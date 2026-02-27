// src/schemas/movie.schema.js
import { z } from "zod";

const currentYear = new Date().getFullYear();

const genreEnum = z.enum(["action", "comedy", "drama", "horror", "scifi"]);

const movieBodyBase = {
    title: z.string().min(2, "El título debe tener mínimo 2 caracteres"),
    director: z.string().min(1, "El director es requerido"),
    year: z.coerce.number().int().min(1888, "El año debe ser >= 1888").max(currentYear, `El año no puede ser mayor que ${currentYear}`),
    genre: genreEnum,
    copies: z.coerce.number().int().min(0, "copies no puede ser negativo").optional(),
    availableCopies: z.coerce.number().int().min(0, "availableCopies no puede ser negativo").optional(),
};

// POST /api/movies
export const createMovieSchema = z.object({
    body: z.object(movieBodyBase),
    query: z.object({}).optional(),
    params: z.object({}).optional(),
});

// PUT /api/movies/:id
export const updateMovieSchema = z.object({
    body: z.object(movieBodyBase).partial(), // en update permitimos parcial
    query: z.object({}).optional(),
    params: z.object({
        id: z.string().min(1),
    }),
});