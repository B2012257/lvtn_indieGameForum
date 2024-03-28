const db = require("../models/index")
const drive = require("../services/google.clound/index")
const { experience } = require("../configs/constraint")
//[GET] /

const getIndexPage = async (req, res) => {

    let projectDB = await db.project.findAll({
        include: [
            db.tag, {
                model: db.image,
                order: [['createdAt', 'DESC']],
            },
        ],
        where: {
            isPublic: true
        },
    })

    let hotProject = await db.project.findAll({
        include: [
            db.user,
            {
                model: db.image,
                limit: 4
            }
        ],
        where: {
            isPublic: true
        },
        limit: 4,
        order: [['createdAt', 'DESC']]
    })
    let projectInfo = JSON.parse(JSON.stringify(projectDB))
    hotProject = JSON.parse(JSON.stringify(hotProject))
    console.log(hotProject);
    return res.render("index", {
        user: req.user || req.session.user,
        title: "Trang chủ",
        header: true,
        footer: false,
        projectInfo,
        hotProject,
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
    let projectDB = await db.project.findAll({
        include: [
            db.classification, db.tag, db.genre, db.image, db.user
        ],
        order: [['createdAt', 'DESC']],
        where: {
            userId: user.id
        }
    })
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
            db.classification, db.tag, db.genre, db.image, {
                model: db.user
            }, {
                model: db.version,
                include: [db.download],
                order: [['createdAt', 'DESC']],
                // limit: 1 //Giới hạn 1 phiên bản mới nhất
            }
        ]
        , order: [[db.image, 'createdAt', 'DESC']]
    })
    let payment_info
    if (req.user?.id || req.session?.user?.id) {
        payment_info = await db.payment.findOne({
            where: {
                projectId: projectDB.id,
                userId: req.user?.id || req.session?.user?.id
            },
            include: [db.payment_method],
        })
        payment_info = JSON.parse(JSON.stringify(payment_info))
    }

    let projectInfo = JSON.parse(JSON.stringify(projectDB))

    // Kiểm tra nếu có payment_info thì đã mua
    console.log(projectInfo.versions[0].downloads);
    console.log(payment_info);
    res.render("project_view", {
        title: 'Xem ' + projectDB.name,
        header: true,
        footer: false,
        projectInfo,
        payment_info,
        user: req.user || req.session.user,
    })
}
const getPayViewPage = async (req, res) => {
    let id = req.params.id
    let projectDB = await db.project.findOne({

        include: [
            db.classification, db.tag, db.genre, db.user, {
                model: db.version,
                include: [db.download],
                order: [['createdAt', 'DESC']],
                // limit: 1 //Giới hạn 1 phiên bản mới nhất
            },
            db.image,
        ],
        where: {
            id
        },
    })
    let projectInfo = JSON.parse(JSON.stringify(projectDB))
    res.render("pay_view", {
        title: 'Thanh toán ' + projectInfo?.name,
        header: true,
        footer: false,
        projectInfo,
        user: req.user || req.session.user,
    })
}

const getLibaryPage = async (req, res) => {
    //Lấy ra các dự án đã mua
    let userId = req.user?.id || req.session?.user?.id
    let paymentDB = await db.payment.findAll({
        where: {
            userId
        },
        include: [
            db.payment_method
        ]
    })
    let project = await db.project.findAll({
        where: {
            id: paymentDB.map((item) => item.projectId)
        },
        include: [
            db.user
        ]
    })
    project = JSON.parse(JSON.stringify(project))
    paymentDB = JSON.parse(JSON.stringify(paymentDB))
    let paymentDbs = Array.from(paymentDB)

    console.log(paymentDbs);
    res.render("libary", {
        title: "Thư viện dự án đã mua",
        header: true,
        footer: false,
        project,
        user: req.user || req.session.user,
    })
}

const getRatingPage = async (req, res) => {
    let user = req.user || req.session?.user
    let slug = req.params.slug
    let projectDb = await db.project.findOne({
        where: {
            slug
        },
        include: [
            db.classification, db.tag, db.genre, db.image, {
                model: db.user
            }, {
                model: db.version,
                include: [db.download],
                order: [['createdAt', 'DESC']],
                // limit: 1 //Giới hạn 1 phiên bản mới nhất
            }
        ]
        , order: [[db.image, 'createdAt', 'DESC']]
    })
    projectDb = JSON.parse(JSON.stringify(projectDb))

    //Kiểm tra người dùng này có mua trò chơi chưa 
    //Nếu chưa mua thì không được đánh giá
    //Nếu đã đánh giá thì cũng không được đánh giá nữa
    let isOnwerGame = false
    let isRateGame = false
    if (user) {
        let payment_info = await db.payment.findOne({
            where: {
                projectId: projectDb.id,
                userId: user.id,
                status: "Success"
            },
        })
        if (payment_info) isOnwerGame = true
        let userRating = await db.user_rating.findOne({
            where: {
                projectId: projectDb.id,
                userId: user.id
            }
        })
        if (userRating) isRateGame = true
    }

    //Hiển thị đánh giá của người dùng
    //Lấy danh sách người dùng đã đánh giá
    //Lấy ra id của rating từ project trước
    let userRatings = await db.user_rating.findAll({
        where: {
            projectId: projectDb.id,
        }
        ,
    })
    userRatings = JSON.parse(JSON.stringify(userRatings))
    console.log("danh sach danh gia");

    let ratingInfo = []
    Array.from(userRatings).forEach(async (item) => {
        console.log(item);
        //Tìm thông tin người dùng đã đánh giá
        let user = await db.user.findOne({
            attributes: ['id', 'name', 'email'],
            where: {
                id: item.userId
            }
        })
        user = JSON.parse(JSON.stringify(user))
        item = { ...item, user: { ...user } }
        item.experienceRate = experience[item.numberStarRate]
        //Biển đổi điểm numberStarRate sang chữ
        ratingInfo.push(item)
    })
    res.render("project_rate", {
        title: "Đánh giá của " + projectDb.name,
        header: true,
        footer: false,
        isOnwerGame,
        isRateGame,
        projectInfo: projectDb,
        ratingInfo,
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
    getPayViewPage,
    getLibaryPage,
    getRatingPage
}