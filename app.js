const express = require('express');
const morgan = require('morgan');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
// const socket_io = require('socket.io');
const cors = require('cors');
const path = require('path')
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const commentRouter = require('./routes/commentRoutes');
const commentReplyRouter = require('./routes/commentReplyRoutes');
const chatRouter = require('./routes/chatRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const foodRoutes = require('./routes/foodRoutes');
const restaurantRouter = require('./routes/restaurantRoute');
const reviewRouter = require('./routes/reviewRoutes');
const searchRouter = require('./routes/search');
const bookingController = require('./controllers/bookingController');
var cron = require('node-cron');
const User = require('./models/userModel');
const Restaurant = require('./models/restaurantModel');
const fs = require('fs');
const json2csv = require('json2csv').parse;
const { spawn } = require('child_process');
const utf8 = require('utf8');
function runScript(params) {
    if (params) {
        return spawn('python', [
            "-u",
            path.join(__dirname, 'recommend.py'), params
        ]);
    } else {
        return spawn('python', [
            "-u",
            path.join(__dirname, 'recommend.py'),params
        ]);
    }
}

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Library API",
            version: "1.0.0",
            description: "Social Network",
        },
        servers: [{
            url: "http://localhost:8000",
        },],
    },
    apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);
// const io = socket_io();

const app = express();

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

// app.io = io;

// app.set("socketio", io);

// io.use(async(socket, next) => {
//     if (socket.handshake.query && socket.handshake.query.token) {
//         const token = socket.handshake.query.token.split(" ")[1];
//         const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
//         const currentUser = await User.findById(decoded.id);
//         socket.user = currentUser;
//         next();
//     } else {
//         next(new Error("Authentication error"));
//     }
// })
// io.on('connection', socket => {
//     // socket.join(socket.user.id);
//     socket.on("Client-sent-data", data=>console.log(data))
// });

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

app.use(cors());


// 2) ROUTES
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/commentReplies', commentReplyRouter);
app.use('/api/chats', chatRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/foods', foodRoutes);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/review', reviewRouter);
app.use('/api/search', searchRouter);
app.get('/', bookingController.createBookingCheckout);


global.csv=null
global.instance=null

cron.schedule('* * * * *',async () => {
            let restaurantList = await Restaurant.find({isAcive: true}).populate('genres').exec(
            (err, results) => {
                if (err) {
                    console.log(err)
                }
                if(results.length){
                    csv = json2csv(JSON.parse(JSON.stringify(results)))
                    const subprocess = runScript(csv)
                    subprocess.stdout.on('data', (data) => {
                        instance=utf8.encode(`${data}`)
                    });
                    subprocess.stderr.on('data', (data) => {
                        console.log(`error:${data}`);
                    });
                    subprocess.stderr.on('close', () => {
                        console.log("Closed");
                    });
                }
                
                
            }

        )
  });



module.exports = app;

