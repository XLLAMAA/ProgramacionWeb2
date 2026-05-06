import mongoose from 'mongoose';

//Lo unico que hace es comprobar que la BD de mongoose este conectada y en caso de no estarlo devuelve error 500

export const getHealth = async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        res.json({
            success: true,
            status: 'ok',
            db: dbStatus,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'error',
            db: 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
};
