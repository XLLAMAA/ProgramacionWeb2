import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },

    name: {
        type: String,
        required: true
    },

    cif: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: String,
        unique: true
    },

    address: {
        street: { type: String, required: true },
        number: { type: String, required: true },
        postal: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: true },
    },

    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true

})

export default mongoose.modeel('Client', clientSchema)