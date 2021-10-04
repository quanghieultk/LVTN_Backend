const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('./../models/userModel');
const Following = require('./../models/followingModel');
const Follower = require('./../models/followerModel');
const Email = require('./../utils/email');
const crypto = require('crypto');

exports.signup = async (req, res) => {
    try {
        if (req.body.role == "admin") {
            if (req.body.key !== "RSAKEY") {
                res.status(404).json({
                    status: 'fail',
                    message: "bạn không có quyền truy cập"
                });
                return;
            }
        }
        const user = await User.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            role: req.body.role,
            birthday: req.body.birthday,
            address: req.body.address,
            phoneNumber: req.body.phoneNumber,
            active: false,
            interests: req.body.interests ? req.body.interests : []
        });

        await Follower.create({
            user: user._id
        });

        await Following.create({
            user: user._id
        });

        const url = `${req.protocol}://${req.get('host')}/me`;
        await new Email(user, url).sendWelcome();

        res.status(201).json({
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

exports.activeUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id,{
            active: true
        });
        res.redirect('http://localhost:3000/signIn');
    } catch (error) {
        res.status(404).json({
            status: 'failed'
        })
    }
    
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: 'fail',
            message: 'Vui lòng nhập email và password'
        });
    }

    const user = await User.findOne({ email: email,active: true }).select('+password')
        .populate({ path: 'followings' })
        .populate({ path: 'followers' })
        .populate("interests");

    if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(401).json({
            status: 'fail',
            message: 'Email hoặc mật khẩu không đúng'
        });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.cookie('jwt', token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    });

    user.password = undefined;

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            status: 'fail',
            message: 'Bạn chưa đăng nhập, vui lòng đăng nhập để truy cập'
        });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id)
        .populate({ path: 'followings' })
        .populate({ path: 'followers' });

    if (!currentUser) {
        return res.status(401).json({
            status: 'fail',
            message: 'Người dùng thuộc về token này không tồn tại'
        });
    }

    req.user = currentUser;
    next();
}

exports.updatePassword = async (req, res) => {
    const { currentPassword, password, passwordConfirm } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(currentPassword, user.password))) {
        return res.status(401).json({
            status: 'fail',
            message: 'Mật khẩu không đúng'
        });
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;

    await user.save();

    user.password = undefined;

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
}

exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Người dùng thuộc về token này không tồn tại'
            });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        try {
            const resetURL = `http://localhost:3000/resetPassword/${resetToken}`;
            await new Email(user, resetURL).sendPasswordReset();

            res.status(200).json({
                status: 'success',
                message: 'Token sent to email!'
            });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            res.status(404).json({
                status: 'fail',
                message: err
            });
        }
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }

};

exports.resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Người dùng thuộc về token này không tồn tại'
            });
        }
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        res.cookie('jwt', token, {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
            httpOnly: true
        });

        user.password = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }

};
