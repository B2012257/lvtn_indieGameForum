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

let upload = multer({ storage: storage });

// [POST] /api/v1/upload-cover-image
router.post('/upload-cover-image', upload.single('coverImage'), apiController.uploadImage);

// [POST] /api/v1/upload-screenshot-image
router.post('/upload-screenshot-image', upload.array('photos', 16), apiController.uploadImages);

// [POST] /api/v1/upload-project
router.post('/upload-project', upload.array('projectFiles', 6), apiController.uploadProject);

module.exports = router;
