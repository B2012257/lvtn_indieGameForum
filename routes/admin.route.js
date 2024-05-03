const express = require('express');
const router = express.Router();
const apiController = require('../controllers/admin.controller');

router.get('/dashboard', apiController.getAdminDashboard);

module.exports = router
