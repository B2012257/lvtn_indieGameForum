const express = require('express')
const router = express.Router()
const userController = require("../controllers/user.controller");
const authMiddleware = require('../middlewares/auth.middleware')


// [Get] /user/:id/project/create
// router.get('/:id/project/create', userController.getCreateProjectPage)

//[POST] /user/upload-project
router.post('/upload-project', userController.uploadProject)
router.post('/project/:projectId/edit', userController.editProject)

router.post('/payment/vnpay/pay/:id', userController.payWithVnpay)
router.get('/order/vnpay_return/', userController.payWithVnpayReturn)
router.post('/payment/paypal/pay/:id', userController.payWithPaypal)
router.get('/payment/paypal/success', userController.paypalSuccess)
router.post('/payment/free/:id', userController.payWithFree)

router.get('/payment/paypal/cancel', userController.paypalCancel)
router.post('/project/:slug/rating', userController.ratingProject)
router.get('/:id/verify/email', userController.getVerifyEmailPage)
router.post('/:id/verify/email', userController.verifyCode)
router.get('/project/discount/:id/delete', userController.deleteDiscount)
router.post('/project/discount', userController.setDiscount)

router.post('/project/:id/follow', userController.followProject)
router.post('/project/:id/unfollow', userController.unFollowProject)
router.get('/project/:id/delete', userController.deleteProject)

router.get('/post/write', userController.getWritePostPage)
router.post('/post/write', userController.createPost)
router.post('/post/:id/delete', userController.deletePost)
router.post('/post/:id/close', userController.closePost)
router.post('/post/:id/reopen', userController.reopenPost)


// router.get('/post/:id/edit', userController.editPostPage)

router.post('/comment/post/:id', userController.commentPost)
router.post('/version/:id/delete', userController.deleteVersion)

router.get('/posts', userController.getMyPostsPage)

module.exports = router
