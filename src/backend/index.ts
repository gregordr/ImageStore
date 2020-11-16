import express from 'express'
const app = express();
import bodyParser from 'body-parser'

app.use(bodyParser.urlencoded({ extended: true }));

import dotenv from 'dotenv'
dotenv.config();

const uploadRouter = require('./routers/uploadRouter');
app.use('/upload', uploadRouter);

const mediaRouter = require('./routers/mediaRouter');
app.use('/media', mediaRouter);

const albumRouter = require('./routers/albumRouter');
app.use('/album', albumRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Listening on port ${port}`));