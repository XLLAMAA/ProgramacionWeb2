import multer from "multer";
import config from "../config/index.js";
import AppError from "../utils/AppError.js";


const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        //Valido los tipos de los archivos que suben
        if (!config.multer.allowedMimeTypes.includes(file.mimetype)) {
            return cb(AppError.unauthorized("Tipo de archivo no permitido"))
        }
        cb(null, true)
    },

    limits: {
        fileSize: config.multer.maxFileSize  // ← Max 5MB
    }
})

export { upload };