const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const postSchema = mongoose.Schema({
    type: {
        type: Boolean,
        default: 0
    },
    description: {
        type: String,
        trim: true,
        default: "",
        es_indexed: true
    },
    photo: {
        type: Array,
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: "Bạn phải cung cấp tác giả"
    },
    hashtags: {
        type: Array,
        default: []
    },
    location: {
        type: {
            type: String
        },
        coordinates: { type: Array, default: undefined },
        address: {
            type: String
        }
    },
    tags: {
        type: Array,
        default: []
    },
})
postSchema.plugin(mongoosastic)
const Post = mongoose.model('Post', postSchema);
Post.createMapping(
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
module.exports =Post;