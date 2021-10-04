const express = require('express');
const search = require('../controllers/searchController');
const Restaurant = require('../models/restaurantModel');
const authController = require('./../controllers/authController');


const router = express.Router();

router.post('/searchRestaurant',
    authController.protect,
    search.searchRestaurant)
router.get('/searchUser',
    authController.protect,
    search.SearchUser)
router.get('/searchPost',
    authController.protect,
    search.SearchPost)
module.exports = router;