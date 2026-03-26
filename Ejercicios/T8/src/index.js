import app from './app.js';
import dbConnect from './config/db.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Conectar a MongoDB
        await dbConnect();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`\n✅ Servidor ejecutándose en puerto ${PORT}`);
            console.log(`🔗 http://localhost:${PORT}`);
            console.log(`📚 Swagger: http://localhost:${PORT}/api-docs\n`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
};

startServer();