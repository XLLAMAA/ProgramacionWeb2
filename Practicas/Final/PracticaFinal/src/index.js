import mongoose from "mongoose";

// Importar config
import config from "./config/index.js";

// Importar app
import app from "./app.js";

// Importar modelos (para validar que esten correctos)
import User from "./models/User.js";
import Company from "./models/Company.js";

// Importar servicio de notificaciones
import "./services/notification.service.js";

// ========================================
// INICIALIZACION DEL SERVIDOR
// ========================================

const startServer = async () => {
    try {
        // Conectar a MongoDB
        console.log("🔄 Conectando a MongoDB...");
        await mongoose.connect(config.database.mongoUri);
        console.log("✅ Conectado a MongoDB correctamente");

        // Verificar que los modelos se cargaron correctamente
        console.log("📦 Modelos de datos registrados:");
        console.log("  - User");
        console.log("  - Company");

        // Iniciar servidor
        const server = app.listen(config.port, () => {
            console.log("🚀 Servidor ejecutándose en puerto", config.port);
            console.log(`🌐 http://localhost:${config.port}`);

            if (config.isDevelopment) {
                console.log("📝 Modo desarrollo activado");
            }
        });

        // Manejo de errores de conexion
        process.on("uncaughtException", (error) => {
            console.error("❌ Error no capturado:", error.message);
            process.exit(1);
        });

        process.on("unhandledRejection", (error) => {
            console.error("❌ Promesa rechazada no capturada:", error.message);
            process.exit(1);
        });

    } catch (error) {
        console.error("❌ Error al iniciar el servidor:", error.message);
        process.exit(1);
    }
};

// Ejecutar servidor
startServer();
