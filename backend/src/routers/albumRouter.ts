import express from 'express';
import { getAlbums, addAlbum, addPhotosToAlbums, removePhotosFromAlbum, deleteAlbum, getMediaInAlbum, setCover, rename } from '../database/albumDatabase';

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


router.get('/:name/all', async (req, res) => {
    try {
        res.status(200).send(await getMediaInAlbum(req.params.name, "%", ""));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.get('/:name/search/:term', async (req, res) => {
    try {
        res.status(200).send(await getMediaInAlbum(req.params.name, `%${req.params.term}%`, req.params.term));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.get('/search/:term', async (req, res) => {
    try {
        res.status(200).send(await getAlbums(`%${req.params.term}%`));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.post('/addPhotos/', async (req, res) => {
    try {
        res.status(200).send(await (await addPhotosToAlbums(req.body.photos, req.body.albums)).toString());
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.post('/remove', async (req, res) => {
    try {
        res.status(200).send(await removePhotosFromAlbum(req.body.albumId, req.body.photoIds));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.post('/setCover/:albumID/:photoID', async (req, res) => {
    try {
        res.status(200).send(await setCover(req.params.albumID, req.params.photoID));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});


router.post('/clearCover/:albumID', async (req, res) => {
    try {
        res.status(200).send(await setCover(req.params.albumID, null));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.post('/rename', async (req, res) => {
    try {
        res.status(200).send(await rename(req.body.albumId, req.body.newAlbumName));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});