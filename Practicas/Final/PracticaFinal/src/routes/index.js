import { Router } from "express";
import userRoutes from "./user.routes.js";

const router = Router();

//Ruta usuario
router.use("/user", userRoutes);

export default router;
