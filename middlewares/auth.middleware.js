const db = require("../models/index")
const isLogin = async (req, res, next) => {
    let user = req.user || req.session.user
    console.log("User", user);
    if (user) {
        let userDb = await db.user.findByPk(user.id)
        console.log("UserDB", userDb);
        userDb = JSON.parse(JSON.stringify(userDb))
        req.user = userDb
        req.session.user = userDb
        next()
    } else {
        res.redirect("/login")
    }
}


const getUserInfoHeader = async (req, res, next) => {
    let user = req.user || req.session.user
    if (user) {
        let userDb = await db.user.findByPk(user.id)
        userDb = JSON.parse(JSON.stringify(userDb))
        req.user = userDb
        req.session.user = userDb
        next()
    } else {
        next()
    }
}
module.exports = {
    isLogin,
    getUserInfoHeader
}