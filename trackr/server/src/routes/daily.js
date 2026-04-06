import express from 'express';
import DailyLog from '../models/DailyLog.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { format, subDays } from 'date-fns';

const router = express.Router();
router.use(protect);

const today = () => new Date().toISOString().split('T')[0];
const dayStr = (d) => d.toISOString().split('T')[0];

router.get('/', async (req, res) => {
  try {
    const { limit = 30 } = req.query;
    const logs = await DailyLog.find({ user: req.user._id }).sort({ date: -1 }).limit(+limit);
    res.json({ success: true, logs });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/today', async (req, res) => {
  try {
    const log = await DailyLog.findOne({ user: req.user._id, date: today() });
    res.json({ success: true, log });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/streak', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Recalculate streak
    let streak = 0;
    let d = new Date();
    while (true) {
      const dateStr = dayStr(d);
      const log = await DailyLog.findOne({ user: req.user._id, date: dateStr, $or: [{ studied: true }, { workedOut: true }, { addedNotes: true }] });
      if (!log) break;
      streak++;
      d = subDays(d, 1);
    }
    // Update user streak
    if (streak !== user.streak) {
      user.streak = streak;
      if (streak > user.longestStreak) user.longestStreak = streak;
      await user.save();
    }
    res.json({ success: true, streak, longestStreak: user.longestStreak });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const date = req.body.date || today();
    const log = await DailyLog.findOneAndUpdate(
      { user: req.user._id, date },
      { ...req.body, user: req.user._id, date },
      { upsert: true, new: true }
    );
    res.json({ success: true, log });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
