
const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth.controller")
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20');
require('dotenv').config()

const {log} = require("debug");



passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/oauth2/redirect/google',
        scope: [ 'profile','email' ]
    },
    (accessToken, refreshToken, profile, done) =>{
    console.log(accessToken, refreshToken, profile)
        return done(null, profile);
    }));
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

router.get('/login/federated/google', passport.authenticate('google'));
router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
}), (data => console.log(data)));

router.get('/login', authController.GetloginPage)
router.get('/register', authController.GetRegisterPage)
router.post('/user/register', authController.registerService)

router.get('/',(req, res) => {
    console.log("req", req.session)

    // if (now > (cookieExpiration + req.session.cookie._expires)) {
    //     // Thời gian hết hạn, đăng xuất người dùng
    //     req.logout();
    // }
    res.render("index", {user: req.user})
})
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Đã xảy ra lỗi khi đăng xuất');
        }
        res.redirect('/login'); // Chuyển hướng sau khi đăng xuất thành công
    });
});

module.exports = router;
