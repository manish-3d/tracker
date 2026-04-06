import express from 'express';
import Note from '../models/Note.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { category, folder, search } = req.query;
    const q = { user: req.user._id };
    if (category) q.category = category;
    if (folder) q.folder = folder;
    if (search) q.$or = [{ title: new RegExp(search, 'i') }, { content: new RegExp(search, 'i') }];
    const notes = await Note.find(q).sort({ isPinned: -1, updatedAt: -1 });
    res.json({ success: true, notes });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/categories', async (req, res) => {
  try {
    const cats = await Note.distinct('category', { user: req.user._id });
    const folders = await Note.distinct('folder', { user: req.user._id });
    res.json({ success: true, categories: cats, folders });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, note });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, note });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!note) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, note });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
