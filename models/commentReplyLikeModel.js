const mongoose = require('mongoose');

const commentReplyLikeSchema = mongoose.Schema({
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommentReply',
        require: true
    },
    users_likes: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true
        }
    }]
});

const CommentReplyLike = mongoose.model('CommentReplyLike', commentReplyLikeSchema);

module.exports = CommentReplyLike;