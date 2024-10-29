const express = require('express')
const router = express.Router()
const authController = require('../controller/authController')
const isAuthenticated = require('../controller/authController')

router.get('/', authController.displayLanding);

router.get('/login', authController.displayLogin);

router.get('/signup', authController.displayRegister);

router.post('/signup', authController.Register);

router.post('/login', authController.Login);

router.get('/logout', authController.isAuthenticated, authController.Logout);

module.exports = router;