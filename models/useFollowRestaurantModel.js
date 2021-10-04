const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const useFollowRestaurantModelSchema = mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.ObjectId,
        ref: "restaurant",
    },
    follow: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    }]
});


const restaurantFollow = mongoose.model('userFollowRestaurant', useFollowRestaurantModelSchema);

module.exports = restaurantFollow;