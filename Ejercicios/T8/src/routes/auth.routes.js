import { Router } from 'express';
import {
    registerUser,
    loginUser,
    getMe
} from '../controllers/auth.controller.js'
import { sessionMiddleware } from '../middleware/session.middleware.js';

const router = Router();

//RUTA REGISTRO
router.post("/register", registerUser)

//RUTA LOGIN
router.post("/login", loginUser)

//RUTA GET
router.get("/me", sessionMiddleware, getMe)

export default router;


