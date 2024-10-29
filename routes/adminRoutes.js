const express = require('express')
const router = express.Router()
const adminController = require('../controller/adminController') 
const authController = require('../controller/authController') 

router.get('/login', adminController.displayLogin)

router.post('/login', adminController.adminLogin)

router.get('/dashboard', authController.isAdminAuthenticated, adminController.displayAdminDashboard)

router.get('/admin/stats/:period', authController.isAdminAuthenticated, adminController.getFilteredStats);

module.exports = router;