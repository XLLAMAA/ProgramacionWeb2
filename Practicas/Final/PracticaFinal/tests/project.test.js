import request from 'supertest';
import app from '../src/app.js';
import Project from '../src/models/Project.js';
import Client from '../src/models/Client.js';
import { setupDB, teardownDB, clearDB } from './setup.js';

describe('Project Endpoints', () => {
    let accessToken = '';
    let companyId = '';
    let clientId = '';
    let projectId = '';

    beforeAll(setupDB);
    afterAll(teardownDB);
    afterEach(clearDB);

    beforeEach(async () => {
        const res = await request(app)
            .post('/api/user')
            .send({
                email: `project_${Date.now()}@example.com`,
                password: 'Password123'
            });

        accessToken = res.body.accessToken;

        const companyRes = await request(app)
            .patch('/api/user/company')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: 'Test Company Project',
                cif: `A${Date.now()}`,
                isFreelance: false
            });

        companyId = companyRes.body.company._id;

        const clientRes = await request(app)
            .post('/api/client')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: 'Client for Project',
                cif: `B${Date.now()}`,
                email: 'client@test.com'
            });

        clientId = clientRes.body.data._id;
    });

    describe('POST /api/project - Create Project', () => {
        it('debería crear un nuevo proyecto', async () => {
            const res = await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Proyecto Test',
                    projectCode: `PROJ-${Date.now()}`,
                    client: clientId,
                    address: {
                        street: 'Calle Proyecto',
                        number: '1',
                        postal: '28001',
                        city: 'Madrid',
                        province: 'Madrid'
                    },
                    email: 'project@test.com'
                })
                .expect(201);

            expect(res.body.data).toHaveProperty('name');
            expect(res.body.data.name).toBe('Proyecto Test');
            projectId = res.body.data._id;
        });

        it('debería rechazar proyecto sin cliente válido', async () => {
            await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Proyecto Inválido',
                    projectCode: `PROJ-${Date.now()}`,
                    client: '65f8b3a2c9d1e20012345678',
                    email: 'project@test.com'
                })
                .expect(400);
        });

        it('debería rechazar código de proyecto duplicado', async () => {
            const code = `PROJ-${Date.now()}`;

            await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Proyecto 1',
                    projectCode: code,
                    client: clientId,
                    email: 'project1@test.com'
                })
                .expect(201);

            const res = await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Proyecto 2',
                    projectCode: code,
                    client: clientId,
                    email: 'project2@test.com'
                })
                .expect(409);

            expect(res.body.message).toBeDefined();
        });
    });

    describe('GET /api/project - List Projects', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Proyecto 1',
                    projectCode: `PROJ1-${Date.now()}`,
                    client: clientId,
                    email: 'proj1@test.com'
                });

            await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Proyecto 2',
                    projectCode: `PROJ2-${Date.now()}`,
                    client: clientId,
                    email: 'proj2@test.com'
                });
        });

        it('debería listar proyectos con paginación', async () => {
            const res = await request(app)
                .get('/api/project?page=1&limit=10')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.pagination.currentPage).toBe(1);
        });

        it('debería filtrar proyectos por cliente', async () => {
            const res = await request(app)
                .get(`/api/project?client=${clientId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('debería filtrar proyectos por nombre', async () => {
            const res = await request(app)
                .get('/api/project?name=Proyecto%201')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/project/:id - Get Project', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Proyecto Individual',
                    projectCode: `PROJ-IND-${Date.now()}`,
                    client: clientId,
                    email: 'individual@test.com'
                });

            projectId = res.body.data._id;
        });

        it('debería obtener un proyecto por ID', async () => {
            const res = await request(app)
                .get(`/api/project/${projectId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data._id).toBe(projectId);
        });

        it('debería devolver 404 para ID inexistente', async () => {
            await request(app)
                .get('/api/project/65f8b3a2c9d1e20012345678')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });
    });

    describe('PUT /api/project/:id - Update Project', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Proyecto a Actualizar',
                    projectCode: `PROJ-UPD-${Date.now()}`,
                    client: clientId,
                    email: 'update@test.com'
                });

            projectId = res.body.data._id;
        });

        it('debería actualizar un proyecto', async () => {
            const res = await request(app)
                .put(`/api/project/${projectId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Proyecto Actualizado',
                    projectCode: `PROJ-UPD-${Date.now()}`,
                    client: clientId,
                    email: 'updated@test.com'
                })
                .expect(200);

            expect(res.body.data.name).toBe('Proyecto Actualizado');
        });
    });

    describe('DELETE /api/project/:id - Delete Project', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Proyecto a Eliminar',
                    projectCode: `PROJ-DEL-${Date.now()}`,
                    client: clientId,
                    email: 'delete@test.com'
                });

            projectId = res.body.data._id;
        });

        it('debería eliminar un proyecto (soft delete)', async () => {
            await request(app)
                .delete(`/api/project/${projectId}?soft=true`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            const project = await Project.findById(projectId);
            expect(project.deleted).toBe(true);
        });
    });

    describe('PATCH /api/project/:id/restore - Restore Project', () => {
        beforeEach(async () => {
            const res = await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    name: 'Proyecto a Restaurar',
                    projectCode: `PROJ-RES-${Date.now()}`,
                    client: clientId,
                    email: 'restore@test.com'
                });

            projectId = res.body.data._id;

            await request(app)
                .delete(`/api/project/${projectId}?soft=true`)
                .set('Authorization', `Bearer ${accessToken}`);
        });

        it('debería restaurar un proyecto archivado', async () => {
            const res = await request(app)
                .patch(`/api/project/${projectId}/restore`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(res.body.data.deleted).toBe(false);
        });
    });
});