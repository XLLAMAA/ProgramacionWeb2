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

//Rutas get
router.get('/', getClientes)
router.get('/:id', getClientById)
router.get('/archived', getArchivedClients)

//Rutas post
router.post('/', validate(createClientSchema), createClient)

//Rutas put
router.put('/:id', validate(updateClientSchema), updateClient)

//Rutas patch 
router.patch('/:id/restore', restoreClient)

//Rutas delete
router.delete('/:id', deleteClient)

export default router;