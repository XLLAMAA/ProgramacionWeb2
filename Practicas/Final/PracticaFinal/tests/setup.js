import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

// Hook de configuración global para Jest
export const setupDB = async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
};

export const teardownDB = async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
};

export const clearDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};

// Jest Global Setup
beforeAll(setupDB);
afterAll(teardownDB);
afterEach(clearDB);