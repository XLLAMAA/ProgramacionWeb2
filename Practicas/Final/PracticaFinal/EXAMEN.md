# EXAMEN — Reto F12: Hazla pasar sin Cloudinary real

## Reto

**F12 — Hazla pasar sin Cloudinary real**

Fundamento medido: tests deterministas — aislamiento de dependencias externas con mocks.

El test "rechazar actualización de albarán firmado" (`tests/deliverynote.test.js`) llama a
`PATCH /:id/sign`, que a su vez invoca `uploadSignature` y `uploadPDF` de
`src/services/storage.service.js`. Esas funciones llegan a Cloudinary en CI sin credenciales,
haciendo el test no determinista. El objetivo es mockear el módulo de storage con Jest y añadir
tests para `GET /api/deliverynote/pdf/:id`.

---

## Tarea técnica

### Cambios realizados

**1. `tests/deliverynote.test.js`**

- Se eliminaron los imports estáticos de `app`, `DeliveryNote`, `Client` y `Project`.
- Se añadió `jest.unstable_mockModule('../src/services/storage.service.js', ...)` al inicio del
  fichero, antes de cualquier `import()` dinámico que cargue el módulo transitivamente. El mock
  devuelve URLs hardcodeadas para `uploadSignature` y `uploadPDF` sin hacer ninguna llamada de red.
- Se declararon `let app` y `let DeliveryNote` a nivel de módulo y se asignaron mediante
  `await import(...)` dentro de `beforeAll`, después de que el mock ya está registrado.
- Se corrigió el método HTTP en dos tests: `.post(/:id/sign)` → `.patch(/:id/sign)`, alineando
  con la ruta real (`router.patch('/:id/sign', ...)` en `deliverynote.routes.js:245`).
- Se añadió el suite `GET /api/deliverynote/pdf/:id` con dos tests:
  - **400** cuando el albarán no está firmado.
  - **403** cuando el token pertenece a un usuario de otra empresa.

**2. `src/controllers/deliverynote.controller.js`**

- Se cambió `AppError.badRequest` → `AppError.forbidden` en los tres puntos donde se bloquea
  una operación sobre un albarán firmado (`updateDeliveryNote`, `deleteDeliveryNote`,
  `signDeliveryNote`). Esto alinea el código con la documentación Swagger (que declaraba 403
  en los tres casos) y con las expectativas de los tests.

**3. `src/app.js`**

- El rate limiter (100 req / 15 min) se desactivó en `NODE_ENV=test`. Con múltiples `beforeEach`
  encadenados (registro, empresa, cliente, proyecto, albarán) la suite consume ~20-25 peticiones
  por test; en suites largas el límite se agotaba y las peticiones devolvían 429, no el código
  esperado.

**4. `src/models/User.js`**

- Se eliminó `default: null` del campo `nif` (`unique: true, sparse: true`). MongoDB incluye en
  el índice sparse los documentos cuyo campo está presente aunque sea `null`; con `default: null`
  todos los usuarios tenían el campo en el documento y el segundo usuario lanzaba
  `E11000 duplicate key error index: nif_1 dup key: { nif: null }`. Sin `default`, los usuarios
  creados sin `nif` no tienen el campo en el documento y el índice sparse los ignora correctamente.

**5. `src/models/Client.js`**

- Se añadió `sparse: true` al campo `phone` (`unique: true`). Mismo patrón que el bug de `nif`:
  sin `sparse`, varios clientes sin teléfono colisionaban en el índice (`phone: null` duplicado).

**6. `src/controllers/client.controller.js`**

- Se añadió en `createClient` una comprobación previa: `Client.findOne({ cif, company, deleted: false })`.
  Si existe, se lanza `AppError.conflict` (409). Antes el controlador insertaba sin validar y
  permitía CIF duplicados en la misma empresa.

**7. `src/controllers/project.controller.js`**

- Se añadió en `createProject` validación del cliente referenciado: si el ObjectId no es válido o
  el cliente no existe / está eliminado, se lanza `AppError.badRequest` (400). También se valida
  que el `projectCode` no exista ya en la empresa (409). Antes se insertaba sin verificar y se
  podían crear proyectos con clientes inexistentes.

**8. `tests/client.test.js` y `tests/project.test.js`**

- Se añadió el bloque `address` (todos los subcampos: street, number, postal, city, province) en
  todas las llamadas a `POST /api/client` y `POST /api/project` que faltaban. Sin él, Mongoose
  rechazaba la inserción por `ValidationError` (campos requeridos por el modelo).

**9. `tests/auth.test.js`**

