const { request } = require("../app");
function idToString(id) {
  return id.toString();
}
exports.sendLikeCommenNotification = (req, values) => {
  const io = req.app.get("socketio");

  if (req.userData.userId !== req.body.authorId) {
    const { profilePicture, username } = values[0];
    const { _id, read, comment, post, type, createdAt } = values[1];
    io.sockets.in(req.body.authorId).emit("newNotification", {
      notification: {
        _id,
        read,
        comment: [{ ...comment }],
        post: [{ ...post }],
        type,
        sender: [
          {
            profilePicture,
            username
          }
        ],
        createdAt
      }
    });
  }
};

exports.sendLikeCommenReplyNotification = (req, values) => {
  const io = req.app.get("socketio");

  console.log(io.sockets)
  if (req.userData.userId !== req.body.authorId) {
    const { profilePicture, username } = values[0];
    const { _id, read, reply, post, type, createdAt } = values[1];
    io.sockets.in(req.body.authorId).emit("newNotification", {
      notification: {
        _id,
        read,
        type,
        sender: [
          {
            profilePicture,
            username
          }
        ],
        reply: [{ ...reply }],
        post: [{ ...post }],
        createdAt
      }
    });
  }
};

exports.sendLikePostNotification = (req, values) => {
  if (req.user.id !== req.body.userId) {
    const io = req.app.get("socketio");
    //create notification on database
    if (req.user.userId !== req.body.authorId) {
      const { _id, read, post, type, createdAt } = values[1];
      io.sockets.to(req.body.authorId).emit("newNotification", {
        notification: {
          _id,
          read,
          post: post,
          type,
          sender: values[0],
          createdAt,
        }
      });
    }
  }

};

exports.sendFollowNotification = (req, values) => {
  const io = req.app.get("socketio");

  if (req.user.id !== req.body.userId) {
    const sender = values[0];
    const { _id, read, type, createdAt } = values[1];
    io.sockets.in(req.body.userId).emit("newNotification", {
      notification: {
        _id,
        read,
        type,
        sender: sender,
        createdAt
      }
    });
  }
};

exports.sendAddCommentReplyNotification = (req, values) => {
  const io = req.app.get("socketio");

  if (req.userData.userId !== req.body.authorId) {
    const { profilePicture, username } = values[0];
    const { _id, read, type, comment, reply, post, createdAt } = values[1];
    io.sockets.in(req.body.authorId).emit("newNotification", {
      notification: {
        _id,
        read,
        sender: [
          {
            profilePicture,
            username
          }
        ],
        post: [{ ...post }],
        comment: [{ ...comment }],
        reply: [{ ...reply }],
        type,
        createdAt
      }
    });
  }
};

exports.sendAddCommentNotification = (req, values) => {
  const io = req.app.get("socketio");
  if (req.user.id !== req.body.authorId) {
    const {
      _id, read, post, type, comment, createdAt } = values[1];
    let sender = values[0][0];
    io.sockets.in(req.body.authorId).emit("newNotification", {
      notification: {
        _id,
        read,
        sender: sender,
        post: post,
        // comment: [{ ...comment }],
        // reply: [{ ...reply }],
        type,
        createdAt
      }
    });
  }
};

exports.sendCommentTaggedNotification = params => {
  const { req, removedUserid, user, notification } = params;
  const io = req.app.get("socketio");
  const { _id, read, type, createdAt, post } = notification;
  const { profilePicture, username } = user;

  removedUserid.forEach(user => {
    if (idToString(user._id) !== idToString(req.userData.userId)) {
      io.sockets.in(user._id).emit("newNotification", {
        notification: {
          _id,
          read,
          sender: [
            {
              profilePicture,
              username
            }
          ],

          post: [{ ...post }],
          type,
          createdAt
        }
      });
    }
  });
};

exports.sendCommentMentionNotification = params => {
  const { req, removedUserid, user, notification } = params;
  const io = req.app.get("socketio");

  const { _id, read, type, createdAt, post } = notification;
  const { profilePicture, username } = user;

  removedUserid.forEach(user => {
    if (idToString(user._id) !== idToString(req.userData.userId)) {
      io.sockets.in(user._id).emit("newNotification", {
        notification: {
          _id,
          read,
          sender: [
            {
              profilePicture,
              username
            }
          ],

          post: [{ ...post }],
          type,
          createdAt
        }
      });
    }
  });
};

exports.sendNewUser = params => {
  const { req, user } = params;
  const io = req.app.get("socketio");

  const { profilePicture, username, _id } = user;
  io.sockets.emit("newUser", {
    username,
    profilePicture,
    _id
  });
};
