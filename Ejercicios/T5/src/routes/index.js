import { Router } from "express";
import moviesRoutes from "./movies.routes.js"

const router = Router();

router.use("/api/movies", moviesRoutes)

export default router;
