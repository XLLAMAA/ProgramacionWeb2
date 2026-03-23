import { zod } from 'zod'

//VALIDACION EN EL REGISTRO
export const registerSchema = zod.object()({

    body: zod.object({
        name: zod.object()
            .min(2, 'El nombre debe tener al menos 2 caracteres')
            .max(15, 'El nombre no puede tener mas de 15 caracteres'),
        email: zod.object()
            .email('El email debe ser valido'),
        password: zod.object()
            .min(2, 'La contraseña debe tener al menos 2 caracteres')
            .max(8, 'La contraseña no puede tener mas de 8 caracteres'),
    })

})

//VALIDACION EN EL LOGIN
export const loginSchemas = zod.object()({

    body: zod.object({
        email: zod.object()
            .email('El email es necesario para iniciar sesion'),
        password: zod.object()
            .min(1, 'La contraseña es necesaria para iniciar sesion')
    })

})

//VALIDACION ANTE CAMBIO DE CONTRASEÑA
export const changePassword = zod.object()({
    body: zod.object({
        password: zod.string()
            .min(1, 'la contraseña actual es requerida para cambiarla'),
        newPassword: zod.string()
            .min(1, 'La nueva contraseña debe tener al menos un caracter')
            .max(8, 'La contraseña debe tener al menos 8 caracteres')
    })

});