import { usuarios } from '../data/usuarios.js';
import { ApiError } from '../middleware/errorHandler.js';

const usuario = usuarios;

//Metodo GET TODOS /api/usuarios/usuarios
export const getAll = (req, res) => {
    let resultado = [...usuarios];
    const { nivel, lenguaje, orden, limit, offset } = req.query;

    if (nivel) {
        resultado = resultado.filter(i => i.nivel == nivel);
    }

    if (orden == 'nivel') {
        resultado = resultado.sort((a, b) => b.nivel - a.nivel);

    } else if (orden == 'nombre') {
        resultado = resultado.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
    }

    res.json(resultado);
};

//Metodo GET por id /api/usuarios/usuarios/:id
export const getById = (req, res) => {
    const id = parseInt(req.params.id);
    const usuario = usuarios.find(i => i.id == id);

    if (!usuario) {
        throw ApiError.notFound(`Usuario con ${id} no encontrado`);
    }

    res.json(usuario);
};

//Metodo POST /api/usuarios/usuarios
export const create = (req, res) => {
    const { nombre, email, nivel, descripcion } = req.body;

    const nuevoUsuario = {
        id: usuario.length + 1,
        nombre,
        email,
        nivel,
        descripcion: descripcion || null,
    };

    usuarios.push(nuevoUsuario);
    res.status(201).json(nuevoUsuario);
};

//Metodo PUT /api/usuarios/usuarios/:id
export const update = (req, res) => {
    const id = parseInt(req.params.id);
    const index = usuarios.findIndex(i => i.id === id);

    if (index === -1) throw ApiError.notFound(`Usuario con id:${id} no encontrado`);

    const { nombre, email, nivel, descripcion } = req.body;

    usuarios[index] = {
        id,
        nombre,
        email,
        nivel,
        descripcion: descripcion || null
    };

    res.json(usuarios[index]);
};

//Metodo PATCH usuarios por campos /api/usuarios/usuarios/:id
export const partialUpdate = (req, res) => {

    const id = parseInt(req.params.id);

    const index = usuarios.findIndex(i => i.id === id);

    if (index === -1) {
        throw ApiError.notFound(`Usuario ${id}, no encontrado`);
    }

    const { nombre, email, nivel } = req.body;

    if (nivel) {
        usuarios[index].nivel = nivel;
    }

    if (email) {
        usuarios[index].email = email;
    }

    if (nombre) {
        usuarios[index].nombre = nombre;
    }

    if (!nivel && !email && !nombre) {
        throw ApiError.notFound(`No se ha introducido campo a actualizar`)
    }

    res.json(usuarios[index]);
};

//Metodo DELETE
export const remove = (req, res) => {
    const id = parseInt(req.params.id);
    const index = usuarios.findIndex(i => i.id === id);

    if (index === -1) throw ApiError.notFound(`usuario con id: ${id} no encontrado`)

    usuarios.splice(index, 1)

    res.status(204).end();
}
