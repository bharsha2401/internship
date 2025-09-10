// backend/controllers/roomController.js
import Room from '../models/Room.js';

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching rooms', error: err.message });
  }
};

export const addRoom = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Room name is required' });
    }
    const room = new Room({ name: name.trim() });
    await room.save();
    res.status(201).json({ message: 'Room added', room });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Room name must be unique' });
    }
    res.status(500).json({ message: 'Room creation failed', error: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Room deletion failed', error: err.message });
  }
};
