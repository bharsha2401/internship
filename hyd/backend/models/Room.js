// server/models/Room.js
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  }
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
