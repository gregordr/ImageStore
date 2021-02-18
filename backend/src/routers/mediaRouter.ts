import express from 'express'
import fs, { promises as fsPromises } from "fs";
import { upload } from '../middleware/upload'
import multer, { MulterError } from "multer";
import { addMedia, removeMedia, getMedia, editMedia } from '../database/mediaDatabase'
import sharp from 'sharp';
import exifr from 'exifr'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegV from 'ffmpeg'
import { parseISO } from "date-fns";
import Filetype from 'file-type'
sharp.cache({ files: 0 });

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

                const type = (await Filetype.fromFile(dir + f.filename))?.mime

                if (type?.startsWith("image")) {
                    const meta = await sharp(dir + f.filename).metadata()
                    const dims = { width: meta.width, height: meta.height, orientation: meta.orientation }


                    if (!dims || !dims.height || !dims.width) {
                        errors.push("Invalid dimensions:" + dims + " in " + f.originalname)
                        return
                    }

                    if (dims.orientation && dims.orientation % 2 === 0) {
                        const tmp = dims.height;
                        dims.height = dims.width;
                        dims.width = tmp;
                    }

                    const coordX: number = (await exifr.parse(dir + f.filename))?.latitude;
                    const coordY: number = (await exifr.parse(dir + f.filename))?.longitude;

                    let date;
                    try {
                        date = Date.parse((await exifr.parse(dir + f.filename))?.CreateDate)
                    } catch (e) {
                        date = NaN
                    }


                    const oid = await addMedia(f.originalname, dims.height, dims.width, (date.toString() === 'NaN') ? Date.now() : date, "photo", coordX, coordY)

                    await fsPromises.rename(dir + f.filename, dir + oid);

                    if (dims.height > dims.width / 5) //Default case, but incase the width is over 5 times the height, we cap the width at 1500
                        await sharp(dir + oid, { failOnError: false }).resize({ width: Math.ceil(dims.width / dims.height * 300), height: 300 }).rotate().jpeg({ quality: 85 }).toFile(dir + "thumb_" + oid)
                    else
                        await sharp(dir + oid, { failOnError: false }).resize({ width: 1500, height: Math.ceil(dims.height / dims.width * 1500) }).rotate().jpeg({ quality: 85 }).toFile(dir + "thumb_" + oid)
                    oids.push(oid)
                } else if (type?.startsWith("video")) {
                    try {
                        const data = await new Promise<any>((resolve) => ffmpeg.ffprobe(dir + f.filename, (err, data) => { resolve(data) }));

                        let date;
                        try {
                            date = parseISO(data.format.tags.creation_time).getTime()
                        } catch (e) {
                            date = NaN
                        }

                        let coordX: number | undefined = undefined;
                        let coordY: number | undefined = undefined;

                        if (data.format.tags.location) {
                            try {
                                const loc: string = data.format.tags.location;
                                coordX = parseFloat(loc)
                                coordY = parseFloat(loc.split("" + coordX)[1])
                            } catch { }
                        }

                        let dims = { height: data.streams[0].height, width: data.streams[0].width }
                        for (const stream of data.streams) {
                            if (dims && dims.height && dims.width)
                                break;
                            dims.height = stream.height;
                            dims.width = stream.width;
                        }

                        if (!dims || !dims.height || !dims.width) {
                            errors.push("Invalid dimensions:" + dims + " in " + f.originalname)
                            return
                        }

                        const oid = await addMedia(f.originalname, dims.height, dims.width, (date.toString() === 'NaN') ? Date.now() : date, "video", coordX, coordY)


                        let dimsS: string;
                        if (dims.height > dims.width / 5) //Default case, but incase the width is over 5 times the height, we cap the width at 1500
                            dimsS = "?x300"
                        else
                            dimsS = "1500x?"

                        var process = new ffmpegV(dir + f.filename);
                        await process.then(async function (video) {
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

        await fsPromises.unlink('media/' + id).catch(() => { })
        await fsPromises.unlink('media/thumb_' + id).catch(() => { })
        await fsPromises.unlink('media/prev_' + id).catch(() => { })

        res.status(200).send();
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

router.use('/', express.static('media'));