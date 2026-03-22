import { Router } from 'express';
import {
    registerUser,
    loginUser,
    getMe
} from '../controllers/auth.controller.js'

const router = Router();

//RUTA REGISTRO
router.post("/register", registerUser)

//RUTA LOGIN
router.post("/login", loginUser)

//RUTA GET
router.get("/me", getMe)

export default router;


