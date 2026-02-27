import Movie from "../models/movie.model.js";
import { handleHttpError } from "../utils/handleError.js";

//GET: Por filtro
export const getMovies = async (req, res) => {
    const { genre } = req.query;

    const filter = {};
    if (genre) {
        filter.genre = genre;
    }

    const movies = await Movie.find(filter).sort({ createdAt: -1 })

    res.json({ data: movies });

};

//GET: Por id
export const getByIdMovie = async (req, res) => {
    const id = await Movie.findById(req.params.id);

    if (!id) {
        return handleHttpError(res, "Pelicula no encontrada", 404)
    }

    res.json({ data: id })

};

//POST: Nueva pelicula
export const createMovie = async (req, res) => {
    const body = { ...req.body };

    if (body.year !== undefined) {
        body.year = Number(body.year);
    }

    if (body.copies !== undefined) {
        body.copies = Number(body.copies)
    }

    if (body.availableCopies !== undefined) {
        body.availableCopies = Number(body.availableCopies)
    }

    if (body.availableCopies !== undefined) {
        body.availableCopies = body.copies ?? 5;
    }

    if (body.availableCopies > body.copies) {
        body.availableCopies = body.copies;
    }

    const movie = await Movie.create(body)

    res.status(201).json({ data: movie })

};

//Put: Actualizar pelicula
export const updateMovie = async (req, res) => {
    const movie = await Movie.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!movie) {
        return handleHttpError(res, "Pelicula no encontrada para actualizar", 404)
    }

    res.json({ data: movie })

};

//DELETE: Eliminar por id
export const deleteMovieById = async (req, res) => {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
        return handleHttpError(res, "Pelicula no encontrada por el id", 404)
    }

    res.status(204).send();

}

//POST: Alquilar pelicula
export const rentMovieById = async (req, res) => {
    const movie = await Movie.findById(req.params.id)

    if (!movie) {
        return handleHttpError(res, "Pelicula no encontrada por el id", 404)
    }

    if (movie.availableCopies === 0) {
        return handleHttpError(res, "No hay copias disponibles de la palicula", 400)
    }

    movie.availableCopies -= 1; //SI hay quita una copia
    movie.timesRented += 1; //Suma una vez a los alquileres de la pelicula

    await movie.save(); //Guarad

    res.json({ data: movie })

}

//POST: Devolver pelicula
export const returnMovieById = async (req, res) => {

    const movie = await Movie.findById(req.params.id);

    if (!movie) {
        return handleHttpError(res, "Película no encontrada", 404);
    }

    if (movie.availableCopies >= movie.copies) {
        return handleHttpError(res, "No hay copias que devolver", 400);
    }

    movie.availableCopies += 1;

    await movie.save();

    res.json({ data: movie });

}

//PATCH: Subir/Cambiar la caratula de la pelicula
export const setMovieCover = async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
        return handleHttpError(res, "Película no encontrada", 404);
    }

    if (!req.file) {
        return handleHttpError(res, "No se ha enviado ninguna imagen", 400);
    }

    movie.cover = req.file.filename;
    await movie.save();

    res.json({ data: movie });
};

//GET: Obtener la imagen de la caratula
export const getMovieCover = async (req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
        return handleHttpError(res, "Película no encontrada", 404);
    }

    if (!movie.cover) {
        return handleHttpError(res, "La película no tiene carátula", 404);
    }

    res.sendFile(`${process.cwd()}/src/storage/${movie.cover}`);
};

//GET: Top 5 peliculas mas alquiladas
export const getTopMovies = async (req, res) => {
    const movies = await Movie.find()
        .sort({ timesRented: -1 })
        .limit(5);

    res.json({ data: movies });
};

