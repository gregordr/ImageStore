import multer from "multer";

const maxSize = parseInt(process.env.MAX_SIZE || (50 * 1024 * 1024).toString());
const dir = "media/"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir);
    },
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
}).array("file");