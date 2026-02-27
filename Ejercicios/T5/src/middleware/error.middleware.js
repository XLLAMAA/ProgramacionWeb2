// src/middleware/error.middleware.js
export const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    // Error Multer tamaño
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            error: "La imagen supera el tamaño máximo permitido (5MB)",
        });
    }

    // Error tipo archivo
    if (err.message?.includes("Solo se permiten imágenes")) {
        return res.status(400).json({
            error: err.message,
        });
    }

    // Error validación mongoose
    if (err.name === "ValidationError") {
        return res.status(400).json({
            error: err.message,
        });
    }

    // Error genérico
    return res.status(500).json({
        error: "Error interno del servidor",
    });
};