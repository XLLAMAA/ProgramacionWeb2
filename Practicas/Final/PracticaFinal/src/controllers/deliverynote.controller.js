import Delivery from '../models/DeliveryNote.js';
import AppError from '../utils/AppError.js';
import { generateDeliveryNotePDF } from '../services/pdf.service.js';
import { uploadSignature, uploadPDF } from '../services/storage.service.js';
import { emitDeliveryNoteCreated, emitDeliveryNoteSigned } from '../services/socket.service.js';

export const getDeliveryNotes = async (req, res, next) => {

    try {

        const { page = 1, limit = 10, format, sort = "workDate" } = req.query
        const skip = (page - 1) * limit

        //Contruyo el filtro y expluyo a los que estan eiminados
        const filtro = {
            company: req.user.company,
            deleted: false
        }

        if (format) {
            filtro.format = format
        }

        const totalItems = await Delivery.countDocuments(filtro)
        const totalPages = Math.ceil(totalItems / limit)

        //-1 para que sea descendente
        const deliveryNotes = await Delivery.find(filtro).sort({ [sort]: -1 }).skip(skip).limit(parseInt(limit))

        res.json({
            success: true, data: deliveryNotes,
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

export const getDeliveryNoteById = async (req, res, next) => {
    try {

        const { id } = req.params

        const delivery = await Delivery.findById(id)
        if (!delivery || delivery.deleted) {
            throw AppError.notFound("Albaran no encontrado o eliminado")
        }

        if (delivery.company.toString() !== req.user.company) {
            throw AppError.forbidden("No perteneces a la compañia, con lo que no tienes permisos")
        }

        res.json({ success: true, data: delivery })

    } catch (e) {
        next(e)
    }
}

export const getArchivedDeliveryNotes = async (req, res, next) => {
    try {

        const { page = 1, limit = 10, sort = "workDate" } = req.query
        const skip = (page - 1) * limit

        //Contruyo el filtro y expluyo a los que estan eiminados
        const filtro = {
            company: req.user.company,
            deleted: true
        }

        const totalItems = await Delivery.countDocuments(filtro)
        const totalPages = Math.ceil(totalItems / limit)

        const deliveryNotes = await Delivery.find(filtro).sort({ [sort]: -1 }).skip(skip).limit(parseInt(limit))

        res.json({
            success: true, data: deliveryNotes,
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

export const createDeliveryNote = async (req, res, next) => {
    try {

        const { client, project, format, description, workDate, material, quantity, unit, hours, workers } = req.body
        const userId = req.user.id

        //Verifico el formato
        if (!['material', 'hours'].includes(format)) {
            throw AppError.badRequest("El formato solo puede ser material o hours")
        }

        const newDelivery = new Delivery({
            user: userId,
            company: req.user.company,
            client,
            project,
            format,
            description,
            workDate,
            ...(format === 'material' && { material, quantity, unit }),
            ...(format === 'hours' && { hours, workers })
        })

        await newDelivery.save()

        //Emito el evento   
        emitDeliveryNoteCreated(req.user.company, newDelivery)

        res.status(201).json({ success: true, data: newDelivery })

    } catch (e) {
        next(e)
    }
}

export const updateDeliveryNote = async (req, res, next) => {
    try {

        const { id } = req.params
        const { client, project, format, description, workDate, material, quantity, unit, hours, workers } = req.body

        const delivery = await Delivery.findById(id)
        if (!delivery) {
            throw AppError.notFound("Delivery no encontrado")
        }

        if (delivery.company.toString() !== req.user.company) {
            throw AppError.forbidden("No tienes permisos en esta compañia")
        }

        //Compruebo si esta firmado 
        if (delivery.signed) {
            throw AppError.badRequest("No puedes editar un Albaran ya fimado")
        }

        delivery.description = description || delivery.description
        delivery.workDate = workDate || delivery.workDate
        delivery.client = client || delivery.client
        delivery.project = project || delivery.project

        //No permito que se edite el  formato una vez creado
        if (format && format !== delivery.format) {
            throw AppError.badRequest("No se puede cambiar el formato una vez creado el Albaran")
        }

        //En funcion del formato escogido...
        if (delivery.format === 'material') {
            delivery.material = material || delivery.material
            delivery.quantity = quantity || delivery.quantity
            delivery.unit = unit || delivery.unit
        } else if (delivery.format === 'hours') {
            delivery.hours = hours || delivery.hours
            delivery.workers = workers || delivery.workers
        }

        await delivery.save()

        res.status(200).json({ success: true, data: delivery })

    } catch (e) {
        next(e)
    }
}

export const restoreDeliveryNote = async (req, res, next) => {
    try {

        const { id } = req.params
        const delivery = await Delivery.findById(id)

        if (!delivery) {
            throw AppError.notFound("Albaran no encontrado")
        }

        if (!delivery.deleted) {
            throw AppError.badRequest("Este Albaran no esta archivado")
        }

        if (delivery.company.toString() !== req.user.company) {
            throw AppError.forbidden("No tienes permisos en esta compañia")
        }

        delivery.deleted = false
        await delivery.save()

        res.json({ success: true, data: delivery })

    } catch (e) {
        next(e)
    }
}

export const deleteDeliveryNote = async (req, res, next) => {
    try {

        const { id } = req.params
        const { soft = true } = req.query

        const delivery = await Delivery.findById(id)
        if (!delivery || delivery.deleted) {
            throw AppError.notFound("Albaran no encontrado o eliminado ya")
        }

        if (delivery.company.toString() !== req.user.company) {
            throw AppError.forbidden("No tienes permisos en esta compañia")
        }

        //Opciones de borrado: 1. Maracar como eliminado 2. Borrar completamente
        if (soft) {
            delivery.deleted = true
            await delivery.save()
        } else {
            await Delivery.findByIdAndDelete(id)
        }

        res.json({ success: true, message: "Albaran eliminado correctamente" })

    } catch (e) {
        next(e)
    }
}

export const signDeliveryNote = async (req, res, next) => {
    try {

        const { id } = req.params
        const signFile = req.file
        const delivery = await Delivery.findById(id)

        if (!signFile) {
            throw AppError.badRequest("Debes proporcionar imagen de firma")
        }

        if (!delivery) {
            throw AppError.notFound("Albaran no encontrado")
        }

        if (delivery.company.toString() !== req.user.company) {
            throw AppError.forbidden("No tienes permisos en esta compañia")
        }

        if (delivery.signed) {
            throw AppError.badRequest("No puedes editar un albaran ya fimado")
        }

        //Pasos de creacion, firma, subida, y  url
        // 1. Generar PDF del albaran
        const pdfData = {
            projectName: delivery.project?.name || 'N/A',
            projectCode: delivery.project?.projectCode || 'N/A',
            clientName: delivery.client?.name || 'N/A',
            workDate: delivery.workDate,
            format: delivery.format,
            description: delivery.description,
            material: delivery.material,
            quantity: delivery.quantity,
            unit: delivery.unit,
            hours: delivery.hours,
            workers: delivery.workers
        };

        const pdfBuffer = await generateDeliveryNotePDF(pdfData);

        // 2. SUBIR FIRMA a Cloudinary
        const signatureResult = await uploadSignature(req.file.buffer, delivery._id);

        // 3. SUBIR PDF a Cloudinary
        const pdfResult = await uploadPDF(pdfBuffer, delivery._id);

        // 4. GUARDAR URLS en la BD
        delivery.signed = true;
        delivery.signedAt = new Date();
        delivery.signatureUrl = signatureResult.url;
        delivery.pdfUrl = pdfResult.url;

        await delivery.save();

        //Emito el evento
        emitDeliveryNoteSigned(req.user.company, delivery);

        res.json({
            success: true,
            message: "Albaran firmado correctamente",
            data: delivery
        });

    } catch (e) {
        next(e)
    }
}
