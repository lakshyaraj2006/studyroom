import multer from "multer";
import crypto from "crypto";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/temp");
    },
    filename: (req, file, cb) => {
        cb(null, crypto.randomUUID() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

export { upload };
