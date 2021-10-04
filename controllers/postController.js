const Post = require('./../models/postModel');
const PostAll = require('./../models/postAll');
const PostLike = require('./../models/postLikeModel');
const User = require('./../models/userModel');
const Notification = require('./../models/notificationModel');
const restaurantFollow = require('./../models/useFollowRestaurantModel');
const Following = require('../models/followingModel');
const notificationHandler = require("../handler/notificationHandler");
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary');
const Jimp = require('jimp');
const mongoose = require("mongoose");
const { response } = require('express');
const Review = require('../models/reviewModel');
const io = require("socket.io")();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
var http = require('http');
const Restaurant = require('../models/restaurantModel');

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
}).array("files", { resource_type: 'raw' });

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


exports.createPost = async (req, res, next) => {
    try {
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
            const post = await Post.create({
                description: req.body.description,
                photo: req.body.photo,
                author: req.user.id,
                hashtags: req.body.hashtags,
                location: JSON.parse(req.body.location),
                tags: req.body.tags
            });
            await PostAll.create({
                post: post._id,
                author: req.user.id,
            })
            await PostLike.create({ post: post._id })

            res.status(201).json({
                status: 'success',
                data: {
                    data: post
                }
            });
        } else {
            res.status(404).json({
                status: 'fail',
                message: 'hình ảnh không đúng'
            });
        }

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.updatePost = async (req, res, next) => {
    console.log(req.body);
    try {
        req.body.photo = [];
        for (const file of req.files) {
            const newUrl = await cloudinaryImageUpload(file.path);
            console.log(newUrl);
            req.body.photo.push(newUrl);
        }
        const post = await Post.findByIdAndUpdate(req.params.id, {
            description: req.body.description,
            photo: req.body.photo,
            author: req.user.id,
            location: JSON.parse(req.body.location),
        }, {
            new: true,
            runValidators: true
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

exports.deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id, function(err,result){
            result.remove(function(err,resu){
                if(err){
                    console.log(err);
                }
            })
        });
        await PostLike.findOneAndDelete({ post: req.params.id });
        await PostAll.findOneAndDelete({ post: req.params.id });
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

exports.getAllReviewAdmin = async (req, res, next) => {
    try {
        post = await Post.find({
            "restaurant": { $exists: true }
        }).populate('author').populate('restaurant');

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

exports.getAllShareAdmin = async (req, res, next) => {
    try {
        post = await Post.find({
            "restaurant": { $exists: false }
        }).populate('author').populate('restaurant');

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

exports.getPost = async (req, res, next) => {
    try {
        let post = await (await Post.findById(req.params.id).populate('author').populate('restaurant'));
        if (!post) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có document'
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

exports.likePost = async (req, res, next) => {

    try {
        var srvSockets = io.sockets.sockets;
        console.log(Object.keys(srvSockets).length)
        const postLike = await PostLike.updateOne({
            post: req.body.postId,
            "users_likes.author": { $ne: req.user.id }
        }, {
            $addToSet: {
                users_likes: {
                    author: req.user.id
                }
            }
        });


        if (postLike.nModified === 1) {
            let user = await User.findByIdAndUpdate(req.user.id, {
                $push: {
                    postLikes: {
                        post: req.body.postId
                    }
                }
            }, { new: true });
            if (req.user.id !== req.body.authorId) {
                let notification = await Notification.create({
                    sender: req.user.id,
                    receiver: req.body.userId,
                    type: "like_post",
                    post: req.body.postId,
                });

                Promise.all([user, notification]).then(
                    (values) => {
                        notificationHandler.sendLikePostNotification(req, values);
                        // res.status(200).json({
                        //     status: 'success',
                        //     postId: req.body.postId
                        // })
                    }
                )
            }

        } else {
            await PostLike.updateOne({
                post: req.body.postId
            }, {
                $pull: {
                    users_likes: {
                        author: req.user.id
                    }
                },
            });
            await User.findByIdAndUpdate(req.user.id, {
                $pull: {
                    postLikes: {
                        post: req.body.postId
                    }
                }
            }, { new: true });
        }

        res.status(200).json({
            status: 'success',
            postId: req.body.postId
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getPostLikes = async (req, res, next) => {
    try {
        const postLikes = await PostLike.find({
            post: req.params.postId
        }).populate('users_likes.author');

        if (!postLikes) {
            res.status(404).json({
                status: 'fail',
                message: 'Không có post like'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: postLikes
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getPostByUser = async (req, res, next) => {
    try {
        var posts = await Post.find({
            author: mongoose.Types.ObjectId(req.params.userId)
        }).populate('author').populate('restaurant').sort({ createdAt: -1 })

        if (!posts) {
            res.status(404).json({
                status: 'fail',
                message: 'Không có post'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: posts
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}


// exports.getPostUserFollow = async (req, res, next) => {
//     try {
//         //get all restaurant follow
//         var restaurantList = [];
//         await restaurantFollow.find({
//             'follow.user': req.user.id
//         }).then((response => {
//             response.forEach(ele => {
//                 restaurantList.push(ele.restaurant.toString())
//             })
//         }))
//         // restaurantList.push(req.user.id);
//         //get all user follow
//         await Following.findOne({ user: mongoose.Types.ObjectId(req.user.id) }).select("following.user").then(
//             async response => {
//                 var friendList = [];
//                 response.following.forEach(element => {
//                     friendList.push(element.user.toString())
//                 });
//                 friendList.push(req.user.id);
//                 var share = await Post.find({
//                     $and: [
//                         {
//                             "restaurant": { $exists: false }
//                         },
//                         {
//                             author: { $in: friendList }
//                         }
//                     ]
//                 }).populate('author');
//                 var review = await Review.find({
//                     $or: [
//                         { author: { $in: friendList } },
//                         {
//                             $and: [
//                                 {
//                                     "restaurant": { $exists: true }
//                                 },
//                                 {
//                                     restaurant: { $in: restaurantList }
//                                 }
//                             ]
//                         }
//                     ],
//                 }).populate('author').populate('restaurant');

//                 var response = review.concat(share);
//                 var result=response.sort(function(a, b) {
//                     var dateA = new Date(a.createdAt), dateB = new Date(b.createdAt);
//                     return dateB - dateA;
//                 })
//                 res.status(200).json({
//                     status: 'success',
//                     data: {
//                         data: result
//                     }
//                 });
//             }
//         );

//     } catch (error) {
//         res.status(404).json({
//             status: 'fail',
//             message: error
//         });
//     }

// }

exports.getPostRandom = async (req, res, next) => {
    try {

    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }

}

exports.getPostUserFollow = async (req, res, next) => {
    try {
        //get all restaurant follow
        var restaurantList = [];
        await restaurantFollow.find({
            'follow.user': req.user.id
        }).then((response => {
            response.forEach(ele => {
                restaurantList.push(ele.restaurant)
            })
        }))
        await Following.findOne({ user: mongoose.Types.ObjectId(req.user.id) }).select("following.user").then(
            async response => {
                var friendList = [];
                response.following.forEach(element => {
                    friendList.push(element.user.toString())
                });
                friendList.push(req.user.id);
                var post=await Post.find({
                    $or: [
                        { author: { $in: friendList } },
                        { restaurant: { $exists: true, $in: restaurantList} }
                    ]
                }).populate('author').populate({path: 'restaurant',match:{isAcive: true}})
                .sort({ createdAt: -1 }).skip(parseInt(req.params.page)).limit(10)
                var temp=[]
                if (post.length == 0) {
                    temp= await Post.find({})
                    .populate('author')
                    .populate({path: 'restaurant',match:{isAcive: true}})
                    .skip(Math.random() * Post.count()).limit(15)
                    .sort({ createdAt: -1 });
                }
                var result=post.concat(temp)
                res.status(200).json({
                    status: 'success',
                    data: {
                        data: result
                    }
                });
            }
        );

    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }

}

