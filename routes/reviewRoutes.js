const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/create',
    authController.protect,
    reviewController.upload,
    reviewController.createReview)
router.post('/update/:id',
    authController.protect,
    reviewController.upload,
    reviewController.updateReview)

module.exports = router;