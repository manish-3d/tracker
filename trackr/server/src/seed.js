import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Note from './models/Note.js';
import StudyLog from './models/StudyLog.js';
import GymLog from './models/GymLog.js';
import Goal from './models/Goal.js';
import DailyLog from './models/DailyLog.js';

dotenv.config();

const subDays = (d, n) => new Date(d - n * 86400000);
const dateStr = (d) => d.toISOString().split('T')[0];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo user
    const existing = await User.findOne({ email: 'demo@trackr.app' });
    if (existing) {
      await Promise.all([
        Note.deleteMany({ user: existing._id }),
        StudyLog.deleteMany({ user: existing._id }),
        GymLog.deleteMany({ user: existing._id }),
        Goal.deleteMany({ user: existing._id }),
        DailyLog.deleteMany({ user: existing._id }),
        User.deleteOne({ _id: existing._id }),
      ]);
    }

    const user = await User.create({ name: 'Demo User', email: 'demo@trackr.app', password: 'Demo@123', streak: 7, longestStreak: 14 });
    console.log('✅ Created demo user');

    // Notes
    await Note.insertMany([
      { user: user._id, title: 'DSA Study Plan', content: '# DSA Study Plan\n\n## Week 1\n- Arrays & Strings\n- Two Pointers\n- Sliding Window\n\n## Week 2\n- Linked Lists\n- Stacks & Queues\n\n## Resources\n- LeetCode Top 150\n- NeetCode roadmap', category: 'Study', folder: 'DSA', tags: ['dsa', 'plan'], isPinned: true },
      { user: user._id, title: 'Binary Search Notes', content: '# Binary Search\n\nBinary search runs in **O(log n)** time.\n\n```python\ndef binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n```\n\n## Template variants\n- Find first/last occurrence\n- Search in rotated array', category: 'Study', folder: 'DSA', tags: ['dsa', 'binary-search'] },
      { user: user._id, title: 'Gym Workout Split', content: '# My Workout Split\n\n| Day | Muscle Group |\n|-----|-------------|\n| Mon | Push (Chest, Shoulders, Tris) |\n| Tue | Pull (Back, Biceps) |\n| Wed | Legs |\n| Thu | Push |\n| Fri | Pull |\n| Sat | Legs |\n| Sun | Rest |\n\n## Key Lifts\n- Bench: 80kg\n- Squat: 100kg\n- Deadlift: 120kg', category: 'Fitness', folder: 'Gym', tags: ['gym', 'plan'], isPinned: true },
      { user: user._id, title: 'Daily Routine', content: '# Daily Routine\n\n## Morning\n- 6:00 AM Wake up\n- 6:15 AM Cold shower\n- 6:30 AM Study session (2hrs)\n\n## Afternoon\n- 12:00 PM Lunch\n- 1:00 PM LeetCode (1hr)\n\n## Evening\n- 5:00 PM Gym\n- 7:00 PM Dinner\n- 8:00 PM Review notes\n\n## Night\n- 10:00 PM Read\n- 11:00 PM Sleep', category: 'Personal', folder: 'Root', tags: ['routine', 'productivity'] },
    ]);
    console.log('✅ Seeded notes');

    // Study logs — last 30 days
    const studyLogs = [];
    for (let i = 29; i >= 0; i--) {
      if (Math.random() > 0.25) { // ~75% days studied
        const questions = Math.floor(Math.random() * 8) + 2;
        const time = Math.floor(Math.random() * 90) + 30;
        studyLogs.push({
          user: user._id,
          date: subDays(new Date(), i),
          subject: i % 3 === 0 ? 'System Design' : i % 5 === 0 ? 'OS & Networks' : 'DSA',
          topics: [{ name: ['Arrays', 'Trees', 'Graphs', 'DP', 'Strings'][Math.floor(Math.random() * 5)], questionssolved: questions, timeSpent: time }],
          totalQuestions: questions,
          totalTime: time,
          difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
        });
      }
    }
    await StudyLog.insertMany(studyLogs);
    console.log(`✅ Seeded ${studyLogs.length} study logs`);

    // Gym logs — last 30 days
    const gymLogs = [];
    const workoutTitles = ['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Full Body'];
    const exercises = [
      { name: 'Bench Press', category: 'chest' },
      { name: 'Squat', category: 'legs' },
      { name: 'Deadlift', category: 'back' },
      { name: 'Pull-ups', category: 'back' },
      { name: 'Shoulder Press', category: 'shoulders' },
      { name: 'Bicep Curls', category: 'arms' },
    ];
    for (let i = 29; i >= 0; i--) {
      if (Math.random() > 0.45) { // ~55% days worked out
        const ex = exercises.slice(0, Math.floor(Math.random() * 3) + 2);
        gymLogs.push({
          user: user._id,
          date: subDays(new Date(), i),
          title: workoutTitles[Math.floor(Math.random() * workoutTitles.length)],
          exercises: ex.map(e => ({
            ...e,
            sets: [
              { setNumber: 1, reps: 8 + Math.floor(Math.random() * 4), weight: 60 + Math.floor(Math.random() * 40) },
              { setNumber: 2, reps: 8 + Math.floor(Math.random() * 4), weight: 60 + Math.floor(Math.random() * 40) },
              { setNumber: 3, reps: 8 + Math.floor(Math.random() * 4), weight: 60 + Math.floor(Math.random() * 40) },
            ],
          })),
          duration: 45 + Math.floor(Math.random() * 30),
          caloriesBurned: 250 + Math.floor(Math.random() * 200),
          mood: ['good', 'great', 'okay'][Math.floor(Math.random() * 3)],
        });
      }
    }
    await GymLog.insertMany(gymLogs);
    console.log(`✅ Seeded ${gymLogs.length} gym logs`);

    // Goals
    const totalQ = studyLogs.reduce((s, l) => s + l.totalQuestions, 0);
    await Goal.insertMany([
      { user: user._id, title: '300 DSA Questions', description: 'Solve 300 LeetCode problems', type: 'study_questions', target: 300, current: totalQ, unit: 'questions', icon: '🧠', color: '#6366f1', deadline: new Date(Date.now() + 60 * 86400000) },
      { user: user._id, title: '25 Gym Days', description: 'Hit the gym 25 times this month', type: 'gym_days', target: 25, current: gymLogs.length, unit: 'days', icon: '💪', color: '#f97316' },
      { user: user._id, title: '100 Study Hours', description: 'Study for 100 hours total', type: 'study_time', target: 100, current: Math.round(studyLogs.reduce((s, l) => s + l.totalTime, 0) / 60), unit: 'hours', icon: '⏱️', color: '#10b981', deadline: new Date(Date.now() + 90 * 86400000) },
      { user: user._id, title: 'Create 20 Notes', description: 'Document everything I learn', type: 'notes_created', target: 20, current: 4, unit: 'notes', icon: '📝', color: '#f59e0b' },
    ]);
    console.log('✅ Seeded goals');

    // Daily logs — last 14 days
    const dailyLogs = [];
    for (let i = 13; i >= 0; i--) {
      const studied = Math.random() > 0.3;
      const workedOut = Math.random() > 0.45;
      dailyLogs.push({
        user: user._id,
        date: dateStr(subDays(new Date(), i)),
        studied,
        workedOut,
        addedNotes: Math.random() > 0.6,
        studyMinutes: studied ? 60 + Math.floor(Math.random() * 90) : 0,
        questionsolved: studied ? Math.floor(Math.random() * 8) + 1 : 0,
        gymDuration: workedOut ? 45 + Math.floor(Math.random() * 30) : 0,
        mood: ['great', 'good', 'okay', 'good', 'great'][Math.floor(Math.random() * 5)],
        highlight: studied ? 'Solved some hard problems today!' : workedOut ? 'Great workout session!' : 'Rest day',
      });
    }
    await DailyLog.insertMany(dailyLogs);
    console.log('✅ Seeded daily logs');

    console.log('\n🎉 Database seeded!\nLogin: demo@trackr.app / Demo@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
