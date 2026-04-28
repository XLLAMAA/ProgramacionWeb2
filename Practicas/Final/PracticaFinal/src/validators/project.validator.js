import { z } from 'zod';

export const projectValidator = ({
    create: z.object({
        body: z.object({
            name: z.string().min(1, "El nombre es requerido"),
            projectCode: z.string().min(1, "Codigo del proyecto requerido"),
            client: z.string().min(1, "Cliente requerido"),
            email: z.string().email("Email requerido"),
            notes: z.string().optional(),
            active: z.boolean().default(true),
            address: z.object({
                street: z.string().min(1),
                number: z.string().min(1),
                postal: z.string().min(1),
                city: z.string().min(1),
                province: z.string().min(1)
            }).optional()
        })
    }),

    //Todo lo que se actualize es opcional
    update: z.object({
        body: z.object({
            name: z.string().min(1).optional(),
            projectCode: z.string().optional(),
            client: z.string().optional(),
            email: z.string().email().optional(),
            notes: z.string().optional(),
            active: z.boolean().optional(),
            address: z.object({
                street: z.string().optional(),
                number: z.string().optional(),
                postal: z.string().optional(),
                city: z.string().optional(),
                province: z.string().optional()
            }).optional()
        })
    })
})
