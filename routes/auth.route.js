const express = require('express')
const router = express.Router()
const authController = require("../controllers/auth.controller");

// [/auth]



router.post('/login/password', authController.loginService)

router.post('/user/register', authController.registerService)



module.exports = router
