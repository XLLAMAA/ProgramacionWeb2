import sharp from 'sharp'
import {
    uploadFromBuffer,
    deleteImage,
    getOptimizedUrl
} from '../config/cloudinary.js';

//Optimiza la imagen con sharp
export const optimizeImage = async (imageBuffer, options = {}) => {

    const {
        width = 400,
        height = 300,
        quality = 80
    } = options

    try {

        const optimized = await sharp(imageBuffer)
            .resize(width, height, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality })
            .toBuffer();

        return optimized

    } catch (e) {
        throw new Error(`Error optimizando imagen: ${e.message}`)
    }

}

//Subiida de la firma (imagen optimizada ) a cloudinary
export const uploadSignature = async (signatureBuffer, deliveryNoteId) => {
    try {
        // Optimizar imagen de firma
        const optimized = await optimizeImage(signatureBuffer, {
            width: 300,
            height: 200,
            quality: 85,
        });

        // Subir a Cloudinary
        const result = await uploadFromBuffer(optimized, {
            folder: 'bildyapp/signatures',
            public_id: `signature_${deliveryNoteId}_${Date.now()}`,
            resource_type: 'image'
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes,
        };
    } catch (error) {
        throw error;
    }
};

//Subir pdf a cloudinary
export const uploadPDF = async (pdfBuffer, deliveryNoteId) => {
    try {
        const result = await uploadFromBuffer(pdfBuffer, {
            folder: 'bildyapp/pdfs',
            public_id: `delivery_note_${deliveryNoteId}`,
            resource_type: 'raw'
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes,
        };
    } catch (error) {
        throw error;
    }
};
//Eliminar de cloudinary
export const deleteFromCloudinary = async (publicId) => {
    try {
        return await deleteImage(publicId);
    } catch (error) {
        throw new Error(`Error eliminando de Cloudinary: ${error.message}`);
    }
};

//Conseguir la url que de cloudinary
export const getCloudinaryUrl = (publicId) => {
    return getOptimizedUrl(publicId);
};

//Subida de muchos archivos
export const uploadBatch = async (files) => {
    try {
        const uploads = files.map(({ buffer, fileName, folder }) =>
            uploadFromBuffer(buffer, {
                folder: folder || 'bildyapp',
                public_id: fileName
            })
        );

        return await Promise.all(uploads);
    } catch (error) {
        throw error;
    }
};

export default {
    optimizeImage,
    uploadSignature,
    uploadPDF,
    deleteFromCloudinary,
    getCloudinaryUrl,
    uploadBatch
};