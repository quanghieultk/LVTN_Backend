// const mongoose = require('mongoose');

// const reviewSchema = mongoose.Schema({
//     description: {
//         type: String,
//         trim: true,
//         default: ""
//     },
//     photo: {
//         type: Array,
//         default: []
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     },
//     author: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: "Bạn phải cung cấp tác giả"
//     },
//     restaurant: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "restaurant",
//         required: "Bạn phải cung cấp nhà hàng"
//     },
//     rating: {
//         food: {
//             type: Number,
//             default: 0,
//             require: "Bạn phải cung cấp rating"
//         },
//         staffAttitude: {
//             type: Number,
//             default: 0,
//             require: "Bạn phải cung cấp rating"
//         },
//         facilities: {
//             type: Number,
//             default: 0,
//             require: "Bạn phải cung cấp rating"
//         },
//         processServing: {
//             type: Number,
//             default: 0,
//             require: "Bạn phải cung cấp rating"
//         },
//         avarage: {
//             type: Number,
//             default: 0,
//             require: "Bạn phải cung cấp rating"
//         }
//     }
// })

// const Review = mongoose.model('review', reviewSchema);

// module.exports = Review;


const mongoose = require('mongoose');
const Post = require('./postModel');
const Review = Post.discriminator('review', new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurant",
        required: "Bạn phải cung cấp nhà hàng"
    },
    rating: {
        food: {
            type: Number,
            default: 0,
            require: "Bạn phải cung cấp rating"
        },
        staffAttitude: {
            type: Number,
            default: 0,
            require: "Bạn phải cung cấp rating"
        },
        facilities: {
            type: Number,
            default: 0,
            require: "Bạn phải cung cấp rating"
        },
        processServing: {
            type: Number,
            default: 0,
            require: "Bạn phải cung cấp rating"
        },
        avarage: {
            type: Number,
            default: 0,
            require: "Bạn phải cung cấp rating"
        }
    }
}))

module.exports = Review;