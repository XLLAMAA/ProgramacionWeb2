import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator.js';

//Controller 
import {
    getProjects,
    getProjectById,
    getArchivedProjects,
    createProject,
    updateProject,
    restoreProject,
    deleteProject
} from '../controllers/project.controller.js';

const router = Router()

router.use(authMiddleware)

/**
 * @openapi
 * /api/project:
 *   post:
 *     tags:
 *       - Proyectos
 *     summary: Crear nuevo proyecto
 *     description: Crea un nuevo proyecto asociado a un cliente y empresa
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validación fallida
 *       409:
 *         description: Proyecto con ese código ya existe
 */
router.post('/', validate(createProjectSchema), createProject)

/**
 * @openapi
 * /api/project:
 *   get:
 *     tags:
 *       - Proyectos
 *     summary: Listar proyectos
 *     description: Obtiene todos los proyectos de la empresa con paginación y filtros
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
 *       - name: client
 *         in: query
 *         schema:
 *           type: string
 *         description: Filtrar por ID de cliente
 *       - name: name
 *         in: query
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre
 *       - name: active
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: sort
 *         in: query
 *         schema:
 *           type: string
 *           default: createdAt
 *     responses:
 *       200:
 *         description: Lista de proyectos paginada
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
 *                     $ref: '#/components/schemas/Project'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', getProjects)

/**
 * @openapi
 * /api/project/{id}:
 *   get:
 *     tags:
 *       - Proyectos
 *     summary: Obtener proyecto por ID
 *     description: Obtiene los datos de un proyecto específico
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
 *         description: Datos del proyecto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: Proyecto no encontrado
 */
/**
 * @openapi
 * /api/project/archived:
 *   get:
 *     tags:
 *       - Proyectos
 *     summary: Listar proyectos archivados
 *     description: Obtiene todos los proyectos que han sido eliminados de forma suave
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
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
 *                     $ref: '#/components/schemas/Project'
 */
router.get('/archived', getArchivedProjects)

router.get('/:id', getProjectById)

/**
 * @openapi
 * /api/project/{id}:
 *   put:
 *     tags:
 *       - Proyectos
 *     summary: Actualizar proyecto
 *     description: Actualiza los datos de un proyecto existente
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
 *             $ref: '#/components/schemas/Project'
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: Proyecto no encontrado
 */
router.put('/:id', validate(updateProjectSchema), updateProject)

/**
 * @openapi
 * /api/project/{id}/restore:
 *   patch:
 *     tags:
 *       - Proyectos
 *     summary: Restaurar proyecto archivado
 *     description: Restaura un proyecto que fue eliminado de forma suave
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
 *         description: Proyecto restaurado
 *       404:
 *         description: Proyecto no encontrado
 */
router.patch('/:id/restore', restoreProject)

/**
 * @openapi
 * /api/project/{id}:
 *   delete:
 *     tags:
 *       - Proyectos
 *     summary: Eliminar proyecto
 *     description: Elimina un proyecto (borrado suave o duro)
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
 *         description: Proyecto eliminado
 *       404:
 *         description: Proyecto no encontrado
 */
router.delete('/:id', deleteProject)

export default router;