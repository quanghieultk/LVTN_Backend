const mongoose = require('mongoose');

const commentLikeSchema = mongoose.Schema({
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
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

const CommentLike = mongoose.model('CommentLike', commentLikeSchema);

module.exports = CommentLike;