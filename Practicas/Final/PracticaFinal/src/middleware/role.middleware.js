/*
    --Se encarga de que el usuario cumpla con los permisos suficientes para determinadas acciones
*/

import User from "../models/User.js";
import AppError from "../utils/AppError.js";

export const requireRole = (allowedRoles) => {
    return async (req, res, next) => {

        try {

            //Compruebo que el usuario este auntenticado
            if (!req.user || !req.user.id) {
                throw AppError.unauthorized("Usuario no autenticado")
            }

            //Creo un usuario y compruebo si existe
            const user = await User.findById(req.user.id)
            if (!user) {
                throw AppError.notFound("Usuario no encontrado")
            }

            //Paso a array
            const arrayRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

            //Verfico el rol del usuario
            if (!arrayRoles.includes(user.role)) {
                throw AppError.forbidden("No tienes permisos para realizar la accion que quieres realizar")
            }

            //Agrego el usuario completo a req
            req.user.role = user.role
            req.user.email = user.email

            next()

        } catch (e) {
            next(e)
        }
    }
}

export default requireRole;