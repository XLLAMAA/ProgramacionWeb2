import { z } from 'zod';

export const createDeliverySchema = z.object({
    client: z.string().min(1, "El cliente es requerido"),
    project: z.string().min(1, "El proyecto es requerido"),
    format: z.enum(['material', 'hours'], { errorMap: () => ({ message: "Formato debe ser 'material' o 'hours'" }) }),
    description: z.string().min(1, "La descripcion es requerida"),
    workDate: z.string().datetime("Fecha de trabajo invalida"),

    //FORMATO MATERIAL
    material: z.string().optional(),
    quantity: z.number().positive().optional(),
    unit: z.string().optional(),
    //FORMATO HORAS
    hours: z.number().positive().optional(),
    workers: z.array(
        z.object({
            name: z.string().min(1),
            hours: z.number().positive()
        })
    ).optional()
});

export const updateDeliverySchema = z.object({
    client: z.string().optional(),
    project: z.string().optional(),
    format: z.enum(['material', 'hours']).optional(),
    description: z.string().min(1).optional(),
    workDate: z.string().datetime().optional(),
    material: z.string().optional(),
    quantity: z.number().positive().optional(),
    unit: z.string().optional(),
    hours: z.number().positive().optional(),
    workers: z.array(
        z.object({
            name: z.string().min(1),
            hours: z.number().positive()
        })
    ).optional()
});