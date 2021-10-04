const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    type: {
        type: Boolean,
        default: 0
    },
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "review",
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: "Bạn phải cung cấp tác giả"
    },
    restaurant:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurant",
    }
})

const PostAll = mongoose.model('PostAll', postSchema);

module.exports =PostAll;