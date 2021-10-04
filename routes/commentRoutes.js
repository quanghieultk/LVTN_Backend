const express = require('express');
const commentController = require('./../controllers/commentController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(
        authController.protect,
        commentController.getAllComments)
    .post(
        authController.protect,
        commentController.createComment);

router
    .route('/:id')
    .get(
        authController.protect,
        commentController.getComment)
    .patch(
        authController.protect,
        commentController.updateComment)
    .delete(
        authController.protect,
        commentController.deleteComment);

router
    .route('/likeComment')
    .post(
        authController.protect,
        commentController.likeComment);

router
    .route('/commentPost/:postId')
    .get(
        authController.protect,
        commentController.getAllCommentsByPost
    );

module.exports = router;