import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createDeliverySchema, updateDeliverySchema } from '../validators/deliverynote.validator.js';
import { upload } from '../middleware/upload.js';

//controller
import {
    getDeliveryNotes,
    getDeliveryNoteById,
    getArchivedDeliveryNotes,
    createDeliveryNote,
    updateDeliveryNote,
    restoreDeliveryNote,
    deleteDeliveryNote,
    signDeliveryNote,
    getPDFDeliveryNote
} from '../controllers/deliverynote.controller.js';


const router = Router()

router.use(authMiddleware)

/**
 * @openapi
 * /api/deliverynote:
 *   post:
 *     tags:
 *       - Albaranes
 *     summary: Crear nuevo albarán
 *     description: Crea un nuevo albarán de material u horas para un proyecto
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryNote'
 *     responses:
 *       201:
 *         description: Albarán creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DeliveryNote'
 *       400:
 *         description: Validación fallida
 */
router.post('/', validate(createDeliverySchema), createDeliveryNote)

/**
 * @openapi
 * /api/deliverynote:
 *   get:
 *     tags:
 *       - Albaranes
 *     summary: Listar albaranes
 *     description: Obtiene todos los albaranes de la empresa con paginación y filtros avanzados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: project
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por ID de proyecto
 *       - name: client
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por ID de cliente
 *       - name: format
 *         in: query
 *         schema:
 *           type: string
 *           enum: [material, hours]
 *       - name: signed
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: from
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicio (YYYY-MM-DD)
 *       - name: to
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha fin (YYYY-MM-DD)
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           default: -workDate
 *     responses:
 *       200:
 *         description: Lista de albaranes paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeliveryNote'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', getDeliveryNotes)

/**
 * @openapi
 * /api/deliverynote/{id}:
 *   get:
 *     tags:
 *       - Albaranes
 *     summary: Obtener albarán por ID
 *     description: Obtiene los datos completos de un albarán con populate de usuario, cliente y proyecto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del albarán
 *     responses:
 *       200:
 *         description: Datos del albarán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DeliveryNote'
 *       404:
 *         description: Albarán no encontrado
 */
/**
 * @openapi
 * /api/deliverynote/archived:
 *   get:
 *     tags:
 *       - Albaranes
 *     summary: Listar albaranes archivados
 *     description: Obtiene todos los albaranes que han sido eliminados de forma suave
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes archivados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeliveryNote'
 */
router.get('/archived', getArchivedDeliveryNotes)

router.get('/:id/pdf', getPDFDeliveryNote)

router.get('/:id', getDeliveryNoteById)

/**
 * @openapi
 * /api/deliverynote/{id}/sign:
 *   post:
 *     tags:
 *       - Albaranes
 *     summary: Firmar albarán
 *     description: Sube una imagen de firma y genera el PDF del albarán firmado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del albarán
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: ['signature']
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *                 description: Imagen de la firma (JPEG, PNG, GIF, WebP)
 *     responses:
 *       200:
 *         description: Albarán firmado y PDF generado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DeliveryNote'
 *       400:
 *         description: Archivo de firma inválido
 *       403:
 *         description: El albarán ya está firmado
 *       404:
 *         description: Albarán no encontrado
 */
router.post('/:id/sign', upload.single('signature'), signDeliveryNote)

/**
 * @openapi
 * /api/deliverynote/{id}:
 *   put:
 *     tags:
 *       - Albaranes
 *     summary: Actualizar albarán
 *     description: Actualiza los datos de un albarán (no permitido si está firmado)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryNote'
 *     responses:
 *       200:
 *         description: Albarán actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DeliveryNote'
 *       403:
 *         description: No se puede modificar un albarán firmado
 *       404:
 *         description: Albarán no encontrado
 */
router.put('/:id', validate(updateDeliverySchema), updateDeliveryNote)

/**
 * @openapi
 * /api/deliverynote/{id}/restore:
 *   patch:
 *     tags:
 *       - Albaranes
 *     summary: Restaurar albarán archivado
 *     description: Restaura un albarán que fue eliminado de forma suave
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán restaurado
 *       404:
 *         description: Albarán no encontrado
 */
router.patch('/:id/restore', restoreDeliveryNote)

/**
 * @openapi
 * /api/deliverynote/{id}:
 *   delete:
 *     tags:
 *       - Albaranes
 *     summary: Eliminar albarán
 *     description: Elimina un albarán (no permitido si está firmado)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: soft
 *         in: query
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Si true, borrado suave; si false, borrado duro
 *     responses:
 *       200:
 *         description: Albarán eliminado
 *       403:
 *         description: No se puede eliminar un albarán firmado
 *       404:
 *         description: Albarán no encontrado
 */
router.delete('/:id', deleteDeliveryNote)

export default router;