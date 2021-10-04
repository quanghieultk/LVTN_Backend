const Food = require('./../models/foodModel');

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
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    },
    limits: {
        fileSize: 10485760 //10 MB
    }
}).single("photo");

exports.upload = async(req, res, next) => {
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

        cloudinary.uploader.upload(req.file.path, function(result) {
            req.body.photo = result.secure_url;
            next();
        });
    });
}

exports.createFood = async (req, res, next) => {
    try {
        const food = await Food.create({
            author: req.user.id,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            photo: req.body.photo
        });

        res.status(201).json({
            status: 'success',
            data: {
                data: food
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.updateFood = async (req, res, next) => {
    try {
        const food = await Food.findByIdAndUpdate(req.params.id, {
            author: req.user.id,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            photo: req.body.photo
        }, {
            new: true,
            runValidators: true
        });

        if (!food) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có food'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: food
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.deleteFood = async (req, res, next) => {
    try {
        const food = await Food.findByIdAndDelete(req.params.id);

        if (!food) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có food'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: food
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}
exports.getAllFoods = async (req, res, next) => {
    try {
        let foods = await Food.find().populate({ path: 'author' });

        if (!foods) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có foods'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: foods
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getFood = async (req, res, next) => {
    try {
        let food = await Food.findById(req.params.id).populate({ path: 'author' });

        if (!food) {
            return res.status(404).json({
                status: 'fail',
                message: 'Không có food'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: food
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}