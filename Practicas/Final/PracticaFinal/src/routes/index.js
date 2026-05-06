import { Router } from "express";
import userRoutes from "./user.routes.js";
import clientRoutes from "./client.routes.js";
import projectRoutes from "./project.routes.js";
import deliveryRoutes from "./deliverynote.routes.js";

const router = Router();

//Ruta usuario
router.use("/user", userRoutes)
//Ruta cliente
router.use("/client", clientRoutes)
//Ruta projject
router.use("/project", projectRoutes)
//Ruta delivery
router.use("/deliverynote", deliveryRoutes)

export default router;
