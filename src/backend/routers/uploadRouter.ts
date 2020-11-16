import express from 'express'
const router = express.Router();
import { uploadFile } from '../middleware/upload'

router.post('/', async (req: any, res: any) => {
    try {
        req = await uploadFile(req, res);

        if (req.file == undefined) {
            return res.status(400).send({ message: "No valid file parameter" });
        }

        res.status(200).send({
            message: req.file.filename,
        });
    } catch (err) {
        res.set('error', 'File too large')
        res.status(500).send({
            message: `Could not upload the file: ${err}`,
        });
    }
});

module.exports = router;