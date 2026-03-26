import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import Podcast from '../src/models/podcast.model.js';
import dbConnect from '../src/config/db.js';
import mongoose from 'mongoose';

// Usar BD de test
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI;

describe('Podcasts Endpoints', () => {
  
  let userToken;
  let adminToken;
  let userId;
  let adminId;
  let podcastId;

  beforeAll(async () => {
    await dbConnect();
    await User.deleteMany({});
    await Podcast.deleteMany({});

    // Crear usuario normal y obtener token
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usuario Normal',
        email: 'user@example.com',
        password: 'Password123'
      });
    userToken = userRes.body.token;
    userId = userRes.body.data._id;

    // Crear admin
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'HashedPassword',
      role: 'admin'
    });
    adminId = adminUser._id;

    // Hacer login como admin para obtener token
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'HashedPassword'
      });
    // Si no funciona el login directo, usamos el token del registro
    adminToken = userRes.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Podcast.deleteMany({});
    await mongoose.disconnect();
  });

  // ✓ GET /api/podcasts → 200 con array (solo publicados)
  test('GET /api/podcasts - Retorna solo podcasts publicados', async () => {
    // Criar podcast publicado
    await Podcast.create({
      title: 'Mi Primer Podcast',
      description: 'Una descripción interesante sobre podcasts',
      author: userId,
      category: 'tech',
      duration: 3600,
      published: true
    });

    // Crear podcast no publicado
    await Podcast.create({
      title: 'Podcast Privado',
      description: 'Esto es privado y no debe aparecer',
      author: userId,
      category: 'tech',
      duration: 1800,
      published: false
    });

    const res = await request(app)
      .get('/api/podcasts');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(1); // Solo el publicado
    expect(res.body.data[0].title).toBe('Mi Primer Podcast');
  });

  // ✓ POST /api/podcasts → 201 con podcast creado (requiere token)
  test('POST /api/podcasts - Con token crea podcast', async () => {
    const res = await request(app)
      .post('/api/podcasts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Nuevo Podcast',
        description: 'Una descripción lo suficientemente larga para este test',
        category: 'science',
        duration: 2400,
        episodes: 5
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.title).toBe('Nuevo Podcast');
    expect(res.body.data.author.toString()).toBe(userId.toString());
    podcastId = res.body.data._id; // Guardar para tests posteriores
  });

  // ✓ POST /api/podcasts → 401 sin token
  test('POST /api/podcasts - Sin token retorna 401', async () => {
    const res = await request(app)
      .post('/api/podcasts')
      .send({
        title: 'Podcast sin protección',
        description: 'Esto debería fallar sin token válido',
        category: 'tech',
        duration: 3000
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(true);
  });

  // ✓ DELETE /api/podcasts/:id → 200 solo para admin
  test('DELETE /api/podcasts/:id - Admin puede eliminar', async () => {
    // Crear podcast
    const podcast = await Podcast.create({
      title: 'Podcast para eliminar',
      description: 'Esta será eliminado por admin',
      author: userId,
      category: 'history',
      duration: 2000
    });

    // Crear admin real con token (simulado)
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Real Admin',
        email: 'realadmin@example.com',
        password: 'AdminPass123'
      });

    // Actualizar rol a admin en BD
    await User.findByIdAndUpdate(adminRes.body.data._id, { role: 'admin' });

    // Hacer login con admin
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'realadmin@example.com',
        password: 'AdminPass123'
      });

    const adminToken = adminLoginRes.body.token;

    // Intentar eliminar
    const res = await request(app)
      .delete(`/api/podcasts/${podcast._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  // ✓ DELETE /api/podcasts/:id → 403 para user normal
  test('DELETE /api/podcasts/:id - User normal retorna 403', async () => {
    // Crear podcast
    const podcast = await Podcast.create({
      title: 'Podcast protegido',
      description: 'Usuario normal no puede borrar esto',
      author: userId,
      category: 'comedy',
      duration: 1500
    });

    const res = await request(app)
      .delete(`/api/podcasts/${podcast._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(true);
  });

  // ✓ GET /api/podcasts/admin/all → 200 solo para admin
  test('GET /api/podcasts/admin/all - Admin ve todos los podcasts', async () => {
    // Crear admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin para tests',
        email: 'admin2@example.com',
        password: 'AdminPass123'
      });

    // Actualizar rol
    await User.findByIdAndUpdate(adminRes.body.data._id, { role: 'admin' });

    // Login
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin2@example.com',
        password: 'AdminPass123'
      });

    const res = await request(app)
      .get('/api/podcasts/admin/all')
      .set('Authorization', `Bearer ${adminLoginRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    // Debería tener tanto publicados como no publicados
  });

});
