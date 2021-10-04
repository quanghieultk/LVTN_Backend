const mongoose = require("mongoose");

const followingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    following: [{
        user: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: "User"
        }
    }]
});

const Following = mongoose.model('Following', followingSchema)

module.exports = Following;