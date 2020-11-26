import express from 'express'
import { promises } from "fs";
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
        const files: any = req.files
        const oids: string[] = []
        await Promise.all(files.map(async (f: any) => {
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
                const oid = await addMedia(f.originalname, dims.height, dims.width)
                await promises.rename("media/" + f.filename, "media/" + oid);
                oids.push(oid)
            }
        }))
        res.status(200).send(oids)
    })
});

router.post('/delete/:name', async (req, res) => {
    try {
        const name = await removeMedia(req.params.name);
        try {
            await promises.unlink('media/' + name)
        } catch (err) {
            console.log(err)
        }
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.use('/', express.static('media'));