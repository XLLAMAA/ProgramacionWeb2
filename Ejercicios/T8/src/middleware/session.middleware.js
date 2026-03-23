import { verifyToken } from "../utils/handleJwt";
import User from '../models/user.model';
import { handleHttpError } from "../utils/handleError";

export const sessionMiddleware = async (req, res, next) => {

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return handleHttpError(res, "No estas autorizado, el token no esta proporcionado", 403)
    }

    const decoder = verifyToken(token)

    if (!decoder) {
        return handleHttpError(res, "Token invalido o expirado", 401)
    }

    const user = await User.findById(decoder._id)

    if (!user) {
        return handleHttpError(res, "No se ha encontrado el usuario", 401)
    }

    req.user = user

    next()

}