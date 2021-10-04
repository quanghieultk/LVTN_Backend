const mongoose = require('mongoose');

const commentReplySchema = mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const CommentReply = mongoose.model('CommentReply', commentReplySchema);

module.exports = CommentReply;