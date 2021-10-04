const Restaurant = require('./../models/restaurantModel');
const RestaurantReview = require('./../models/restaurantReviewModel');
const RestaurantPost = require('./../models/restaurantPostModel');
const RestaurantGenres = require('./../models/restaurantGenresModel');
const PostLike = require('./../models/postLikeModel');
const review = require('./../models/reviewModel');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary');
const Jimp = require('jimp');
const restaurantFollow = require('../models/useFollowRestaurantModel');
var geodist = require('geodist')
const fs = require('fs');
const json2csv = require('json2csv').parse;
var child_process = require('child_process');
const Review = require('./../models/reviewModel');
const Post = require('../models/postModel');
const mongoose = require('mongoose');
function checkFileType(file, cb) {

    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error("Ảnh này không được cho phép"));
    }
}

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, Date.now() + "." + ext);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    limits: {
        fileSize: 10485760 //10 MB
    }
}).array("image");

const cloudinaryImageUpload = async file => {
    return new Promise(resolve => {
        cloudinary.uploader.upload(file, function (result) {
            resolve(result.secure_url);
        });
    })
}

exports.upload = async (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                message: err.message
            });
        }

        if (!req.files) {
            return res.status(400).json({
                message: "Vui lòng tải file"
            });
        }

        next();
    });
}


