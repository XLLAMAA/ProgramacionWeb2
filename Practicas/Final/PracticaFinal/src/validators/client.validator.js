import { z } from 'zod';

export const createClientSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    cif: z.string().min(1, "Cif requerido"),
    email: z.string().email("Email requerido"),
    phone: z.string().optional(),
    address: z.object({
        street: z.string().min(1),
        number: z.string().min(1),
        postal: z.string().min(1),
        city: z.string().min(1),
        province: z.string().min(1)
    }).optional()
});

export const updateClientSchema = z.object({
    name: z.string().min(1).optional(),
    cif: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.object({
        street: z.string().optional(),
        number: z.string().optional(),
        postal: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional()
    }).optional()
});