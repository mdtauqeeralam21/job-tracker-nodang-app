import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  jobId: { type: String, required: true },
  message: { type: String, required: true },
  reminderDateTime: { type: Date, required: true },
});

const Reminder = mongoose.model('reminder', reminderSchema);

export default Reminder;
