import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Company from '../src/models/Company.js';
import { setupDB, teardownDB, clearDB } from './setup.js';

describe('Auth Endpoints', () => {
    let accessToken = '';
    let userId = '';

    beforeAll(setupDB);
    afterAll(teardownDB);
    afterEach(clearDB);

    describe('POST /api/user - Register', () => {
        it('debería registrar un nuevo usuario', async () => {
            const res = await request(app)
                .post('/api/user')
                .send({
                    email: `test_${Date.now()}@example.com`,
                    password: 'Password123'
                })
                .expect('Content-Type', /json/)
                .expect(201);

            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
            expect(res.body.user).toHaveProperty('email');
            expect(res.body.user.role).toBe('admin');
            expect(res.body.user.status).toBe('pending');

            userId = res.body.user.id;
            accessToken = res.body.accessToken;
        });

        it('debería rechazar email duplicado', async () => {
            const email = `duplicate_${Date.now()}@example.com`;

            await request(app)
                .post('/api/user')
                .send({
                    email,
                    password: 'Password123'
                })
                .expect(201);

            const res = await request(app)
                .post('/api/user')
                .send({
                    email,
                    password: 'Password456'
                })
                .expect(409);

            expect(res.body.message).toBeDefined();
        });

        it('debería rechazar contraseña corta', async () => {
            const res = await request(app)
                .post('/api/user')
                .send({
                    email: `short_${Date.now()}@example.com`,
                    password: 'Pass1'
                })
                .expect(400);

            expect(res.body.message).toBeDefined();
        });

        it('debería rechazar email inválido', async () => {
            const res = await request(app)
                .post('/api/user')
                .send({
                    email: 'invalid-email',
                    password: 'Password123'
                })
                .expect(400);

            expect(res.body.message).toBeDefined();
        });
    });

    describe('POST /api/user/login - Login', () => {
        let testEmail = '';
        let testPassword = 'Password123';

        beforeEach(async () => {
            testEmail = `login_${Date.now()}@example.com`;
            await request(app)
                .post('/api/user')
                .send({
                    email: testEmail,
                    password: testPassword
                });
        });

        it('debería hacer login correctamente', async () => {
            const res = await request(app)
                .post('/api/user/login')
                .send({
                    email: testEmail,
                    password: testPassword
                })
                .expect(200);

            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
            expect(res.body.user.email).toBe(testEmail);
        });

        it('debería rechazar password incorrecta', async () => {
            await request(app)
                .post('/api/user/login')
                .send({
                    email: testEmail,
                    password: 'WrongPassword123'
                })
                .expect(401);
        });

        it('debería rechazar usuario inexistente', async () => {
            await request(app)
                .post('/api/user/login')
                .send({
                    email: 'noexiste@example.com',
                    password: 'Password123'
                })
                .expect(401);
        });
    });

    describe('GET /api/user - Get User', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/user')
                .send({
                    email: `getuser_${Date.now()}@example.com`,
                    password: 'Password123'
                });

            accessToken = res.body.accessToken;
        });

        it('debería obtener usuario autenticado', async () => {
            const res = await request(app)
                .get('/api/user')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.user).toHaveProperty('email');
            expect(res.body.user).toHaveProperty('role');
        });

        it('debería rechazar sin token', async () => {
            await request(app)
                .get('/api/user')
                .expect(401);
        });

        it('debería rechazar token inválido', async () => {
            await request(app)
                .get('/api/user')
                .set('Authorization', 'Bearer invalid_token')
                .expect(401);
        });
    });

    describe('PUT /api/user - Update Personal Data', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/user')
                .send({
                    email: `update_${Date.now()}@example.com`,
                    password: 'Password123'
                });

            accessToken = res.body.accessToken;
        });

        it('debería actualizar datos personales', async () => {
            const res = await request(app)
                .put('/api/user')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Juan',
                    lastName: 'Pérez',
                    nif: '12345678A'
                })
                .expect(200);

            expect(res.body.user.name).toBe('Juan');
            expect(res.body.user.lastName).toBe('Pérez');
        });
    });

    describe('PATCH /api/user/company - Create Company', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/user')
                .send({
                    email: `company_${Date.now()}@example.com`,
                    password: 'Password123'
                });

            accessToken = res.body.accessToken;
        });

        it('debería crear una empresa', async () => {
            const res = await request(app)
                .patch('/api/user/company')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Mi Empresa',
                    cif: 'A12345678',
                    isFreelance: false
                })
                .expect(200);

            expect(res.body.company).toHaveProperty('name');
            expect(res.body.company.name).toBe('Mi Empresa');
        });

        it('debería rechazar CIF duplicado creando nueva empresa', async () => {
            const cif = `B${Date.now()}`;

            await request(app)
                .patch('/api/user/company')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Empresa 1',
                    cif,
                    isFreelance: false
                })
                .expect(200);

            const res2 = await request(app)
                .post('/api/user')
                .send({
                    email: `company2_${Date.now()}@example.com`,
                    password: 'Password123'
                });

            const accessToken2 = res2.body.accessToken;

            const res = await request(app)
                .patch('/api/user/company')
                .set('Authorization', `Bearer ${accessToken2}`)
                .send({
                    name: 'Empresa 1 (otra)',
                    cif,
                    isFreelance: false
                })
                .expect(200);

            expect(res.body.user.role).toBe('guest');
        });
    });

    describe('DELETE /api/user - Delete User', () => {
        it('debería eliminar usuario (soft delete)', async () => {
            const res = await request(app)
                .post('/api/user')
                .send({
                    email: `delete_${Date.now()}@example.com`,
                    password: 'Password123'
                });

            const token = res.body.accessToken;
            const userId = res.body.user.id;

            await request(app)
                .delete('/api/user?soft=true')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            const user = await User.findById(userId);
            expect(user.deleted).toBe(true);
        });
    });
});