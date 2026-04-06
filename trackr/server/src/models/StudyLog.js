import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  name: String,
  subtopics: [String],
  questionssolved: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 }, // minutes
});

const studyLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  subject: { type: String, required: true }, // e.g. "DSA", "System Design"
  topics: [topicSchema],
  totalQuestions: { type: Number, default: 0 },
  totalTime: { type: Number, default: 0 }, // minutes
  notes: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
}, { timestamps: true });

studyLogSchema.index({ user: 1, date: -1 });

export default mongoose.model('StudyLog', studyLogSchema);
