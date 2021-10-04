const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const mongoosastic = require('mongoosastic');
const restaurantSchema = new mongoose.Schema({
    restaurantname: {
        type: String,
        required: [true, 'Vui lòng nhập tên nhà hàng'],
        es_indexed: true,
        // es_type: "text"
    },
    address: {
        type: String,
        required: [true, 'Vui lòng nhập địa chỉ']
    },
    location: {
        lat: {
            type: Number,
            required: [true, 'Vui lòng nhập vị trí']
        },
        long: {
            type: Number,
            required: [true, 'Vui lòng nhập vị trí']
        }
    },
    phone: {
        type: Number,
        // required: [true, 'Vui lòng nhập số điện thoại'],
    },
    email: {
        type: String,
        // required: [true, 'Vui lòng nhập email'],
        // unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Vui lòng nhập đúng định dạng email']
    },
    description: {
        type: String
    },
    isAcive: {
        type: Boolean,
        default: false,
        es_indexed: true,
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
    rating: {
        type: Number,
        default: 0
    },
    numberOfReview:{
        type: Number,
        default: 0
    },
    genres:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurantGenres",
        es_indexed: true
    }]
});

restaurantSchema.plugin(mongoosastic)

const Restaurant = mongoose.model('restaurant', restaurantSchema);
Restaurant.createMapping(
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

module.exports = Restaurant;