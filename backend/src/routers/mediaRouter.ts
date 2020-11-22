import express from 'express'
import { promises } from "fs";
import { upload } from '../middleware/upload'
import multer from "multer";
import { addMedia, removeMedia, getMedia } from '../database/mediaDatabase'

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
        }
        else {
            res.status(200).send(await addMedia(req.file.filename))
        }
    })
});

router.post('/delete/:name', async (req, res) => {
    try {
        const name = await removeMedia(req.params.name);
        await promises.unlink(name)
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.use('/', express.static('media'));