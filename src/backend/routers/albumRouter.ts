import express from 'express';
import { getAlbums, addAlbum } from '../database/albumDatabase';

export const router = express.Router();

router.put('/new/:name', async (req, res) => {
    const name = req.params.name;
    try {
        await addAlbum(name);
        res.status(200).send(name);
    } catch (err) {
        console.log(err);
        res.status(500).send("Album with that name already exists");
    }
});

router.get('/all', async (req, res) => {
    try {
        res.status(200).send(await getAlbums(""));
    } catch (err) {
        console.log(err);
        res.status(500).send("Unwanted error");
    }
});

/*TODO:
delete album - also delete all entries
delete photo from album - don't delete photo itself
add photo to album - validate album and photo both exist - make media database? or check in filesystem if file exists?
*/