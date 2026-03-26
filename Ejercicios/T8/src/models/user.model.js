import mongoose from "mongoose";
import { maxLength, minLength, required } from "zod/mini";

const currentYear = new Date().getFullYear();   //Variable para la fecha

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Se requere el nombre del usuario"],
            trim: true,
            minLength: [2, "Un minimo de 2 caracteres"],
            maxLength: [50, "Un maximo de 50 caracteres"]
        },

        email: {
            type: String,
            required: [true, "Se requiere el email"],
            trim: true,
            unique: true,
        },

        password: {
            type: String,
            required: [true, "Se requiere la contraseña"],
            minLength: [8, "Minimo de 8 caracteres"],
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },

        createdAt: {
            type: Date,
            timestamps: true
        }

    }
)

export default mongoose.model('User', userSchema);