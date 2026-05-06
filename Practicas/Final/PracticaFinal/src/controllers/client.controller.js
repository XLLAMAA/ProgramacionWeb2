import Client from '../models/Client.js';
import AppError from '../utils/AppError.js';
import { emitClientCreated } from '../services/socket.service.js';

export const getClientes = async (req, res, next) => {

    try {

        const { page = 1, limit = 10, name, sort = "createdAt" } = req.query
        const skip = (page - 1) * limit

        //Contruyo el filtro y expluyo a los que estan eiminados
        const filtro = {
            company: req.user.company,
            deleted: false
        }

        if (name) {
            filtro.name = { $regex: name, $options: 'i' }
        }

        const totalItems = await Client.countDocuments(filtro)
        const totalPages = Math.ceil(totalItems / limit)

        const clients = await Client.find(filtro).sort({ [sort]: 1 }).skip(skip).limit(parseInt(limit))

        res.json({
            success: true, data: clients,
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

export const getClientById = async (req, res, next) => {
    try {

        const { id } = req.params

        const client = await Client.findById(id)
        if (!client || client.deleted) {
            throw AppError.notFound("Cliente no encontrado o eliminado")
        }

        if (client.company.toString() !== req.user.company) {
            throw AppError.forbidden("No perteneces a la compañia, con lo que no tienes permisos")
        }

        res.json({ success: true, data: client })

    } catch (e) {
        next(e)
    }
}

export const getArchivedClients = async (req, res, next) => {
    try {

        const { page = 1, limit = 10, sort = 'createdAt' } = req.query
        const skip = (page - 1) * limit

        const filtro = {
            company: req.user.company,
            deleted: true
        }

        const totalItems = await Client.countDocuments(filtro)
        const totalPages = Math.ceil(totalItems / limit)

        const clients = await Client.find(filtro).sort({ [sort]: 1 }).skip(skip).limit(parseInt(limit))

        res.json({
            success: true,
            data: clients,
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

export const createClient = async (req, res, next) => {
    try {

        const { name, cif, email, phone, address } = req.body;
        const userId = req.user.id

        const newClient = new Client({
            user: userId,
            company: req.user.company,
            name,
            cif,
            email,
            phone,
            address
        })

        await newClient.save()

        // Emitir evento de cliente creado
        emitClientCreated(req.user.company, newClient);

        res.status(201).json({ success: true, data: newClient })

    } catch (e) {
        next(e)
    }
}

export const updateClient = async (req, res, next) => {

    try {

        const { id } = req.params
        const { name, cif, email, phone, address } = req.body

        const client = await Client.findById(id)
        if (!client) {
            throw AppError.notFound("No se ha encontrado el cliente buscado")
        }

        if (client.company.toString() !== req.user.company) {
            throw AppError.forbidden("No tienes permisos en esta compañia")
        }

        //Compruebo que el cif que va a cambiar es unico (no existe o no esta en uso)
        if (cif && cif !== client.cif) {
            const exists = await Client.findOne({ cif, company: req.user.company });
            if (exists) {
                throw AppError.conflict("Este CIF ya existe");
            }
        }

        client.name = name || client.name
        client.email = email || client.email
        client.phone = phone || client.phone
        if (address) client.address = address

        await client.save()

        res.status(200).json({ success: true, data: client })

    } catch (e) {
        next(e)
    }

}

export const restoreClient = async (req, res, next) => {
    try {

        const { id } = req.params

        const client = await Client.findById(id)

        if (!client) {
            throw AppError.notFound("Cliente no encontrado")
        }

        if (!client.deleted) {
            throw AppError.badRequest("Este cliente no está archivado")
        }

        if (client.company.toString() !== req.user.company) {
            throw AppError.forbidden("No tienes permisos en esta compañia")
        }

        client.deleted = false
        await client.save()

        res.json({ success: true, data: client })

    } catch (e) {
        next(e)
    }
}

export const deleteClient = async (req, res, next) => {
    try {

        const { id } = req.params
        const { soft = true } = req.query

        const client = await Client.findById(id)
        if (!client || client.deleted) {
            throw AppError.notFound("Cliente no encontrado o eliminado ya")
        }

        if (client.company.toString() !== req.user.company) {
            throw AppError.forbidden("No tienes permisos en esta compañia")
        }

        //Opciones de borrado: 1. Maracar como eliminado 2. Borrar completamente
        if (soft) {
            client.deleted = true
            await client.save()
        } else {
            await Client.findByIdAndDelete(id)
        }

        res.json({ success: true, message: "Cliente eliminado correctamente" })

    } catch (e) {
        next(e)
    }
}

