const db = require("../models/index")
const drive = require("../services/google.clound/index")
//[GET] /

const getIndexPage = (req, res) => {
    console.log("req")
    console.log(req.session?.user?.id ?? req.user?.id)

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
    // await drive.uploadImageFile()
    // await  drive.createFolder("projects")
    // await drive.searchFolder("projects")
    let classification;
    await db.classification.findAll(
        {
            attributes: ['id', 'name', 'description']
        }
    )
        .then((row) => {
            classification = JSON.parse(JSON.stringify(row))
        })
    // let classification = [
    //     {
    //         id: 1,
    //         name: "Trò chơi"
    //     },
    //     {
    //         id: 2,
    //         name: "Thiết kế"
    //     },
    //     {
    //         id: 3,
    //         name: "Pixel art design"
    //     },
    // ]
    let genres;
    await db.genre.findAll(
        {
            attributes: ['id', 'name', 'description']
        }
    )
        .then((row) => {
            genres = JSON.parse(JSON.stringify(row))
        })
    // let genres = [
    //     {
    //         id: 1,
    //         name: "Kinh dị"
    //     },
    //     {
    //         id: 2,
    //         name: "Phiêu lưu"
    //     },
    //     {
    //         id: 3,
    //         name: "Sinh tồn"
    //     },
    // ]
    //Sau này lấy tag từ bacekend

    let tags;
    await db.tag.findAll(
        {
            attributes: ['id', 'name', 'description']
        }
    )
        .then((row) => {
            tags = JSON.parse(JSON.stringify(row))
        })

    if (req.user || req.session.user) {
        res.render("upload_project", {
            title: "Tạo dự án",
            header: true,
            footer: false,
            tags,
            classification,
            genres,
            user: req.user || req.session.user,
        })
    } else {
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