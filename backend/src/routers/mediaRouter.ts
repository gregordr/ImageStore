import express from 'express'
import fs, { promises as fsPromises } from "fs";
import { upload } from '../middleware/upload'
import multer from "multer";
import { addMedia, removeMedia, getMedia } from '../database/mediaDatabase'
import sizeOf from 'image-size';
import sharp from 'sharp';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';

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

const dir = "media/"

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

router.post('/add', async (req, res) => {
    upload(req, res, async (err: multer.MulterError | "router") => {
        const oids: string[] = []
        const errors: string[] = []

        if (err) {

            errors.push("Backend error: Either some file is too large, or /media does not exist.")
            res.status(200).send({ success: [], errors })
            return
        }

        if (!req.files) {
            errors.push("No file was uploaded")
            res.status(200).send({ success: [], errors })
            return
        }

        if (!Array.isArray(req.files)) {
            throw new Error();
        }

        await Promise.all(req.files.map(async (f) => {
            try {
                if (!f || !f.originalname) {
                    errors.push("Something went really wrong!")
                    console.log(f)
                    return
                }

                let dims: ISizeCalculationResult;
                try {
                    dims = sizeOf(dir + f.filename)
                } catch (error) {
                    if (error instanceof TypeError) {
                        errors.push("Invalid type in " + f.originalname)
                        await fsPromises.unlink(dir + f.filename)
                        return
                    } else {
                        throw error
                    }
                }

                if (!dims || !dims.height || !dims.width) {
                    errors.push("Invalid dimensions:" + dims + " in " + f.originalname)
                    return
                }

                if (dims.orientation && dims.orientation % 2 === 0) {
                    const tmp = dims.height;
                    dims.height = dims.width;
                    dims.width = tmp;
                }
                const oid = await addMedia(f.originalname, dims.height, dims.width)
                await fsPromises.rename(dir + f.filename, dir + oid);
                await sharp(dir + oid, { failOnError: false }).resize({ width: Math.ceil(dims.width / dims.height * 300), height: 300 }).rotate().toFile(dir + "thumb_" + oid)

                oids.push(oid)

            } catch (e) {
                errors.push("Unknown error in " + f.originalname)
                console.log(e.toString())
            }
        }))
        res.status(200).send({ success: oids, errors })
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