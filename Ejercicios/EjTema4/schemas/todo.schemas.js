// src/schemas/usuarios.schema.js
import { z } from 'zod';

export const createTodoSchema = z.object({
    body: z.object({
        title: z.string()
            .min(3, 'El título debe tener al menos 3 caracteres')
            .max(100, 'El título no puede exceder 100 caracteres'),
        lenguaje: z.enum(['javascript', 'python', 'java', 'csharp']),
        priority: z.enum(['basico', 'intermedio', 'avanzado']),
        descripcion: z.string().optional(),
        completed: z.string().optional()
    })
});

export const updateTodoSchema = z.object({
    body: z.object({
        completed: z.boolean()
    }),
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID debe ser numérico')
    })
});