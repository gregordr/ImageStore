import express from 'express'
import fs, { promises as fsPromises } from "fs";
import { upload } from '../middleware/upload'
import multer, { MulterError } from "multer";
import { addMedia, removeMedia, getMedia, editMedia } from '../database/mediaDatabase'
import sizeOf from 'image-size';
import sharp from 'sharp';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import exifr from 'exifr'
import mime from 'mime';
import ffmpeg from 'ffmpeg'
import { spawn } from 'child_process';
import { parseISO } from "date-fns";

export const router = express.Router();

router.get('/all', async (req, res) => {
    try {
        res.status(200).send(await getMedia("%", ""));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.get('/search/:term', async (req, res) => {
    try {
        res.status(200).send(await getMedia(`%${req.params.term}%`, req.params.term));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

const dir = "media/"

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

router.post('/add', async (req, res) => {
    upload(req, res, async (err: multer.MulterError | "router") => {
        const oids: string[] = []
        const errors: string[] = []

        if (err) {
            if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE')
                errors.push("Some file is over the maxiumum file size.")
            else {
                console.log(err)
                errors.push("Unknown error happened and logged.")
            }
            res.status(200).send({ success: [], errors })
            return
        }

        if (!req.files) {
            errors.push("No file was uploaded")
            res.status(200).send({ success: [], errors })
            return
        }

        if (!Array.isArray(req.files)) {
            throw new Error();
        }

        await Promise.all(req.files.map(async (f) => {
            try {
                if (!f || !f.originalname) {
                    errors.push("Something went really wrong!")
                    console.log(f)
                    return
                }

                const type = mime.getType(f.originalname)

                if (type?.startsWith("image")) {
                    let dims: ISizeCalculationResult;
                    try {
                        dims = sizeOf(dir + f.filename)
                    } catch (error) {
                        if (error instanceof TypeError) {
                            errors.push("Invalid type in " + f.originalname)
                            await fsPromises.unlink(dir + f.filename)
                            return
                        } else {
                            throw error
                        }
                    }

                    if (!dims || !dims.height || !dims.width) {
                        errors.push("Invalid dimensions:" + dims + " in " + f.originalname)
                        return
                    }

                    if (dims.orientation && dims.orientation % 2 === 0) {
                        const tmp = dims.height;
                        dims.height = dims.width;
                        dims.width = tmp;
                    }

                    let date;
                    try {
                        date = Date.parse((await exifr.parse(dir + f.filename))?.CreateDate)
                    } catch (e) {
                        date = NaN
                    }

                    const oid = await addMedia(f.originalname, dims.height, dims.width, (date.toString() === 'NaN') ? Date.now() : date, "photo")
                    await fsPromises.rename(dir + f.filename, dir + oid);

                    if (dims.height > dims.width / 5) //Default case, but incase the width is over 5 times the height, we cap the width at 1500
                        await sharp(dir + oid, { failOnError: false }).resize({ width: Math.ceil(dims.width / dims.height * 300), height: 300 }).rotate().toFile(dir + "thumb_" + oid)
                    else
                        await sharp(dir + oid, { failOnError: false }).resize({ width: 1500, height: Math.ceil(dims.height / dims.width * 1500) }).rotate().toFile(dir + "thumb_" + oid)
                    oids.push(oid)
                } else if (type?.startsWith("video")) {
                    try {
                        var process = new ffmpeg(dir + f.filename);
                        await process.then(async function (video) {
                            const args = ["-v", "quiet", "-select_streams", "v:0", "-show_entries", "stream_tags=creation_time", "-of", "default=noprint_wrappers=1:nokey=1", dir + f.filename]
                            const process = spawn("ffprobe", args);

                            let date = NaN;
                            for await (const data of process.stdout) {
                                try {
                                    date = parseISO("" + data).getTime()
                                } catch (e) {
                                    date = NaN
                                }
                                continue;
                            };

                            await (new Promise<void>((resolve) => process.on("exit", code => (resolve()))))

                            const m: any = video.metadata
                            const dims = { height: m.video.resolution.h, width: m.video.resolution.w }

                            const oid = await addMedia(f.originalname, dims.height, dims.width, (date.toString() === 'NaN') ? Date.now() : date, "video")


                            let dimsS;
                            if (dims.height > dims.width / 5) //Default case, but incase the width is over 5 times the height, we cap the width at 1500
                                dimsS = "?x300"
                            else
                                dimsS = "1500x?"


                            const thumbName = await video.fnExtractFrameToJPG(dir, { number: 1, size: dimsS, file_name: "thumb_" + oid })
                            await fsPromises.rename(dir + "thumb_" + oid + "_1.jpg", dir + "thumb_" + oid);

                            try {
                                const prev = await video.setDisableAudio().setVideoFrameRate(30).setVideoSize(dimsS, true, true).setVideoDuration(10).save(dir + "prev_" + oid + ".mp4")
                                await fsPromises.rename(prev, dir + "prev_" + oid);
                            } catch (e) {
                                console.log(e)
                                console.trace(e)
                            }

                            await fsPromises.rename(dir + f.filename, dir + oid);

                            oids.push(oid)
                        }, function (err) {
                            console.log('Error: ' + err);
                        });
                    } catch (e) {
                        console.log("ERROR: " + e.code);
                        console.log("ERROR: " + e.msg);
                    }
                } else {
                    errors.push("Invalid type in " + f.originalname)
                }

            } catch (e) {
                errors.push("Unknown error happened and logged in " + f.originalname)
                console.log(e.toString())
            }
        }))
        res.status(200).send({ success: oids, errors })
    })
});

router.post('/edit/:id', async (req, res) => {
    try {
        await editMedia(req.params.id, req.body.name, req.body.date);
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        const id = await removeMedia(req.params.id);
        try {
            await fsPromises.unlink('media/' + id)
            await fsPromises.unlink('media/thumb_' + id)
        } catch (err) {
            console.log(err)
        }
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.use('/', express.static('media'));