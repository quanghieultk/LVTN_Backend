const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Food phải có name']
    },
    description: {
        type: String,
        required: [true, 'Food phải có description']
    },
    price: {
        type: Number,
        required: [true, 'Food phải có price']
    },
    photo: {
        type: String
    }
});

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;