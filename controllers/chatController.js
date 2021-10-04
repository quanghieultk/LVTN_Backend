const mongoose = require("mongoose");

const Message = require('./../models/messageModel');
const ChatRoom = require('./../models/chatRoomModel');
const User = require('./../models/userModel');

const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary');

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
}).single("file");

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

        cloudinary.uploader.upload(req.file.path, function (result) {
            req.body.photo = result.secure_url;
            next();
        });
    });
}
exports.getChatRooms = (req, res) => {
    ChatRoom.find(
        {
            members: { $in: [req.user.id] }
        }
    ).populate("members")
        .populate("lastMessage")
        .then((rooms) => {
            res.status(200).json({ rooms });
        })
        .catch(err => {
            console.log(err.message);
            res.status(500).json({ message: err.message });
        });
};

exports.checkRoom = async (req, res, next) => {
    try {
        const rooms = await ChatRoom.find({
            members: {
                $in: mongoose.Types.ObjectId(req.user.id)
            },
            _id: mongoose.Types.ObjectId(req.body.roomId)
        });
        if (!rooms.length) {
            res.status(404).json({
                status: 'fail',
                message: 'Phòng không tồn tại'
            })
            return;
        }else{
            req.room = rooms[0];
        }
        next();
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.sendMessage = async (req, res, next) => {
    try {
        const io = req.app.get("socketio");
        const message = await Message.create({
            roomId: req.body.roomId,
            sender: req.user.id,
            text: req.body.text,
            receiver: req.body.receiver._id,
            messageType: "text"
        });
        await ChatRoom.findByIdAndUpdate({
            _id: req.body.roomId
        }, {
            $set: {
                lastMessage: message._id,
            },
            $inc: {
                messages: 1
            }
        });
        io.sockets.in(req.body.receiver._id).emit("newMessage", {
            ...message.toObject()
        });

        res.status(200).json({
            status: 'success',
            data: {
                data: message
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.readMessage = async (req, res, next) => {
    try {
        const io = req.app.get("socketio");

        const receiverId = req.room.members.filter(
            member => member.toString().trim() !== req.user.id.toString().trim()
        );

        await Message.updateMany({
            _id: {
                $in: req.body.messageIds,
            },
            receiver: mongoose.Types.ObjectId(req.user.id)
        }, {
            $set: {
                read: true
            }
        });

        io.sockets.in(receiverId[0]).emit("readMessage", {
            messageIds: req.body.messageIds,
            roomId: req.room._id
        });

        res.status(200).json({
            read: "messages"
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getMessagesForRoom = async (req, res, next) => {
    try {
        const messages = await Message.find({
            roomId: req.body.roomId
        })
            .limit(50)
            .sort({
                createdAt: -1
            });

        if (!messages) {
            res.status(404).json({
                status: 'fail',
                message: 'Không có message'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: messages
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.sendImage = async (req, res, next) => {
    try {
        const io = req.app.get("socketio");

        const message = await Message.create({
            roomId: req.body.roomId,
            sender: req.user.id,
            receiver: JSON.parse(req.body.receiver)._id,
            photo: req.body.photo,
            messageType: "image"
        });

        await ChatRoom.findByIdAndUpdate({
            _id: req.body.roomId,
        }, {
            $inc: {
                messages: 1
            }
        });

        io.sockets.in(JSON.parse(req.body.receiver)._id).emit("sendImage", {
            message: message.toObject(),
            receiver: JSON.parse(req.body.receiver)._id
        });

        res.status(200).json({
            status: 'success',
            data: {
                data: message
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}