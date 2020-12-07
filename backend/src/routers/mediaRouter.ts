import express from 'express'
import { promises as fsPromises } from "fs";
import { upload } from '../middleware/upload'
import multer from "multer";
import { addMedia, removeMedia, getMedia } from '../database/mediaDatabase'
import sizeOf from 'image-size';

export const router = express.Router();

router.get('/all', async (req, res) => {
    try {
        res.status(200).send(await getMedia("%"));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.get('/search/:term', async (req, res) => {
    try {
        res.status(200).send(await getMedia(`%${req.params.term}%`));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.post('/add', async (req, res) => {
    upload(req, res, async (err: multer.MulterError | "router") => {
        if (err) {
            res.status(500).send(err.toString())
            return
        }

        if (!req.files) {
            res.status(500).send("No file uploaded")
            return
        }

        if (!Array.isArray(req.files)) {
            throw new Error();
        }

        const oids: number[] = []
        await Promise.all(req.files.map(async (f) => {
            const dims = sizeOf("media/" + f.filename)

            if (!dims.height || !dims.width) {
                res.status(500).send("Invalid file")
                return
            } else {
                if (dims.orientation && dims.orientation % 2 === 0) {
                    const tmp = dims.height;
                    dims.height = dims.width;
                    dims.width = tmp;
                }
                try {
                    const oid = await addMedia(f.originalname, dims.height, dims.width)
                    await fsPromises.rename("media/" + f.filename, "media/" + oid);
                    oids.push(oid)
                } catch {
                    //Idk how to handle this best actually, maybe let's just send back the stuff we did insert
                }
            }
        }))
        res.status(200).send(oids)
    })
});

router.post('/delete/:name', async (req, res) => {
    try {
        const name = await removeMedia(req.params.name);
        try {
            await fsPromises.unlink('media/' + name)
        } catch (err) {
            console.log(err)
        }
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.use('/', express.static('media'));