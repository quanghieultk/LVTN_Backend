const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    roomName: {
        type: String,
        default: ""
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    messages: {
        type: Number,
        default: 0
    }
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;