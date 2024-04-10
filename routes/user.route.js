const express = require('express')
const router = express.Router()
const userController = require("../controllers/user.controller");



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
router.post('/project/discount', userController.setDiscount)

router.post('/project/:id/follow', userController.followProject)


module.exports = router
