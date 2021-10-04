const Comment = require('./../models/commentModel');
const CommentLike = require('./../models/commentLikeModel');
const User = require('./../models/userModel');
const Notification = require('./../models/notificationModel');
const notificationHandler = require("../handler/notificationHandler");
exports.createComment = async (req, res, next) => {
    try {
        console.log(req.body.userId)
        const comment = await Comment.create({
            text: req.body.text,
            author: req.user.id,
            post: req.body.postId
        });
        await CommentLike.create({ comment: comment._id });
        let user = await User.find(
            {
                _id: req.user.id
            }
        )
        let notification;
        if (req.user.id != req.body.authorId) {
            notification = await Notification.create({
                sender: req.user.id,
                receiver: req.body.authorId,
                post: req.body.postId,
                comment: comment._id,
                type: "post_comment"
            });
        }

        Promise.all([user, notification]).then(
            (values) => {
                notificationHandler.sendAddCommentNotification(req, values)
            }
        )
        res.status(201).json({
            status: 'success',
            data: {
                data: comment
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.updateComment = async (req, res, next) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!comment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có comment'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: comment
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findByIdAndDelete(req.params.id);
        await CommentLike.findOneAndDelete({ comment: req.params.id });

        if (!comment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có comment'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: comment
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}
exports.getAllComments = async (req, res, next) => {
    try {
        let comments = await Comment.find();

        if (!comments) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có comment'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: comments
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getComment = async (req, res, next) => {
    try {
        let comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có comment'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: comment
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getAllCommentsByPost = async (req, res, next) => {
    try {
        let comments = await Comment.find({ post: req.params.postId }).populate('author');

        if (!comments) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có comment'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: comments
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.likeComment = async (req, res, next) => {
    try {
        const {
            commentId,
        } = req.body
        const commentLike = await CommentLike.updateOne({
            comment: req.body.commentId,
            "users_likes.author": { $ne: req.user.id }
        }, {
            $addToSet: {
                users_likes: {
                    author: req.user.id
                }
            }
        });

        await Notification.create({
            sender: req.user.id,
            receiver: req.body.userId,
            comment: req.body.commentId,
            post: req.body.postId,
            type: "like_comment"
        });

        await User.findByIdAndUpdate(req.user.id, {
            $push: {
                commentLikes: {
                    post: req.body.commentId
                }
            }
        }, { new: true });

        res.status(200).json({
            status: 'success',
            data: commentLike
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}