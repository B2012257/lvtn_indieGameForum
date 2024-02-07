const express = require('express');
const router = express.Router();
const apiController = require('../controllers/webApi.controller');
const path = require('path');
const multer = require('multer')

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

var upload = multer({ storage: storage });

// [POST] /api/v1
router.post('/upload-cover-image', upload.single('coverImage'), apiController.uploadImages);

module.exports = router;
