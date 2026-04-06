import mongoose from 'mongoose';

const setSchema = new mongoose.Schema({
  setNumber: Number,
  reps: Number,
  weight: Number,
  unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
  completed: { type: Boolean, default: true },
});

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full_body', 'other'],
    default: 'other',
  },
  sets: [setSchema],
  notes: String,
  personalRecord: { type: Boolean, default: false },
});

const gymLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  title: { type: String, default: 'Workout' },
  exercises: [exerciseSchema],
  duration: { type: Number, default: 0 }, // minutes
  caloriesBurned: { type: Number, default: 0 },
  mood: { type: String, enum: ['terrible', 'bad', 'okay', 'good', 'great'], default: 'good' },
  notes: String,
}, { timestamps: true });

gymLogSchema.index({ user: 1, date: -1 });

export default mongoose.model('GymLog', gymLogSchema);
