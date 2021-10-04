const express = require('express');

const foodController = require('./../controllers/foodController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(
        authController.protect,
        foodController.getAllFoods)
    .post(
        authController.protect,
        foodController.upload,
        foodController.createFood);

router
    .route('/:id')
    .get(
        authController.protect,
        foodController.getFood)
    .patch(
        authController.protect,
        foodController.updateFood)
    .delete(
        authController.protect,
        foodController.deleteFood);

module.exports = router;