const mongoose = require('mongoose');
const Notification = require('./../models/notificationModel');

exports.readNotifications = async (req, res, next) => {
    try {
        const respone = await Notification.updateMany({
            _id: {
                $in: req.body.notificationIds
            }
        }, {
            $set: {
                read: true
            }
        }, {
            multi: true
        });
        res.status(200).json({
            status: 'success',
            read: 'notifications'
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getNotifications = async (req, res, next) => {
    try {
        console.log(req.params.page)
        const notifications = await Notification.find({
            receiver:  mongoose.Types.ObjectId(req.user.id)
        }).sort({
            createdAt: -1
        }).skip(parseInt(req.params.page)).limit(10).populate("sender");
        res.status(200).json({
            status: 'success',
            data: {
                data: notifications
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}