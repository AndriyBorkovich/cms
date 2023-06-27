import { Schema as _Schema, model } from 'mongoose';

// Define the schema
const Schema = _Schema;
const chatUserSchema = new Schema({
    username: String,
});

// Create a model from the schema
export default model('User', chatUserSchema);