import Podcast from '../models/podcast.model';
import { handleHttpError } from "../utils/handleError.js";


//GET ALL PUBLICADOS
export const getAllPodCast = async (req, res) => {
    try {
        const filter = { published: true }; // Por defecto solo publicados

        // Si es admin, mostrar todos
        if (req.user?.role === 'admin') {
            delete filter.published;
        }

        const podcasts = await Podcast.find(filter);
        res.json({ data: podcasts });
    } catch (error) {
        handleHttpError(res, "Error obteniendo podcasts", 400);
    }

}

//GET POR ID 
export const getByIdPodCast = async (req, res) => {
    try {
        const podcastData = await Podcast.findById(req.params.id);

        if (!podcastData) {
            return handleHttpError(res, "Podcast no encontrado", 404);
        }

        //Si no es ni admin ni el autor solo puede ver si esta publicado
        const isAdmin = req.user?.role === 'admin';
        const isAuthor = podcastData.author.toString() === req.user?.id;

        if (!podcastData.published && !isAdmin && !isAuthor) {
            return handleHttpError(res, "No puedes ver este podcast", 403);
        }

        res.json({ data: podcastData });
    } catch (error) {
        handleHttpError(res, "Error obteniendo podcast", 400);
    }

}

//POST 
export const createPodCast = async (req, res) => {
    try {
        const { title, descripcion } = req.body;

        const podcast = await Podcast.create({
            title,
            descripcion,
            author: req.user.id
        });

        res.status(201).json({ data: podcast });
    } catch (error) {
        handleHttpError(res, "Error creando podcast", 400);
    }

}

//PUT
export const updatePodCast = async (req, res) => {
    try {
        const podcast = await Podcast.findById(req.params.id);

        if (!podcast) {
            return handleHttpError(res, "No se ha encontrado el podcast a actualizar", 404);
        }

        if (podcast.author.toString() !== req.user.id) {
            return handleHttpError(res, "No tienes permisos porque no eres el autor", 403);
        }

        const updated = await Podcast.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json({ data: updated });
    } catch (error) {
        handleHttpError(res, "Error actualizando podcast", 400);
    }

}


//DELETE
export const deletePodcast = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return handleHttpError(res, "No tienes permisos para eliminar podcasts", 403);
        }

        const podcast = await Podcast.findByIdAndDelete(req.params.id);

        if (!podcast) {
            return handleHttpError(res, "No se ha encontrado el podcast a eliminar", 404);
        }

        res.status(204).send();
    } catch (error) {
        handleHttpError(res, "Error eliminando podcast", 400);
    }

}

//GET ADMIN
export const getAdminAll = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return handleHttpError(res, "No tienes permisos de administrador", 403);
        }

        const podcasts = await Podcast.find();

        res.json({ data: podcasts });
    } catch (error) {
        handleHttpError(res, "Error obteniendo podcasts", 400);
    }

}

//PATCH 
export const publishPodcast = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return handleHttpError(res, "No tienes permisos de administrador", 403);
        }

        const podcast = await Podcast.findById(req.params.id);

        if (!podcast) {
            return handleHttpError(res, "No se ha encontrado el podcast", 404);
        }

        podcast.published = !podcast.published;
        await podcast.save();

        res.json({
            data: podcast,
            message: `Podcast ${podcast.published ? 'publicado' : 'despublicado'}`
        });
    } catch (error) {
        handleHttpError(res, "Error cambiando estado del podcast", 400);
    }

}