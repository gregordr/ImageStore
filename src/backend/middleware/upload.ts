import util from "util";
import multer from "multer";
const maxSize = 2 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "media/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const _uploadFile = multer({
    storage: storage,
    limits: { fileSize: maxSize },
}).single("file");

export let uploadFile = util.promisify(_uploadFile);