const UserVoice = require("../model/Voice");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const cloudinary = require('cloudinary').v2;
// config cloudnary
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



// upload recording
const uploadRecording = async (req, res) => {
  const file = req.file;
  const outputFilePath = path.join("uploads", `${uuidv4()}.mp3`);
  
  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }

  try {
    // Convert the uploaded file to MP3
    await new Promise((resolve, reject) => {
      ffmpeg(file.path)
        .toFormat("mp3")
        .on("end", resolve)
        .on("error", reject)
        .save(outputFilePath);
    });

      // Upload the MP3 file to Cloudinary
      const result = await cloudinary.uploader.upload(outputFilePath, {
        resource_type: 'video', // 'video' for audio files
        public_id: uuidv4(),
        format: 'mp3',
      });

    // Delete the original file after conversion
    fs.unlinkSync(file.path);

   // Save the Cloudinary URL to MongoDB
   const recording = await UserVoice.create({
    filename: path.basename(outputFilePath),
    filepath: result.secure_url,
    user: req.user._id
  });

   // Add the recording to the user's recordings array
   req.user.recordings.push(recording._id);
   await req.user.save();


    // Delete the MP3 file after saving to MongoDB
    fs.unlinkSync(outputFilePath);

   return res.status(200).json({
      success: true,
      message: "File converted, saved to database, and removed from server.",
      recording,
    });
  } catch (err) {
    console.error("Error converting file:", err);
    res.status(500).json({ success: false, message: "Error converting file.", error: err.message });
  }
};


const getVoiceRecording = async (req, res) => {
  try {
    const recordings = await UserVoice.find({ user: req.user._id });
    if (recordings.length <= 0) {
      return res.status(404).json({ success: false, message: "No voice recordings found." });
    }
    return res.status(200).json({ success: true, recordings });
  } catch (error) {
    console.error("Error fetching recordings:", error);
    return res.status(500).json({ success: false, message: "Error fetching recordings.", error: error.message });
  }
};

const deleteVoiceRecording = async (req, res) => {
  const { id } = req.params;
  try {
    const recording = await UserVoice.findOneAndDelete({ _id: id, user: req.user._id });
    if (!recording) {
      return res.status(404).json({ success: false, message: "Recording not found." });
    }

    const public_id = path.basename(recording.filepath, path.extname(recording.filepath));
    await cloudinary.uploader.destroy(public_id, { resource_type: 'video' });

   return res.status(200).json({ success: true, message: "Recording deleted." });
  } catch (error) {
    console.error("Error deleting recording:", error);
    return res.status(500).json({ success: false, message: "Error deleting recording.", error: error.message });
  }
};

module.exports = { uploadRecording,getVoiceRecording ,deleteVoiceRecording};
