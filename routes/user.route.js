const express = require('express')
const router = express.Router()
const userController = require("../controllers/user.controller");
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

// [Get] /user/:id/project/create
// router.get('/:id/project/create', userController.getCreateProjectPage)

router.post('/upload-project', upload.single("cover_images"), userController.uploadProject)



module.exports = router
