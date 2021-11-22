import express from 'express'
import { addBoxes, boundingBox, Box, getBoxes, removeBox } from '../database/faceDatabase'

export const router = express.Router();

router.post('/get', async (req, res) => {
    res.status(200).send(await getBoxes(req.body.id))
});

router.post('/add', async (req, res) => {
    const { id, boxes } = req.body;
    try {
        res.status(200).send(await addBoxes(id, boxes.map((box: string) => Box.fromString(box))))
    } catch (err) {
        res.status(500).send(err.toString());
    }
})

router.post('/remove', async (req, res) => {
    try {
        res.status(200).send(await removeBox(req.body.id, Box.fromArray(req.body.box)))
    } catch (err) {
        res.status(500).send(err.toString());
    }
})

