/*
    -Verifica JWT en endpoints protegidos
    -Se necesita cuando un endpoint requiere un usuario autenticado
*/

import jwt from "jsonwebtoken";
import config from "../config/index.js";
import AppError from "../utils/AppError.js";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
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

        //Cargar usuario completo con company, role, status
        const user = await User.findById(decoded.id)
            .select('_id company role status')
            .lean();

        if (!user) {
            throw AppError.unauthorized("Usuario no encontrado");
        }

        //Agrego el usuario al req para usarlo en el controller
        req.user = {
            id: user._id.toString(),
            company: user.company,
            role: user.role,
            status: user.status
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

        next(e);
    }
}