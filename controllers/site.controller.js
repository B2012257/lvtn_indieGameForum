const db = require("../models/index")
const drive = require("../services/google.clound/index")
const { experience } = require("../configs/constraint")
const e = require("express")


//Số dự án mới trong tuần
let newProjectStatisticWeek = async ({ userId }) => {
    let dataJson = []

    //Lấy ngày bắt đầu và kết thúc của tuần hiện tại
    let currentDate = new Date()
    let currentDay = currentDate.getDay()
    let currentMonth = currentDate.getMonth()
    let currentYear = currentDate.getFullYear()
    //Lấy từ thứ 2 đến chủ nhật
    let startDate = new Date(currentYear, currentMonth, currentDate.getDate() - currentDay + 1)
    let endDate = new Date(currentYear, currentMonth, currentDate.getDate() + (7 - currentDay))

    //Đổi ra ngày tháng năm và lấy từ thứ 2 - Chủ nhật

    startDate = startDate.toLocaleDateString()
    endDate = endDate.toLocaleDateString()
    console.log(startDate, endDate);

    let results = await db.project.findAndCountAll({
        where: {
            userId,
            createdAt: {
                [db.Sequelize.Op.between]: [startDate, endDate]
            },
            isPublic: true
        }

    })
    results = JSON.parse(JSON.stringify(results))
    //Lấy ra ngày tạo dự án
    let createdAt
    results.rows.forEach(item => {
        createdAt = new Date(item.createdAt).toLocaleDateString()
    })
    console.log("createdAt", createdAt);

    //Tạo data cho biểu đồ 7 ngày với dạng {date: dd/mm/yyyy, count: số lượng}
    for (let i = 0; i < 7; i++) {
        let date = new Date(currentYear, currentMonth, currentDate.getDate() - currentDay + i + 1)
        date = date.toLocaleDateString()
        let count = 0
        //Chỉ lấy ngày/tháng
        date = date.split("/").slice(0, 2).reverse().join("/")

        // Kiểm tra date có trùng với createdAt không
        results.rows.forEach(item => {
            createdAt = new Date(item.createdAt).toLocaleDateString()
            createdAt = createdAt.split("/").slice(0, 2).reverse().join("/")

            if (date === createdAt) {
                count = count + 1
                //Kiểm tra nếu trong dataJson đã có ngày này chưa, nếu có thì ghi đè giá trị count mới
                let index = dataJson.findIndex(item => item.date === date)
                if (index !== -1) {
                    dataJson[index].count = count
                } else {
                    dataJson.push({
                        date: date,
                        count
                    })
                }
            } else {
                let index = dataJson.findIndex(item => item.date === date)
                if (index !== -1) {
                    dataJson[index].count = count
                } else {
                    dataJson.push({
                        date: date,
                        count: 0
                    })
                }
            }
        })


    }
    console.log(dataJson);
    return dataJson
}
//Thống kê số lượng dự án của người dùng trong tuần, trả về dữ liệu biểu đồ trong 1 tuần
let paidStatisticWeek = async ({ userId }) => {
    let dataJson = []

    //Lấy ngày bắt đầu và kết thúc của tuần hiện tại
    let currentDate = new Date()
    let currentDay = currentDate.getDay()
    let currentMonth = currentDate.getMonth()
    let currentYear = currentDate.getFullYear()
    //Lấy từ thứ 2 đến chủ nhật
    let startDate = new Date(currentYear, currentMonth, currentDate.getDate() - currentDay + 1)
    let endDate = new Date(currentYear, currentMonth, currentDate.getDate() + (7 - currentDay))

    //Đổi ra ngày tháng năm và lấy từ thứ 2 - Chủ nhật

    startDate = startDate.toLocaleDateString()
    endDate = endDate.toLocaleDateString()
    console.log(startDate, endDate);
    //Tìm các prpject của user trong tuần

    let projectResults = await db.project.findAndCountAll({
        where: {
            userId,
        }
    })
    projectResults = JSON.parse(JSON.stringify(projectResults)) //Mảng các dự án của user

    // console.log(projectResults);
    let results = await db.payment.findAndCountAll({
        where: {
            projectId: projectResults.rows.map(item => item.id),
            createdAt: {
                [db.Sequelize.Op.between]: [startDate, endDate]
            }
        }
    })
    results = JSON.parse(JSON.stringify(results))

    // Tạo data cho biểu đồ 7 ngày
    let data = []

    for (let i = 0; i < 7; i++) {
        let date = new Date(currentYear, currentMonth, currentDate.getDate() - currentDay + i + 1)
        date = date.toLocaleDateString()
        let count = 0
        results.rows.forEach(item => {
            //Lấy ra ngày thanh toán
            let dateOfPayment = new Date(item.dateOfPayment).toLocaleDateString()
            //Nếu ngày thanh toán trùng với ngày thì tăng count
            if (dateOfPayment === date) {
                count++
            }
        })
        data.push(count)
    }
    //Tạo data dạng json key là ngày và value là số lượng format key dạng dd/mm/yyyy
    for (let i = 0; i < 7; i++) {
        let date = new Date(currentYear, currentMonth, currentDate.getDate() - currentDay + i + 1)
        date = date.toLocaleDateString()
        //Chỉ lấy ngày/tháng
        date = date.split("/").slice(0, 2).reverse().join("/")
        dataJson.push({
            date: date,
            count: data[i]
        })
    }

    return dataJson

}
const statisticMonth = () => {

}
const statisticSixMonth = () => {

}
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
const getProjectViewByClassificationPage = async (req, res) => {

    let classificationSlug = req.params.classification

    //Lấy ra danh sách dự án theo thể loại
    let whereCondition = {}

    if (classificationSlug !== 'all') {
        whereCondition = {
            slug: classificationSlug
        }
    }
    //Phân trang dự án
    let page = req.query.page || 1 //Lấy ra page trên query
    let limitPerPage = 4 //Giới hạn số lượng trên 1 trang
    let offset = (page - 1) * limitPerPage //Tính offset bắt đầu từ bao nhiêu


    // Sắp xếp trò chơi mắc định sẽ là giảm dần theo thời gian cập nhật
    let order = req.query.order || "DESC"
    let orderBy = req.query.orderBy || "updatedAt"

    let orderQuery = [[orderBy, order]]

    console.log(whereCondition);
    // Hiển thị danh sách trò chơi phân trang và sắp xếp
    let projectDB = await db.project.findAll({
        where: {
            isPublic: true
        },
        offset,
        limit: limitPerPage,
        order: orderQuery,
        include: [{
            model: db.image,
            where: {
                isCoverImage: true
            }
        }, db.tag, {
            model: db.classification,
            where: whereCondition
        }, db.genre
        ]
    })

    projectDB = JSON.parse(JSON.stringify(projectDB))

    // Tính toán thông tin phân trang
    const totalProjects = await db.project.count(); //Tính lại tổng số dự án dựa theo điều kiện
    const totalPages = Math.ceil(totalProjects / limitPerPage);
    const nextPage = (page < totalPages) ? parseInt(page) + 1 : null;

    console.log(totalProjects, totalPages, nextPage);
    res.render("projects", {
        user: req.user || req.session.user,
        title: "Kho dự án",
        header: true,
        footer: true,
        currentOrder: order,
        currentOrderBy: orderBy,
        totalPages,
        nextPage,
        classificationSlug,
        nextPageNumer: parseInt(page) + 1,
        previousPage: (page == 1) ? true : false,
        previousPageNumber: parseInt(page) - 1,
        projectInfo: projectDB,
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
    let paidWeekStatistic = await paidStatisticWeek({ userId: user.id })
    let newProjectWeekStatistic = await newProjectStatisticWeek({ userId: user.id })


    //Đếm tổng dự án
    let totalProject = await db.project.count({
        where: {
            userId: user.id
        }
    })

    if (req.user || req.session.user) {
        res.render("my_project", {
            title: "Dự án của tôi",
            header: true,
            projects,
            footer: false,
            paidWeekStatistic,
            newProjectWeekStatistic,
            totalProject,
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
    //Kiểm tra nếu game miển phí thì không cần thanh toán

    let projectInfo = JSON.parse(JSON.stringify(projectDB))
    let isFreeGame = false
    if (projectInfo.price == 0) {
        isFreeGame = true
    }
    console.log(isFreeGame);
    res.render("pay_view", {
        title: 'Thanh toán ' + projectInfo?.name,
        header: true,
        footer: false,
        projectInfo,
        isFreeGame,
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

    paymentDB = JSON.parse(JSON.stringify(paymentDB))
    let paymentReturn = []  //Danh sách trả về
    await Array.from(paymentDB)
        .forEach(async (item) => {
            let project = await db.project.findOne({
                where: {
                    id: item.projectId
                },
                include: [db.user]
            })
            // console.log(project);
            project = JSON.parse(JSON.stringify(project))
            item = { ...item, project: { ...project } }
            console.log(item);
            paymentReturn.push(item)
        })

    // console.log(paymentReturn);
    res.render("libary", {
        title: "Thư viện dự án đã mua",
        header: true,
        footer: false,
        paymentReturn,
        user: req.user || req.session.user,
    })
}

const getRatingPage = async (req, res) => {
    let user = req.user || req.session?.user
    console.log("user trong rating", user);
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
        //Tìm thông tin người dùng đã đánh giá
        let user = await db.user.findOne({
            attributes: ['id', 'name', 'email', 'avatarUrl'],
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

const getTagsPage = async (req, res) => {
    let tagSlug = req.params.slug
    //Khi xem tất cả các tag thì không cần where và không hiển thị tất cả trò chơi của tag
    let whereCondition = {}
    let showGameOfTag = false
    if (tagSlug !== "all") {
        whereCondition = { slug: tagSlug }
        showGameOfTag = true
    }
    let tags = []
    let totalProject = await db.project.count()
    let tagDB = await db.tag.findAll({
        attributes: ['id', 'name', 'description', 'slug'],
        where: whereCondition,
        order: [['createdAt', 'ASC']]
    })
    tagDB = JSON.parse(JSON.stringify(tagDB))
    //Đếm xem mỗi tag có bao nhiêu dự án đang sử dụng
    Array.from(tagDB).forEach(async (tagItem) => {
        let projectOfTag = await db.project.findAll({
            include: [{
                model: db.tag,
                where: {
                    id: tagItem.id
                },
            },
            {
                model: db.image,
                where: {
                    isCoverImage: true
                }
            },
            db.genre, db.classification
            ],

        })
        projectOfTag = JSON.parse(JSON.stringify(projectOfTag))
        tagItem.projects = { ...projectOfTag }
        tagItem.projectCount = projectOfTag.length
        tagItem.percent = (projectOfTag.length / totalProject) * 100
        tagItem.percent = Number.parseFloat(tagItem.percent).toFixed(2)
        tags.push(tagItem)
    })
    //Mỗi tag đếm xem có bao nhiêu dự án đang sử dụng trên tổng dự án
    //Tính ra bao nhiêu phần trăm
    //Trả về tất cả tags
    console.log(showGameOfTag);
    res.render("tags", {
        title: "Các nhãn dự án",
        header: true,
        tags,
        showGameOfTag,
        totalProject: parseInt(totalProject),
        user: req.user || req.session.user,
    })
}
const getGenresPage = async (req, res) => {

}
const getForumPage = async (req, res) => {
    res.render("forum", {
        title: "Diễn đàn",
        header: true,
        footer: false,
        user: req.user || req.session.user,
    })
}

const getProjectBillPage = async (req, res) => {
    // Lấy thông tin thanh tóan project của người dùng để làm hoá đơn
    let projectId = req.params.id
    let user = req.user || req.session.user
    let project = await db.project.findOne({
        where: {
            id: projectId
        }
    })
    let payment = await db.payment.findOne({
        where: {
            projectId,
            userId: user.id
        }
    })
    let paymentMethod = await db.payment_method.findOne({
        where: {
            id: payment.paymentMethodId
        }
    })

    let projectInfo = JSON.parse(JSON.stringify(project))
    let paymentInfo = JSON.parse(JSON.stringify(payment))
    let paymentMethodInfo = JSON.parse(JSON.stringify(paymentMethod))
    res.render("project_bill", {
        title: "Hoá đơn dự án",
        header: true,
        footer: false,
        projectInfo,
        paymentInfo,
        paymentMethodInfo,
        user
    })
}
module.exports = {
    getIndexPage,
    getLoginPage,
    getRegisterPage,
    getProjectViewByClassificationPage,
    getCreateProjectPage,
    getEditInterfaceProjectPage,
    getMyProjectPage,
    getProjectViewPage,
    getPayViewPage,
    getLibaryPage,
    getRatingPage,
    getTagsPage,
    getGenresPage,
    getForumPage,
    getProjectBillPage,
}