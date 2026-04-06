import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD string for easy lookup
  studied: { type: Boolean, default: false },
  workedOut: { type: Boolean, default: false },
  addedNotes: { type: Boolean, default: false },
  studyMinutes: { type: Number, default: 0 },
  questionsolved: { type: Number, default: 0 },
  gymDuration: { type: Number, default: 0 },
  mood: { type: String, enum: ['great', 'good', 'okay', 'bad', 'terrible'], default: 'okay' },
  highlight: { type: String, default: '' }, // One-liner for the day
  gratitude: { type: String, default: '' },
}, { timestamps: true });

dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyLog', dailyLogSchema);
