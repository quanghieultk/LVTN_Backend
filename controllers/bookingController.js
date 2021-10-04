const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Food = require('./../models/foodModel');
const Booking = require('./../models/bookingModel');

exports.getCheckoutSession = async (req, res, next) => {
    try {
        const food = await Food.findById(req.params.foodId);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            success_url: `${req.protocol}://${req.get('host')}/?food=${
                req.params.foodId
            }&user=${req.user.id}&price=${food.price}`,
            cancel_url: `${req.protocol}://${req.get('host')}/`,
            customer_email: req.user.email,
            client_reference_id: req.params.foodId,
            line_items: [{
                name: food.name,
                description: food.description,
                images: [
                    food.photo
                ],
                amount: food.price * 100,
                currency: 'usd',
                quantity: 1
            }]
        });

        res.status(200).json({
            status: 'success',
            session
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.createBookingCheckout = async (req, res, next) => {
    try {
        const { food, user, price } = req.query;
        if (!food && !user && !price) return next();
        await Booking.create({ food, user, price });

        res.redirect('http://localhost:3000/market');
        next();
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}