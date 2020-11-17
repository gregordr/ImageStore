import express from 'express'
import fs from 'fs'
import { upload } from '../middleware/upload'
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
    upload(req, res, async function (err: any) {
        if (err) {
            res.status(500).send(err.toString())
        }
        else {
            res.status(200).send(await addMedia(req.file.filename))
        }
    })
});

router.post('/remove/:name', async (req, res) => {
    try {
        const name: string = await removeMedia(req.params.name);
        fs.unlink(name, () => res.status(200).send());
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.use('/', express.static('media'));