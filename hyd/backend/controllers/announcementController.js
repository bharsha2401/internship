import Announcement from '../models/Announcement.js';

// Create new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, createdBy } = req.body;
    const newAnnouncement = new Announcement({ title, message, createdBy });
    await newAnnouncement.save();
    res.status(201).json({ message: 'Announcement created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create announcement', error });
  }
};

// Get all announcements (for Admin, Super Admin)
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).populate('createdBy', 'name role');
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements', error });
  }
};

// Get announcements for Employees
export const getEmployeeAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 }).select('title message createdAt');
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements', error });
  }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message } = req.body;
    const updated = await Announcement.findByIdAndUpdate(id, { title, message }, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update announcement' });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await Announcement.findByIdAndDelete(id);
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete announcement' });
  }
};
