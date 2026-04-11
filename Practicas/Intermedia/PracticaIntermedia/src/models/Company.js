import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    name: {
        type: String,
        required: true,
    },

    cif: {
        type: String,
        required: true,
    },

    address: {
        street: { type: String, required: true },
        number: { type: String, required: true },
        postal: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: true },
    },

    logo: {
        type: String,
        required: true
    },

    isFreelance: {
        type: Boolean,
        default: false
    },

    deleted: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });   //Crea mongoose los campos de createdAt y updateAt

export default mongoose.model('Company', CompanySchema);