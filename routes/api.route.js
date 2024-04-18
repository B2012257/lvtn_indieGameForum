const express = require('express');
const router = express.Router();
const apiController = require('../controllers/webApi.controller');
const path = require('path');
const multer = require('multer')
const { platform } = require('../configs/constraint')

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
// router.post('/upload-project', upload.array('projectFiles', 6), apiController.uploadProject);
router.post('/upload-project', upload.fields([
    { name: 'version', maxCount: 1 },
    { name: 'projectId', maxCount: 1 },
    {
        name: platform.windows, maxCount: 1
    },
    {
        name: platform.mac, maxCount: 1
    },
    {
        name: platform.linuxDebian, maxCount: 1
    },
    {
        name: platform.linuxRPM, maxCount: 1
    },
    {
        name: platform.android, maxCount: 1
    },
    {
        name: platform.ios, maxCount: 1
    },
]), apiController.uploadProject);

//[POST] /api/v1/project/update/description 
router.post('/project/update/description', apiController.saveDescription);

router.post('/project/update/image', upload.fields([
    { name: 'projectId', maxCount: 1 },
    { name: 'type', maxCount: 1 },
    { name: 'image', maxCount: 1 }, //file

    { name: 'images', maxCount: 30 }, //files
    { name: 'href', maxCount: 30 } // url
]), apiController.updateImage);
router.post('/user/update/avatar', upload.single('avatar'), apiController.updateAvatar);
router.get('/search', apiController.search)
router.post('/editor/upload-image', upload.single('image'), apiController.uploadImageEditor);
module.exports = router;
