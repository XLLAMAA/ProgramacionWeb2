import request from 'supertest';
import { setupDB, teardownDB, clearDB } from './setup.js';

// Mock de storage.service.js ANTES de cualquier import dinámico que lo cargue transitivamente.
// Sin esto, uploadSignature y uploadPDF llaman a Cloudinary real en CI (sin credenciales → fallo no determinista).
jest.unstable_mockModule('../src/services/storage.service.js', () => ({
    uploadSignature: jest.fn().mockResolvedValue({
        url: 'https://res.cloudinary.com/fake/bildyapp/signatures/sig.webp',
        publicId: 'bildyapp/signatures/fake-sig-id',
        size: 1024
    }),
    uploadPDF: jest.fn().mockResolvedValue({
        url: 'https://res.cloudinary.com/fake/bildyapp/pdfs/note.pdf',
        publicId: 'bildyapp/pdfs/fake-pdf-id',
        size: 4096
    }),
    optimizeImage: jest.fn().mockImplementation(async (buf) => buf),
    deleteFromCloudinary: jest.fn().mockResolvedValue({ result: 'ok' }),
    getCloudinaryUrl: jest.fn().mockReturnValue('https://res.cloudinary.com/fake/url'),
    uploadBatch: jest.fn().mockResolvedValue([]),
    default: {
        uploadSignature: jest.fn(),
        uploadPDF: jest.fn(),
        optimizeImage: jest.fn(),
        deleteFromCloudinary: jest.fn(),
        getCloudinaryUrl: jest.fn(),
        uploadBatch: jest.fn()
    }
}));

// Se declaran aquí y se asignan en beforeAll para que el mock esté activo al cargar app
let app;
let DeliveryNote;

