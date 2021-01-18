import express from 'express'
import { getUnlabeled, removeLabel, addLabels, addLabelsAuto, getLabels } from '../database/labelDatabase'

export const router = express.Router();

router.get('/getBatch', async (req, res) => {
    try {
        res.status(200).send(await getUnlabeled());
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.post('/get', async (req, res) => {
    res.status(200).send(await getLabels(req.body.ids))
});

router.post('/labelAuto', async (req, res) => {
    const { id, labels } = req.body;
    addLabelsAuto(id, labels)
    res.status(200).send()
});

router.post('/add', async (req, res) => {
    const { ids, labels } = req.body;
    try {
        res.status(200).send(await addLabels(ids, labels))
    } catch (err) {
        res.status(500).send(err.toString());
    }
})

router.post('/remove/', async (req, res) => {
    try {
        res.status(200).send(await removeLabel(req.body.id, req.body.label))
    } catch (err) {
        res.status(500).send(err.toString());
    }
})