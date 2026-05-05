import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

// Importar config
import config from "./config/index.js";

// Importar middlewares
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

// Importar router central
import routes from "./routes/index.js";

// ========================================
// CONFIGURACION DE EXPRESS
// ========================================

const app = express();

// ========== MIDDLEWARES GLOBALES ==========

// Seguridad con helmet
app.use(helmet());

// Parser JSON
app.use(express.json());

// Sanitizar datos de MongoDB
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: "Demasiadas solicitudes, por favor intenta mas tarde",
});
app.use(limiter);

// Servir archivos estaticos (uploads)
app.use("/uploads", express.static("uploads"));

// ========== RUTAS ==========

// Router central con todos los endpoints
app.use("/api", routes);

// ========== MIDDLEWARES DE ERROR ==========

// Manejo de rutas no encontradas (DEBE ir despues de todas las rutas)
app.use(notFoundHandler);

// Manejo global de errores (DEBE ser el ultimo middleware)
app.use(errorHandler);

export default app;
