import express from 'express';
import StudyLog from '../models/StudyLog.js';
import Goal from '../models/Goal.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/logs', async (req, res) => {
  try {
    const { subject, limit = 30, page = 1 } = req.query;
    const q = { user: req.user._id };
    if (subject) q.subject = subject;
    const logs = await StudyLog.find(q).sort({ date: -1 }).limit(+limit).skip((+page - 1) * +limit);
    const total = await StudyLog.countDocuments(q);
    res.json({ success: true, logs, total });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/subjects', async (req, res) => {
  try {
    const subjects = await StudyLog.distinct('subject', { user: req.user._id });
    res.json({ success: true, subjects });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const uid = req.user._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 86400000);
    const sevenDaysAgo = new Date(now - 7 * 86400000);

    const [allTime, monthly, weekly, bySubject] = await Promise.all([
      StudyLog.aggregate([{ $match: { user: uid } }, { $group: { _id: null, totalQ: { $sum: '$totalQuestions' }, totalTime: { $sum: '$totalTime' }, sessions: { $sum: 1 } } }]),
      StudyLog.find({ user: uid, date: { $gte: thirtyDaysAgo } }).sort({ date: 1 }),
      StudyLog.find({ user: uid, date: { $gte: sevenDaysAgo } }).sort({ date: 1 }),
      StudyLog.aggregate([{ $match: { user: uid } }, { $group: { _id: '$subject', totalQ: { $sum: '$totalQuestions' }, totalTime: { $sum: '$totalTime' }, sessions: { $sum: 1 } } }]),
    ]);

    // Build daily chart data (30 days)
    const dailyMap = {};
    monthly.forEach(l => {
      const day = l.date.toISOString().split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { questions: 0, time: 0 };
      dailyMap[day].questions += l.totalQuestions;
      dailyMap[day].time += l.totalTime;
    });

    res.json({
      success: true,
      allTime: allTime[0] || { totalQ: 0, totalTime: 0, sessions: 0 },
      dailyMap,
      weekly,
      bySubject,
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/logs', async (req, res) => {
  try {
    const log = await StudyLog.create({ ...req.body, user: req.user._id });
    // Update related goals
    await Goal.updateMany(
      { user: req.user._id, type: 'study_questions', isCompleted: false },
      { $inc: { current: log.totalQuestions } }
    );
    await Goal.updateMany(
      { user: req.user._id, type: 'study_time', isCompleted: false },
      { $inc: { current: Math.round(log.totalTime / 60) } }
    );
    // Mark completed goals
    await Goal.updateMany(
      { user: req.user._id, isCompleted: false, $expr: { $gte: ['$current', '$target'] } },
      { isCompleted: true, completedAt: new Date() }
    );
    res.status(201).json({ success: true, log });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/logs/:id', async (req, res) => {
  try {
    await StudyLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
