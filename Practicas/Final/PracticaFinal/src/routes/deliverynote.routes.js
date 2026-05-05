import { Router } from 'express';
import { validateRequest } from '../middleware/validate.js';
import { auth } from '../middleware/auth.middleware.js';
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
    signDeliveryNote
} from '../controllers/deliverynote.controller.js';


const router = Router()

router.use(auth)

//Rutas get
router.get('/', getDeliveryNotes)
router.get('/:id', getDeliveryNoteById)
router.get('/archived', getArchivedDeliveryNotes)

//Rutas post
router.post('/', validateRequest(createDeliverySchema), createDeliveryNote)
router.post('/:id/sign', upload.single('signature'), signDeliveryNote)

//Rutas put
router.put('/:id', validateRequest(updateDeliverySchema), updateDeliveryNote)

//Rutas patch 
router.patch('/:id/restore', restoreDeliveryNote)

//Rutas delete
router.delete('/:id', deleteDeliveryNote)

export default router;
