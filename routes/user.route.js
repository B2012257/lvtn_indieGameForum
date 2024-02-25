const express = require('express')
const router = express.Router()
const userController = require("../controllers/user.controller");



// [Get] /user/:id/project/create
// router.get('/:id/project/create', userController.getCreateProjectPage)

//[POST] /user/upload-project
router.post('/upload-project', userController.uploadProject)


module.exports = router
