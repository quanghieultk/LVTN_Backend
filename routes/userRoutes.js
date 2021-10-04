const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.patch('/updatePassword',
    authController.protect,
    authController.updatePassword);
router.get('/active/:id',
    authController.activeUser);
router.post('/changeProfilePicture',
    authController.protect,
    userController.upload,
    userController.changeProfilePicture);

router.post('/changeBackgroundPicture',
    authController.protect,
    userController.upload,
    userController.changeBackgroundPicture);

router.post('/forgotPassword',
    authController.forgotPassword);



router.patch('/resetPassword/:token',
    authController.resetPassword);

router
    .route('/')
    .get(userController.getAllUsers);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

router.post('/signup', authController.signup);
router.post('/login', authController.login);



router.get('/restaurant/getRestaurantFollow', authController.protect, userController.getRestaurantUserFollow);

router.post('/followUser', authController.protect, userController.followUser);
router.post('/followRestaurant', authController.protect, userController.restaurantFollow);

router.get('/followers/:id', authController.protect, userController.getFollowers);
router.get('/followings/:id', authController.protect, userController.getFollowings);

router.get('/getImageOfUser/:userId', authController.protect, userController.getImageOfUser);
router.get('/interesting/all', userController.getInteresting);

module.exports = router;