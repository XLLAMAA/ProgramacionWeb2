import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createClientSchema, updateClientSchema } from '../validators/client.validator.js';

//controller
import {
    getClientes,
    getClientById,
    getArchivedClients,
    createClient,
    updateClient,
    restoreClient,
    deleteClient,
} from '../controllers/client.controller.js';

const router = Router()

router.use(authMiddleware)

/**
 * @openapi
 * /api/client:
 *   post:
 *     tags:
 *       - Clientes
 *     summary: Crear nuevo cliente
 *     description: Crea un nuevo cliente asociado a la empresa del usuario
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         description: Validación fallida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Cliente con ese CIF ya existe
 */
router.post('/', validate(createClientSchema), createClient)

/**
 * @openapi
 * /api/client:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Listar clientes
 *     description: Obtiene todos los clientes de la empresa con paginación y filtros
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
 *       - name: name
 *         in: query
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre (búsqueda parcial)
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           default: createdAt
 *     responses:
 *       200:
 *         description: Lista de clientes paginada
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
 *                     $ref: '#/components/schemas/Client'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', getClientes)

/**
 * @openapi
 * /api/client/{id}:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Obtener cliente por ID
 *     description: Obtiene los datos de un cliente específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Datos del cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/:id', getClientById)

/**
 * @openapi
 * /api/client/archived:
 *   get:
 *     tags:
 *       - Clientes
 *     summary: Listar clientes archivados
 *     description: Obtiene todos los clientes que han sido eliminados de forma suave
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
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
 *                     $ref: '#/components/schemas/Client'
 */
router.get('/archived', getArchivedClients)

/**
 * @openapi
 * /api/client/{id}:
 *   put:
 *     tags:
 *       - Clientes
 *     summary: Actualizar cliente
 *     description: Actualiza los datos de un cliente existente
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
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         description: Cliente no encontrado
 */
router.put('/:id', validate(updateClientSchema), updateClient)

/**
 * @openapi
 * /api/client/{id}/restore:
 *   patch:
 *     tags:
 *       - Clientes
 *     summary: Restaurar cliente archivado
 *     description: Restaura un cliente que fue eliminado de forma suave
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
 *         description: Cliente restaurado
 *       404:
 *         description: Cliente no encontrado
 */
router.patch('/:id/restore', restoreClient)

/**
 * @openapi
 * /api/client/{id}:
 *   delete:
 *     tags:
 *       - Clientes
 *     summary: Eliminar cliente
 *     description: Elimina un cliente (borrado suave o duro)
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
 *         description: Cliente eliminado
 *       404:
 *         description: Cliente no encontrado
 */
router.delete('/:id', deleteClient)

export default router;