const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const restaurantPostSchema = mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
    },
    image: {
        type: Array,
    },
    foodName: {
        type: String,
    },
    cookingRecipe: {
        type: String,
    },
    resources:{
        type: Array,
    },
    description: {
        type: String,
    }
});


const RestaurantPost = mongoose.model('restaurantPost', restaurantPostSchema);

module.exports = RestaurantPost;