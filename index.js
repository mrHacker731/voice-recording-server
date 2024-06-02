const express = require('express');
const connectDB = require('./db/db');
const app = express();
require('dotenv').config();
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const recordRoute = require("./routes/VoiceRoute");
const authRouter = require('./routes/AuthRoute');
const cors = require("cors");

ffmpeg.setFfmpegPath(ffmpegPath);

app.use(cors());
app.use(express.json());
app.use("/api/v1",recordRoute);
app.use('/api/v1/auth',authRouter);


app.get('/', (req, res) => {
    res.send("welcome to voice recorder");
})

connectDB();
const port = process.env.PORT || 4000;
app.listen(port,()=>{
    console.log("listening on port " + port);
})