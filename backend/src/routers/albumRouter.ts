import express from 'express';
import { getAlbums, addAlbum, addPhotosToAlbums, removePhotoFromAlbum, deleteAlbum } from '../database/albumDatabase';

export const router = express.Router();

router.post('/new/:name', async (req, res) => {
    const name = req.params.name;
    try {
        res.status(200).send(await addAlbum(name));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.post('/delete/:name', async (req, res) => {
    const name = req.params.name;
    try {
        res.status(200).send(await deleteAlbum(name));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.get('/all', async (req, res) => {
    try {
        res.status(200).send(await getAlbums("%"));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.get('/search/:term', async (req, res) => {
    try {
        res.status(200).send(await getAlbums(req.params.term));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.post('/addPhotos/', async (req, res) => {
    try {
        res.status(200).send(await addPhotosToAlbums(req.body.albums, req.body.photos));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.post('/remove/:albumID/:photoID', async (req, res) => {
    try {
        res.status(200).send(await removePhotoFromAlbum(req.params.albumID, req.params.photoID));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});