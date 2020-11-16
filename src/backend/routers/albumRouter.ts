import express from 'express';
import { getAlbums, addAlbum, addPhotoToAlbum } from '../database/albumDatabase';

export const router = express.Router();

router.put('/new/:name', async (req, res) => {
    const name = req.params.name;
    try {
        res.status(200).send(await addAlbum(name));
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/all', async (req, res) => {
    try {
        res.status(200).send(await getAlbums("%"));
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/search/:term', async (req, res) => {
    try {
        res.status(200).send(await getAlbums(req.params.term));
    } catch (err) {
        res.status(500).send(err);
    }
});

router.put('/add/:albumID/:photoID', async (req, res) => {
    try {
        res.status(200).send(await addPhotoToAlbum(req.params.albumID, req.params.photoID));
    } catch (err) {
        res.status(500).send(err);
    }
});

/*TODO:
delete album - also delete all entries
delete photo from album - don't delete photo itself
add photo to album - validate album and photo both exist - make media database? or check in filesystem if file exists?
*/