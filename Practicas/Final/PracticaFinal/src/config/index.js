// ========================================
// CONFIGURACION CENTRALIZADA
// ========================================

export default {
    // ========== ENVIRONMENT ==========
    env: process.env.NODE_ENV || "development",
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",

    // ========== SERVIDOR ==========
    port: process.env.PORT || 3000,

    // ========== DATABASE MONGODB ==========
    database: {
        mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/bildyapp",
    },

    // ========== JWT - ACCESS TOKEN ==========
    jwt: {
        access: {
            secret: process.env.JWT_ACCESS_SECRET || "access_secret_default_cambiar",
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
        },
        refresh: {
            secret: process.env.JWT_REFRESH_SECRET || "refresh_secret_default_cambiar",
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        },
    },

    // ========== BCRYPTJS - CONTRASENAS ==========
    bcrypt: {
        rounds: 10,
    },

    // ========== MULTER - SUBIDA DE ARCHIVOS ==========
    multer: {
        uploadDir: process.env.MULTER_UPLOAD_DIR || "./uploads",
        maxFileSize: parseInt(process.env.MULTER_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5 MB
        allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    },

    // ========== RATE LIMITING ==========
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        maxRequests: 100, // maximo 100 requests por ventana
        message: "Demasiadas solicitudes, intenta mas tarde",
    },

    // ========== VERIFICACION DE EMAIL ==========
    verification: {
        codeLength: 6,
        maxAttempts: 3,
    },
};
