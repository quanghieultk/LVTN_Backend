const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const mongoosastic = require('mongoosastic');
const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Vui lòng nhập tên'],
        es_indexed: true
    },
    lastname: {
        type: String,
        required: [true, 'Vui lòng nhập họ'],
        es_indexed: true
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Vui lòng nhập đúng định dạng email'],
        es_indexed: true
    },
    photo: {
        type: String
    },
    background: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Vui lòng xác nhận mật khẩu'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Mật khẩu xác thực không chính xác'
        }
    },
    active: {
        type: Boolean,
        default: true
    },
    address: {
        type: String,
        es_indexed: true
    },
    birthday: {
        type: Date
    },
    phoneNumber: {
        type: Number
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    postLikes: [{
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    }],
    commentLikes: [{
        comment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    }],
    commentReplyLikes: [{
        commentReply: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CommentReply'
        }
    }],
    interests:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurantGenres",
    }]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual('followings', {
    ref: 'Following',
    foreignField: 'user',
    localField: '_id',
    justOne: true
});

userSchema.virtual('followers', {
    ref: 'Follower',
    foreignField: 'user',
    localField: '_id',
    justOne: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};
userSchema.plugin(mongoosastic)
const User = mongoose.model('User', userSchema);

User.createMapping(
    {
    "settings": {
        "analysis": {
            "filter": {},
            "analyzer": {
                "edge_ngram_analyzer": {
                    "filter": [
                        "lowercase",
                        "icu_folding"
                    ],
                    "tokenizer": "edge_ngram_tokenizer"
                },
                "edge_ngram_search_analyzer": {
                    "tokenizer": "lowercase"
                }
            },
            "tokenizer": {
                "edge_ngram_tokenizer": {
                    "type": "edge_ngram",
                    "min_gram": 1,
                    "max_gram": 10,
                    "token_chars": [
                        "letter"
                    ]
                }
            }
        }

    },
    "mappings": {
        "properties": {
            "restaurantname": {
                "type": "text",
                "analyzer": "edge_ngram_analyzer",
                "search_analyzer": "edge_ngram_search_analyzer"
            }
        }

    }
},
    (err, mapping) => {
        if (err) {
            console.log('error creating mapping (you can safely ignore this)');
            console.log(err);
        } else {
            console.log('mapping created!');
            console.log(mapping);
        }
    })
module.exports = User;