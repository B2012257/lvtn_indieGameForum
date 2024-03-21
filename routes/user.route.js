const express = require('express')
const router = express.Router()
const userController = require("../controllers/user.controller");



// [Get] /user/:id/project/create
// router.get('/:id/project/create', userController.getCreateProjectPage)

//[POST] /user/upload-project
router.post('/upload-project', userController.uploadProject)

router.post('/payment/vnpay/pay/:id', userController.payWithVnpay)
router.get('/order/vnpay_return', userController.payWithVnpay)
router.post('/payment/paypal/pay/:id', userController.payWithPaypal)
router.get('/payment/paypal/success', userController.paypalSuccess)
router.get('/payment/paypal/cancel', userController.paypalCancel)

module.exports = router
