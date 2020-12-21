import express from 'express'
import { getUnlabeled, addLabels, getLabels } from '../database/labelDatabase'

export const router = express.Router();

router.get('/getBatch', async (req, res) => {
    try {
        res.status(200).send(await getUnlabeled());
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.get('/labels/:id', async (req, res) => {
    res.status(200).send(await getLabels(req.params.id))
});

router.post('/label', async (req, res) => {
    const { id, labels } = req.body;
    if (labels)
        addLabels(id, labels instanceof Array ? labels : [labels])
    else
        addLabels(id, [])
    res.status(200).send()
});