const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const restaurantReviewSchema = mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
    },
    userReview:[{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        point: {
            type: Number,
        },
        review: {
            type:  String,
        },
    }]
});


const RestaurantReview = mongoose.model('restaurantReview', restaurantReviewSchema);

module.exports = RestaurantReview;