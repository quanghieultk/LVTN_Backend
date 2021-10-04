const express = require('express');
const commentReplyController = require('./../controllers/commentReplyController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(
        authController.protect,
        commentReplyController.getAllCommentReplies)
    .post(
        authController.protect,
        commentReplyController.createCommentReply);

router
    .route('/:id')
    .get(
        authController.protect,
        commentReplyController.getCommentReply)
    .patch(
        authController.protect,
        commentReplyController.updateCommentReply)
    .delete(
        authController.protect,
        commentReplyController.deleteCommentReply);

router
    .route('/likeCommentReply')
    .post(
        authController.protect,
        commentReplyController.likeCommentReply);
router
    .route('/commentCommentReply/:commentId')
    .get(
        authController.protect,
        commentReplyController.getAllCommentReplyByComment);
module.exports = router;