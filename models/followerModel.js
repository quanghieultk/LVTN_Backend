const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    followers: [{
        user: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: "User"
        }
    }]
});

const Follower = mongoose.model("Follower", followerSchema);

module.exports = Follower;