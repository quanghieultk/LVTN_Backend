const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const restaurantSchema = new mongoose.Schema({
    id:{
        type: Number,
        required: [true, 'Vui lòng nhập id']
    },
    name:{
        type: String,
        required: [true, 'Vui lòng nhập loai nha hang']
    }
});

const Restaurant = mongoose.model('restaurantGenres', restaurantSchema);


module.exports = Restaurant;