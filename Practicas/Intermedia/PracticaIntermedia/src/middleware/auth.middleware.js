/*
    -Verifica JWT en endpoints protegidos
    -Se necesita cuando un endpoint requiere un usuario autenticado
*/

import jwt from "jsonwebtoken";
import config from "../config/index.js";
import AppError from "../utils/AppError.js";

export const authMiddleware = (req, res, next) => {
    try {

        //Onbtengo token de la cabecera 
        const tokenCabercera = req.headers.authorization

        //valido 
        if (!tokenCabercera || !tokenCabercera.startsWith("Bearer")) {
            throw AppError.unauthorized("Token no proporcionado o tiene un formato incorrecto")
        }

        //Extraigo solo el token
        const token = tokenCabercera.substring(7)

        //Verifico y descodifico el token
        const decoded = jwt.verify(token, config.jwt.access.secret)

        //Agrego el usuario al req para usarlo en el controller
        req.user = {
            id: decoded.id,
        };

        next()

    } catch (e) {

        //Si el token es invalido
        if (e.name === "JsonWebTokenError") {
            return next(AppError.unauthorized("Token invalido"));
        }
        //Token expirado
        if (e.name === "TokenExpiredError") {
            return next(AppError.unauthorized("Token expirado"));
        }

        next(error);
    }
}