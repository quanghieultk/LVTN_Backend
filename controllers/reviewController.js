const review = require('./../models/reviewModel');
const PostAll = require('./../models/postAll');
const User = require('./../models/userModel');
const Notification = require('./../models/notificationModel');
const notificationHandler = require("../handler/notificationHandler");
const PostLike = require('./../models/postLikeModel');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary');
const Jimp = require('jimp');
const mongoose = require("mongoose");
const Restaurant = require('../models/restaurantModel');
const io = require("socket.io")();
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const Review = require('./../models/reviewModel');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
}).array("files");

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

exports.createReview = async (req, res, next) => {
    try {
        const restau = await Restaurant.find({ isAcive: true, _id: req.body.restaurant })
        if (restau.length == 0) {
            res.status(404).json({
                status: 'fail',
                message: "nhà hàng chưa được kiểm duyệt"
            });
            return;
        }
        req.body.photo = [];
        const formData = new FormData();
        for (const file of req.files) {
            formData.append("files", fs.createReadStream(file.path), file.filename);
        }
        let formHeaders = formData.getHeaders();
        let flag = await axios.post('http://localhost:5000', formData, {
            headers: {
                ...formHeaders,
            }
        })
            .then(response => {
                if (!response.data.result.includes(false)) {
                    return true;
                } else {
                    return false;
                }

            })
            .catch(error =>
                res.status(404).json({
                    status: 'fail',
                    message: "Hình ảnh không chứa món ăn"
                })
            )
        if (flag == true) {
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
                restaurant: req.body.restaurant,
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
            await PostAll.create({
                type: true,
                post: rev._id,
                author: req.user.id,
                restaurant: req.body.restaurant
            })
            await PostLike.create({ post: rev._id })

            let restaurant = await Restaurant.findOne({
                _id: req.body.restaurant
            })
            const point = (restaurant.rating * restaurant.numberOfReview + rev.rating.avarage) / (restaurant.numberOfReview + 1);
            const rest = await Restaurant.findOneAndUpdate({
                _id: req.body.restaurant
            }, {
                $set: {
                    rating: point,
                    numberOfReview: restaurant.numberOfReview + 1
                }
            })

            res.status(201).json({
                status: 'success',
                data: {
                    data: rev
                }
            });
        } else {
            res.status(404).json({
                status: 'fail',
                message: 'hình ảnh không đúng'
            });
            return;
        }

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}


exports.updateReview = async (req, res, next) => {
    try {
        //check authentication
        req.body.photo = [];
        for (const file of req.files) {
            const newUrl = await cloudinaryImageUpload(file.path);
            console.log(newUrl);
            req.body.photo.push(newUrl);
        }
        const rating = JSON.parse(req.body.rating)
        const food = parseInt(rating.food);
        const staffAttitude = parseInt(rating.staffAttitude);
        const facilities = parseInt(rating.facilities);
        const processServing = parseInt(rating.processServing);
        const prev = await review.findById(req.params.id);
        const rev = await review.findByIdAndUpdate(req.params.id, {
            description: req.body.description,
            photo: req.body.photo,
            author: req.user.id,
            restaurant: req.body.restaurant,
            location: JSON.parse(req.body.location),
            rating: {
                food: food,
                staffAttitude: staffAttitude,
                facilities: facilities,
                processServing: processServing,
                avarage: (food + staffAttitude + facilities + processServing) / 4
            }
        }, {
            new: true,
            runValidators: true
        });

        if (!rev) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có review'
            });
        } else {
            let restaurant = await Restaurant.findOne({
                _id: req.body.restaurant
            })
            const point = (restaurant.rating * restaurant.numberOfReview - prev.rating.avarage + rev.rating.avarage) / (restaurant.numberOfReview);
            const rest = await Restaurant.findOneAndUpdate({
                _id: req.body.restaurant
            }, {
                $set: {
                    rating: point,
                    numberOfReview: restaurant.numberOfReview
                }
            })
            res.status(200).json({
                status: 'success',
                data: {
                    data: rev
                }
            });
        }
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}



exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id)

        if (!review) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có review'
            });
        }else{
            let restaurant= await Restaurant.findOne({
                _id: review.restaurant
            })
            const point=(restaurant.rating*restaurant.numberOfReview+review.rating.avarage)/(restaurant.numberOfReview+1);
            const rest=await Restaurant.findOneAndUpdate({
                _id: restaurant._id
            },{
                $set:{
                    rating: point,
                    numberOfReview: restaurant.numberOfReview-1
                }
            })
            res.status(200).json({
                status: 'success',
                data: {
                    data: review
                }
            });
        }

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}


