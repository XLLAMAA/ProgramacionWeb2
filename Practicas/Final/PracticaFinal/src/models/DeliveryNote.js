import mongoose from 'mongoose';

const deliveryNoteSchema = new mongoose.Schema({
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

    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },

    format: {
        type: String,
        enum: ['material', 'hours'],
        required: true
    },

    description: {
        type: String,
        required: true
    },

    workDate: {
        type: Date,
        required: true
    },

    // Para format: 'material'
    material: String,
    quantity: Number,
    unit: String,

    // Para format: 'hours'
    hours: Number,
    workers: [
        {
            name: String,
            hours: Number
        }
    ],

    // Firma
    signed: {
        type: Boolean,
        default: false
    },

    signedAt: Date,

    signatureUrl: String,

    pdfUrl: String,

    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('DeliveryNote', deliveryNoteSchema);
