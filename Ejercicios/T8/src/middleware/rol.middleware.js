import { handleHttpError } from "../utils/handleError";

export const checkRole = (roleRequerido) => {

    return (req, res, next) => {
        if (!req.user) {
            return handleHttpError(res, "Usuario no autenticado", 403)
        }

        if (req.user.role !== roleRequerido != 'admin') {
            return handleHttpError(res, "No eres un usuario con permisos", 403)
        }
        next()
    }

}