- Se alinearon los códigos esperados con el comportamiento real:
  - `400` → `422` en errores de validación Zod (el `errorHandler` mapea `ZodError` a 422).
  - `200` → `201` en `getUser`, `updatePersonalData`, `updateCompanyData` y `deleteUser`,
    porque esos controladores responden con `res.status(201)`.

---

## Respuestas socráticas

### 1. ¿Qué ocurre en GitHub Actions sin `CLOUDINARY_*`?

`uploadSignature` llama internamente a `uploadFromBuffer` de `src/config/cloudinary.js`, que
inicializa el SDK de Cloudinary con las variables de entorno. Sin `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`, el SDK intentará una petición HTTP con
credenciales vacías. Cloudinary rechazará la autenticación con un error (típicamente 401 o un
error de SDK), lo que provoca que `uploadSignature` lance una excepción. El controlador la
captura y responde con 500. El test espera 200 → falla con "expected 200 but received 500".
El resultado es **no determinista**: pasa en local (con credenciales en `.env`) y falla en CI
(sin ellas). Además, si el test falla con un handle abierto (la conexión HTTP pendiente),
Jest puede detectarlo como open handle.

### 2. Si mockeas `uploadSignature` con `jest.mock`, ¿también `optimizeImage`?

Sí. Al usar `jest.unstable_mockModule('../src/services/storage.service.js', factory)`, Jest
reemplaza **el módulo entero** por el objeto que devuelve la factory. Todas las exportaciones
del módulo —`uploadSignature`, `uploadPDF`, `optimizeImage`, etc.— quedan sustituidas por las
implementaciones del mock. La función `uploadSignature` mockeada no contiene ninguna llamada
interna a `optimizeImage`, porque es un `jest.fn()` que devuelve directamente las URLs
hardcodeadas. Sharp nunca se ejecuta. Esto es clave: se mockea la unidad (el módulo), no
las funciones individualmente.

### 3. Con mock de URLs fijas, ¿cómo testearías que `signatureUrl` y `pdfUrl` se guardan en BD?

Después de hacer `PATCH /:id/sign` y verificar que devuelve 200, consulto directamente el
modelo Mongoose usando `mongodb-memory-server` como base de datos real en memoria:

```js
const saved = await DeliveryNote.findById(deliveryNoteId);
expect(saved.signatureUrl).toBe('https://res.cloudinary.com/fake/bildyapp/signatures/sig.webp');
expect(saved.pdfUrl).toBe('https://res.cloudinary.com/fake/bildyapp/pdfs/note.pdf');
expect(saved.signed).toBe(true);
```

Esto es posible porque `mongodb-memory-server` es una instancia real de MongoDB que persiste
los datos durante el test. El controlador escribe en esa BD a través de `delivery.save()`, y
el test puede leerlos directamente con `DeliveryNote.findById`. El mock fija las URLs de entrada
para que la aserción sea determinista.

### 4. Hipotético: Cloudinary cambia API y `uploadFromBuffer` devuelve `{ url: undefined }`. ¿Tu test con mock lo detectaría?

**No.** El mock reemplaza completamente `uploadSignature` con un `jest.fn()` que devuelve URLs
hardcodeadas sin llamar nunca a la implementación real ni a Cloudinary. El cambio de contrato
de la API externa es invisible para el test: desde su perspectiva, `uploadSignature` siempre
devuelve `{ url: 'https://res.cloudinary.com/fake/...' }`.

Los mocks garantizan **determinismo e independencia** del entorno, pero sacrifican la capacidad
de detectar cambios en las dependencias externas. Para detectar ese tipo de cambio se
necesitaría un **contract test** (por ejemplo, con Pact) que verifique el contrato entre
`uploadFromBuffer` y la API real de Cloudinary, o un test de integración que llame a Cloudinary
con credenciales de un entorno de sandbox dedicado en CI.

### 5. `socket.service.js:26` tiene bug real (`User` no importado). ¿Un test de integración Supertest lo detectaría? ¿Diferencia con smoke test?

**No lo detectaría directamente.** Los tests de Supertest hacen peticiones HTTP al servidor
Express. El middleware de autenticación de Socket.IO —donde está el `User` no importado— solo
se ejecuta cuando un cliente WebSocket intenta conectarse. En ningún test HTTP de Supertest se
inicia una conexión WebSocket, por lo que ese código nunca se evalúa y el
`ReferenceError: User is not defined` nunca se lanza durante los tests.

