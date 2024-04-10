
const express = require('express');
const router = express.Router();
const siteController = require("../controllers/site.controller")
const authMiddleware = require('../middlewares/auth.middleware')

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
router.get('/user/project/create', authMiddleware.isLogin, siteController.getCreateProjectPage)
router.get('/user/project/:id/editInfo', authMiddleware.isLogin, siteController.getEditInfoProjectPage)
router.post('/user/project/:id/editInfo', authMiddleware.isLogin, siteController.editInfoProject)

router.get('/user/project/:id/edit', authMiddleware.isLogin, siteController.getEditInterfaceProjectPage)
router.get('/user/projects', authMiddleware.isLogin, siteController.getMyProjectPage)

router.get('/project/:slug/view', siteController.getProjectViewPage) //xem dự án

router.get('/project/:id/bill', authMiddleware.isLogin, siteController.getProjectBillPage) //xem hoá đơn dự án

router.get('/project/:id/pay', authMiddleware.isLogin, siteController.getPayViewPage) //trang thanh toan dự án
router.get('/user/libary', authMiddleware.isLogin, siteController.getLibaryPage)
router.get('/project/:slug/rating', siteController.getRatingPage)

router.get('/tags/:slug', siteController.getTagsPage)

router.get('/genres', siteController.getGenresPage)

router.get('/project/:classification', siteController.getProjectViewByClassificationPage)
router.get('/forum', siteController.getForumPage)


router.get('/user/my-profile', authMiddleware.isLogin, siteController.getProfilePage);

router.get('/', siteController.getIndexPage)

module.exports = router;
