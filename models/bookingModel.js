const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: '',
        required: [true, 'Booking phải có food']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Booking phải có user']
    },
    price: {
        type: Number,
        required: [true, 'Booking phải có price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;