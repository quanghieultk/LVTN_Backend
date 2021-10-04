const express = require('express');

const authController = require('./../controllers/authController');
const chatController = require('./../controllers/chatController');

const router = express.Router();

router.post('/sendMessage',
    authController.protect,
    chatController.checkRoom,
    chatController.sendMessage
);

router.post('/readMessage',
    authController.protect,
    chatController.checkRoom,
    chatController.readMessage
)

router.post('/getMessagesForRoom',
    authController.protect,
    chatController.checkRoom,
    chatController.getMessagesForRoom
);


router.post("/getChatRooms/", authController.protect, chatController.getChatRooms);
module.exports = router;