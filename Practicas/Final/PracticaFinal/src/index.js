import mongoose from "mongoose";

// Importar config
import config from "./config/index.js";

// Importar app
import app from "./app.js";

// Importar modelos (para validar que estén correctos)
import User from "./models/User.js";
import Company from "./models/Company.js";
import Client from "./models/Client.js";
import Project from "./models/Project.js";
import DeliveryNote from "./models/DeliveryNote.js";

// Importar servicio de notificaciones
import "./services/notification.service.js";
import { initializeSocket } from "./services/socket.service.js";

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
        console.log("  - Client");
        console.log("  - Project");
        console.log("  - DeliveryNote");

        //Iniciar servidor
        const server = app.listen(config.port, () => {
            console.log("🚀 Servidor ejecutándose en puerto", config.port);
            console.log(`🌐 http://localhost:${config.port}`);

            //Iniciar socket
            initializeSocket(server);
            console.log("🔌 Socket.IO inicializado");

            if (config.isDevelopment) {
                console.log("📝 Modo desarrollo activado");
            }
        });

        // Graceful shutdown - SIGTERM (Docker, PM2)
        process.on("SIGTERM", () => {
            console.log("📛 Señal SIGTERM recibida, cerrando servidor...");
            server.close(async () => {
                await mongoose.connection.close();
                console.log("✅ Servidor y conexión a BD cerrados");
                process.exit(0);
            });
        });

        // Graceful shutdown - SIGINT (Ctrl+C)
        process.on("SIGINT", () => {
            console.log("📛 Señal SIGINT recibida, cerrando servidor...");
            server.close(async () => {
                await mongoose.connection.close();
                console.log("✅ Servidor y conexión a BD cerrados");
                process.exit(0);
            });
        });

        // Errores no capturados
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