exports.createRestaurantRecommend = async (req, res, next) => {
    try {
        const restaurant = new Restaurant({
            restaurantname: req.body.restaurantname,
            address: req.body.address.toString().trim(),
            location: req.body.location,
            email: req.body.email,
            phone: req.body.phone,
            restauranttype: req.body.type,
            description: req.body.description
        });
        restaurant.save();
        res.status(201).json({
            status: 'success',
            data: {
                restaurant: restaurant
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

//restaurant
exports.createRestaurant = async (req, res, next) => {
    try {
        const restaurant = new Restaurant({
            restaurantname: req.body.restaurantname,
            address: req.body.address.toString().trim(),
            location: req.body.location,
            email: req.body.email,
            phone: req.body.phone,
            description: req.body.description.toString().trim(),
            isAcive: req.body.isAcive ? req.body.isAcive : false,
            genres: req.body.genres ? req.body.genres : []
        });
        await restaurant.save();
        restaurantFollow.create({
            restaurant: restaurant._id
        })
        res.status(201).json({
            status: 'success',
            data: {
                restaurant: restaurant
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}



exports.getRestaurantByUser = async (req, res, next) => {
    try {
        var restaurant = await Restaurant.find({
            user: req.params.userId
        });
        res.status(200).json({
            status: 'success',
            data: {
                restaurant: restaurant
            }
        });

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getRestaurantById = async (req, res, next) => {
    try {
        let postRestaurant = await Restaurant.findOne({
            $and: [{
                _id: { $eq: req.params.restaurantId }
            }, {
                isAcive: { $eq: true }
            }]
        }).populate('genres');

        if (!postRestaurant) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có document'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: postRestaurant
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getAllRestaurant = async (req, res, next) => {
    try {
        var restaurant = await Restaurant.find().populate({ path: 'genres' });
        res.status(200).json({
            status: 'success',
            data: {
                restaurant: restaurant
            }
        });

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

//chưa test
exports.updateRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, {
            user: req.body.user,
            restaurantname: req.body.restaurantname,
            address: req.body.address,
            location: req.body.location,
            email: req.body.email,
            phone: req.body.phone,
            restauranttype: req.body.type,
            description: req.body.description,
            genres: req.body.genres ? req.body.genres : []
        }, {
            new: true,
            runValidators: true,
            returnOriginal: false
        });
        if (!restaurant) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có post'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: restaurant
            }
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

//todo
exports.deleteRestaurant = async (req, res, next) => {
    try {
        var restaurant = await Restaurant.findById(req.params.id, function(err,result){
            result.remove(function(err,resu){
                if(err){
                    console.log(err);
                }
            })
        });
        await Review.findOneAndDelete({ restaurant: req.params.id });

        if (!restaurant) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có restaurant'
            });
        }

        res.status(200).json({
            status: 'success'
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

//todo !important
exports.getRestaurantByUserLocation = async (req, res, next) => {
    try {
        //input: location 
        //output: danh sach nha hang theo khoang cach

    } catch (error) {

    }
}

//restaurant post
exports.createRestaurantPost = async (req, res, next) => {
    try {
        req.body.photo = [];
        for (const file of req.files) {
            const newUrl = await cloudinaryImageUpload(file.path);
            req.body.photo.push(newUrl);
        }
        const review = await RestaurantPost.create({
            restaurant: req.body.restaurant,
            image: req.body.photo,
            foodName: req.body.foodName,
            cookingRecipe: req.body.cookingRecipe,
            resources: req.body.resources,
            description: req.body.description,
        });

        res.status(200).json({
            status: 'success',
            data: {
                review: review
            }
        });

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}
//chưa test
exports.updateRestaurantPost = async (req, res, next) => {
    try {
        req.body.photo = [];
        for (const file of req.files) {
            const newUrl = await cloudinaryImageUpload(file.path);
            console.log(newUrl);
            req.body.photo.push(newUrl);
        }
        const post = await RestaurantPost.findByIdAndUpdate(req.params.id, {
            restaurant: req.body.restaurant,
            image: req.body.photo,
            foodName: req.user.foodName,
            cookingRecipe: req.body.cookingRecipe,
            resources: req.body.resources,
            description: req.body.description,
            createAt: req.body.createAt
        }, {
            new: true,
            runValidators: true,
            returnOriginal: false
        });

        if (!post) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có post'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: post
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}
//chua test
exports.deleteRestaurantPost = async (req, res, next) => {
    try {
        const post = await RestaurantPost.findByIdAndDelete(req.params.id);
        await RestaurantReview.findOneAndDelete({ restaurant: req.params.id });

        if (!post) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có post'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: post
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getAllRestaurantPost = async (req, res, next) => {
    try {
        const post = await RestaurantPost.find();
        res.status(200).json({
            status: 'success',
            data: {
                data: post
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getPostByIdRestaurant = async (req, res, next) => {
    try {
        var post = await Post.find({
            restaurant: mongoose.Types.ObjectId(req.params.restaurantId)
            // isAcive: true
        }).populate('author').populate('restaurant')
        console.log(post)
        res.status(200).json({
            status: 'success',
            data: {
                data: post
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

//review restaurant

//test
// exports.getReviewRestaurant = async (req, res, next) => {
//     try {
//         var restaurantReview = await RestaurantReview
//             .find({ restaurant: req.params.restaurantId }
//             ).populate(
//                 'userReview.user'
//             )
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 restaurant: restaurantReview
//             }
//         });

//     } catch (err) {
//         res.status(404).json({
//             status: 'fail',
//             message: err
//         });
//     }
// }

// exports.createReviewRestaurant = async (req, res, next) => {
//     try {
//         let data = await RestaurantReview.updateOne({
//             restaurant: req.body.restaurant,
//         }, {
//             $addToSet: {
//                 userReview: {
//                     user: req.user.id,
//                     point: req.body.point,
//                     review: req.body.review
//                 }
//             }
//         }
//         )
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 restaurant: data
//             }
//         });

//     } catch (err) {
//         res.status(404).json({
//             status: 'fail',
//             message: err
//         });
//     }
// }

// exports.updateReviewRestaurant = async (req, res, next) => {
//     try {
//         let data = await RestaurantReview.findOneAndUpdate({
//             restaurant: req.body.restaurant,
//             "userReview._id": req.body.id
//         },
//             {
//                 $set:
//                 {
//                     "userReview.$.review": req.body.review,
//                     "userReview.$.point": req.body.point,
//                 }
//             }
//             , { returnOriginal: false },
//             (err, doc) => {
//                 if (err) {
//                     res.status(404).json({
//                         status: 'fail',
//                         message: err
//                     });
//                 }
//                 res.status(200).json({
//                     status: 'success',
//                     data: {
//                         restaurant: doc
//                     }
//                 }
//                 )
//             });

//     } catch (err) {
//         res.status(404).json({
//             status: 'fail',
//             message: err
//         });
//     }
// }
exports.getUserFollowRestaurant = async (req, res, next) => {
    try {
        let data = await restaurantFollow
            .findOne({
                restaurant: req.params.restaurantId
            })
            .populate('restaurant')
            .populate('follow.user');
        res.status(200).json({
            status: 'success',
            data: {
                follow: data
            }
        });
    } catch (err) {

        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.deleteRestaurantReview = async (req, res, next) => {
    try {
        let data = await RestaurantReview.findOneAndUpdate({
            restaurant: req.body.restaurant,
        }, {
            $pull: {
                userReview: { _id: req.body.id }
            }
        })

        res.status(200).json({
            status: 'success',
            data: {
                review: data
            }
        });

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.recommendByLocation = async (req, res, next) => {
    try {
        //input location and userid
        let lat = req.body.location.lat;
        let long = req.body.location.long;
        //get list location restaurant
        let restaurantList = await Restaurant.find();
        restaurantList.forEach(ele => {
            ele.dist = geodist({ lat: lat, lon: long }, { lat: ele.location.lat, lon: ele.location.long });
        })
        restaurantList.sort((a, b) => (a.dist > b.dist) ? -1 : 1);
        res.status(200).json({
            status: 'success',
            data: {
                listRestaurant: restaurantList.slice(0, 5)
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.recommendRestaurant = async (req, res, next) => {
    try {
        let location = JSON.parse(req.body.locationRestaurant);
        const restaurant = new Restaurant({
            restaurantname: req.body.restaurantname,
            address: req.body.address,
            location: location.location,
            // email: req.body.email,
            // phone: req.body.phone,
            description: req.body.descriptionRestaurant
        });
        restaurant.save();
        restaurantFollow.create({
            restaurant: restaurant._id
        })
        // create review
        req.body.photo = [];
        for (const file of req.files) {
            const newUrl = await cloudinaryImageUpload(file.path);
            req.body.photo.push(newUrl);
        }
        const rating = JSON.parse(req.body.rating)
        const food = parseInt(rating.food);
        const staffAttitude = parseInt(rating.staffAttitude);
        const facilities = parseInt(rating.facilities);
        const processServing = parseInt(rating.processServing);

        const rev = await review.create({
            description: req.body.description,
            photo: req.body.photo,
            author: req.user.id,
            restaurant: restaurant._id,
            location: JSON.parse(req.body.location),
            rating: {
                food: food,
                staffAttitude: staffAttitude,
                facilities: facilities,
                processServing: processServing,
                avarage: (food + staffAttitude + facilities + processServing) / 4
            },
            type: true
        });
        await PostLike.create({ post: rev._id })
        res.status(200).json({
            status: 'success',
            data: {
                review: rev,
                restaurant: restaurant

            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

// exports.getListRestaurantTop = async (req, res, next) => {
//     try {
//         let restaurantList = await Restaurant.find({}).sort({ 'rating': -1 }).limit(5);
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 listRestaurant: restaurantList
//             }
//         });
//     } catch (err) {
//         res.status(404).json({
//             status: 'fail',
//             message: err
//         });
//     }
// }

// exports.getListRestaurantByRating = async (req, res, next) => {
//     try {
//         let restaurantList = await Restaurant.find({}).populate('genres').exec(
//             (err, results) => {
//                 if (err) {
//                     console.log(err)
//                 }
//                 console.log(JSON.parse(JSON.stringify(results)))
//                 let csv = json2csv(JSON.parse(JSON.stringify(results)))
//                 console.log(csv)
//                 const filePath = path.join("csv-" + 1 + ".csv")
//                 fs.writeFile(filePath, csv, function (err) {
//                     console.log(err)
//                 })
//             }
//         )

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 listRestaurant: restaurantList
//             }
//         });
//     } catch (err) {
//         res.status(404).json({
//             status: 'fail',
//             message: err
//         });
//     }
// }

exports.approveRestaurant = async (req, res, next) => {
    try {
        await Restaurant.findByIdAndUpdate(req.params.id, {
            isAcive: true
        }, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            status: 'success'
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.createRestaurantGenres = async (req, res, next) => {
    try {
        await RestaurantGenres.create({
            id: req.body.id,
            name: req.body.name
        })
        res.status(200).json({
            status: 'success'
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}
function runScript(params, intertest) {
    if (intertest) {
        return child_process.spawn('python', [
            "-u",
            path.join(__dirname, '..', 'recommend.py'), params, intertest
        ]);
    } else {
        return child_process.spawn('python', [
            "-u",
            path.join(__dirname, '..', 'recommend.py'), params
        ]);
    }

}
exports.getListRestaurantByRating = (req, res, next) => {
    try {
        const subprocess = runScript(csv)
        subprocess.stdout.pipe(res)
        subprocess.stderr.pipe(res)
        subprocess.stderr.on('data', (data) => {
            console.log(`error:${data}`);
        });
        subprocess.stderr.on('close', () => {
            console.log("Closed");
        });

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getListRestaurantTop = async (req, res, next) => {
    try {
        const subprocess = runScript(csv, req.query.interests);
        subprocess.stdout.pipe(res)
        subprocess.stderr.pipe(res)
        subprocess.stderr.on('data', (data) => {
            console.log(`error:${data}`);
        });
        subprocess.stderr.on('close', () => {
            console.log("Closed");
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}