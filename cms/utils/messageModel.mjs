import { Schema, model } from 'mongoose';
import moment from 'moment';
// Define the Message schema
const messageSchema = new Schema({
  room: {
    type: String,
  },
  user: {
    type: String,
  },
  message: {
    type: String,
  },
  createdAt: {
    type: String,
    default: moment().format('h:mm a')
  }
});

// Create the Message model
const Message = model('Message', messageSchema);

export default Message;