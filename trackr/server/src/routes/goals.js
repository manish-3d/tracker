import express from 'express';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ isCompleted: 1, createdAt: -1 });
    res.json({ success: true, goals });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, goal });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!goal) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, goal });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
