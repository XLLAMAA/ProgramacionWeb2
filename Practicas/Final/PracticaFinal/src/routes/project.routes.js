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

//Rutas get
router.get('/', getProjects)
router.get('/:id', getProjectById)
router.get('/archived', getArchivedProjects)

//Rutas post
router.post('/', validate(createProjectSchema), createProject)

//Rutas put
router.put('/:id', validate(updateProjectSchema), updateProject)

//Rutas patch 
router.patch('/:id/restore', restoreProject)

//Rutas delete
router.delete('/:id', deleteProject)

export default router;