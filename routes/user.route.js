const express = require('express')
const router = express.Router()
const userController = require("../controllers/user.controller");

// [/auth]


// [Get] /user/:id/project/create
// router.get('/:id/project/create', userController.getCreateProjectPage)

router.post('/upload-project', userController.uploadProject)



module.exports = router
