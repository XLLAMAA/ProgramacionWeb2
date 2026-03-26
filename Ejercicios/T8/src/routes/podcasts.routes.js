import { Router } from 'express';
import {
    getAllPodCast,
    getByIdPodCast,
    createPodCast,
    updatePodCast,
    deletePodcast,
    getAdminAll,
    publishPodcast
} from '../controllers/podcasts.controller.js'
import { sessionMiddleware } from '../middleware/session.middleware.js';
import { checkRole } from '../middleware/rol.middleware.js';

const router = Router();

//RUTAS GET (públicas)
router.get("/", getAllPodCast)

//RUTA GET admin (protegida - DEBE IR ANTES de /:id)
router.get("/admin/all", sessionMiddleware, checkRole('admin'), getAdminAll)

//RUTA GET por ID (pública)
router.get("/:id", getByIdPodCast)

//RUTA POST (requiere autenticación)
router.post("/", sessionMiddleware, createPodCast)

//RUTA PUT (requiere autenticación - autor)
router.put("/:id", sessionMiddleware, updatePodCast)

//RUTA DELETE (solo admin)
router.delete("/:id", sessionMiddleware, checkRole('admin'), deletePodcast);

//RUTA PATCH (solo admin)
router.patch("/:id/publish", sessionMiddleware, checkRole('admin'), publishPodcast)


export default router;