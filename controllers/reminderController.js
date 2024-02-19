// controllers/reminderController.js

import Reminder from '../models/reminder.js';

// Create a new reminder
const createReminder = async (req, res) => {
  try {
    const reminderData = req.body;
    req.body.userId = req.user.userId;
    const newReminder = await Reminder.create(reminderData);
    res.status(201).json(newReminder);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get reminders for a specific user
const getRemindersByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const reminders = await Reminder.find({ userId });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { createReminder, getRemindersByUser };
