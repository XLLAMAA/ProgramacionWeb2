import express from 'express';
import { getHealth } from '../controllers/health.controller.js';

const router = express.Router();

//Ruta get
router.get('/', getHealth);

export default router;
