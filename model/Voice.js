const mongoose = require('mongoose');

const VoiceSchema = new mongoose.Schema({
  filename: {type:String},
  filepath: {type:String},
  transcript: {type:String},
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now }

},{timestamps:true})
module.exports = mongoose.model("VoiceData", VoiceSchema);