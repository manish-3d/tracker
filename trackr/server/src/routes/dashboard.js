import express from 'express';
import StudyLog from '../models/StudyLog.js';
import GymLog from '../models/GymLog.js';
import Note from '../models/Note.js';
import Goal from '../models/Goal.js';
import DailyLog from '../models/DailyLog.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const uid = req.user._id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const [
      studyAll, gymAll, noteCount, goals,
      recentStudy, recentGym, recentDaily, user
    ] = await Promise.all([
      StudyLog.aggregate([{ $match: { user: uid } }, { $group: { _id: null, totalQ: { $sum: '$totalQuestions' }, totalTime: { $sum: '$totalTime' }, sessions: { $sum: 1 } } }]),
      GymLog.aggregate([{ $match: { user: uid } }, { $group: { _id: null, sessions: { $sum: 1 }, duration: { $sum: '$duration' } } }]),
      Note.countDocuments({ user: uid }),
      Goal.find({ user: uid }),
      StudyLog.find({ user: uid, date: { $gte: sevenDaysAgo } }).sort({ date: 1 }),
      GymLog.find({ user: uid, date: { $gte: sevenDaysAgo } }).sort({ date: 1 }),
      DailyLog.find({ user: uid, date: { $gte: thirtyDaysAgo.toISOString().split('T')[0] } }).sort({ date: 1 }),
      User.findById(uid),
    ]);

    // Build 7-day chart
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const sl = recentStudy.filter(l => l.date.toISOString().split('T')[0] === dateStr);
      const gl = recentGym.filter(l => l.date.toISOString().split('T')[0] === dateStr);
      chartData.push({
        date: dateStr,
        label: d.toLocaleDateString('en', { weekday: 'short' }),
        questions: sl.reduce((s, l) => s + l.totalQuestions, 0),
        studyTime: sl.reduce((s, l) => s + l.totalTime, 0),
        gymSessions: gl.length,
        gymDuration: gl.reduce((s, l) => s + l.duration, 0),
      });
    }

    res.json({
      success: true,
      stats: {
        totalQuestions: studyAll[0]?.totalQ || 0,
        totalStudyTime: studyAll[0]?.totalTime || 0,
        studySessions: studyAll[0]?.sessions || 0,
        gymSessions: gymAll[0]?.sessions || 0,
        gymDuration: gymAll[0]?.duration || 0,
        notes: noteCount,
        streak: user?.streak || 0,
        longestStreak: user?.longestStreak || 0,
      },
      goals,
      chartData,
      recentDaily,
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
