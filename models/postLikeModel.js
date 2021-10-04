const mongoose = require('mongoose');

const postLikeSchema = mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
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

const PostLike = mongoose.model('PostLike', postLikeSchema);

module.exports = PostLike;