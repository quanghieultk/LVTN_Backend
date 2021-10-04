const ChatRoom = require('../models/chatRoomModel');
const Follower = require('../models/followerModel');
const Following = require('../models/followingModel');
const User = require('./../models/userModel');
const Notification = require('./../models/notificationModel');
const RestaurantFollow = require('./../models/useFollowRestaurantModel');
const Followers = require('./../models/followerModel');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary');
const Restaurant = require('../models/restaurantModel');
const restaurantFollow = require('./../models/useFollowRestaurantModel');
const notificationHandler = require("../handler/notificationHandler");
const Post = require('../models/postModel');
const restaurantGenres = require('../models/restaurantGenresModel');
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
}).single("photo");

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

        if (!req.file) {
            return res.status(400).json({
                message: "Vui lòng tải file"
            });
        }

        next();
    });
}

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .populate({ path: 'followings' })
            .populate({ path: 'followers' });

        if (!users) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có users'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: users
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getUser = async (req, res, next) => {
    try {
        let user = await User.findOne({ _id: req.params.id})
            .populate({ path: 'followings' })
            .populate({ path: 'followers' })
            .populate("interests")
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có user'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: user
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}
exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('interests');

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có user'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: user
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có user'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: user
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.followUser = async (req, res, next) => {
    try {
        const io = req.app.get("socketio");

        const room = await ChatRoom.find({
            members: {
                $all: [req.user.id, req.body.userId]
            }
        });

        if (room.length === 0) {
            const chatRoom = await ChatRoom.create({
                members: [req.user.id, req.body.userId]
            });

            io.sockets.in(req.body.userId).emit('newRoom', {
                ...chatRoom.toObject(),
                lastMessage: []
            });
        }

        if (req.user.id !== req.body.userId) {
            const following = await Following.updateOne({
                user: req.user.id,
                "following.user": {
                    $ne: req.body.userId
                }
            }, {
                $addToSet: {
                    following: {
                        user: req.body.userId
                    }
                }
            });

            if (following.nModified === 1) {
                await Follower.updateOne({
                    user: req.body.userId
                }, {
                    $push: {
                        followers: {
                            user: req.user.id
                        }
                    }
                });

                const user = await User.findOne({
                    _id: req.user.id
                })

                const notification = await Notification.create({
                    sender: req.user.id,
                    message: "followed you",
                    receiver: req.body.userId,
                    type: "follow"
                });

                Promise.all([user, notification]).then(
                    (values) => {
                        notificationHandler.sendFollowNotification(req, values);
                        // res.status(200).json({
                        //     status: 'success',
                        //     postId: req.body.postId
                        // })
                    }
                )

                res.status(200).json({
                    userId: req.body.userId,
                    action: "followed",
                });
            } else {
                await Following.updateOne(
                    {
                        user: req.user.id
                    },
                    {
                        $pull: {
                            following: {
                                user: req.body.userId
                            }
                        },
                    }
                );

                await Follower.updateOne(
                    {
                        user: req.body.userId,
                    },
                    {
                        $pull: {
                            followers: {
                                user: req.user.id
                            }
                        },
                    }
                );

                res.status(200).json({
                    userId: req.body.userId,
                    action: "unfollowed",
                });
            }
        }
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.changeProfilePicture = async (req, res, next) => {
    try {
        const newUrl = await cloudinaryImageUpload(req.file.path);
        let user = await User.findOneAndUpdate({
            _id: req.user.id
        }, {
            photo: newUrl
        }, {
            new: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: user
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.changeBackgroundPicture = async (req, res, next) => {
    try {
        const newUrl = await cloudinaryImageUpload(req.file.path);
        let user = await User.findOneAndUpdate({
            _id: req.user.id
        }, {
            background: newUrl
        }, {
            new: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: user
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getFollowers = async (req, res, next) => {
    try {
        const userId = req.params.id;
        let friendList = await Follower.find({ user: userId })
            .populate({
                path: 'followers',
                populate: {
                    path: 'user'
                }
            })
        res.status(200).json({
            status: 'success',
            data: {
                friendList: friendList
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}
exports.getFollowings = async (req, res, next) => {
    try {
        const userId = req.params.id;
        let friendList = await Following.find({ user: userId })
            .populate({
                path: 'following',
                populate: {
                    path: 'user'
                }
            })
        res.status(200).json({
            status: 'success',
            data: {
                friendList: friendList
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}


exports.restaurantFollow = async (req, res, next) => {
    try {
        const follow = await RestaurantFollow.updateOne({
            restaurant: req.body.restaurant,
            'follow.user': {
                $ne: req.user.id
            }
        }, {
            $addToSet:
            {
                follow: {
                    user: req.user.id
                }
            }
        })
        if (follow.nModified === 1) {
            res.status(200).json({
                userId: req.user.id,
                action: "followed",
            });

        } else {
            await RestaurantFollow.updateOne(
                {
                    restaurant: req.body.restaurant
                },
                {
                    $pull: {
                        follow: {
                            user: req.user.id
                        }
                    },
                }
            );
            res.status(200).json({
                userId: req.user.id,
                action: "unfollowed",
            });
        }
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}




exports.getRestaurantUserFollow = async (req, res, next) => {
    try {
        const restaurant = await restaurantFollow.find({
            'follow.user': req.user.id
        }).populate('restaurant')
        res.status(200).json({
            restaurant: restaurant
        });
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}


exports.changeStatus = (userId, clients, io, onOff) => {
    if (onOff == true) {
        Followers.find({ user: userId })
            .select("followers")
            .then((user) => {
                user[0].followers.forEach((user) => {
                    io.sockets.in(user.user.toString()).emit("activityStatusUpdate", {
                        active: true,
                        user: userId,
                    });
                });
            })
            .catch((err) => console.log(err.message));

        Following.find({ user: userId })
            .select("following.user")
            .then((user) => {
                //check user empty
                user[0].following.forEach((user) => {
                    io.sockets.in(user.user.toString()).emit("activityStatusUpdate", {
                        active: true,
                        user: userId,
                    });
                });
            })
            .catch((err) => console.log(err.message));

        User.findByIdAndUpdate(
            { _id: userId },
            { active: true },
            { new: true }
        )
            .then(() => { })
            .catch((err) => console.log(err.message));
    } else {
        Followers.find({ user: mongoose.Types.ObjectId(userId) })
            .select("followers.user")
            .then((user) => {
                user[0].followers.forEach((user) => {
                    const toUserId = user.user.toString();
                    io.sockets.in(toUserId).emit("activityStatusUpdate", {
                        active: false,
                        user: userId,
                    });
                });
            })
            .catch((err) => console.log(err.message));

        Following.find({ user: mongoose.Types.ObjectId(userId) })
            .select("following.user")
            .then((user) => {
                user[0].following.forEach((user) => {
                    const toUserId = user.user.toString();
                    io.sockets.in(toUserId).emit("activityStatusUpdate", {
                        active: false,
                        user: userId,
                    });
                });
            })
            .catch((err) => console.log(err.message));

        User.findByIdAndUpdate(
            { _id: userId },
            { active: false },
            { new: true }
        )
            .then(() => { })
            .catch((err) => console.log(err.message));
    }
};

exports.getImageOfUser = async (req, res, next) => {
    try {
        const img = await Post.find({
            'author': req.params.userId
        }).select('photo');
        res.status(200).json({
            restaurant: img
        });
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getInteresting= async (req, res, next)=>{
    try{
        const gen = await restaurantGenres.find({});
        res.status(200).json({
            interesting: gen
        });
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}


