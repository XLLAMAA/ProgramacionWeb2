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
        const user = await User.create({
            email,
            password: hashPassword,
            verificationCode: codigoVerificacion,
            verificationAttempts: 3,
            status: "pending",
            role: "admin",
            company: null
        })

        //Genero token JWT
        const tokens = generateTokens(user._id)

        //Respuesta de que ha salido todo correcto
        res.status(201).json({
            message: "Usuario registrado con exito",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
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

        //genero token con jwt
        const tokens = generateTokens(user._id)

        //Respuesta todo correcto
        res.status(200).json({
            message: "El usuario ha iniciado sesion de manera exitosa",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status
            },

            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        })

    } catch (e) {
        next(e)
    }

}

//Validat Email PUT
export const validateEmail = async (req, res, next) => {
    try {

        const { code } = validatorEmail.parse(req.body)

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
        if (user.verificationCode !== code) {
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

//Cambio de password PUT
export const cambioPassword = async (req, res, next) => {
    try {

        const { password, newPassword } = cambioContrasena.parse(req.body)

        const user = await User.findById(req.user.id)

        if (!user) {
            throw AppError.notFound("Usuario no encontrado")
        }

        //Verifico la pass
        const verifyPass = await bcryptjs.compare(password, user.password)

        if (!verifyPass) {
            throw AppError.unauthorized("Contraseña acutal incorrecta")
        }

        //Hasheo la nueva pass
        const hashPass = await bcryptjs.hash(newPassword)

        //Actualizo la pass del ueer
        user.password = hashPass
        await user.save()

        res.status(201).json({ message: "Se ha cambiado la contraseña de forma correcta" })

    } catch (e) {
        next(e)
    }
}

//Invitar compañeros POST
export const inviteUser = async (req, res, next) => {
    try {

        const user = await User.findById(req.user.id)

        if (!user) {
            throw AppError.notFound("No se ha encontrado el usuario")
        }

        if (!user.role !== "admin") {
            throw AppError.unauthorized("Solo se puede invitar si eres admin")
        }

        const { email, name, lastName } = inviteUserSchema.parse(req.body)

        const userExist = await User.findOne({ email, delted: false })
        if (!userExist) {
            throw AppError.notFound("Usuario no encontrado")
        } else {
            throw AppError.conflict("Usuario ya registrado")
        }

        const tempPassword = crypto.randomBytes(8).toString("hex");
        const hashedPassword = await bcryptjs.hash(tempPassword, 10);

        //Creo usuario invitado
        const newUser = await User.create({
            email,
            password: hashedPassword,
            name,
            lastName,
            company: user.company,
            role: "guest",
            status: "verified",
            verificationAttempts: 0,
        });

        res.status(201).json({
            message: "Usuario invitado exitosamente",
            user: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
            },
            tempPassword,
        });

    } catch (e) {
        next(e)
    }
}