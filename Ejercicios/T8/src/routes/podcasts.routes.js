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

const router = Router();

//RUTAS GET
router.get("/", getAllPodCast)
router.get("/admin/all", getAdminAll)
router.get("/:id", getByIdPodCast)

//RUTA POST
router.post("/", createPodCast)

//RUTA PUT
router.put("/:id", updatePodCast)

//RUTA DELETE
router.delete("/:id", deletePodcast);

//RUTA PATCH
router.patch("/:id/publish", publishPodcast)


export default router;