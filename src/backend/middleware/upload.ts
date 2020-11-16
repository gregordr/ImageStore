import util from "util";
import multer from "multer";
const maxSize = 2 * 1024 * 1024;

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "media/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

let uploadFile = multer({
    storage: storage,
    limits: { fileSize: maxSize },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

module.exports = uploadFileMiddleware;