const dotenv = require('dotenv');
const { promisify } = require('util');
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');
const DB = process.env.DATABASE_LOCAL;
mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    .then(() => console.log('DB connection successful!'));

const User = require('./models/userModel');
const userController = require("./controllers/userController");
const port = process.env.PORT || 8000;

var socket = require('socket.io')
var server = app.listen(port, function () {
    console.log('listening for requests on port ' + port);
})

let io = socket(server, {
    cors: {
        origin: "*"
    }
})
io.use(async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
        const token = socket.handshake.query.token;
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);
        socket.user = currentUser;
        next();
    } else {
        next(new Error("Authentication error"));
    }
}).on('connection', socket => {
    if(socket.user){
        socket.join(socket.user.id);
        let userOnline = socket.client.conn.server.clientsCount;
        // console.log(socket.client);
        userController.changeStatus(socket.user.id, userOnline, io,true);
        // socket.on("dis", () => {
        //     console.log('dis')
        //     let userOnline = socket.client.conn.server.clientsCount;
        //     userController.changeStatus(socket.user.id, userOnline, io);
        //     socket.leave(socket.user.id);
        // });
        socket.on("disconnect", () => {
            //check all connect
            
            let userOnline = socket.client.conn.server.clientsCount;
            userController.changeStatus(socket.user.id, userOnline, io, false);
            socket.leave(socket.user.id);
        });
    }
        
})
app.set("socketio", io);



