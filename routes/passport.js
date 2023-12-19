const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const express = require('express')
const LocalStrategy = require('passport-local');
const router = express.Router()
const db = require("../models/index")
require('dotenv').config()

//Google Oauth2
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/redirect/google',
        scope: [ 'profile','email' ]
    },
    async (accessToken, refreshToken, profile, done) =>{
        // console.log(accessToken, refreshToken, profile)
        //Kiem tra xem co trong db chua
        const isExist = await db.user.findOne(
            {
                where: {
                    googleId: profile.id,
                }
            }
        )
        if(isExist) {
            //Sinh token
            return done(null, isExist);
        }else
           //Them vao db
        db.user.create(
            {
                name: profile.displayName,
                googleId: profile.id,
            })
            .then(row => {
                return done(null, row)
            })
            .catch(err => {
                console.log(err)
                return done(err)
            })
    }));
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

router.get('/login/federated/google', passport.authenticate('google'));
router.get('/google', passport.authenticate('google', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
}));

module.exports =router
