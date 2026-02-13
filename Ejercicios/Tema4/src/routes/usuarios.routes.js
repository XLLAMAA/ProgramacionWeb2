import { Router } from 'express';
import * as usuariosController from '../controllers/usuarios.contoller.js';
import { validate } from '../middleware/validateRequest.js';
import { createUsuariosSchema, updateUsuariosSchema } from '../schemas/usuarios.schemas.js'

const router = Router();

router.get('/', usuariosController.getAll);
router.get('/:id', usuariosController.getById);
router.post('/', validate(createUsuariosSchema), usuariosController.create);
router.put('/:id', validate(updateUsuariosSchema), usuariosController.update);
router.patch('/:id', validate(updateUsuariosSchema), usuariosController.partialUpdate);
router.delete('/:id', usuariosController.remove);

export default router;