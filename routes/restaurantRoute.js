const express = require('express');
const restaurantController = require('./../controllers/restaurantController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/create',
    authController.protect,
    restaurantController.createRestaurant);
router.post('/update/:id',
    authController.protect,
    restaurantController.updateRestaurant);
router.delete('/delete/:id',
    authController.protect,
    restaurantController.deleteRestaurant);
router.get('/getRestaurantById/:restaurantId',
    authController.protect,
    restaurantController.getRestaurantById);

router.get('/getListRestaurant/:userId',
    authController.protect,
    restaurantController.getRestaurantByUser);

router.get('/allRestaurant',
    authController.protect,
    restaurantController.getAllRestaurant);

router.get('/getListRestaurantByRating',
    authController.protect,
    restaurantController.getListRestaurantByRating);
router.get('/getListRestaurantTop',
    authController.protect,
    restaurantController.getListRestaurantTop);

router.post('/createRestaurantGenres',
    authController.protect,
    restaurantController.createRestaurantGenres);
// router.get('/test',
//     // authController.protect,
//     restaurantController.test);
// router.post('/createReviewRestaurant',
//     authController.protect,
//     restaurantController.createReviewRestaurant);

// router.post('/updateReviewRestaurant',
//     authController.protect,
//     restaurantController.updateReviewRestaurant);

// router.post('/deleteReviewRestaurant',
//     authController.protect,
//     restaurantController.deleteRestaurantReview);

router.get('/allRestaurantPost',
    authController.protect,
    restaurantController.getAllRestaurantPost);

router.get('/getPostByRestaurantId/:restaurantId',
    authController.protect,
    restaurantController.getPostByIdRestaurant);

router.post('/createRestaurantPost',
    authController.protect,
    restaurantController.upload,
    restaurantController.createRestaurantPost);

router.delete('/deleteRestaurantPost/:id',
    authController.protect,
    restaurantController.deleteRestaurantPost);

router.post('/recommend',
    authController.protect,
    restaurantController.createRestaurantRecommend);

router.post('/acceptRecommend',
    authController.protect,
    restaurantController.createRestaurantRecommend);

router.get('/getUserFollowRestaurant/:restaurantId',
    authController.protect,
    restaurantController.getUserFollowRestaurant);

router.post('/getRecommnedRestaurantListByLocation',
    authController.protect,
    restaurantController.recommendByLocation);

router.post('/recommendRestaurant',
    authController.protect,
    restaurantController.upload,
    restaurantController.recommendRestaurant);

router.post('/approveRestaurant/:id',
    authController.protect,
    restaurantController.approveRestaurant);

module.exports = router;