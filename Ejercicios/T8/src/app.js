import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './docs/swagger.js';
import router from './routes/index.js';

const app = express();

// --- 1. Middlewares Globales ---
app.use(cors());
app.use(express.json());

// --- 2. Documentación Swagger ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// --- 3. Rutas ---
app.use('/api', router);

// --- 4. Exportación ---
export default app;