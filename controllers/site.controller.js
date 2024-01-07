const db = require("../models/index")

//[GET] /

const getIndexPage = (req, res) => {
    console.log("req")
    console.log(req.user)

    // if (!req.user) {
    //     return res.redirect("/login")
    // }
    return res.render("index", {
        user: req.user || req.session.user,
        title: "Trang chủ",
        header: true,
        footer: false,
        isHomeActive: true
    })
}

// [GET] /login
const getLoginPage = (req, res) => {
    res.render("login", {
        title: "Login page",
        header: false,
        footer: false
    })
}
// [GET] /register
const getRegisterPage = (req, res) => {
    res.render("register", {
        title: "Đăng ký tài khoản",
        header: false,
        footer: false
    })
}
// [GET] /games
const getGamesPage = (req, res) => {
    res.render("games", {
        user: req.user || req.session.user,
        title: "Kho trò chơi",
        header: true,
        footer: true,
        isGamesActive: true
    })
}
// [GET] /user/upload-project
const getCreateProjectPage = async (req, res) => {
    if(req.user || req.session.user){
        res.render("upload_project", {
            title: "Tạo dự án",
            header: true,
            footer: true,
            user: req.user || req.session.user,
        })
    }else {
        res.redirect("/login")
    }

}
module.exports = {
    getIndexPage,
    getLoginPage,
    getRegisterPage,
    getGamesPage,
    getCreateProjectPage
}