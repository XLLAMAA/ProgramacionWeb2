import mongoose from 'mongoose';

const currentYear = new Date().getFullYear();

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'El titulo es requerido'],
            trim: true,
            unique: true,
            minlength: [2, 'Mínimo 2 caracteres'],
            maxlength: [100, 'Máximo 100 caracteres']
        },
        director: {
            type: String,
            required: [true, 'El director es requerido'],
            lowercase: true,
            trim: true,
        },
        year: {
            type: Number,
            required: [true, "El año es requerido"],
            min: [1950, "El año debe ser >= 1950"],
            max: [currentYear, `El año no puede ser mayor que ${currentYear}`],
        },
        genre: {
            type: String,
            required: [true, "El genero es requerido"],
            enum: {
                values: ["action", "comedy", "drama", "horror", "scifi"],
                message: "{VALUE} no es un genero valido",
            },
        },
        copies: {
            type: Number,
            default: 5,
            min: [0, "Las copias no pueden ser negativas (<0)"],
        },
        availableCopies: {
            type: Number,
            min: [0, "Las copias disponibles no pueden ser negativas (<0)"],
        },
        timesRented: {
            type: Number,
            default: 0,
            min: [0, "El contador de alquileres no puede ser negativo"],
        },
        cover: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,   // Añade createdAt y updatedAt
        versionKey: false   // Elimina __v
    }
);

export default mongoose.model("Movie", movieSchema);
