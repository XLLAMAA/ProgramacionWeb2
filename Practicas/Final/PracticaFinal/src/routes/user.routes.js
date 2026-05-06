import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";

//Importo validadores
import {
    registerSchema,
    loginSchema,
    validatorEmail,
    personaDataInfo,
    personalCompany,
    cambioContraseña,
    refreshTokenSchema,
    inviteUserSchema,
} from "../validators/user.validator.js";

//Importo controladores
import {
    register,
    login,
    validateEmail,
    updatePersonalData,
    updateCompanyData,
    uploadLogo,
    getUser,
    refreshToken,
    logout,
    deleteUser,
    cambioPassword,
    inviteUser,
} from "../controllers/user.controller.js";


const router = Router();

// ========== RUTAS PUBLICAS ==========

/**
 * @openapi
 * /api/user:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario con email y contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['email', 'password']
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: El email ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", validate(registerSchema), register);

/**
 * @openapi
 * /api/user/login:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Iniciar sesión
 *     description: Autentica un usuario con email y contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['email', 'password']
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", validate(loginSchema), login);

/**
 * @openapi
 * /api/user/refresh:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Renovar token de acceso
 *     description: Obtiene un nuevo token de acceso usando el refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['refreshToken']
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIs...
 *     responses:
 *       200:
 *         description: Token renovado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Refresh token inválido o expirado
 */
router.post("/refresh", validate(refreshTokenSchema), refreshToken);

// ========== RUTAS PROTEGIDAS (AUTENTICADO) ==========

/**
 * @openapi
 * /api/user/validation:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Validar correo electrónico
 *     description: Confirma la cuenta con el código de verificación
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['code']
 *             properties:
 *               code:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: Email validado correctamente
 *       400:
 *         description: Código inválido
 *       401:
 *         description: No autorizado
 *       429:
 *         description: Demasiados intentos fallidos
 */
router.put("/validation", authMiddleware, validate(validatorEmail), validateEmail);

/**
 * @openapi
 * /api/user:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar datos personales
 *     description: Actualiza nombre, apellidos y NIF del usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: Pérez
 *               nif:
 *                 type: string
 *                 example: 12345678A
 *     responses:
 *       200:
 *         description: Datos actualizados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 */
router.put("/", authMiddleware, validate(personaDataInfo), updatePersonalData);

/**
 * @openapi
 * /api/user/company:
 *   patch:
 *     tags:
 *       - Usuarios
 *     summary: Crear o unirse a una empresa
 *     description: Crea una nueva empresa o se une a una existente por CIF
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['name', 'cif']
 *             properties:
 *               name:
 *                 type: string
 *                 example: Empresa S.L.
 *               cif:
 *                 type: string
 *                 example: A12345678
 *               address:
 *                 $ref: '#/components/schemas/Address'
 *               isFreelance:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Empresa creada o actualizada
 *       401:
 *         description: No autorizado
 */
router.patch("/company", authMiddleware, validate(personalCompany), updateCompanyData);

/**
 * @openapi
 * /api/user/logo:
 *   patch:
 *     tags:
 *       - Usuarios
 *     summary: Subir logo de empresa
 *     description: Carga la imagen del logo de la empresa (máx 5MB)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo subido correctamente
 *       401:
 *         description: No autorizado
 *       413:
 *         description: Archivo muy grande
 */
router.patch("/logo", authMiddleware, upload.single("logo"), uploadLogo);

/**
 * @openapi
 * /api/user:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener usuario autenticado
 *     description: Devuelve los datos del usuario autenticado con su empresa
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 */
router.get("/", authMiddleware, getUser);

/**
 * @openapi
 * /api/user/logout:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Cerrar sesión
 *     description: Invalida el token de refresco del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *       401:
 *         description: No autorizado
 */
router.post("/logout", authMiddleware, logout);

/**
 * @openapi
 * /api/user/password:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Cambiar contraseña
 *     description: Cambia la contraseña del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['currentPassword', 'newPassword']
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       401:
 *         description: Contraseña actual incorrecta
 */
router.put("/password", authMiddleware, validate(cambioContraseña), cambioPassword);

/**
 * @openapi
 * /api/user:
 *   delete:
 *     tags:
 *       - Usuarios
 *     summary: Eliminar usuario
 *     description: Elimina la cuenta del usuario (suave o duro)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: soft
 *         in: query
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Si true, realiza borrado suave; si false, borrado duro
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       401:
 *         description: No autorizado
 */
router.delete("/", authMiddleware, deleteUser);

// ========== RUTAS ADMIN (SOLO ADMINISTRADORES) ==========

/**
 * @openapi
 * /api/user/invite:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Invitar compañero
 *     description: Crea un nuevo usuario con rol guest en la misma empresa (solo admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['email']
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario invitado creado
 *       401:
 *         description: No autorizado o sin permisos
 *       403:
 *         description: Solo administradores pueden invitar
 */
router.post("/invite", authMiddleware, requireRole(["admin"]), validate(inviteUserSchema), inviteUser);

export default router;