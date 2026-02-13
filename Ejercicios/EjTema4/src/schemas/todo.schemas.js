// src/schemas/todo.schema.js
import { z } from 'zod';

export const createTodoSchema = z.object({
    body: z.object({
        title: z.string()
            .min(3, 'El título debe tener al menos 3 caracteres')
            .max(100, 'El título no puede exceder 100 caracteres'),
        descripcion: z.string().optional(),
        completed: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']),
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

export const toggleTodoSchema = z.object({
    params: z.object({ id: z.string().regex(/^\d+$/) })
});