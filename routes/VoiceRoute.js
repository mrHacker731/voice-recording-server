const upload = require('../config/multer');
const { protect } = require('../config/protect');
const { uploadRecording, getVoiceRecording, deleteVoiceRecording } = require('../controller/recordControler');

const router = require('express').Router();

router.post("/upload/recording",upload.single('voice'),protect,uploadRecording);
router.get("/get/recording",protect,getVoiceRecording);
router.delete("/delete/recording/:id",protect,deleteVoiceRecording)

module.exports = router;