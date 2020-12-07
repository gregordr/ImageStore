import multer from "multer";
const maxSize = 50 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "media/");
    },
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
}).array("file");