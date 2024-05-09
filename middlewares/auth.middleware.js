const { where, InvalidConnectionError } = require("sequelize");
const db = require("../models/index")
const isLogin = async (req, res, next) => {
    let user = req.user || req.session.user
    if (user) {
        let userDb = await db.user.findByPk(user.id, {
            include: [db.role]
        })
        userDb = JSON.parse(JSON.stringify(userDb))
        req.user = userDb
        req.session.user = userDb
        next()
    } else {
        res.redirect("/login")
    }
}

const isAdmin = async (req, res, next) => {
    let user = req.user || req.session.user
    if (user) {
        let userDb = await db.user.findByPk(user.id, {
            include: [db.role]
        })
        userDb = JSON.parse(JSON.stringify(userDb))
        if (userDb.role.name.toUpperCase().trim() === "ADMIN") {
            req.user = userDb
            req.session.user = userDb
            req.admin = true
            next()
        } else {
            res.redirect("/login")
        }
    } else {
        res.redirect("/login")
    }
}
const getUserInfoHeader = async (req, res, next) => {
    let user = req.user || req.session.user
    if (user) {
        let userDb = await db.user.findByPk(user.id, {
            include: [db.role]
        })
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
    isAdmin,
    getUserInfoHeader
}