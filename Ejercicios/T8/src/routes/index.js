import { Router } from 'express';
import authRoutes from './auth.routes.js';
import podcastRoutes from './podcasts.routes.js';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de podcasts
router.use('/podcasts', podcastRoutes);

export default router;