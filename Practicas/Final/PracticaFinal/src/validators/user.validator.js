import { z } from "zod"

//Registrarse
export const registerSchema = z.object({
    email:
        z.string({ error: "Introduce tu email" })
            .email("Email invalido")
            .transform(email => email.toLowerCase().trim()),

    password:
        z.string({ error: "Introduce tu contraseña" })
            .min(8, "La contraseña debe tener al menos 8 caracteres")
})

//Logearse
export const loginSchema = z.object({
    email:
        z.string({ error: "Introduce tu email" })
            .email("Email invalido")
            .transform(email => email.toLowerCase().trim()),

    password:
        z.string({ error: "Introduce tu contraseña" })
            .min(1, "Contraseña requerida")
})

//Validar email
export const validatorEmail = z.object({
    code:
        z.string({ error: "Codigo de verificacion es requerido" })
            .regex(/^\d{6}$/, "El codigo debe tener exactamente 6 dígitos"),
})

//Datos personales
export const personaDataInfo = z.object({
    name:
        z.string({ error: "Introduce tu nombre" })
            .min(1, "Nombre no puede estar vacío")
            .transform(val => val.trim()),
    lastName:
        z.string({ error: "Introduce tus apellidos" })
            .min(1, "Apellido no puede estar vacío")
            .transform(val => val.trim()),
    nif:
        z.string({ error: "Introduce tu NIF" })
            .min(5, "El NIF debe tener 5 caracteres mínimo")
            .transform(val => val.toUpperCase().trim()),
});

//Direccion
export const addressSchema = z.object({
    street: z.string({ error: "Introduce la calle" }).min(1).transform(val => val.trim()),
    number: z.string({ error: "Introduce el número" }).min(1).transform(val => val.trim()),
    postal: z.string({ error: "Introduce el código postal" }).min(1).transform(val => val.trim()),
    city: z.string({ error: "Introduce la ciudad" }).min(1).transform(val => val.trim()),
    province: z.string({ error: "Introduce la provincia" }).min(1).transform(val => val.trim()),
});

//Datos compañia
export const personalCompany = z.object({
    name:
        z.string({ error: "Introduce el nombre de la empresa" })
            .min(1, "Nombre no puede estar vacío")
            .transform(val => val.trim()),
    cif:
        z.string({ error: "Introduce el CIF" })
            .min(1, "CIF no puede estar vacío")
            .transform(val => val.toUpperCase().trim()),
    isFreelance:
        z.boolean()
            .default(false),

    address: addressSchema.optional(),
});

//Cambio de contraseña
export const cambioContrasena =
    z.object({
        currentPassword: z
            .string({ error: "Introduce la contraseña" })
            .min(1, "Contraseña actual es requerida"),
        newPassword: z
            .string({ error: "Introduce la nueva contraseña" })
            .min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    })
        .refine(
            data => data.currentPassword !== data.newPassword,
            {
                message: "La nueva contraseña debe ser diferente a la actual",
                path: ["newPassword"],
            }
        );

//Refresh tocken
export const refreshTokenSchema = z.object({
    refreshToken: z
        .string({ error: "Introduce el refresh token" })
        .min(1, "Refresh token es requerido"),
});

//Invitar companeros
export const inviteUserSchema = z.object({
    email: z
        .string({ error: "Introduce el email" })
        .email("Email invalido")
        .transform(email => email.toLowerCase().trim()),
    name: z
        .string({ error: "Introduce el nombre" })
        .min(1, "Nombre no puede estar vacio")
        .transform(val => val.trim()),
    lastName: z
        .string({ error: "Introduce los apellidos" })
        .min(1, "Apellidos no pueden estar vacios")
        .transform(val => val.trim()),
});