import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },

    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },

    name: {
        type: String,
        required: true
    },

    projectCode: {
        type: String,
        required: true,
        unique: true
    },

    address: {
        street: { type: String, required: true },
        number: { type: String, required: true },
        postal: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: true },
    },

    email: {
        type: String,
        required: true
    },

    notes: {
        type: String
    },

    active: {
        type: Boolean,
        default: true
    },

    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Project', projectSchema);