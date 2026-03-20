import mongoose, { model } from "mongoose";
import { minLength } from "zod";

const podcastSchemas = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Es requerido escribir el titulo"],
            minLength: [3, "Minimo de 3 caracteres en el titulo"]
        },

        descripcion: {
            type: String,
            reuqired: [true, "Se requere la descripcion del podcast"],
            minLength: [10, "Descripcion minima de 10 caracteres"]
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', //Referencia al modelo de usuario
            reqired: [true, "Es requerido el nombre del autor"]
        },

        category: {
            type: String,
            enum: ['tech', 'science', 'history', 'comedy', 'news'],
        },

        duration: {
            type: Number,
            min: [60, "Duracion mimnima 60s"]
        },

        episodes: {
            type: Number,
            default: 1
        },

        published: {
            type: Boolean,
            default: false
        },

        createdAt: {
            type: Date,
            timestamps: true
        }

    }
)