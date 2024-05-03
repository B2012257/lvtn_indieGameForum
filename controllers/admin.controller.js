const { user } = require("../models")

const getAdminDashboard = (req, res) => {
    //Tổng dự án
    //Tổng bài viết
    //Tổng người dùng
    //Người dùng mới trong tháng
    //Tổng doanh thu
    //Biểu đồ doanh thu trong tuần
    res.render('admin_dashboard', {
        title: 'Trang quản trị',
        header: true,
        user: req.user || req.session.user
    })
}
module.exports = {
    getAdminDashboard
}