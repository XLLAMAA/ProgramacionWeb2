import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import config from '../config/index.js'
import { IncomingWebhook } from '@slack/webhook';


let io = null;

// 1️⃣ INICIALIZAR Socket.IO
export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // 2️⃣ AUTENTICACIÓN con JWT
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Token no proporcionado'));

            const decoded = jwt.verify(token, config.jwt.access.secret);  //verifico jwt
            socket.user = decoded; // { id, company }
            next();
        } catch (error) {
            next(new Error('Token inválido'));
        }
    });

    // 3️⃣ CONEXIÓN
    io.on('connection', (socket) => {
        console.log(`✅ Usuario conectado: ${socket.user.id}`);

        // El usuario se une a su sala de empresa
        socket.join(`company:${socket.user.company}`);

        // DESCONEXIÓN
        socket.on('disconnect', () => {
            console.log(`❌ Usuario desconectado: ${socket.user.id}`);
        });
    });

    return io;
};

// 4️⃣ FUNCIONES para EMITIR eventos
export const emitDeliveryNoteCreated = (company, deliveryNote) => {
    if (io) {
        io.to(`company:${company}`).emit('deliverynote:created', deliveryNote);
    }
};

export const emitDeliveryNoteSigned = (company, deliveryNote) => {
    if (io) {
        io.to(`company:${company}`).emit('deliverynote:signed', deliveryNote);
    }
};

export const emitClientCreated = (company, data) => {
    if (io) {
        io.to(`company:${company}`).emit('client:created', data);
    }
};

export const emitProjectCreated = (company, data) => {
    if (io) {
        io.to(`company:${company}`).emit('project:created', data);
    }
};

export const getIO = () => io;