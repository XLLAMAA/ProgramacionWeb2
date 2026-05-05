import { Router } from 'express';
import { validateRequest } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
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

router.use(auth)

//Rutas get
router.get('/', getProjects)
router.get('/:id', getProjectById)
router.get('/archived', getArchivedProjects)

//Rutas post
router.post('/', validateRequest(createProjectSchema), createProject)

//Rutas put
router.put('/:id', validateRequest(updateProjectSchema), updateProject)

//Rutas patch 
router.patch('/:id/restore', restoreProject)

//Rutas delete
router.delete('/:id', deleteProject)

export default router;