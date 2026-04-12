import User from "../models/User.js";
import Company from "../models/Company.js";
import AppError from "../utils/AppError.js";
import {
    registerSchema,
    loginSchema,
    validatorEmail,
    personaDataInfo,
    personalCompany,
    cambioContrasena,
    refreshTokenSchema,
    inviteUserSchema
} from "../validators/user.validator.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { validateHeaderName } from "http";

//Registro de usuario POST
export const register = async (req, res, next) => {
    try {

        const { email, password } = registerSchema.parse(req.body);

        //Compruebo si existe el email
        const userExist = await User.findOne({ email, deleted: false })
        if (userExist) {
            throw AppError.conflict("Este email ya esta en uso en un usuario")
        }

        //Si no existe se le envia un codigo aleatorio de 6 digitos 
        const codigoVerificacion = crypto.randomInt(100000, 999999).toString()

        //Hashe la password con bcryptjs
        const hashPassword = await bcryptjs.hash(password, 10)

        //Creo el user en la BD
        const user = await user.create({
            email,
            password: hashPassword,
            codigoVerificacion,
            verificationAttempts: 3,
            status: "pending",
            role: "admin",
            company: null
        })

        //Genero tocken JWT
        const tocken = generateTockens(user._id)

        //Respuesta de que ha salido todo correcto
        res.status(201).json({
            message: "Usuario registrado con exito",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status
            },
            accessTocken: tocken.accessTocken,
            refreshTokenSchema: tocken.refreshTokenSchema
        })


    } catch (e) {
        next(e)
    }
}

//Logearse POSt
export const login = async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body)

        //creo el user y compruebo si exister
        const user = await User.findOne({ email, deleted: false })

        if (!user) {
            throw AppError.unauthorized("Usuario no registrado")
        }

        //Valido la password
        const validPassword = await bcryptjs.compare(password, user.password)

        if (!validPassword) {
            throw AppError.unauthorized("La contraseña no es correcta")
        }

        //genero tocken con jwt
        const tocken = generateTockens(user._id)

        //Respuesta todo correcto
        res.status(201).json({
            message: "EL usaurio ha iniciado sesion de manera exitosa",
            user: {
                user: user._id,
                email: user.email,
                role: user.role,
                status: user.status
            },

            accesTocken: tocken.accesTocken,
            refreshTokenSchema: tocken.refreshTokenSchema,
        })

    } catch (e) {
        next(e)
    }

}

//Validat Email PUT
export const validateEmail = async (req, res, next) => {
    try {

        const { email } = validatorEmail.parse(req.body)

        //verifico el user
        const user = await User.findById(req.user.id)

        if (!user) {
            throw AppError.notFound("Usuario no encontrado")
        }

        //verifico intentos de verificacion
        if (user.verificationAttempts <= 0) {
            throw AppError.tooManyRequests("Has realizado demasiados intentos de verificacion")
        }

        //Verifico que el codigo sea correcto
        if (user.verificationAttempts !== code) {
            user.verificationAttempts -= 1
            await user.save()
            throw AppError.badRequest("Codigo incorrecto")
        }

        //Si el codigo es correcto actualizo el statrus de user
        user.status = "verified"
        user.verificationCode = null
        user.verificationAttempts = null
        await user.save()

        res.json({ message: "Email verificado exitosamente" })

    } catch (e) {
        next(e)
    }
}

//Actualizar datos personales PUT
export const updatePersonalData = async (req, res, next) => {
    try {

        const { name, lastName, nif } = personaDataInfo.parse(req.body)

        //verifico el nif
        const verifyNif = await user.findOne({
            nif,
            _id: { $ne: req.user.id },
            deleted: false
        })

        if (verifyNif) {
            throw AppError.conflict("Nif ya registrado en otro usuario")
        }

        //Actualizo los datos personales del user
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name: lastaName, nif },
            { new: true, runValidators: true }
        )


        //Respuesta
        res.status(201).json({
            message: "Datos personales actualizados correctamente",
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                nif: user.nif
            }
        })

    } catch (e) {
        next(e)
    }
}


