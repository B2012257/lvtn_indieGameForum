const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20');
const db = require("../models/index")
// Get Login page
const GetloginPage = (req, res) => {
    res.render("login", {title: "Login page"})
}
const GetRegisterPage = (req, res) => {
    res.render("register", {title: "Register page"})
}
const registerService = (req,res) => {
   let retypePassword = req.body['re-type-password']
    let password = req.body.password
    if(password === retypePassword) {
        let newUser = {
            username: req.body.username,
            password: password
        }
    db.user.create(newUser)
        .then(data => {
            console.log(data)
            res.send(data)
        })
        .catch(err => {
            res.send(data)
        })
    }

}
const LoginService = (req, res) => {
}
module.exports = {GetloginPage, LoginService,GetRegisterPage,registerService}