import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' }, // Markdown content
  category: { type: String, default: 'General', trim: true },
  folder: { type: String, default: 'Root', trim: true },
  tags: [{ type: String, trim: true }],
  isPinned: { type: Boolean, default: false },
  color: { type: String, default: '' },
}, { timestamps: true });

noteSchema.index({ user: 1, category: 1 });
noteSchema.index({ user: 1, title: 'text', content: 'text' });

export default mongoose.model('Note', noteSchema);
