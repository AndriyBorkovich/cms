// join, leave room
import User from './userModel.mjs';
import pkg from 'mongoose';
const { connect, connection } = pkg;
const url = "mongodb://127.0.0.1:27017/messengerdb"
connect(url, {}).then(result => console.log('db connected')).catch(error => console.log(error));

// join, add to db
export function userJoin(user)
{
    const newUser = new User(user);
    // Save the user document to the "users" collection
    newUser.save().then(() => {
      console.log('User added to the collection in db');
    }).catch(error => {
      console.log('Error adding user:', error);
      connection.close();
    });

    //return { _id: newUser._id, username: newUser.username, room: newUser.room };
}

export async function getCurrentUser(id) {
    try {
      const user = await User.findById(id).exec();
      //return { _id: user._id, username: user.username, room: user.room };
    } catch (error) {
      console.log('Error getting current user:', error);
      return null;
    }
  }

export async function userLeave(id) {
    try {
      const user = await User.findByIdAndRemove(id).exec();
      if (user) {
        return { _id: user._id, username: user.username, room: user.room };
      }

      return null;
    } catch (error) {
      console.log('Error deleting user:', error);
      return null;
    }
  }

export async function getRoomUsers(room) {
    try {
      const usersData = await User.find({ room }).lean().exec();
      const filteredUsers = usersData.filter(user => user.room === room);
      const usersArray = filteredUsers.map(user => ({ username: user.username }));
      
      return usersArray;
    } catch (error) {
      console.log('Error getting room users:', error);
      return [];
    }
  }

  export async function checkUserNameExists(username)
  {
    try {
      const count = await User.countDocuments({ username }).exec();
      return count > 0; // Return true if count is greater than 0, indicating that the username exists
    } catch (error) {
      console.error('Error checking username:', error);
      return false; // Return false in case of an error
    }
  } 

export default {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    checkUserNameExists
};