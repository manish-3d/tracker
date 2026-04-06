import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: {
    type: String,
    enum: ['study_questions', 'study_time', 'gym_days', 'gym_sessions', 'notes_created', 'custom'],
    required: true,
  },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  unit: { type: String, default: '' }, // "questions", "hours", "days", etc.
  deadline: { type: Date },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  color: { type: String, default: '#6366f1' },
  icon: { type: String, default: '🎯' },
}, { timestamps: true });

goalSchema.virtual('percentage').get(function () {
  return Math.min(100, Math.round((this.current / this.target) * 100));
});

goalSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Goal', goalSchema);
