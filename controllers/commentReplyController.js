const CommentReply = require('./../models/commentReplyModel');
const CommentReplyLike = require('./../models/commentReplyLikeModel');
const User = require('./../models/userModel');
const Notification = require('./../models/notificationModel');

exports.createCommentReply = async(req, res, next) => {
    try {
        const commentReply = await CommentReply.create({
            text: req.body.text,
            author: req.user.id,
            comment: req.body.commentId
        });
        await CommentReplyLike.create({ comment: commentReply._id });

        await Notification.create({
            sender: req.user.id,
            receiver: req.body.userId,
            comment: req.body.commentId,
            post: req.body.postId,
            reply: comment._id,
            type: "comment_reply"
        });

        res.status(201).json({
            status: 'success',
            data: {
                data: commentReply
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.updateCommentReply = async(req, res, next) => {
    try {
        const commentReply = await CommentReply.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!commentReply) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có commentReply'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: commentReply
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.deleteCommentReply = async(req, res, next) => {
    try {
        const commentReply = await CommentReply.findByIdAndDelete(req.params.id);
        await CommentReplyLike.findOneAndDelete({ comment: req.params.id });

        if (!commentReply) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có commentReply'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: commentReply
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}
exports.getAllCommentReplies = async(req, res, next) => {
    try {
        let commentReplies = await CommentReply.find();

        if (!commentReplies) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có commentReplies'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: commentReplies
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getCommentReply = async(req, res, next) => {
    try {
        let commentReply = await CommentReply.findById(req.params.id);

        if (!commentReply) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có commentReply'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: commentReply
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getAllCommentReplyByComment = async(req, res, next) => {
    try {
        let commentReplies = await CommentReply.find({ comment: req.params.commentId }).populate('author');

        if (!commentReplies) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có commentReplies'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: commentReplies
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.likeCommentReply = async(req, res, next) => {
    try {
        const {
            commentId,
        } = req.body
        const commentReplyLike = await CommentReplyLike.updateOne({
            comment: commentId,
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
            reply: req.body.commentId,
            post: req.body.postId,
            type: "like_commentReply"
        });

        await User.findByIdAndUpdate(req.user.id, {
            $push: {
                commentReplyLikes: {
                    post: commentId
                }
            }
        }, { new: true });

        res.status(200).json({
            status: 'success',
            data: commentReplyLike
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}