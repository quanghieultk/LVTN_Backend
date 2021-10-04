const express = require('express');

const authController = require('./../controllers/authController');
const notificationController = require('./../controllers/notificationController');

const router = express.Router();

router.get('/getNotifications/:page',
    authController.protect,
    notificationController.getNotifications);

router.post('/readNotifications',
    authController.protect,
    notificationController.readNotifications);

module.exports = router;