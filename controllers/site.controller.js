const db = require("../models/index")
const drive = require("../services/google.clound/index")
//[GET] /

const getIndexPage = async (req, res) => {

    let projectDB = await db.project.findAll({
        include: [
            db.tag, db.image,
        ],
        where: {
            isPublic: true
        }
    })
    let projectInfo = JSON.parse(JSON.stringify(projectDB))
    return res.render("index", {
        user: req.user || req.session.user,
        title: "Trang chủ",
        header: true,
        footer: false,
        projectInfo,
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
const getEditInterfaceProjectPage = async (req, res) => {
    const projectDb = await db.project.findOne({
        include: [
            db.classification, db.tag, db.genre, db.user,
            {
                model: db.image,
                order: [['createdAt', 'DESC']]
            },
            {
                model: db.version,
                include: [db.download],
                order: [['createdAt', 'DESC']],
                // limit: 1 //Giới hạn 1 phiên bản mới nhất
            }
        ],
        where: {
            id: req.params.id
        },
    })
    let projectInfo = JSON.parse(JSON.stringify(projectDb))
    console.log(projectInfo + "as")
    if (req.user || req.session.user) {
        res.render("preview_project", {
            title: "Trang trí " + projectInfo.name,
            header: true,
            footer: false,
            projectInfo,
            user: req.user || req.session.user,
        })
    } else {
        res.redirect("/login")
    }
}
const getMyProjectPage = async (req, res) => {
    let user = req?.user ?? req?.session?.user
    console.log(user)
    let projectDB = await db.project.findAll({
        include: [
            db.classification, db.tag, db.genre, db.image, db.user
        ],
        order: [['createdAt', 'DESC']],
        where: {
            userId: user.id
        }
    })
    console.log(req.user || req.session.user);
    let projects = JSON.parse(JSON.stringify(projectDB))
    if (req.user || req.session.user) {
        res.render("my_project", {
            title: "Dự án của tôi",
            header: true,
            projects,
            footer: false,
            user,
        })
    } else {
        res.redirect("/login")
    }
}
const getProjectViewPage = async (req, res) => {
    let slug = req.params.slug
    let projectDB = await db.project.findOne({
        where: {
            slug
        },
        include: [
            db.classification, db.tag, db.genre, db.image, db.user, {
                model: db.version,
                include: [db.download],
                order: [['createdAt', 'DESC']],
                // limit: 1 //Giới hạn 1 phiên bản mới nhất
            }
        ]
        , order: [[db.image, 'createdAt', 'DESC']]
    })
    let projectInfo = JSON.parse(JSON.stringify(projectDB))
    res.render("project_view", {
        title: 'Xem ' + slug,
        header: true,
        footer: false,
        projectInfo,
        user: req.user || req.session.user,
    })
}
const getPayViewPage = async (req, res) => {
    let id = req.params.id
    let projectDB = await db.project.findOne({
        where: {
            id
        },
        include: [
            db.classification, db.tag, db.genre, db.user, {
                model: db.version,
                include: [db.download],
                // limit: 1 //Giới hạn 1 phiên bản mới nhất
            }, {
                model: db.image,
                where: {
                    isCoverImage: true
                }
            }
        ]
        , order: [[db.image, 'createdAt', 'DESC']]
    })
    let projectInfo = JSON.parse(JSON.stringify(projectDB))
    res.render("pay_view", {
        title: 'Thanh toán ' + projectInfo.name,
        header: true,
        footer: false,
        projectInfo,
        user: req.user || req.session.user,
    })
}
module.exports = {
    getIndexPage,
    getLoginPage,
    getRegisterPage,
    getGamesPage,
    getCreateProjectPage,
    getEditInterfaceProjectPage,
    getMyProjectPage,
    getProjectViewPage,
    getPayViewPage
}