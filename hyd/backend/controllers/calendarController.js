import CalendarEvent from '../models/CalendarEvent.js';

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, createdBy } = req.body;
    const newEvent = new CalendarEvent({ title, description, date, createdBy });
    await newEvent.save();
    res.status(201).json({ message: 'Event created' });
  } catch (error) {
    res.status(500).json({ message: 'Event creation failed', error });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await CalendarEvent.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch events', error });
  }
};
