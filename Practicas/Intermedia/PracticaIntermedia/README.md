# 🏗️ BildyApp Backend - User Management API

Proyecto backend de la **Práctica Intermedia** - Sistema de gestión de usuarios con asignación de empresas y control de roles.

---

## 📚 Tecnologías Utilizadas

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Runtime** | Node.js | 22+ (ESM) |
| **Framework** | Express | 5.x |
| **BD** | MongoDB Atlas + Mongoose | 7.x/8.x |
| **Autenticación** | JWT (jsonwebtoken) | 9.x |
| **Validación** | Zod | 3.x |
| **Hash Passwords** | bcryptjs | 2.x (10 rounds) |
| **Uploads** | Multer | 1.x (5MB max) |
| **Seguridad** | Helmet + Rate Limiting | 7.x |
| **Config** | Dotenv | 16.x |

---

## 🏗️ Estructura del Proyecto

```
src/
├── app.js                              # Configuración Express + middlewares globales
├── index.js                            # Punto de entrada (conexión BD + servidor)
├── config/
│   └── index.js                        # Configuración centralizada desde .env
├── models/
│   ├── User.js                         # Schema usuario (auth, verificación, empresa)
│   └── Company.js                      # Schema empresa (CIF, owner, logo)
├── controllers/
│   └── user.controller.js              # 12 funciones de negocio
├── routes/
│   ├── index.js                        # Router principal (centraliza todas las rutas)
│   └── user.routes.js                  # 12 endpoints de usuario
├── middleware/
│   ├── error-handler.js                # Manejo centralizado de errores (5 casos)
│   ├── auth.middleware.js              # Verificación JWT Bearer token
│   ├── validate.js                     # Factory para validar Zod schemas
│   ├── role.middleware.js              # Autorización por rol (admin/guest)
│   └── upload.js                       # Multer para subir logos
├── validators/
│   └── user.validator.js               # 9 schemas Zod con .transform() y .refine()
├── services/
│   └── notification.service.js         # EventEmitter para ciclo de vida usuario
└── utils/
    └── AppError.js                     # Clase de errores con factory methods
```

---

## 🔐 Configuración de Entorno

### Archivo `.env` (PRIVADO - en .gitignore)

```bash
# Base de datos MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/bildyapp

# Servidor
PORT=3000
NODE_ENV=development

# JWT Tokens
JWT_ACCESS_SECRET=tu_secreto_acceso_super_seguro_aqui_min_32chars
JWT_REFRESH_SECRET=tu_secreto_refresco_super_seguro_aqui_min_32chars

# Multer (uploads)
MULTER_UPLOAD_DIR=./uploads
MULTER_MAX_FILE_SIZE=5242880
MULTER_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp
MULTER_ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Verificación de Email
VERIFICATION_CODE_LENGTH=6
VERIFICATION_MAX_ATTEMPTS=3
```

---

## 🚀 Cómo Iniciar

### 1. Instalación de dependencias
```bash
npm install
```

### 2. Configurar `.env`
Copiar `.env.example` → `.env` y rellenar con credenciales reales.

### 3. Iniciar servidor
```bash
npm start
```

**Salida esperada:**
```
🔄 Conectando a MongoDB...
✅ Conectado a MongoDB correctamente
📦 Modelos de datos registrados:
  - User
  - Company
🚀 Servidor ejecutándose en puerto 3000
🌐 http://localhost:3000
📝 Modo desarrollo activado
```

---

## 📡 Endpoints Disponibles (12 Total)

### Rutas Públicas (sin autenticación)

| Método | Ruta | Request Body | Descripción |
|--------|------|---|-------------|
| POST | `/api/user` | `{ email, password }` | Registrar nuevo usuario |
| POST | `/api/user/login` | `{ email, password }` | Iniciar sesión |
| POST | `/api/user/refresh` | `{ refreshToken }` | Renovar token de acceso |

### Rutas Protegidas (requieren JWT Bearer)

| Método | Ruta | Request Body | Descripción |
|--------|------|---|-------------|
| PUT | `/api/user/validation` | `{ code }` | Validar email con código (6 dígitos) |
| PUT | `/api/user` | `{ name, lastName, nif }` | Actualizar datos personales |
| PATCH | `/api/user/company` | `{ name, cif, address, isFreelance }` | Crear o unirse a empresa |
| PATCH | `/api/user/logo` | FormData: `{ logo: file }` | Subir logo de empresa |
| GET | `/api/user` | - | Obtener información del usuario autenticado |
| POST | `/api/user/logout` | - | Cerrar sesión (simple ACK) |
| PUT | `/api/user/password` | `{ currentPassword, newPassword }` | Cambiar contraseña |
| DELETE | `/api/user` | Query: `?soft=true` | Eliminar usuario (soft o hard delete) |

