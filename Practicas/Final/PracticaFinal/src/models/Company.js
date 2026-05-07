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
        unique: true,
    },

    address: {
        street: { type: String },
        number: { type: String },
        postal: { type: String },
        city: { type: String },
        province: { type: String },
    },

    logo: {
        type: String,
        default: null,
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

//Indices
CompanySchema.index({ cif: 1 }, { unique: true });
CompanySchema.index({ owner: 1 });

export default mongoose.model("Company", CompanySchema);