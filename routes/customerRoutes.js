const express = require('express')
const router = express.Router()
const customerController = require('../controller/customerController')
const authController = require('../controller/authController')

router.get('/home', authController.isAuthenticated, customerController.Home);

router.get('/service', authController.isAuthenticated, customerController.Service);

router.get('/profile', authController.isAuthenticated, customerController.Profile);

router.post('/add-booking', authController.isAuthenticated, customerController.addBooking)

router.post('/delete-appointment/:id', authController.isAuthenticated, customerController.deleteBooking)

router.post('/reschedule-appointment', authController.isAuthenticated, customerController.updateBooking)

module.exports = router;