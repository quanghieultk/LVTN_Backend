const axios = require('axios');
const User = require('../models/userModel');
// fetch.Promise = Bluebird;
const Post = require('../models/postModel');
const Restaurant = require('../models/restaurantModel');
exports.searchRestaurant = async (req, res, next) => {
    try {
        await axios.post('http://localhost:9200/restaurants/_search?pretty', {
            "query": {
                "match": {
                    "restaurantname": {
                        "query": req.body.searchKey,
                        "fuzziness": 6
                    }
                }
            }
        }).then(
            // response => res.status(201).json({
            //     status: 'success',
            //     data: {
            //         response: response.data.hits.hits
            //     }
            // })
            async response => {
                if (!response || !response.data.hits.hits || !response.data.hits.hits.total <= 0) {
                    res.status(201).json({
                        status: 'success',
                        data: {
                            response: []
                        }
                    })
                    return;
                }
                let restaurantList = response.data.hits.hits.map(r => r['_id']);
                let data = await Restaurant.find({
                    _id: {
                        $in: restaurantList
                    }
                }).limit(10);
                res.status(201).json({
                    status: 'success',
                    data: {
                        response: data
                    }
                })
            }
        )
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }
}

exports.SearchUser = async (req, res, next) => {
    try {
        await axios.post('http://localhost:9200/users/_search?pretty', {
            "query": {
                // "match": {
                //     "lastname": {
                //         "query": req.query.description,
                //         "fuzziness": 6
                //     },
                //     "firstname": {
                //         "query": req.query.description,
                //         "fuzziness": 6
                //     }
                // }
                "multi_match": {

                    "fields": ["lastname", "firstname"],
                    "query": req.query.description,
                    "fuzziness": "AUTO"
                }
            }
        }).then(
            // response => res.status(201).json({
            //     status: 'success',
            //     data: {
            //         response: response.data.hits.hits
            //     }
            // })
            async response => {
                if (!response || !response.data.hits.hits || !response.data.hits.hits.total <= 0) {
                    res.status(201).json({
                        status: 'success',
                        data: {
                            response: []
                        }
                    })
                    return;
                }
                let userList = response.data.hits.hits.map(r => r['_id']);
                let data = await User.find({
                    _id: {
                        $in: userList
                    }
                }).limit(10);
                res.status(201).json({
                    status: 'success',
                    data: {
                        response: data
                    }
                })
            }
        )
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }
}

exports.SearchPost = async (req, res, next) => {
    try {
        await axios.post('http://localhost:9200/posts/_search?pretty', {
            "query": {
                "match": {
                    "description": {
                        "query": req.query.description,
                        "fuzziness": 6
                    }
                }
            }
        }).then(
            async response => {
                if (!response || !response.data.hits.hits || !response.data.hits.hits.total <= 0) {
                    res.status(201).json({
                        status: 'success',
                        data: {
                            response: []
                        }
                    })
                    return;
                }
                let postList = response.data.hits.hits.map(r => r['_id']);
                let data = await Post.find({
                    _id: {
                        $in: postList
                    }
                }).populate('author').populate('restaurant').limit(10);
                res.status(201).json({
                    status: 'success',
                    data: {
                        response: data
                    }
                })
            }
        )
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }
}