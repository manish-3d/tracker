import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import studyRoutes from './routes/study.js';
import gymRoutes from './routes/gym.js';
import goalsRoutes from './routes/goals.js';
import dailyRoutes from './routes/daily.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/gym', gymRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });
