const express = require('express')
const router = express.Router()
const adminController = require('../controller/adminController') 
const authController = require('../controller/authController') 

router.get('/login', adminController.displayLogin)

router.post('/login', adminController.adminLogin)

router.get('/dashboard', authController.isAdminAuthenticated, adminController.displayAdminDashboard)

router.get('/admin/stats/:period', authController.isAdminAuthenticated, adminController.getStats);

router.get('/appointments', authController.isAuthenticated, adminController.displayReports);

router.post('/delete-appointment/:id', authController.isAdminAuthenticated, adminController.deleteBooking);

router.post('/approve-appointment/:id', authController.isAdminAuthenticated, adminController.approveBooking);

router.post('/reschedule-appointment', authController.isAdminAuthenticated, adminController.updateBooking);

router.post('/complete-appointment/:id', authController.isAdminAuthenticated, adminController.completeBooking);

router.post('/add-booking', authController.isAdminAuthenticated, adminController.addBooking)

module.exports = router;