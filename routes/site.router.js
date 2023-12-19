
const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth.controller")

const {log} = require("debug");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");


router.get('/login', authController.getLoginPage)
router.post('/login/password', authController.loginService)

router.get('/register', authController.getRegisterPage)
router.post('/user/register', authController.registerService)

router.get('/', authController.getIndexPage)
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Đã xảy ra lỗi khi đăng xuất');
        }
        req.user = {}
        res.redirect('/login'); // Chuyển hướng sau khi đăng xuất thành công
    });
});

module.exports = router;
