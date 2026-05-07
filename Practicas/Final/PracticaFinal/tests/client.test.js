import request from 'supertest';
import app from '../src/app.js';
import Client from '../src/models/Client.js';
import { setupDB, teardownDB, clearDB } from './setup.js';

describe('Client Endpoints', () => {
    let accessToken = '';
    let companyId = '';
    let clientId = '';

    beforeAll(setupDB);
    afterAll(teardownDB);
    afterEach(clearDB);

    beforeEach(async () => {
        const res = await request(app)
            .post('/api/user')
            .send({
                email: `client_${Date.now()}@example.com`,
                password: 'Password123'
            });

        accessToken = res.body.accessToken;

        const companyRes = await request(app)
            .patch('/api/user/company')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: 'Test Company',
                cif: `A${Date.now()}`,
                isFreelance: false
            });

        companyId = companyRes.body.company.id;
    });

    describe('POST /api/client - Create Client', () => {
        it('debería crear un nuevo cliente', async () => {
            const res = await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Cliente Test',
                    cif: 'B87654321',
                    email: 'cliente@test.com',
                    phone: '912345678',
                    address: {
                        street: 'Calle Principal',
                        number: '123',
                        postal: '28001',
                        city: 'Madrid',
                        province: 'Madrid'
                    }
                })
                .expect(201);

            expect(res.body.data).toHaveProperty('name');
            expect(res.body.data.name).toBe('Cliente Test');
            expect(res.body.data.cif).toBe('B87654321');
            clientId = res.body.data._id;
        });

        it('debería rechazar cliente sin autenticación', async () => {
            await request(app)
                .post('/api/client')
                .send({
                    name: 'Cliente Test',
                    cif: 'B87654321',
                    email: 'cliente@test.com'
                })
                .expect(401);
        });

        it('debería rechazar CIF duplicado en la misma empresa', async () => {
            const cif = `C${Date.now()}`;

            await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Cliente 1',
                    cif,
                    email: 'cliente1@test.com'
                })
                .expect(201);

            const res = await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Cliente 2',
                    cif,
                    email: 'cliente2@test.com'
                })
                .expect(409);

            expect(res.body.message).toBeDefined();
        });
    });

    describe('GET /api/client - List Clients', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Cliente 1',
                    cif: 'D11111111',
                    email: 'cliente1@test.com'
                });

            await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Cliente 2',
                    cif: 'D22222222',
                    email: 'cliente2@test.com'
                });
        });

        it('debería listar clientes con paginación', async () => {
            const res = await request(app)
                .get('/api/client?page=1&limit=10')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.pagination).toHaveProperty('currentPage');
            expect(res.body.pagination).toHaveProperty('totalItems');
            expect(res.body.pagination.currentPage).toBe(1);
        });

        it('debería filtrar clientes por nombre', async () => {
            const res = await request(app)
                .get('/api/client?name=Cliente%201')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0].name).toContain('Cliente 1');
        });
    });

    describe('GET /api/client/:id - Get Client', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Cliente Individual',
                    cif: 'E12345678',
                    email: 'individual@test.com'
                });

            clientId = res.body.data._id;
        });

        it('debería obtener un cliente por ID', async () => {
            const res = await request(app)
                .get(`/api/client/${clientId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data._id).toBe(clientId);
            expect(res.body.data.name).toBe('Cliente Individual');
        });

        it('debería devolver 404 para ID inexistente', async () => {
            await request(app)
                .get('/api/client/65f8b3a2c9d1e20012345678')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });
    });

    describe('PUT /api/client/:id - Update Client', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Cliente a Actualizar',
                    cif: 'F12345678',
                    email: 'update@test.com'
                });

            clientId = res.body.data._id;
        });

        it('debería actualizar un cliente', async () => {
            const res = await request(app)
                .put(`/api/client/${clientId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Cliente Actualizado',
                    cif: 'F12345678',
                    email: 'updated@test.com'
                })
                .expect(200);

            expect(res.body.data.name).toBe('Cliente Actualizado');
        });
    });

    describe('DELETE /api/client/:id - Delete Client', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Cliente a Eliminar',
                    cif: 'G12345678',
                    email: 'delete@test.com'
                });

            clientId = res.body.data._id;
        });

        it('debería eliminar un cliente (soft delete)', async () => {
            await request(app)
                .delete(`/api/client/${clientId}?soft=true`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            const client = await Client.findById(clientId);
            expect(client.deleted).toBe(true);
        });
    });

    describe('GET /api/client/archived - List Archived Clients', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Cliente Archivable',
                    cif: 'H12345678',
                    email: 'archive@test.com'
                });

            clientId = res.body.data._id;

            await request(app)
                .delete(`/api/client/${clientId}?soft=true`)
                .set('Authorization', `Bearer ${accessToken}`);
        });

        it('debería listar clientes archivados', async () => {
            const res = await request(app)
                .get('/api/client/archived')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data).toBeInstanceOf(Array);
        });
    });

    describe('PATCH /api/client/:id/restore - Restore Client', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Cliente a Restaurar',
                    cif: 'I12345678',
                    email: 'restore@test.com'
                });

            clientId = res.body.data._id;

            await request(app)
                .delete(`/api/client/${clientId}?soft=true`)
                .set('Authorization', `Bearer ${accessToken}`);
        });

        it('debería restaurar un cliente archivado', async () => {
            const res = await request(app)
                .patch(`/api/client/${clientId}/restore`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data.deleted).toBe(false);
        });
    });
});