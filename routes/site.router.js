
const express = require('express');
const router = express.Router();
const siteController = require("../controllers/site.controller")

router.get('/login', siteController.getLoginPage)
router.get('/register', siteController.getRegisterPage)
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Đã xảy ra lỗi khi đăng xuất');
        }
        req.user = {}
        res.redirect('/login'); // Chuyển hướng sau khi đăng xuất thành công
    });
});
router.get('/user/project/create', siteController.getCreateProjectPage)
router.get('/user/project/:id/edit', siteController.getEditInterfaceProjectPage)
router.get('/user/projects', siteController.getMyProjectPage)
router.get('/project/:slug/view', siteController.getProjectViewPage) //xem dự án
router.get('/project/:id/pay', siteController.getPayViewPage) //trang thanh toan dự án

router.get('/games', siteController.getGamesPage)
router.get('/', siteController.getIndexPage)

module.exports = router;
