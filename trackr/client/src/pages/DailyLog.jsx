import { useState, useEffect } from 'react';
import { CalendarDays, BookOpen, Dumbbell, FileText, Smile, Zap, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { fmtTime, MOOD_EMOJI, COLORS } from '../lib/utils';
import { PageHeader, Spinner, StatCard } from '../components/ui';
import { format, subDays, addDays } from 'date-fns';

const MOODS = ['great', 'good', 'okay', 'bad', 'terrible'];
const MOOD_COLOR = { great: '#10b981', good: '#7c6fcd', okay: '#f59e0b', bad: '#f97316', terrible: '#ef4444' };

export default function DailyLog() {
  const [today] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [log, setLog] = useState({ studied: false, workedOut: false, addedNotes: false, studyMinutes: 0, questionsolved: 0, gymDuration: 0, mood: 'okay', highlight: '', gratitude: '' });
  const [history, setHistory] = useState([]);
  const [streak, setStreak] = useState({ streak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

  const fetchLog = async (date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const [histRes, streakRes] = await Promise.all([
        api.get('/daily?limit=30'),
        api.get('/daily/streak'),
      ]);
      setHistory(histRes.data.logs);
      setStreak(streakRes.data);
      const found = histRes.data.logs.find(l => l.date === dateStr);
      if (found) {
        setLog(found);
      } else {
        setLog({ studied: false, workedOut: false, addedNotes: false, studyMinutes: 0, questionsolved: 0, gymDuration: 0, mood: 'okay', highlight: '', gratitude: '' });
      }
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLog(selectedDate); }, [selectedDate]);

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/daily', { ...log, date: format(selectedDate, 'yyyy-MM-dd') });
      toast.success('Daily log saved! ✅');
      fetchLog(selectedDate);
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const toggle = (field) => setLog(l => ({ ...l, [field]: !l[field] }));

  // Build 30-day heatmap
  const heatmapDays = [];
  for (let i = 29; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const logEntry = history.find(l => l.date === dateStr);
    heatmapDays.push({ date: d, dateStr, log: logEntry });
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={28} /></div>;

  const completedToday = (log.studied ? 1 : 0) + (log.workedOut ? 1 : 0) + (log.addedNotes ? 1 : 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Log"
        subtitle="Track your daily activities and habits"
      />

      {/* Streak + Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Zap size={18} />} label="Current Streak" value={`${streak.streak} days`} color={COLORS.orange} />
        <StatCard icon={<Zap size={18} />} label="Longest Streak" value={`${streak.longestStreak} days`} color={COLORS.accent} />
        <StatCard icon={<CalendarDays size={18} />} label="Logged This Month" value={history.length} color={COLORS.green} />
        <StatCard icon={<Smile size={18} />} label="Today's Score" value={`${completedToday}/3`} color={COLORS.blue} />
      </div>

      {/* 30-day heatmap */}
      <div className="card p-5">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">30-Day Activity</h3>
        <div className="flex gap-1.5 flex-wrap">
          {heatmapDays.map(({ date, dateStr, log: l }) => {
            const hasActivity = l && (l.studied || l.workedOut || l.addedNotes);
            const intensity = l ? (l.studied ? 1 : 0) + (l.workedOut ? 1 : 0) + (l.addedNotes ? 1 : 0) : 0;
            const isSelected = dateStr === format(selectedDate, 'yyyy-MM-dd');
            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(date)}
                title={`${format(date, 'MMM d')} · ${l?.mood ? MOOD_EMOJI[l.mood] : ''} ${l?.highlight || ''}`}
                className={`heatmap-cell w-8 h-8 cursor-pointer flex items-center justify-center text-xs rounded-lg border-2 transition-all ${isSelected ? 'border-[var(--accent)] scale-110' : 'border-transparent'}`}
                style={{
                  background: intensity === 0 ? 'var(--surface-2)' :
                    intensity === 1 ? `${COLORS.accent}30` :
                    intensity === 2 ? `${COLORS.accent}60` : `${COLORS.accent}`,
                  color: intensity === 3 ? 'white' : 'var(--text-muted)',
                }}>
                {format(date, 'd')}
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-3 text-xs text-[var(--text-muted)]">
          <span>Less</span>
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="w-4 h-4 rounded" style={{ background: i === 0 ? 'var(--surface-2)' : `${COLORS.accent}${['30','60','ff'][i-1]}` }} />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Selected Day Log */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedDate(d => subDays(d, 1))} className="btn btn-ghost p-1.5">
              <ChevronLeft size={16} />
            </button>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                {isToday ? "Today" : format(selectedDate, 'EEEE')}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">{format(selectedDate, 'MMMM d, yyyy')}</p>
            </div>
            <button
              onClick={() => setSelectedDate(d => addDays(d, 1))}
              disabled={isToday}
              className="btn btn-ghost p-1.5 disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
          <button onClick={save} disabled={saving} className="btn btn-primary">
            <Save size={15} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Activity Toggles */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { key: 'studied', icon: <BookOpen size={20} />, label: 'Studied', color: COLORS.accent },
            { key: 'workedOut', icon: <Dumbbell size={20} />, label: 'Worked Out', color: COLORS.orange },
            { key: 'addedNotes', icon: <FileText size={20} />, label: 'Added Notes', color: COLORS.green },
          ].map(({ key, icon, label, color }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${log[key] ? 'border-current' : 'border-[var(--border)] hover:border-[var(--surface-3)]'}`}
              style={{ color: log[key] ? color : 'var(--text-muted)', background: log[key] ? `${color}12` : 'var(--surface-2)' }}>
              {icon}
              <span className="text-xs font-semibold">{label}</span>
              {log[key] && <span className="text-[10px]">✓ Done</span>}
            </button>
          ))}
        </div>

        {/* Quantitative Fields */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div>
            <label className="label">Study (mins)</label>
            <input type="number" className="input" min="0" value={log.studyMinutes || ''}
              onChange={e => setLog(l => ({ ...l, studyMinutes: +e.target.value }))} />
          </div>
          <div>
            <label className="label">Questions Solved</label>
            <input type="number" className="input" min="0" value={log.questionsolved || ''}
              onChange={e => setLog(l => ({ ...l, questionsolved: +e.target.value }))} />
          </div>
          <div>
            <label className="label">Gym (mins)</label>
            <input type="number" className="input" min="0" value={log.gymDuration || ''}
              onChange={e => setLog(l => ({ ...l, gymDuration: +e.target.value }))} />
          </div>
        </div>

        {/* Mood */}
        <div className="mb-5">
          <label className="label">Mood</label>
          <div className="flex gap-2">
            {MOODS.map(m => (
              <button key={m}
                onClick={() => setLog(l => ({ ...l, mood: m }))}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 transition-all text-xs font-medium ${log.mood === m ? 'border-current scale-105' : 'border-[var(--border)] hover:border-[var(--surface-3)] text-[var(--text-muted)]'}`}
                style={{ color: log.mood === m ? MOOD_COLOR[m] : undefined, background: log.mood === m ? `${MOOD_COLOR[m]}12` : 'var(--surface-2)' }}>
                <span className="text-xl">{MOOD_EMOJI[m]}</span>
                <span className="capitalize hidden sm:block">{m}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Highlight of the Day</label>
            <textarea className="input resize-none" rows={2} placeholder="What went well today?"
              value={log.highlight || ''} onChange={e => setLog(l => ({ ...l, highlight: e.target.value }))} />
          </div>
          <div>
            <label className="label">Gratitude</label>
            <textarea className="input resize-none" rows={2} placeholder="What are you grateful for?"
              value={log.gratitude || ''} onChange={e => setLog(l => ({ ...l, gratitude: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* History list */}
      <div className="card p-5">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Recent Logs</h3>
        <div className="space-y-2">
          {history.slice(0, 7).map(entry => (
            <div key={entry.date}
              onClick={() => setSelectedDate(new Date(entry.date + 'T12:00:00'))}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] cursor-pointer transition-all">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-[var(--surface-3)]">
                {MOOD_EMOJI[entry.mood] || '📅'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {format(new Date(entry.date + 'T12:00:00'), 'EEEE, MMM d')}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">{entry.highlight || 'No highlight'}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {entry.studied && <span title="Studied" className="w-5 h-5 rounded bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-xs">S</span>}
                {entry.workedOut && <span title="Worked out" className="w-5 h-5 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs">G</span>}
                {entry.addedNotes && <span title="Added notes" className="w-5 h-5 rounded bg-green-500/20 text-green-400 flex items-center justify-center text-xs">N</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
