import { Router } from "express";
import {
    getMovies,
    getByIdMovie,
    createMovie,
    updateMovie,
    deleteMovieById,
    rentMovieById,
    returnMovieById,
    setMovieCover,
    getMovieCover,
    getTopMovies,
} from "../controllers/movies.controller.js";

import { validate, validateObjectId } from '../middleware/validate.middleware.js';
import { createMovieSchema, updateMovieSchema } from '../schemas/movie.schema.js';

const router = Router();

//Rutas GET
router.get("/", getMovies)
router.get("/:id", getByIdMovie);
router.get("/:id/cover", getMovieCover);
router.get("/stats/top", getTopMovies);

//POST
router.post("/", createMovie);
router.post("/:id/rent", rentMovieById);
router.post("/:id/return", returnMovieById);

//PUT
router.put("/:id", updateMovie);

//DELETE
router.delete("/:id", deleteMovieById);

//PATCH
router.patch("/:id/cover", setMovieCover);

export default router;