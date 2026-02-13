//src/controllers/todo/todos

import { todos } from '../data/todo.js';
import { ApiError } from '../middleware/errorHandler.js';

//Metodo GET /api/todo/todos
export const getAll = (req, res) => {
    let resultado = [...todos];
    const { completed, orden, limit, offset } = req.query;

    if (typeof completed !== 'undefined') {
        const completedBool = completed === 'true' || completed === '1';
        resultado = resultado.filter(c => c.completed === completedBool);
    }

    res.json(resultado);

}

//Metodo GET por id /api/todo/todos
export const getById = (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find(i => i.id === id);

    if (!todo) {
        throw ApiError.notFound(`No se ha encontrado el id: ${id}`);
    }

    res.json(todo);

}

//Metodo POST /api/todo/todos
export const create = (req, res) => {
    const { title, description, completed, priority } = req.body

    const newTodo = {
        id: todos.length + 1,
        title,
        description: description || null,
        completed: completed ?? false,
        priority: priority ?? 'medium',
        createdAt: new Date().toISOString()
    };

    todos.push(newTodo);

    res.status(201).json(newTodo)

}

//Metodo PUT /api/todo/todos
export const update = (req, res) => {
    const id = parseInt(req.params.id);
    const index = todos.findIndex(i => i.id === id);

    if (index === -1) {
        throw ApiError.notFound(`No se ha encontrado el id: ${id}`);
    }

    const { title, description, completed, priority } = req.body;

    todos[index] = {
        id,
        title,
        description: description || null,
        completed: completed ?? false,
        priority: priority ?? "medium",
        createdAt: todos[index].createdAt
    };

    res.json(todos[index]);

}

//Metodo PATCH /api/todo/todos
export const toggleTodo = (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find(i => i.id === id);

    if (!todo) {
        throw ApiError.notFound(`No se ha encontrado el id: ${id}`);
    }

    todo.completed = !todo.completed;   //Cambia de false a true y viceversa

    return res.json(todo);

}

//Metodo DELETE /api/todo/todos
export const remove = (req, res) => {
    const id = parseInt(req.params.id);
    const index = todos.findIndex(i => i.id === id);

    if (index === -1) {
        throw ApiError.notFound(`No se ha encontrado el id: ${id}`);
    }

    todos.splice(index, 1);

    res.status(204).end();
}