const db = require("../models/index")
const drive = require("../services/google.clound/index")
const { experience } = require("../configs/constraint")
const e = require("express")
const { where } = require("sequelize")
const { order } = require("paypal-rest-sdk")
require('dotenv').config();
var moment = require('moment'); // require
const { set } = require("../app")
//Số dự án mới trong tuần
let newProjectStatisticWeek = async ({ userId }) => {
    let dataJson = []

    // Lấy ngày bắt đầu và kết thúc của tuần hiện tại
    let currentDate = new Date();
    let currentDay = currentDate.getDay();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Nếu ngày hiện tại là Chủ nhật (ngày 0), trừ 6 ngày để đến thứ 2
    let startDiff = currentDay === 0 ? 6 : currentDay - 1;
    // Nếu ngày hiện tại không phải là Chủ nhật, tính số ngày còn lại đến hết tuần
    let endDiff = currentDay === 0 ? 0 : 7 - currentDay;

    let startDate = new Date(currentYear, currentMonth, currentDate.getDate() - startDiff);
    let endDate = new Date(currentYear, currentMonth, currentDate.getDate() + endDiff);

    console.log(startDate, endDate);
    //Đổi ra ngày tháng năm và lấy từ thứ 2 - Chủ nhật

    startDate = startDate.toLocaleDateString()
    endDate = endDate.toLocaleDateString()

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
    console.log(results);
    //Lấy ra ngày tạo dự án
    let createdAt
    results.rows.forEach(item => {
        createdAt = new Date(item.createdAt).toLocaleDateString()
    })
    console.log("createdAt", createdAt);

    //Tạo data cho biểu đồ 7 ngày với dạng {date: dd/mm/yyyy, count: số lượng}
    for (let i = 0; i < 7; i++) {
        // console.log(currentDay);
        let date = new Date(startDate)
        date.setDate(date.getDate() + i)
        date = date.toLocaleDateString()

        // console.log(date, "date");
        let count = 0
        //Chỉ lấy ngày/tháng
        date = date.split("/").slice(0, 2).reverse().join("/")

        // Kiểm tra date có trùng với createdAt không
        results.rows.forEach(item => {
            createdAt = moment.utc(item.createdAt).format('D/M');
            console.log(createdAt, "createdAt", date);
            if (date === createdAt) {
                count = count + 1
                //Kiểm tra nếu trong dataJson đã có ngày này chưa, nếu có thì ghi đè giá trị count mới
                let index = dataJson.findIndex(item => item.date === date);
                if (index !== -1) {
                    // Nếu đã tồn tại trong dataJson, cập nhật giá trị count
                    dataJson[index].count = count;
                } else {
                    // Nếu không tồn tại, thêm mới vào dataJson với giá trị count
                    dataJson.push({
                        date: date,
                        count: count
                    });
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

    // Lấy ngày bắt đầu và kết thúc của tuần hiện tại
    let currentDate = new Date();
    let currentDay = currentDate.getDay();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Nếu ngày hiện tại là Chủ nhật (ngày 0), trừ 6 ngày để đến thứ 2
    let startDiff = currentDay === 0 ? 6 : currentDay - 1;
    // Nếu ngày hiện tại không phải là Chủ nhật, tính số ngày còn lại đến hết tuần
    let endDiff = currentDay === 0 ? 0 : 7 - currentDay;

    let startDate = new Date(currentYear, currentMonth, currentDate.getDate() - startDiff);
    let endDate = new Date(currentYear, currentMonth, currentDate.getDate() + endDiff, 23, 59, 59);

    //Đổi ra ngày tháng năm và lấy từ thứ 2 - Chủ nhật

    startDate = startDate.toLocaleDateString()
    endDate = endDate.toLocaleDateString()
    //Tìm các prpject của user trong tuần
    // console.log(startDate, endDate);
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
                [db.Sequelize.Op.between]: [moment(startDate), moment(endDate)]
            }
        }
    })
    results = JSON.parse(JSON.stringify(results))
    // console.log(results, "results");
    // Tạo data cho biểu đồ 7 ngày
    let data = []

    for (let i = 0; i < 7; i++) {
        let date = new Date(startDate)
        date.setDate(date.getDate() + i)
        date = date.toLocaleDateString()
        date = moment(date).format('MM/DD/YYYY');
        // console.log(date, "date");
        let count = 0
        results.rows.forEach(item => {
            //Lấy ra ngày thanh toán
            let formattedDate = moment(item.createdAt).format('MM/DD/YYYY');
            //Nếu ngày thanh toán trùng với ngày thì tăng count
            console.log(formattedDate, date);
            if (formattedDate === date) {
                count++
            }
        })
        data.push(count)
    }
    //Tạo data dạng json key là ngày và value là số lượng format key dạng dd/mm/yyyy
    for (let i = 0; i < 7; i++) {
        let date = new Date(startDate)
        date.setDate(date.getDate() + i)
        date = date.toLocaleDateString()
        date = moment(date).format('D/M')
        //Chỉ lấy ngày/tháng
        dataJson.push({
            date: date,
            count: data[i]
        })
    }
    // console.log(dataJson, "dataJson");
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
                where: {
                    isCoverImageLarge: false
                }
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
                limit: 4,
                where: {
                    isCoverImageLarge: false
                }
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
    let searchQuery = req.query.q
    let whereCondition = {}
    //Lấy ra danh sách dự án theo thể loại
    let whereProjectCondition = {
        isPublic: true
    }
    console.log(searchQuery, "searchQuery");
    console.log(whereProjectCondition, "whereProjectCondition");
    //Khi có seachQuery thì tìm kiếm theo tên dự án và không theo classificationSlug
    if (searchQuery) {
        whereProjectCondition = {
            name: {
                [db.Sequelize.Op.like]: `%${searchQuery}%`
            },
            isPublic: true
        }
    }
    if (classificationSlug !== 'all' && !searchQuery) {
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

    console.log(whereCondition, whereProjectCondition);
    // Hiển thị danh sách trò chơi phân trang và sắp xếp
    let projectDB = await db.project.findAll({
        where: whereProjectCondition,
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
    console.log(projectDB, "projectDB");
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
const editInfoProject = async (req, res) => {
    let projectId = req.params.id
    let projectDb = await db.project.findOne({
        where: {
            id: projectId
        }
    })
    let { name, classification, description, genre, tags, short_description, long_description, releaseStatus, options, priceValue, visibility } = req.body
    // cập nhật thông tin dự án

    try {
        if (options === "free") priceValue = 0
        let project = await db.project.update({
            name, classificationId: classification, description, genreId: genre, short_description, long_description, releaseStatus, options, price: priceValue, isPublic: visibility

        }, {
            where: {
                id: projectId
            }
        })

        //cập nhật tags: 
        //Lấy id của mấy tags cũ
        //Kiểm tra tags nếu tìm thấy thì lưu id vào project_tag, còn không tìm thấy thì lưu mới vào db và lưu vào project_tag
        let project_tags = []
        project_tags = tags.split(",") // array of tags
        //Xoá hết tags hiện tại và thêm tags mới
        await projectDb.setTags([])

        for (const projectTagName of project_tags) {

            //project_tags.forEach(async projectTagName => {
            if (projectTagName.trim() === "") { return console.log("Tag rỗng") }
            else
                await db.tag.findOrCreate({
                    where: {
                        name: projectTagName
                    },
                    defaults: {
                        name: projectTagName
                    },
                    attributes: ['id']
                })
                    .then(async ([tagInstance, created]) => {
                        await projectDb.addTag(tagInstance.id);
                        // Kiểm tra nếu tag được tạo mới hoặc đã tồn tại
                        // if (created) {
                        //     console.log('Tag:', tagInstance.id);

                        //     // Kiểm tra xem project_db có phải là mô hình project không
                        //     // Sử dụng addTag để thêm tag vào project

                        // } else {
                        //     await project_db.addTag(tagInstance.id);
                        //     console.log('Tag đã được thêm vào project.');

                        // }
                    });
        }

        //});

        res.redirect("/user/project/" + projectId + "/edit")
        //Xóa tất cả tag cũ

    } catch (e) {
        console.log(e);
        console.log("Lỗi cập nhật thông tin dự án");
    }
}
const getEditInfoProjectPage = async (req, res) => {
    //Lấy ra thông tin dự án
    let projectId = req.params.id
    let projectDB = await db.project.findOne({
        where: {
            id: projectId
        }
        , include: [db.classification, db.tag, db.genre]
    })
    // Lấy danh sách phân loại
    let classifications = await db.classification.findAll({})
    //Lấy danh sách thể loại
    let genres = await db.genre.findAll({})
    let tags = await db.tag.findAll({})
    projectDB = JSON.parse(JSON.stringify(projectDB))
    tags = JSON.parse(JSON.stringify(tags))
    genres = JSON.parse(JSON.stringify(genres))
    classifications = JSON.parse(JSON.stringify(classifications))
    //

    console.log(projectDB);
    res.render("edit_info_project", {
        title: "Chỉnh sửa thông tin dự án",
        header: true,
        footer: false,
        tags, genres, classifications,
        projectDB,
        user: req.user || req.session.user,

    })
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
    //orderBy=name&order=ASC&saled=ASC
    let orderBy = req.query.orderBy || "name"
    let order = req.query.order || "DESC" // Mặc định giảm dần
    let orderQuery = [[orderBy, order]]

    if (orderBy === "saled") {
        orderQuery = [['name', 'DESC']]

    }

    console.log(orderQuery);
    let user = req?.user ?? req?.session?.user
    let projectDB = await db.project.findAll({
        include: [
            db.classification, db.tag, db.genre, db.image, db.user],
        order: orderQuery,
        where: {
            userId: user.id
        }
    })
    let projects = JSON.parse(JSON.stringify(projectDB))
    //Nếu orderBy bằng saled thì sắp xếp projects theo số lượt bán
    //Sắp xếp theo số lượng bán của từng project
    for (const project of projects) {
        let projectSaledCount = await db.payment.findAndCountAll({
            where: {
                projectId: project.id
            }
        })
        //Lấy những chương trình giảm giá còn hạn
        let discount_intime = await db.discount.findOne({
            where: {
                projectId: project.id,
                endDate: {
                    [db.Sequelize.Op.gte]: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                }
            }
        })

        projectSaledCount = JSON.parse(JSON.stringify(projectSaledCount))
        discount_intime = JSON.parse(JSON.stringify(discount_intime))
        if (discount_intime) {
            project.discount = {
                discountValuePercent: discount_intime.discountValuePercent,
                startDate: discount_intime.startDate,
                endDate: discount_intime.endDate
            }
        }
        project.saledCount = projectSaledCount.count
        // projectSaledCount = JSON.parse(JSON.stringify(projectSaledCount))
    }

    //Sắp xếp theo saledCount nếu orderBy = saled
    // Sắp xếp mảng theo thuộc tính saledCount tăng dần
    if (orderBy === "saled") {
        if (order === "ASC")
            projects = projects.sort((a, b) => a.saledCount - b.saledCount);

        // Sắp xếp mảng theo thuộc tính saledCount giảm dần
        else if (order === "DESC")
            projects = projects.sort((a, b) => b.saledCount - a.saledCount);
    }



    let paidWeekStatistic = await paidStatisticWeek({ userId: user.id })

    let newProjectWeekStatistic = await newProjectStatisticWeek({ userId: user.id })
    console.log(projects, "projects")
    // Tính tổng doanh thu
    let totalRevenue = 0
    //Lấy project do người này tạo ra
    let projectOfThisUser = await db.project.findAll({
        where: {
            userId: user.id
        }
    })
    projectOfThisUser = JSON.parse(JSON.stringify(projectOfThisUser))

    for (const projectItem of projectOfThisUser) {
        let payments = await db.payment.findAll({
            where: {
                projectId: projectItem.id
            },
            include: [db.payment_method]
        })
        payments = JSON.parse(JSON.stringify(payments))

        for (const item of payments) {
            if (item?.payment_method?.name === "paypal") {
                item.lastPrice = Math.round(parseFloat(item.lastPrice) * parseFloat(process.env.USD_TO_VND_EXCHANGE_RATE)) * 1000
            }
            totalRevenue = totalRevenue + (parseFloat(item.lastPrice) - (parseFloat(item.lastPrice) * 0.02))
        }
    }

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
            orderBy,
            order,
            totalRevenue: totalRevenue,
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
            db.classification, db.tag, db.genre, {
                model: db.image

            }, {
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
    let isFollowing = false
    if (req.user?.id || req.session?.user?.id) {
        payment_info = await db.payment.findOne({
            where: {
                projectId: projectDB.id,
                userId: req.user?.id || req.session?.user?.id
            },
            include: [db.payment_method],
        })
        payment_info = JSON.parse(JSON.stringify(payment_info))
        //Kiểm tra xem người dùng có đang follow project này k
        let userFollow = await db.user_follow.findOne({
            where: {
                projectId: projectDB.id,
                userId: req.user?.id || req.session?.user?.id
            }
        })
        userFollow = JSON.parse(JSON.stringify(userFollow))
        if (userFollow) isFollowing = true
    }

    let projectInfo = JSON.parse(JSON.stringify(projectDB))

    // Kiểm tra nếu có payment_info thì đã mua
    res.render("project_view", {
        title: 'Xem ' + projectDB.name,
        header: true,
        footer: false,
        projectInfo,
        payment_info,
        isFollowing,
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
    let user = req.user ?? req.session?.user
    let project = await db.project.findOne({
        where: {
            id: projectId
        },
        include: [db.user, db.image]
    })
    let payment = await db.payment.findOne({
        where: {
            projectId,
            userId: user.id
        },
        include: [db.payment_method]
    })


    let paymentInfo = JSON.parse(JSON.stringify(payment))
    let projectInfo = JSON.parse(JSON.stringify(project))
    console.log(paymentInfo, projectInfo);

    res.render("project_bill", {
        title: "Hoá đơn dự án",
        header: true,
        footer: false,
        projectInfo,
        paymentInfo,
        user
    })
}
const getProfilePage = async (req, res) => {
    let user = req.user || req.session.user
    let userDB = await db.user.findOne({
        where: {
            id: user.id
        }
        , include: [db.role]
    })
    let userProject = await db.project.findOne({
        where: {
            userId: user.id
        }
    })
    userProject = JSON.parse(JSON.stringify(userProject))
    let isDevAccount = false
    let isPlayerAccount = false
    let isAdmin = false
    if (userDB.role.name.toLowerCase() === "admin") {
        isAdmin = true
    }
    else if (userProject) {
        isDevAccount = true
    }
    else {
        isPlayerAccount = true
    }
    //Nếu có 1 project thì người dùng là dev
    //Ngược lại là người chơi

    userDB = JSON.parse(JSON.stringify(userDB))
    let loginByGoogle = false
    console.log(userDB, "userDB");
    if (userDB.googleId) {
        loginByGoogle = true
    }
    // console.log(loginByGoogle, "loginByGoogle");
    let isVerified = false
    if (userDB.isActive) isVerified = true

    console.log(isVerified, "isVerified");
    res.render("user_info", {
        title: "Trang cá nhân",
        header: true,
        footer: false,
        loginByGoogle,
        isDevAccount,
        isPlayerAccount,
        isAdmin,
        isVerified,
        user: userDB
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
    getEditInfoProjectPage,
    editInfoProject,
    getProfilePage,

}