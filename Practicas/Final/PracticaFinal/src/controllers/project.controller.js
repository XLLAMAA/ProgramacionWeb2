import Project from '../models/Project.js';
import AppError from '../utils/AppError.js';
import { emitProjectCreated } from '../services/socket.service.js';

export const getProjects = async (req, res, next) => {

    try {

        const { page = 1, limit = 10, name, sort = "createdAt" } = req.query
        const skip = (page - 1) * limit

        //Contruyo el filtro y excluyo a los que estan eliminados
        const filtro = {
            company: req.user.company,
            deleted: false
        }

        if (name) {
            filtro.name = { $regex: name, $options: 'i' }
        }

        const totalItems = await Project.countDocuments(filtro)
        const totalPages = Math.ceil(totalItems / limit)

        const projects = await Project.find(filtro).sort({ [sort]: 1 }).skip(skip).limit(parseInt(limit))

        res.json({
            success: true, data: projects,
            pagination: {
                currentPage: parseInt(page),
                totalItems,
                totalPages,
                limit: parseInt(limit)
            }
        })

    } catch (e) {
        next(e)
    }

}

export const getProjectById = async (req, res, next) => {
    try {

        const { id } = req.params

        const project = await Project.findById(id)
        if (!project || project.deleted) {
            throw AppError.notFound("Proyecto no encontrado o eliminado")
        }

        if (project.company.toString() !== req.user.company.toString()) {
            throw AppError.forbidden("No perteneces a la compañia, con lo que no tienes permisos")
        }

        res.json({ success: true, data: project })

    } catch (e) {
        next(e)
    }
}

export const getArchivedProjects = async (req, res, next) => {
    try {

        const { page = 1, limit = 10, sort = 'createdAt' } = req.query
        const skip = (page - 1) * limit

        const filtro = {
            company: req.user.company,
            deleted: true
        }

        const totalItems = await Project.countDocuments(filtro)
        const totalPages = Math.ceil(totalItems / limit)

        const projects = await Project.find(filtro).sort({ [sort]: 1 }).skip(skip).limit(parseInt(limit))

        res.json({
            success: true,
            data: projects,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems,
                limit: parseInt(limit)
            }
        })

    } catch (e) {
        next(e)
    }
}

export const createProject = async (req, res, next) => {
    try {

        const { name, projectCode, client, email, notes, active, address } = req.body;
        const userId = req.user.id

        const newProject = new Project({
            user: userId,
            company: req.user.company,
            name,
            projectCode,
            client,
            email,
            notes,
            active,
            address
        })

        await newProject.save()

        // Emitir evento de proyecto creado
        emitProjectCreated(req.user.company, newProject);

        res.status(201).json({ success: true, data: newProject })

    } catch (e) {
        next(e)
    }
}

export const updateProject = async (req, res, next) => {

    try {

        const { id } = req.params
        const { name, projectCode, client, email, notes, active, address } = req.body

        const project = await Project.findById(id)
        if (!project) {
            throw AppError.notFound("No se ha encontrado el proyecto buscado")
        }

        if (project.company.toString() !== req.user.company) {
            throw AppError.forbidden("No tienes permisos en esta compañia")
        }

        //Compruebo que el projectCode que va a cambiar es unico (no existe o no esta en uso)
        if (projectCode && projectCode !== project.projectCode) {
            const exists = await Project.findOne({ projectCode, company: req.user.company });
            if (exists) {
                throw AppError.conflict("Este código de proyecto ya existe");
            }
        }

        project.name = name || project.name
        project.projectCode = projectCode || project.projectCode
        project.email = email || project.email
        project.client = client || project.client
        project.notes = notes || project.notes
        if (active !== undefined) project.active = active
        if (address) project.address = address

        await project.save()

        res.status(200).json({ success: true, data: project })

    } catch (e) {
        next(e)
    }

}

export const restoreProject = async (req, res, next) => {
    try {

        const { id } = req.params

        const project = await Project.findById(id)

        if (!project) {
            throw AppError.notFound("Proyecto no encontrado")
        }

        if (!project.deleted) {
            throw AppError.badRequest("Este proyecto no está archivado")
        }

        if (project.company.toString() !== req.user.company.toString()) {
            throw AppError.forbidden("No tienes permisos en esta compañia")
        }

        project.deleted = false
        await project.save()

        res.json({ success: true, data: project })

    } catch (e) {
        next(e)
    }
}

export const deleteProject = async (req, res, next) => {
    try {

        const { id } = req.params
        const { soft = true } = req.query

        const project = await Project.findById(id)
        if (!project) {
            throw AppError.notFound("Proyecto no encontrado")
        }

        if (project.company.toString() !== req.user.company) {
            throw AppError.forbidden("No tienes permisos en esta compañia")
        }

        //Opciones de borrado: 1. Marcar como eliminado 2. Borrar completamente
        if (soft) {
            project.deleted = true
            await project.save()
        } else {
            await Project.findByIdAndDelete(id)
        }

        res.json({ success: true, message: "Proyecto eliminado correctamente" })

    } catch (e) {
        next(e)
    }
}
