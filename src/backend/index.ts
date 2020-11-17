import express from 'express'
const app = express();
import bodyParser from 'body-parser'

app.use(bodyParser.urlencoded({ extended: true }));

import dotenv from 'dotenv'
dotenv.config();

import { router as mediaRouter } from './routers/mediaRouter';
app.use('/media', mediaRouter);

import { router as albumRouter } from './routers/albumRouter';
app.use('/album', albumRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}`));