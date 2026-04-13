/*
    --Error-Handler coje todos los errores y los devuelve con una respuesta objeto (json)
    --routesNotFound es para cuando el usuario trate de entrar a una ruta que no exista
*/

import AppError from "..utils/AppError.js";

export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err)

    //CASO 1: Es un AppError (lo lanzamos nosotros)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            statusCode: err.statusCode,
        });
    }

    //CASO 2: Error de validacion Zod
    if (err.name === "ZodError") {
        // Mapear errores de Zod a formato mas legible
        const errors = err.errors.map((error) => ({
            path: error.path.join("."),
            message: error.message,
        }));

        return res.status(422).json({
            success: false,
            message: "Error de validacion",
            statusCode: 422,
            errors,
        });
    }

    //CASO 3: Error de JWT (token invalido/expirado)
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Token invalido o expirado",
            statusCode: 401,
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expirado",
            statusCode: 401,
        });
    }

    //CASO 4: Error de Mongoose (BD)
    if (err.name === "MongoError" || err.name === "MongoServerError") {
        return res.status(500).json({
            success: false,
            message: "Error en la base de datos",
            statusCode: 500,
        });
    }

    //CASO 5: Error desconocido / generico
    return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        statusCode: 500,
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });

}

export const rotesNotFound = (req, res, next) => {
    const error = new AppError(
        `Ruta no encontrada: ${req.originalUrl}`, 404
    )

    next(error)
}