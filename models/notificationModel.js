const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    type: String,
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    reply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reply'
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;