//Actualizacion datos compañia PUT
export const updateCompanyData = async (req, res, next) => {
    try {

        const { name, cif, address, isFreelance } = personalCompany.parse(req.body)

        const user = await User.findById(req.user.id)
        if (!user) {
            throw AppError.notFound("No se ha eencontrado el usuario")
        }

        let company

        if (isFreelance) {
            company = await Company.findOne({
                cif: user.nif,
                deleted: false
            })

            if (!company) {
                //Creo la compañia freelance
                company = Company.create({
                    owner: user._id,
                    name: user.name,
                    cif: user.nif,
                    address: user.address,
                    isFreelance: true
                })
            }
        } else {
            //Busco si el CIF ya existe
            company = await Company.findOne({ cif, deleted: false });

            if (company) {
                // CIF existe → usuario se une a esa compañía como guest
                user.role = "guest";
            } else {
                // CIF no existe → crear nueva compañía no freelance
                company = await Company.create({
                    owner: user._id,
                    name,
                    cif,
                    address,
                    isFreelance: false,
                });
            }
        }

        user.company = company._id
        await user.save()

        res.status(201).json({
            message: "Compañia asiganada-creada correctamente",
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                company: company._id
            },
            company: {
                id: company._id,
                name: company.name,
                cif: company.cif,
                isFreelance: company.isFreelance
            }
        })

    } catch (e) {
        next(e)
    }
}

export const uploadLogo = async (req, res, next) => {
    try {

        //Obtengo el user con populate de compañia
        const userr = await user.findById(req.user.id).populate("company")
        if (!user || !user.company) {
            throw AppError.badRequest("Usuario sin comañia asiganda")
        }

        //VVerifico que se envio un archivs
        if (!req.file) {
            throw AppError.badRequest("No se ha suido el archivo (logo)")
        }

        //Url del logo en uploads
        const logoUrl = `/uploads/${req.file.filename}`

        //Actualiozo los datos de la compañia con la url del logo
        const company = await Company.findByIdAndUpdate(
            user.company._id,
            { logo: logoUrl },
            { new: true }
        )

        //Respuesta
        res.status(201).json({
            message: "Logo subido y actualizado correctamente",
            company: {
                id: company._id,
                name: company.name,
                logo: company.logo
            }
        })


    } catch (e) {
        next(e)
    }
}

//Get user por id
export const getUser = async (req, res, next) => {
    try {

        const user = await User.findById(req.user.id).populate("company")

        if (!user || user.deleted) {
            throw AppError.notFound("Usuario no encontado o eliminado")
        }

        res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                lastName: user.lastName,
                fullName: user.fullName,
                nif: user.nif,
                role: user.role,
                status: user.status,
                company: user.company,
                address: user.address,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });

    } catch (e) {
        next(e)
    }
}

export const refreshToken = async (req, res, next) => {
    try {
        //Validar que el refreshToken existe
        const { refreshToken } = refreshTokenSchema.parse(req.body);

        //Verificar y decodificar el refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        //Verificar que el usuario exista
        const user = await User.findById(decoded.id);
        if (!user || user.deleted) {
            throw AppError.notFound("Usuario no encontrado");
        }

        //Nuevo tocken de acceso
        const tokens = generateTokens(user._id);

        res.status(201).json({
            message: "Token renovado",
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });

    } catch (error) {
        //Si el token expira
        if (error.name === "TokenExpiredError") {
            return next(AppError.unauthorized("Token de acceso expirado"));
        }
        next(error);
    }
};

//Logout POST
export const logout = async (req, res, next) => {
    try {
        // En este caso es logout simple
        // En producción podrías: guardar en lista negra, eliminar de BD, etc.

        res.json({ message: "Sesion cerrada exitosamente" });

    } catch (error) {
        next(error);
    }
}

//Eliminar Usuario Delete
export const deleteUser = async (req, res, next) => {
    try {

        const { soft } = req.query

        //En funcion de si el soft es true  o false se hace boorrado logico (reversible) o fisco (irreversibel)
        if (soft === "true") {
            await User.findByIdAndUpdate(req.user.id, { delted: true })
            res.status(201).json({
                message: "Usuario eliminado (logico)",
            })
        } else {
            await User.findByIdAndDelete(req.user.id)
            res.status(201).json({
                message: "Usuario eliminado (fisico)"
            })
        }

    } catch (e) {
        next(e)
    }
}