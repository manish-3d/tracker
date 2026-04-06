import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const token = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });
    if (await User.findOne({ email })) return res.status(409).json({ success: false, message: 'Email already exists' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ success: true, token: token(user._id), user: { _id: user._id, name: user.name, email: user.email, theme: user.theme, streak: user.streak } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    res.json({ success: true, token: token(user._id), user: { _id: user._id, name: user.name, email: user.email, theme: user.theme, streak: user.streak, longestStreak: user.longestStreak } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }));

router.put('/theme', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { theme: req.body.theme }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

export default router;