describe('DeliveryNote Endpoints', () => {
    let accessToken = '';
    let companyId = '';
    let clientId = '';
    let projectId = '';
    let deliveryNoteId = '';

    beforeAll(async () => {
        await setupDB();
        const appModule = await import('../src/app.js');
        app = appModule.default;
        const dnModule = await import('../src/models/DeliveryNote.js');
        DeliveryNote = dnModule.default;
    });

    afterAll(teardownDB);
    afterEach(clearDB);

    beforeEach(async () => {
        const res = await request(app)
            .post('/api/user')
            .send({
                email: `delivery_${Date.now()}@example.com`,
                password: 'Password123'
            });

        accessToken = res.body.accessToken;

        const companyRes = await request(app)
            .patch('/api/user/company')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: 'Test Company Delivery',
                cif: `A${Date.now()}`,
                isFreelance: false
            });

        companyId = companyRes.body.company._id;

        const clientRes = await request(app)
            .post('/api/client')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: 'Client for Delivery',
                cif: `B${Date.now()}`,
                email: 'client@delivery.com'
            });

        clientId = clientRes.body.data._id;

        const projectRes = await request(app)
            .post('/api/project')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: 'Project for Delivery',
                projectCode: `PROJ-DEL-${Date.now()}`,
                client: clientId,
                email: 'project@delivery.com'
            });

        projectId = projectRes.body.data._id;
    });

    describe('POST /api/deliverynote - Create DeliveryNote', () => {
        it('debería crear un albarán de horas', async () => {
            const res = await request(app)
                .post('/api/deliverynote')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    format: 'hours',
                    description: 'Trabajo de fontanería',
                    workDate: new Date().toISOString(),
                    hours: 8,
                    project: projectId,
                    client: clientId
                })
                .expect(201);

            expect(res.body.data).toHaveProperty('format');
            expect(res.body.data.format).toBe('hours');
            expect(res.body.data.hours).toBe(8);
            deliveryNoteId = res.body.data._id;
        });

        it('debería crear un albarán de material', async () => {
            const res = await request(app)
                .post('/api/deliverynote')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    format: 'material',
                    description: 'Material de construcción',
                    workDate: new Date().toISOString(),
                    material: 'Cemento',
                    quantity: 50,
                    unit: 'kg',
                    project: projectId,
                    client: clientId
                })
                .expect(201);

            expect(res.body.data.format).toBe('material');
            expect(res.body.data.material).toBe('Cemento');
            expect(res.body.data.quantity).toBe(50);
        });

        it('debería crear un albarán con múltiples trabajadores', async () => {
            const res = await request(app)
                .post('/api/deliverynote')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    format: 'hours',
                    description: 'Trabajo en equipo',
                    workDate: new Date().toISOString(),
                    workers: [
                        { name: 'Juan', hours: 8 },
                        { name: 'María', hours: 6 }
                    ],
                    project: projectId,
                    client: clientId
                })
                .expect(201);

            expect(res.body.data.workers).toHaveLength(2);
        });

        it('debería rechazar albarán sin autenticación', async () => {
            await request(app)
                .post('/api/deliverynote')
                .send({
                    format: 'hours',
                    description: 'Test',
                    workDate: new Date().toISOString(),
                    hours: 8,
                    project: projectId,
                    client: clientId
                })
                .expect(401);
        });
    });

    describe('GET /api/deliverynote - List DeliveryNotes', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/deliverynote')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    format: 'hours',
                    description: 'Albarán 1',
                    workDate: new Date().toISOString(),
                    hours: 8,
                    project: projectId,
                    client: clientId
                });

            await request(app)
                .post('/api/deliverynote')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    format: 'material',
                    description: 'Albarán 2',
                    workDate: new Date().toISOString(),
                    material: 'Arena',
                    quantity: 100,
                    unit: 'kg',
                    project: projectId,
                    client: clientId
                });
        });

        it('debería listar albaranes con paginación', async () => {
            const res = await request(app)
                .get('/api/deliverynote?page=1&limit=10')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.pagination.currentPage).toBe(1);
        });

        it('debería filtrar albaranes por formato', async () => {
            const res = await request(app)
                .get('/api/deliverynote?format=hours')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data.every(d => d.format === 'hours')).toBe(true);
        });

        it('debería filtrar albaranes por proyecto', async () => {
            const res = await request(app)
                .get(`/api/deliverynote?project=${projectId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/deliverynote/:id - Get DeliveryNote', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/deliverynote')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    format: 'hours',
                    description: 'Albarán Individual',
                    workDate: new Date().toISOString(),
                    hours: 8,
                    project: projectId,
                    client: clientId
                });

            deliveryNoteId = res.body.data._id;
        });

        it('debería obtener un albarán por ID', async () => {
            const res = await request(app)
                .get(`/api/deliverynote/${deliveryNoteId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data._id).toBe(deliveryNoteId);
        });

        it('debería devolver 404 para ID inexistente', async () => {
            await request(app)
                .get('/api/deliverynote/65f8b3a2c9d1e20012345678')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });
    });

    describe('PUT /api/deliverynote/:id - Update DeliveryNote', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/deliverynote')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    format: 'hours',
                    description: 'Albarán a Actualizar',
                    workDate: new Date().toISOString(),
                    hours: 8,
                    project: projectId,
                    client: clientId
                });

            deliveryNoteId = res.body.data._id;
        });

        it('debería actualizar un albarán', async () => {
            const res = await request(app)
                .put(`/api/deliverynote/${deliveryNoteId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    description: 'Albarán Actualizado',
                    hours: 10,
                    format: 'hours',
                    project: projectId,
                    client: clientId
                })
                .expect(200);

            expect(res.body.data.description).toBe('Albarán Actualizado');
            expect(res.body.data.hours).toBe(10);
        });

        it('debería rechazar actualización de albarán firmado', async () => {
            // La ruta de firma es PATCH — ver deliverynote.routes.js línea 245
            await request(app)
                .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('signature', Buffer.from('fake image'), 'signature.png')
                .expect(200);

            await request(app)
                .put(`/api/deliverynote/${deliveryNoteId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    description: 'No debería actualizarse',
                    hours: 12,
                    format: 'hours',
                    project: projectId,
                    client: clientId
                })
                .expect(403);
        });
    });

    describe('DELETE /api/deliverynote/:id - Delete DeliveryNote', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/deliverynote')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    format: 'hours',
                    description: 'Albarán a Eliminar',
                    workDate: new Date().toISOString(),
                    hours: 8,
                    project: projectId,
                    client: clientId
                });

            deliveryNoteId = res.body.data._id;
        });

        it('debería eliminar un albarán (soft delete)', async () => {
            await request(app)
                .delete(`/api/deliverynote/${deliveryNoteId}?soft=true`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            const delivery = await DeliveryNote.findById(deliveryNoteId);
            expect(delivery.deleted).toBe(true);
        });

        it('debería rechazar eliminación de albarán firmado', async () => {
            await request(app)
                .patch(`/api/deliverynote/${deliveryNoteId}/sign`)
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('signature', Buffer.from('fake image'), 'signature.png')
                .expect(200);

            await request(app)
                .delete(`/api/deliverynote/${deliveryNoteId}?soft=true`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(403);
        });
    });

    describe('GET /api/deliverynote/archived - List Archived DeliveryNotes', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/deliverynote')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    format: 'hours',
                    description: 'Albarán Archivable',
                    workDate: new Date().toISOString(),
                    hours: 8,
                    project: projectId,
                    client: clientId
                });

            deliveryNoteId = res.body.data._id;

            await request(app)
                .delete(`/api/deliverynote/${deliveryNoteId}?soft=true`)
                .set('Authorization', `Bearer ${accessToken}`);
        });

        it('debería listar albaranes archivados', async () => {
            const res = await request(app)
                .get('/api/deliverynote/archived')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data).toBeInstanceOf(Array);
        });
    });

    describe('GET /api/deliverynote/pdf/:id - Download PDF', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/deliverynote')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    format: 'hours',
                    description: 'Albarán para PDF',
                    workDate: new Date().toISOString(),
                    hours: 8,
                    project: projectId,
                    client: clientId
                });

            deliveryNoteId = res.body.data._id;
        });

        it('debería devolver 400 si el albarán no está firmado', async () => {
            const res = await request(app)
                .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400);

            expect(res.body.message).toBeDefined();
        });

        it('debería devolver 403 si el albarán pertenece a otra empresa', async () => {
            // Segundo usuario con empresa distinta intenta acceder al albarán del primero
            const otherUserRes = await request(app)
                .post('/api/user')
                .send({
                    email: `otherpdf_${Date.now()}@example.com`,
                    password: 'Password123'
                });

            const otherToken = otherUserRes.body.accessToken;

            await request(app)
                .patch('/api/user/company')
                .set('Authorization', `Bearer ${otherToken}`)
                .send({
                    name: 'Other Company PDF',
                    cif: `Z${Date.now()}`,
                    isFreelance: false
                });

            await request(app)
                .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .expect(403);
        });
    });
});
