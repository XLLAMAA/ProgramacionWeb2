# BildyApp - Backend API

## 📋 Descripción

Backend de **BildyApp**, una API REST con Node.js y Express para la gestión de albaranes. En esta práctica intermedia se implementa el módulo completo de **gestión de usuarios**, incluyendo registro, autenticación, onboarding y administración de cuentas.

## 🎯 Objetivos

- Implementar sistema de autenticación y autorización con JWT
- Gestión de usuarios con roles (admin, guest)
- Manejo de compañías y relaciones entre entidades
- Validación de datos con Zod
- Upload de archivos (logos)
- Seguridad: Helmet, rate limiting, sanitización
- Arquitectura MVC con async/await

## 🛠️ Tecnologías

| Categoría | Tecnología | Tema |
|-----------|-----------|------|
| Runtime | Node.js 22+ con ESM | T1 |
| Async | async/await, Promises | T2 |
| HTTP | Express 5, middleware | T4 |
| Validación | Zod | T4, T6 |
| BD | MongoDB Atlas + Mongoose | T5 |
| Arquitectura | MVC | T5 |
| Archivos | Multer | T5 |
| Errores | AppError, middleware centralizado | T6 |
| Seguridad | Helmet, rate limiting, sanitización | T6 |
| Autenticación | JWT + bcryptjs | T7 |
| Roles | Sistema admin/guest | T7 |

## 📁 Estructura del Proyecto

```
src/
├── config/
│   └── index.js              # Configuración centralizada
├── controllers/
│   └── user.controller.js    # Lógica de usuarios
├── middleware/
│   ├── auth.middleware.js    # Verificación JWT
│   ├── error-handler.js      # Errors centralizados
│   ├── role.middleware.js    # Autorización por roles
│   ├── upload.js             # Configuración Multer
│   └── validate.js           # Validación Zod
├── models/
│   ├── User.js               # Modelo usuario (virtuals, indexes)
│   └── Company.js            # Modelo compañía
├── routes/
│   └── user.routes.js        # Rutas de usuarios
├── services/
│   └── notification.service.js # EventEmitter
├── utils/
│   └── AppError.js           # Clase errores personalizada
├── validators/
│   └── user.validator.js     # Esquemas Zod
├── app.js                    # Config Express
└── index.js                  # Entry point

uploads/                      # Logos subidos
.env                         # Variables entorno
.env.example                 # Template variables
package.json
```

## 🔗 Modelos de Datos

### User (Usuario)
```
{
  email: String (unique),
  password: String (bcrypt),
  name: String,
  lastName: String,
  nif: String,
  role: 'admin' | 'guest',
  status: 'pending' | 'verified',
  verificationCode: String,
  verificationAttempts: Number,
  company: ObjectId (ref: Company),
  address: { street, number, postal, city, province },
  deleted: Boolean (soft delete),
  createdAt: Date,
  updatedAt: Date,
  // Virtual: fullName → name + ' ' + lastName
}
```

### Company (Compañía)
```
{
  owner: ObjectId (ref: User),
  name: String,
  cif: String,
  address: { street, number, postal, city, province },
  logo: String (URL),
  isFreelance: Boolean,
  deleted: Boolean (soft delete),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Endpoints

### Autenticación
- `POST /api/user/register` - Registro de usuario
- `PUT /api/user/validation` - Validación del email
- `POST /api/user/login` - Login
- `POST /api/user/refresh` - Renovar token
- `POST /api/user/logout` - Logout

### Onboarding
- `PUT /api/user/register` - Actualizar datos personales
- `PATCH /api/user/company` - Crear/unirse a compañía
- `PATCH /api/user/logo` - Subir logo

### Usuario
- `GET /api/user` - Obtener usuario actual
- `PUT /api/user/password` - Cambiar contraseña
- `DELETE /api/user` - Eliminar usuario (hard/soft)
- `POST /api/user/invite` - Invitar compañeros

## 📋 Requisitos Técnicos Obligatorios

✅ ESM ("type": "module" en package.json)  
✅ Node.js 22+ con --watch  
✅ async/await en todas las operaciones  
✅ EventEmitter para eventos del usuario  
✅ Arquitectura MVC  
✅ Validación Zod con .transform() y .refine()  
✅ MongoDB Atlas + Mongoose  
✅ Populate en consultas  
✅ Virtual fullName en User  
✅ Indexes: email (unique), company, status, role  
✅ Clase AppError + middleware centralizado  
✅ Helmet, rate limiting, sanitización NoSQL  
✅ JWT (access + refresh tokens)  
✅ Roles (admin, guest)  

## 📦 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env (copiar desde .env.example)
cp .env.example .env

# 3. Configurar variables de entorno
# Editar .env con:
# - MONGODB_URI
# - JWT_SECRET
# - JWT_EXPIRE_TIME
# - JWT_REFRESH_SECRET
# - JWT_REFRESH_EXPIRE_TIME
# - PORT
```

## 🚀 Ejecución

```bash
# Desarrollo (con --watch)
npm run dev

# Producción
npm start
```

## 📝 Rúbrica (10 puntos)

| Funcionalidad | Puntos |
|---------------|--------|
| POST /api/user/register | 1 |
| PUT /api/user/validation | 1 |
| POST /api/user/login | 1 |
| PUT /api/user/register (datos personales) | 1 |
| PATCH /api/user/company | 1 |
| PATCH /api/user/logo | 1 |
| GET /api/user | 1 |
| Refresh + Logout | 1 |
| DELETE /api/user (hard/soft) | 1 |
| POST /api/user/invite | 1 |

**Bonus:**
- PUT /api/user/password (+0.5 pts)
- Zod discriminatedUnion (+0.5 pts)

---

**Estado:** En desarrollo  
**Última actualización:** Abril 2026
