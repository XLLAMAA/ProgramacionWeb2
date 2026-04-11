import mongoose from 'mongoose';
import { z, ZodNumberFormat } from 'zod';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    name: {
        type: String
    },

    lastName: {
        type: String
    },

    nif: {
        type: String,
        required: true,
        unique: true
    },

    role: {
        type: String,
        enum: ['admin', 'guest'],
        default: 'admin'
    },

    status: {
        type: String,
        enum: ['pending', 'verified'],
        default: 'pending',
        index: true
    },

    verificationCode: {
        type: String
    },

    verificationAttempts: {
        type: Number
    },

    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
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
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

//Index unicos
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

//Virtual
UserSchema.virtual('fullName').get(function () {
    return `${this.name} ${this.lastName}`;
});

export default mongoose.model('User', UserSchema);