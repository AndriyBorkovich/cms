import { createServer } from 'http';
import express from 'express';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// creating server
const app = express();
app.use(express.static(__dirname));
const server = createServer(app);
import { Server } from "socket.io";
const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
     }
});

//imports
import bodyParser from 'body-parser';
import Chat from './utils/chatModel.mjs';   
import  {formatMessage, getChatHistory, saveMessage}  from './utils/messages.mjs';
import { userJoin, getCurrentUser, userLeave, getRoomUsers, checkUserNameExists } from './utils/users.mjs';
import {getRooms} from './utils/rooms.js';
import User from './utils/userModel.mjs';

const botName = 'Admin';

// WHEN CONNECTION
io.sockets.on('connection', function (socket) {
  
  // adding user to other group
  socket.on('joinGroup', (groupId) => {
    console.log(`User joined the room ${groupId}`);
    socket.join(groupId);
  });
  
  // get messages from client side
  socket.on('chatMessage', (message) => {
      // receiving new messages
      console.log('New message:', message);
  
      // creating message object
      const newMessage = {
          groupName: message.groupName,
          sender: message.sender,
          message: message.message,
          sendAt: message.sendAt,
      };
  
      // find correct chat by id
      Chat.findOneAndUpdate(
        { chatName: message.groupName },
        { $push: { messages: newMessage } },
        { new: true })
        .then((updatedChat) => {
          if (updatedChat) {
            // Sending message to all chat members
            console.log(`Sending message to other users in ${updatedChat.chatName} chat ...`);
            socket.to(updatedChat.chatName).emit('message', newMessage);
            console.log("Sent");
          } else {
            console.log("Chat not found");
          }
        })
        .catch((err) => {
          console.error("Error:", err);
        });
  });

  // leave chat
  socket.on('disconnect', function(data) {
    console.log("User disconnected from chat");
  });
});


// REGISTRATION
app.post('/signUp', bodyParser.json() ,async (req, res) => {
  const newUser = req.body.user;
  console.log(newUser);
  const usernameToCheck = newUser.username;
  let exists = await checkUserNameExists(usernameToCheck);
  if(exists) {
    res.status(400).send({message: 'User already exists'});
  } else {
    // adding user to db
    userJoin(newUser);
    res.send(newUser);
  }
});

// LOGIN
app.post('/logIn', bodyParser.json() ,async (req, res) => {
  const newUser = req.body.user;
  const usernameToCheck = newUser.username; 
  
  // check if user already exists
  let exists = await checkUserNameExists(usernameToCheck);
  if(!exists) {
    return res.status(401).send({message:'Incorrect login'});
  } else {
    res.send(newUser);
  }
});

// GET ALL DATA ABOUT ALL CHATS
app.get('/getAllData', function(req, res) {

  Chat.find({})
      .then(chats => {
        res.send(chats);
      })
      .catch(error => {
          console.error(error);
          res.status(500).send('Server error');
      });
});

// ADDING NEW USERS TO CHAT
app.post('/addNewUsers', bodyParser.json(), function(req, res) {
  console.log(req.body);
  const chatName = req.body.chatName;
  const usersToAdd = req.body.members;

  // find desired chat and add new users to it
  Chat.findOneAndUpdate(
    { chatName: chatName },
    { $push: { members: { $each: usersToAdd } }, $inc: { __v: 1 } },
    { new: true }
  )
    .then(updatedChat => {
      if (!updatedChat) {
        return res.status(404).send({message:'Chat not found'});
      }
  
      console.log('Adding new users...');
      res.send({message: 'Members added successfully'});
    })
    .catch(err => {
      if (err.name === 'VersionError') {
        return res.status(409).send({message:'Conflict: Document has been modified'});
      }
  
      console.log(err);
      res.status(500).send({message:'Internal Server Error'});
    });
});

// GET ALL USERS FROM ALL GROUPS
app.get('/loadAnotherUsers', function(req, res) {
  User.find({})
    .then(users => {
      res.send(users);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send({message:'Server error'});
    });
});

// CREATING CHAT
app.post('/createChat', bodyParser.json(), function(req, res) {
  const chatData = req.body;
  console.log(chatData);
  // checking if there is a chat with chosen name
  Chat.findOne({ chatName: chatData.chatName })
    .then(existingChat => {
      if (existingChat) {
        res.status(400).send({message:'Chat with this name already exists!'});
      } else {
        const chat = new Chat(chatData);
        chat.save()
          .then(() => {
            console.log("New chat created");
            res.send(chat);
          })
          .catch(err => {
            console.log(err);
            res.status(500).send({message:'Internal Server Error'});
          });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({message:'Internal Server Error'});
    });
});

// SWITCH CHAT
app.post('/changeChat', bodyParser.json(),function(req, res) {
  console.log(req.body);
  const nameToFind  = req.body.chatName;
  Chat.findOne({ chatName: nameToFind })
      .then(chat => {
          if (chat) {
              console.log(`Switched chat to ${chat.chatName}`);
              res.send(chat);
          } else {
              res.status(404).send({message:'Chat not found'});
          }
      })
      .catch(error => {
          console.error(error);
          res.status(500).send({message:'Internal server error'});
      }
  );
});

// LEAVE FROM CHAT
app.post('/leaveChat', bodyParser.json(), function(req, res) {
  console.log(req.body);
  const chatToLeave = req.body.chatName;
  const userToLeave = req.body.username;

  Chat.findOne({ chatName: chatToLeave })
      .then(chat => {
          if (!chat) {
              return res.status(404).send({message:'Chat not found'});
          }

          // find user by index
          const memberIndex = chat.members.findIndex(member => member.username === userToLeave);

          if (memberIndex === -1) {
              return res.status(404).send({message:'User not found in the chat'});
          }

          // perform deleting
          chat.members.splice(memberIndex, 1);
          
          // save changes
          return chat.save();
      })
      .then(savedChat => {
          res.send({message:'User left the chat successfully'});
      })
      .catch(err => {
          console.error(err);
          res.status(500).send('Internal Server Error');
      });
});

// DELETE CHAT
app.post('/deleteChat',bodyParser.json(), function(req, res) {
  const chatNameToDelete = req.body.chatName;

  Chat.deleteOne({ chatName: chatNameToDelete })
      .then(result => {
          if (result.deletedCount === 0) {
              return res.status(404).send({message:'Chat not found'});
          }
          res.send({message:'Chat deleted successfully'});
      })
      .catch(err => {
          console.log(err);
          res.status(500).send({message:'Internal Server Error'});
      });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});