**Diferencia con un smoke test:** un smoke test es un test básico que solo verifica que el
servidor arranca y responde a una petición mínima (p. ej. `GET /health` devuelve 200). Tampoco
detectaría el bug por la misma razón: no conecta vía WebSocket. La diferencia frente a un test
de integración HTTP completo es solo la profundidad: el smoke test cubre el arranque del proceso,
el test de integración cubre los flujos de negocio HTTP; ambos son ciegos a la capa WebSocket.

Para detectar este bug habría que escribir un test que use `socket.io-client` para conectarse
al servidor con un token JWT válido. En ese momento el middleware de Socket.IO se ejecuta,
referencia `User` (no importado) y lanza el `ReferenceError`, que se propagaría como un error
de conexión detectable en el test.

---

## Proceso

1. **Análisis del problema.** Identifiqué tres causas de fallo encadenadas:
   - Sin mock de `storage.service.js`, `uploadSignature` llama a Cloudinary real → 500 en CI.
   - Los tests de firma usaban `.post(/:id/sign)` pero la ruta define `PATCH` → 404 siempre.
   - El controlador lanzaba `AppError.badRequest` (400) donde los tests esperaban 403, y donde
     el Swagger también documentaba 403.

2. **Mock con `jest.unstable_mockModule`.** Para ESM con `--experimental-vm-modules`, `jest.mock`
   no está hoistado de forma fiable. `jest.unstable_mockModule` es la API correcta: se llama
   síncronamente antes de los `import()` dinámicos, garantizando que cuando Jest carga `app.js`
   (y transitivamente el controlador y `storage.service.js`) ya encuentra el módulo mockeado en
   el registro.

3. **Imports dinámicos en `beforeAll`.** Para que el mock esté activo en el momento de cargar
   `app`, cambié los imports estáticos de `app` y `DeliveryNote` a `await import(...)` dentro
   de `beforeAll`. Así la secuencia queda: (1) mock registrado, (2) `setupDB()` inicia
   `mongodb-memory-server` y conecta Mongoose, (3) `import('../src/app.js')` carga la app con
   el módulo de storage ya mockeado.

4. **Fix del método HTTP.** Corregí `.post(/:id/sign)` → `.patch(/:id/sign)` en los dos tests
   que firmaban un albarán, alineando con `router.patch('/:id/sign', ...)`.

5. **Fix del código de error.** Cambié `AppError.badRequest` → `AppError.forbidden` en los tres
   sitios donde se rechaza una operación sobre un albarán firmado, haciendo que el HTTP status
   coincida con lo que los tests esperan (403) y con lo que el Swagger documenta.

6. **Nuevos tests para `/pdf/:id`.** Añadí el suite con dos casos: 400 para albarán no firmado
   (el controlador lanza `AppError.badRequest` antes de llegar al axios) y 403 para usuario de
   otra empresa (el controlador verifica la compañía antes del estado de firma). Ambos se
   resuelven sin necesidad de mockear axios porque el controlador retorna antes de llegar a esa
   llamada.

7. **Fix del rate limiter.** Al ejecutar la suite completa, las peticiones de los múltiples
   `beforeEach` agotaban el rate limiter. Se envuelve el middleware en
   `if (config.env !== 'test')` para que solo opere en producción.

8. **Fix del sparse index de `nif`.** Al intentar crear el segundo usuario dentro del test 403,
   MongoDB devolvía `E11000 duplicate key error index: nif_1 dup key: { nif: null }`. La causa
   es que `default: null` hacía que el campo existiera en todos los documentos con valor `null`,
   y MongoDB no excluye los `null` del índice sparse. Se eliminó el default para que el campo
   esté verdaderamente ausente en los documentos sin NIF.

9. **Extensión a la suite completa.** El criterio "`npm test` pasa al 100%" obligó a revisar
   también `auth.test.js`, `client.test.js` y `project.test.js`. Los fallos pre-existentes
   tenían tres causas:
   - `Client.phone` con `unique: true` sin `sparse: true` (mismo patrón que el bug de `nif`).
   - `createClient` no comprobaba CIF duplicado dentro de la empresa, y `createProject` no
     validaba la existencia del cliente referenciado: ambos hacían `save()` directo y los tests
     que esperaban 409 / 400 acababan recibiendo 201 o 500.
   - Los tests creaban `Client` y `Project` sin el bloque `address` que el modelo declara como
     requerido. Y `auth.test.js` esperaba 400/200 donde el `errorHandler` y los controladores
     devolvían 422/201 respectivamente.

   Se aplicaron los fixes mínimos (validaciones en controladores + `sparse` en `phone` +
   `address` y status codes en los tests) hasta llegar a 52/52.
