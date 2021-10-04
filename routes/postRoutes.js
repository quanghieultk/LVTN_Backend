const express = require('express');
const postController = require('./../controllers/postController');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.get('/getAllReviewAdmin',
    authController.protect,
    postController.getAllReviewAdmin);
router.get('/getAllShareAdmin',
    authController.protect,
    postController.getAllShareAdmin);
router.post('/likePost',
    authController.protect,
    postController.likePost);
router.get('/getPostLikes/:postId',
    authController.protect,
    postController.getPostLikes);
router.get('/getPostByUser/:userId',
    authController.protect,
    postController.getPostByUser);

router.post('/',
    authController.protect,
    postController.upload,
    postController.createPost);

// router.get('/',
//     authController.protect,
//     postController.getAllPosts);

router.get('/getPostUserFollow/:page',
    authController.protect,
    postController.getPostUserFollow);
router.get('/random',
    authController.protect,
    postController.getPostRandom);
router.patch('/:id',
    authController.protect,
    postController.upload,
    postController.updatePost);

router.get('/:id',
    authController.protect,
    postController.getPost);

router.delete('/deleteReview/:id',
    authController.protect,
    reviewController.deleteReview
);
router.delete('/:id',
    authController.protect,
    postController.deletePost);






module.exports = router;