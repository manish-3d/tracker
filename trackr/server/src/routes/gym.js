import express from 'express';
import GymLog from '../models/GymLog.js';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/logs', async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const logs = await GymLog.find({ user: req.user._id }).sort({ date: -1 }).limit(+limit).skip((+page - 1) * +limit);
    const total = await GymLog.countDocuments({ user: req.user._id });
    res.json({ success: true, logs, total });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const uid = req.user._id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const [allTime, monthly, byExercise] = await Promise.all([
      GymLog.aggregate([{ $match: { user: uid } }, { $group: { _id: null, sessions: { $sum: 1 }, totalDuration: { $sum: '$duration' }, totalCalories: { $sum: '$caloriesBurned' } } }]),
      GymLog.find({ user: uid, date: { $gte: thirtyDaysAgo } }).sort({ date: 1 }),
      GymLog.aggregate([
        { $match: { user: uid } },
        { $unwind: '$exercises' },
        { $group: { _id: '$exercises.name', count: { $sum: 1 }, category: { $first: '$exercises.category' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const dailyMap = {};
    monthly.forEach(l => {
      const day = l.date.toISOString().split('T')[0];
      dailyMap[day] = { duration: l.duration, calories: l.caloriesBurned, exercises: l.exercises.length };
    });

    res.json({ success: true, allTime: allTime[0] || { sessions: 0, totalDuration: 0, totalCalories: 0 }, dailyMap, byExercise });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/logs', async (req, res) => {
  try {
    const log = await GymLog.create({ ...req.body, user: req.user._id });
    await Goal.updateMany(
      { user: req.user._id, type: 'gym_days', isCompleted: false },
      { $inc: { current: 1 } }
    );
    await Goal.updateMany(
      { user: req.user._id, isCompleted: false, $expr: { $gte: ['$current', '$target'] } },
      { isCompleted: true, completedAt: new Date() }
    );
    res.status(201).json({ success: true, log });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/logs/:id', async (req, res) => {
  try {
    const log = await GymLog.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    res.json({ success: true, log });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/logs/:id', async (req, res) => {
  try {
    await GymLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