### Rutas Admin (requieren JWT + rol "admin")

| Método | Ruta | Request Body | Descripción |
|--------|------|---|-------------|
| POST | `/api/user/invite` | `{ email, name, lastName }` | Invitar nuevo usuario |

---

## 🔑 Autenticación JWT

### Estructura Access Token (15 minutos)
```json
{
  "id": "66abcdef123456789",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Estructura Refresh Token (7 días)
```json
{
  "id": "66abcdef123456789",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Cómo enviar en requests
```bash
Authorization: Bearer <access_token>
```

---

## 💾 Esquemas de Base de Datos

### User Schema
```javascript
{
  email: String (unique, lowercase transform),
  password: String (bcrypt 10 rounds),
  name: String (trim transform),
  lastName: String (trim transform),
  nif: String (uppercase transform),
  verificationCode: String (6 dígitos),
  verificationAttempts: Number (max 3),
  status: Enum ["pending", "verified"],
  role: Enum ["admin", "guest"],
  company: ObjectId ref Company (opcional hasta onboarding),
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
  },
  deleted: Boolean (soft delete flag),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Virtual: fullName = name + " " + lastName
// Indexes: email (unique), company, status, role
```

### Company Schema
```javascript
{
  owner: ObjectId ref User (admin que creó),
  name: String,
  cif: String (unique),
  address: {
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
  },
  logo: String (URL, optional, default: null),
  isFreelance: Boolean (para autónomos),
  deleted: Boolean (soft delete),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

// Indexes: cif (unique), owner
```

---

## 🛡️ Manejo de Errores

### 5 Casos Principales en `error-handler.js`

1. **AppError** → Status HTTP personalizado (400, 401, 403, 404, 409, 429, 500, 422)
2. **ZodError** → 422 Validation Error con detalles de campos
3. **JsonWebTokenError** → 401 Token inválido
4. **TokenExpiredError** → 401 Token expirado
5. **MongoError** → 500 Error de base de datos
6. **Genérico** → 500 Error interno del servidor

**Formato de respuesta estándar:**
```json
{
  "success": false,
  "message": "Descripción del error",
  "statusCode": 400,
  "errors": [
    {
      "path": "campo.anidado",
      "message": "Detalle del error de validación"
    }
  ]
}
```

---

## 🔔 Sistema de Eventos

Usando EventEmitter en `notification.service.js`:

```javascript
eventEmitter.emit("user:registered", userData)       // Nuevo usuario registrado
eventEmitter.emit("user:verified", userData)         // Email verificado
eventEmitter.emit("user:invited", userData)          // Usuario invitado
eventEmitter.emit("user:deleted", userData)          // Usuario eliminado
```

Cada evento está configurado para loguear en consola con emojis.

---

## 🔐 Middleware Stack por Endpoint

### Rutas Públicas
```
validate(schema) → controller
```

### Rutas Protegidas
```
authMiddleware → validate(schema) → controller
```

### Rutas Admin
```
authMiddleware → requireRole(["admin"]) → validate(schema) → controller
```

### Upload
```
authMiddleware → upload.single("logo") → controller
```

---

## 📌 Notas Importantes para Continuar

### ✅ Ya Implementado
- ✅ Sistema de autenticación JWT completo (access + refresh separados)
- ✅ Validación con Zod (9 schemas con .transform() y .refine())
- ✅ Roles y permisos (admin/guest)
- ✅ Soft delete para usuarios (deleted flag)
- ✅ Upload de logos con Multer (timestamps en nombres)
- ✅ EventEmitter para notificaciones de ciclo de vida
- ✅ Rate limiting (100 requests/15 min)
- ✅ Error handling centralizado (5 casos)
- ✅ Helmet para seguridad
- ✅ Virtuals y indexes en schemas
- ✅ Populate relationships
- ✅ Sanitización contra NoSQL injection

### 🔄 Próximas Implementaciones Recomendadas

#### FASE 2 - Mejoras Inmediatas
- [ ] **Blacklist de tokens** - Usar Redis o BD para logout real
- [ ] **Envío de emails** - Nodemailer para códigos de verificación
- [ ] **Logs estructurados** - Winston para guardar en archivos
- [ ] **Tests unitarios** - Jest para controllers y validators
- [ ] **Swagger/OpenAPI** - Documentación automática de API

#### FASE 3 - Escalabilidad
- [ ] **Paginación** - Para listar usuarios (admin)
- [ ] **Búsqueda y filtrado** - Por rol, empresa, status
- [ ] **Auditoría** - Registrar cambios en usuarios
- [ ] **Rate limiting dinámico** - Por usuario/IP individual
- [ ] **CORS** - Si hay frontend en diferente dominio
- [ ] **GraphQL** - Alternativa a REST

#### FASE 4 - Recursos Adicionales
- [ ] **Tracks (canciones)** - Modelo y endpoints CRUD
- [ ] **Storage** - Gestión de almacenamiento
- [ ] **Subscripciones** - Sistema de planes/pagos

---

## 🚨 Cambios Importantes en BD

Si necesitas modificar los schemas:

1. **Modificar schema** en `src/models/User.js` o `src/models/Company.js`
2. **Actualizar validators** en `src/validators/user.validator.js`
3. **Crear migration** si usas versionado de Mongoose
4. **Agregar middleware especial** si hay validación compleja
5. **Actualizar controllers** para manipular los nuevos campos

---

## 📤 Configuración de Uploads

- **Directorio:** `./uploads/`
- **Nombre archivo:** `{timestamp}-{nombre_original}` (ej: `1681234567-logo.png`)
- **Tamaño máximo:** 5MB (5,242,880 bytes)
- **Tipos permitidos:** jpg, jpeg, png, gif, webp
- **MIME types validados** en Multer

---

## 🐛 Troubleshooting Común

| Error | Causa | Solución |
|-------|-------|----------|
| `Cannot find module '../utils'` | Import path incorrecto | Usar `../` en lugar de `./` |
| `authMiddleware is not defined` | Export incorrecto | Verificar export en auth.middleware.js |
| `Multer: unexpected field` | Campo HTML incorrecto | Debe ser `name="logo"` en form |
| `Token expired: use refresh endpoint` | Access token vencido | Client debe enviar refresh token |
| `MongooseError: disconnected` | MONGODB_URI inválida | Verificar credenciales en .env |
| `Zod validation error not caught` | Error handler no configurado | Verificar order de middlewares en app.js |
| `File too large` | Archivo > 5MB | Rechazado automáticamente por Multer |

---

## 📋 Validadores Zod Disponibles (9 Schemas)

1. **registerSchema** - POST /register
2. **loginSchema** - POST /login
3. **validatorEmail** - PUT /validation
4. **personalDataInfo** - PUT / (actualizar datos)
5. **personalCompany** - PATCH /company
6. **cambioContrasena** - PUT /password (con .refine() para validar newPassword ≠ currentPassword)
7. **refreshTokenSchema** - POST /refresh
8. **inviteUserSchema** - POST /invite
9. **addressSchema** - Schema reutilizable para direcciones

---

## 🔗 Relaciones de Datos

```
User ─────────┬────────┐
              │        │
         company      deleted (soft)
              │
           Company ─────┐
                        │
                      owner (User)
```

- **User.company** → Referencia a Company (después de onboarding)
- **Company.owner** → Referencia al User admin que creó la empresa
- **Queries** filtran `{ deleted: false }` automáticamente por las relaciones

---

## 📦 Dependencias del Proyecto

```json
{
  "type": "module",
  "dependencies": {
    "express": "^5.x",
    "mongoose": "^7.x o ^8.x",
    "jsonwebtoken": "^9.x",
    "bcryptjs": "^2.x",
    "zod": "^3.x",
    "multer": "^1.x",
    "helmet": "^7.x",
    "express-rate-limit": "^7.x",
    "dotenv": "^16.x"
  }
}
```

---

## 📝 Requisitos Cumplidos

✅ ESM ("type": "module")  
✅ Node.js 22+ con async/await  
✅ async/await en todas las operaciones  
✅ EventEmitter para eventos del usuario  
✅ Arquitectura MVC  
✅ Validación Zod con .transform() y .refine()  
✅ MongoDB Atlas + Mongoose  
✅ Populate en consultas  
✅ Virtual fullName en User  
✅ Indexes: email (unique), company, status, role, cif (unique)  
✅ Clase AppError + middleware centralizado  
✅ Helmet + rate limiting + sanitización NoSQL  
✅ JWT (access/refresh separados)  
✅ Roles (admin/guest) con requireRole middleware  
✅ Soft delete con bandera deleted  
✅ 12 endpoints funcionales  

---

**Estado:** ✅ MVP funcional - User Management completo  
**Última actualización:** 13 de abril de 2026  
**Versión:** 1.0.0
