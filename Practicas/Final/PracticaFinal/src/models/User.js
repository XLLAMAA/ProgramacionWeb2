import mongoose from 'mongoose';
import { z } from 'zod';

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
        unique: true,
        sparse: true,
        default: null
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
        default: null,
        index: true
    },

    address: {
        street: { type: String, default: null },
        number: { type: String, default: null },
        postal: { type: String, default: null },
        city: { type: String, default: null },
        province: { type: String, default: null },
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