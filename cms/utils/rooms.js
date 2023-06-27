import User from './userModel.mjs'
export async function getRooms() {
  try {
    const rooms =  await User.distinct('room').exec();
    return rooms;
  }
  catch (error) {
    throw new Error('Failed to retrieve rooms: ' + error.message);
  }
}
