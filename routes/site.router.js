
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
router.get('/user/upload-project', siteController.getCreateProjectPage)
router.get('/games',siteController.getGamesPage)
router.get('/', siteController.getIndexPage)

module.exports = router;
