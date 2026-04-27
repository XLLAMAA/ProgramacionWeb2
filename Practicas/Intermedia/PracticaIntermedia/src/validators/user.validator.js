import { z } from "zod"

//Registrarse
export const registerSchema = z.object({
    email:
        z.string({ requiredError: "Introduce tu email" })
            .email("Email invalido")
            .transform(email => email.toLowerCase().trim()),

    password:
        z.string({ requiredError: "Introduce tu contraseña" })
            .min(8, "La contraseña debe tener al menos 8 caracteres")

})

//Logearse
export const loginSchema = z.object({
    email:
        z.string({ requiredError: "Introduce tu email" })
            .email("Email invalido")
            .transform(email => email.toLowerCase().trim()),

    password:
        z.string({ requiredError: "Introduce tu contraseña" })
            .min(1, "Contraseña requerida")
})

//Validar email
export const validatorEmail = z.object({
    code:
        z.string({ requiredError: "Codigo de verificacion es requerido" })
            .regex(/^\d{6}$/, "El codigo debe tener exactamente 6 dígitos"),
})

//Datos personales
export const personaDataInfo = z.object({
    name:
        z.string({ requiredError: "Introduce tu nombre" })
            .min(1, "Nombre no puede estar vacío")
            .transform(val => val.trim()),
    lastName:
        z.string({ requiredError: "Introduce tus apellidos" })
            .min(1, "Apellido no puede estar vacío")
            .transform(val => val.trim()),
    nif:
        z.string({ requiredError: "Introduce tu NIF" })
            .min(5, "El NIF debe tener 5 caracteres mínimo")
            .transform(val => val.toUpperCase().trim()),

});

//Direccion
export const addressSchema = z.object({
    street: z
        .string({ requiredError: "Introduce la calle" })
        .min(1, "La calle no puede estar vacía")
        .transform(val => val.trim()),
    number: z
        .string({ requiredError: "Introduce el número de la calle" })
        .min(1, "El número no puede estar vacío")
        .transform(val => val.trim()),
    postal: z
        .string({ requiredError: "Introduce el código postal" })
        .min(1, "El código postal no puede estar vacío")
        .transform(val => val.trim()),
    city: z
        .string({ requiredError: "Introduce la ciudad" })
        .min(1, "La ciudad no puede estar vacía")
        .transform(val => val.trim()),
    province: z
        .string({ requiredError: "Introduce la provincia" })
        .min(1, "La provincia no puede estar vacía")
        .transform(val => val.trim()),
});

//Datos compañia
export const personalCompany = z.object({
    name:
        z.string({ requiredError: "Introduce el nombre de la empresa" })
            .min(1, "Nombre no puede estar vacío")
            .transform(val => val.trim()),
    cif:
        z.string({ requiredError: "Introduce el CIF" })
            .min(1, "CIF no puede estar vacío")
            .transform(val => val.toUpperCase().trim()),
    isFreelance:
        z.boolean({ requiredError: "Introduce si eres freelance" })
            .default(false),

    address: addressSchema,
});

//Cambio de contraseña
export const cambioContraseña =
    z.object({
        currentPassword: z
            .string({ requiredError: "Introduce la contraseña" })
            .min(1, "Contraseña actual es requerida"),
        newPassword: z
            .string({ requiredError: "Introduce la nueva contraseña" })
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
        .string({ requiredError: "Introduce el refresh token" })
        .min(1, "Refresh token es requerido"),
});

//Invitar companeros
export const inviteUserSchema = z.object({
    email: z
        .string({ requiredError: "Introduce el email" })
        .email("Email invalido")
        .transform(email => email.toLowerCase().trim()),
    name: z
        .string({ requiredError: "Introduce el nombre" })
        .min(1, "Nombre no puede estar vacio")
        .transform(val => val.trim()),
    lastName: z
        .string({ requiredError: "Introduce los apellidos" })
        .min(1, "Apellidos no pueden estar vacios")
        .transform(val => val.trim()),
});








