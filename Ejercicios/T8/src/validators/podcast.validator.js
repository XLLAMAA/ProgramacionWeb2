import { zod } from 'zod';

const validCategories = ['tech', 'science', 'history', 'comedy', 'news'];

export const createPodcastSchema = zod.object({
    body: zod.object({
        title: zod.string()
            .min(3, 'El título debe tener al menos 3 caracteres')
            .max(200, 'El título no puede exceder 200 caracteres'),
        description: zod.string()
            .min(10, 'La descripción debe tener al menos 10 caracteres')
            .max(2000, 'La descripción no puede exceder 2000 caracteres'),
        category: zod.enum(validCategories, {
            errorMap: () => ({ message: `La categoría debe ser una de: ${validCategories.join(', ')}` })
        }),
        duration: zod.number()
            .min(60, 'La duración debe ser mínimo 60 segundos'),
        episodes: zod.number()
            .int('Los episodios deben ser un número entero')
            .min(1, 'Debe haber al menos 1 episodio')
            .optional()
            .default(1)
    })
});

export const updatePodcastSchema = zod.object({
    body: zod.object({
        title: zod.string()
            .min(3, 'El título debe tener al menos 3 caracteres')
            .max(200, 'El título no puede exceder 200 caracteres')
            .optional(),
        description: zod.string()
            .min(10, 'La descripción debe tener al menos 10 caracteres')
            .max(2000, 'La descripción no puede exceder 2000 caracteres')
            .optional(),
        category: zod.enum(validCategories, {
            errorMap: () => ({ message: `La categoría debe ser una de: ${validCategories.join(', ')}` })
        }).optional(),
        duration: zod.number()
            .min(60, 'La duración debe ser mínimo 60 segundos')
            .optional(),
        episodes: zod.number()
            .int('Los episodios deben ser un número entero')
            .min(1, 'Debe haber al menos 1 episodio')
            .optional()
    }),
    params: zod.object({
        id: zod.string()
            .regex(/^[0-9a-f]{24}$/, 'ID debe ser un ObjectId válido')
    })
});

export const publishPodcastSchema = zod.object({
    params: zod.object({
        id: zod.string()
            .regex(/^[0-9a-f]{24}$/, 'ID debe ser un ObjectId válido')
    })
});

export const getPodcastSchema = zod.object({
    params: zod.object({
        id: zod.string()
            .regex(/^[0-9a-f]{24}$/, 'ID debe ser un ObjectId válido')
    })
});

export const deletePodcastSchema = zod.object({
    params: zod.object({
        id: zod.string()
            .regex(/^[0-9a-f]{24}$/, 'ID debe ser un ObjectId válido')
    })
});

export const paginationSchema = zod.object({
    query: zod.object({
        page: zod.string()
            .regex(/^\d+$/, 'page debe ser un número')
            .transform(Number)
            .refine(n => n > 0, 'page debe ser mayor que 0')
            .optional()
            .default('1'),
        limit: zod.string()
            .regex(/^\d+$/, 'limit debe ser un número')
            .transform(Number)
            .refine(n => n > 0 && n <= 100, 'limit debe estar entre 1 y 100')
            .optional()
            .default('10')
    })
});

