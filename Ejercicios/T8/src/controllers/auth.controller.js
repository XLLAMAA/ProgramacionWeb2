import User from '../models/user.model.js';
import { handleHttpError } from "../utils/handleError.js";
import bcryptjs from 'bcryptjs';
import { tokenSign } from '../utils/handleJwt.js';
import { encrypt, compare } from '../utils/handlePassword.js';

//POST REGISTER
export const registerUser = async (req, res) => {

    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return handleHttpError(res, "Es necesario que introduzca el nombre, email y contraseña", 403)
    }

    const exitUser = await User.findOne({ email });
    if (exitUser) {
        return handleHttpError(res, "Ya existe un usuario registrado", 409)
    }

    const hashedPassword = await encrypt(password)

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })

    const token = tokenSign(user)

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password

    res.status(201).json({
        data: userWithoutPassword,
        token
    })

}

//POST LOGIN
export const loginUser = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return handleHttpError(res, "debes introducir el email y la contraseña", 409)
    }

    const user = await User.findOne({ email })

    if (!user) {
        return handleHttpError(res, "No se ha encontrado el user", 403)
    }

    const confirmarPass = await compare(password, user.password)
    if (!confirmarPass) {
        return handleHttpError(res, "No coincide la contraseña", 409)
    }

    const token = tokenSign(user)

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password

    res.status(201).json({
        data: userWithoutPassword,
        token
    })

}

//GET
export const getMe = async (req, res) => {
    const user = await User.findById(req.user.id)

    if (!user) {
        return handleHttpError(res, "No se ha encontrado el usaurio", 403)
    }

    const userWithoutPassword = user.toObject()
    delete userWithoutPassword.password

    res.json({ data: userWithoutPassword })
}