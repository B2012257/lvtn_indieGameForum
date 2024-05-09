const { user, post } = require("../models")
const db = require('../models')
const getAdminDashboard = async (req, res) => {
    //Tổng dự án
    //Tổng bài viết
    //Tổng người dùng
    //Người dùng mới trong tháng
    //Tổng doanh thu
    //Biểu đồ doanh thu trong tuần

    let totalProject = 0
    let totalPosts = 0
    let totalDeveloper = 0
    let totalUser = 0
    let newUserInMonth = 0
    let totalRevenue = 0 //doanh thu -> lấy 2% trên mỗi thanh toán

    //Lấy tất cả payment, nếu tiền việt thì lấy 2% ra, nếu tiến usd thì lấy 2% ra và đổi qua vnd
    let payments = await db.payment.findAll(
        {
            include: [db.payment_method]
        }

    )
    payments = JSON.parse(JSON.stringify(payments))
    payments.forEach(payment => {
        if (payment.payment_method?.name === 'vnpay') {
            console.log(parseInt(payment.lastPrice));
            totalRevenue += parseInt(payment.lastPrice) * 0.02
            console.log(totalRevenue);
        } else {
            console.log(parseFloat(payment.lastPrice));
            totalRevenue += parseFloat(payment.lastPrice) * 0.02 * parseFloat(process.env.USD_TO_VND_EXCHANGE_RATE) * 1000
            console.log(totalRevenue);

        }

    })
    totalRevenue = totalRevenue
    totalRevenue = parseInt(totalRevenue)
    totalProject = await db.project.count()
    totalPosts = await db.post.count({
        //Posttype khác devlog
        where: {
            postType: {
                [db.Sequelize.Op.ne]: 'devlog'
            }
        }

    })
    //Lấy id người dùng trong project mà id không được trùng
    totalDeveloper = await db.project.count({
        distinct: true,
        col: 'userId'
    })

    totalUser = await db.user.count()

    //trả về 10 bài viết gần đây

    //Lấy thông tin các bài viết, người đăng, số lượt bình chọn, số bình luận
    let posts = await db.post.findAll({
        include: [db.user],
        where: {
            // với postType là article hoặc question
            postType: {
                [db.Sequelize.Op.or]: ['article', 'question', 'devlog']
            },
            is_public: true,
        },
        order: [['createdAt', 'DESC']],
        limit: 10
    })
    posts = JSON.parse(JSON.stringify(posts))


    //Trả về 10 trò chơi gần đây
    let projects = await db.project.findAll({
        limit: 8,
        order: [
            ['createdAt', 'DESC']
        ],
        include: [db.user, db.discount, db.classification, db.tag, db.image],
    })

    //Lấy doanh thu trong vòng 6 tháng trước kể từ tháng này
    let revenueIn6Months = [] //Key value: tháng, value: doanh thu
    let month = (new Date().getMonth()) + 1
    let year = new Date().getFullYear()
    for (let i = 0; i < 6; i++) {

        let monthRevenue = 0
        let monthName = ''
        if (month === 0) {
            month = 12
            year -= 1
        }
        monthName = month + '/' + year
        //Lấy doanh thu trong tháng
        // payments.forEach(payment => {
        //     if (payment.payment_method?.name === 'vnpay' && new Date(payment.createdAt).getMonth() === month - 1 && new Date(payment.createdAt).getFullYear() === year) {
        //         monthRevenue += parseInt(payment.lastPrice) * 0.02
        //     } else if (new Date(payment.createdAt).getMonth() === month - 1 && new Date(payment.createdAt).getFullYear() === year) {
        //         monthRevenue += parseFloat(payment.lastPrice) * 0.02 * parseFloat(process.env.USD_TO_VND_EXCHANGE_RATE) * 1000
        //     }
        // })
        for (let i = 0; i < payments.length; i++) {
            const payment = payments[i];
            if (new Date(payment.createdAt).getMonth() === month - 1 && new Date(payment.createdAt).getFullYear() === year) {
                if (payment.payment_method?.name === 'vnpay') {
                    monthRevenue += parseInt(payment.lastPrice) * 0.02;
                } else {
                    monthRevenue += parseFloat(payment.lastPrice) * 0.02 * parseFloat(process.env.USD_TO_VND_EXCHANGE_RATE) * 1000;
                }
            }
        }

        // So sánh với tháng trước, nếu tăng thì số dương, giảm thì số âm, giữ nguyên thì 0
        let compare = 0
        if (i > 0) {
            console.log(revenueIn6Months[i - 1].value, monthRevenue);
            compare = revenueIn6Months[i - 1].value - monthRevenue
            revenueIn6Months[i - 1].compare = parseInt(compare)
        }
        revenueIn6Months.push({
            month: monthName,
            value: parseInt(monthRevenue),
            compare
        })

        month -= 1
    }
    console.log(revenueIn6Months);
    projects = JSON.parse(JSON.stringify(projects))
    totalPosts = JSON.parse(JSON.stringify(totalPosts))
    totalProject = JSON.parse(JSON.stringify(totalProject))
    totalDeveloper = JSON.parse(JSON.stringify(totalDeveloper))
    totalUser = JSON.parse(JSON.stringify(totalUser))

    res.render('admin_dashboard', {
        title: 'Thống kê hệ thống',
        header: true,
        totalPosts,
        posts,
        projects,
        totalProject,
        totalDeveloper,
        totalRevenue,
        totalUser,
        revenueIn6Months,
        user: req.user || req.session.user
    })
}
module.exports = {
    getAdminDashboard
}