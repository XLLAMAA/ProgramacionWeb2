export default class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AppError";

        Error.captureStackTrace(this, this.constructor);
    }

    //Metodos factorias para errores comunes
    static badRequest(message = "Solicitud invalida") {
        return new AppError(message, 400);
    }

    static unauthorized(message = "No autorizado") {
        return new AppError(message, 401);
    }

    static forbidden(message = "Acceso prohibido") {
        return new AppError(message, 403);
    }

    static notFound(message = "Recurso no encontrado") {
        return new AppError(message, 404);
    }

    static conflict(message = "Conflicto en la solicitud") {
        return new AppError(message, 409);
    }

    static tooManyRequests(message = "Demasiadas solicitudes") {
        return new AppError(message, 429);
    }

    static internalServerError(message = "Error interno del servidor") {
        return new AppError(message, 500);
    }

    static validationError(message = "Error de validacion") {
        return new AppError(message, 422);
    }
}
