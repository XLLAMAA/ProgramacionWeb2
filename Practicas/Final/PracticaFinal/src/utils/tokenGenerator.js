import jwt from "jsonwebtoken";
import config from "../config/index.js";

export const generateTokens = (userId) => {

    //Token de acceso - 15 mins
    const accessToken = jwt.sign(
        { id: userId },
        config.jwt.access.secret,
        { expiresIn: config.jwt.access.expiresIn }
    )

    //Token de refresco - 7 dias
    const refreshToken = jwt.sign(
        { id: userId },
        config.jwt.refresh.secret,
        { expiresIn: config.jwt.refresh.expiresIn }
    )

    return {
        accessToken,
        refreshToken
    }


}