import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/user.model.js';
import dbConnect from '../src/config/db.js';
import mongoose from 'mongoose';

// Usar BD de test
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI;

describe('Auth Endpoints', () => {
  
  beforeAll(async () => {
    await dbConnect();
    await User.deleteMany({}); // Limpiar antes de tests
  });

  afterAll(async () => {
    await User.deleteMany({}); // Limpiar después
    await mongoose.disconnect();
  });

  // ✓ POST /api/auth/register → 201 con usuario creado
  test('POST /api/auth/register - Crear usuario válido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'Password123'
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.name).toBe('Juan Pérez');
    expect(res.body.data.email).toBe('juan@example.com');
    expect(res.body.data).not.toHaveProperty('password'); // No devuelve contraseña
    expect(res.body).toHaveProperty('token');
  });

  // ✓ POST /api/auth/register → 400 si email duplicado
  test('POST /api/auth/register - Email duplicado retorna 409', async () => {
    // Primero crea uno
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Ana García',
        email: 'ana@example.com',
        password: 'Password123'
      });

    // Intenta crear con mismo email
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Otro Nombre',
        email: 'ana@example.com',
        password: 'OtraPassword123'
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(true);
  });

  // ✓ POST /api/auth/register → 400 si faltan campos
  test('POST /api/auth/register - Faltan campos retorna 403', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com'
        // Faltan name y password
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(true);
  });

  // ✓ POST /api/auth/login → 201 con token cuando credenciales válidas
  test('POST /api/auth/login - Credenciales válidas retorna token', async () => {
    // Primero registra
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Carlos López',
        email: 'carlos@example.com',
        password: 'Password123'
      });

    // Luego hace login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'carlos@example.com',
        password: 'Password123'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.email).toBe('carlos@example.com');
  });

  // ✓ POST /api/auth/login → 401 si contraseña incorrecta
  test('POST /api/auth/login - Contraseña incorrecta retorna 409', async () => {
    // Registra usuario
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'María Rodríguez',
        email: 'maria@example.com',
        password: 'CorrectPassword123'
      });

    // Intenta login con contraseña mal
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'maria@example.com',
        password: 'MalaPassword123'
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(true);
  });

  // ✓ GET /api/auth/me → 200 con datos del usuario (requiere token)
  test('GET /api/auth/me - Con token válido retorna usuario', async () => {
    // Registra y obtiene token
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Pedro Martínez',
        email: 'pedro@example.com',
        password: 'Password123'
      });

    const token = registerRes.body.token;

    // Usa el token en GET /me
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('pedro@example.com');
    expect(res.body.data).not.toHaveProperty('password');
  });

  // ✓ GET /api/auth/me → 401 sin token
  test('GET /api/auth/me - Sin token retorna 401', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(true);
  });

});
