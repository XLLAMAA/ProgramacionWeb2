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

// POST /api/user - Registrar nuevo usuario
router.post("/", validate(registerSchema), register);

// POST /api/user/login - Iniciar sesion con email y contraseña
router.post("/login", validate(loginSchema), login);

// POST /api/user/refresh - Obtener nuevo token de acceso
router.post("/refresh", validate(refreshTokenSchema), refreshToken);

// ========== RUTAS PROTEGIDAS (AUTENTICADO) ==========

// PUT /api/user/validation - Validar email con codigo de verificacion
router.put("/validation", authMiddleware, validate(validatorEmail), validateEmail);

// PUT /api/user - Actualizar datos personales (nombre, apellido, NIF)
router.put("/", authMiddleware, validate(personaDataInfo), updatePersonalData);

// PATCH /api/user/company - Crear o unirse a una empresa
router.patch("/company", authMiddleware, validate(personalCompany), updateCompanyData);

// PATCH /api/user/logo - Subir logo de empresa
router.patch("/logo", authMiddleware, upload.single("logo"), uploadLogo);

// GET /api/user - Obtener informacion del usuario autenticado
router.get("/", authMiddleware, getUser);

// POST /api/user/logout - Cerrar sesion
router.post("/logout", authMiddleware, logout);

// PUT /api/user/password - Cambiar contraseña
router.put("/password", authMiddleware, validate(cambioContraseña), cambioPassword);

// DELETE /api/user - Eliminar cuenta de usuario
router.delete("/", authMiddleware, deleteUser);

// ========== RUTAS ADMIN (SOLO ADMINISTRADORES) ==========

// POST /api/user/invite - Invitar nuevo usuario (solo administradores)
router.post("/invite", authMiddleware, requireRole(["admin"]), validate(inviteUserSchema), inviteUser);

export default router;
