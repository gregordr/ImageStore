import multer from "multer";

const maxSize = 50 * 1000 * 1000;
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