import express from 'express'
import fs from 'fs'

export const router = express.Router();

router.get('/all', async (req, res) => {
    fs.readdir('media/', function (err, files) {
        //handling error
        if (err) {
            return res.status(500).send({
                message: `Unable to scan directory: ${err}`,
            });
        }

        const fileInfos: unknown[] = [];

        files.forEach((file: unknown) => {
            fileInfos.push({
                name: file,
            });
        });

        res.status(200).send(fileInfos);
    });
});

router.use('/', express.static('media'));