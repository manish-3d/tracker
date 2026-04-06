import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Dumbbell, FileText, Zap, Clock, Target, TrendingUp, Calendar, Flame } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { fmt, fmtTime, fmtDate, pct, COLORS, MOOD_EMOJI } from '../lib/utils';
import { StatCard, ProgressBar, ProgressRing, PageHeader, Badge, Spinner } from '../components/ui';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-3 text-xs shadow-xl">
      <p className="font-semibold text-[var(--text-primary)] mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartTab, setChartTab] = useState('study');

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>;

  const s = data?.stats || {};
  const activeGoals = data?.goals?.filter(g => !g.isCompleted) || [];
  const completedGoals = data?.goals?.filter(g => g.isCompleted) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good ${getGreeting()}, ${user?.name?.split(' ')[0]} 👋`}
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      />

      {/* Streak Banner */}
      {s.streak > 0 && (
        <div className="card p-4 flex items-center gap-4 border-orange-500/20 bg-orange-500/5 animate-fade-in">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-2xl shrink-0">🔥</div>
          <div className="flex-1">
            <p className="font-semibold text-[var(--text-primary)]">{s.streak} Day Streak!</p>
            <p className="text-sm text-[var(--text-muted)]">Longest: {s.longestStreak} days — keep the momentum going</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-orange-400">{s.streak}</p>
            <p className="text-xs text-[var(--text-muted)]">days</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen size={18} />} label="Questions Solved" value={fmt(s.totalQuestions)} sub={`${s.studySessions} sessions`} color={COLORS.accent} />
        <StatCard icon={<Clock size={18} />} label="Study Time" value={fmtTime(s.totalStudyTime)} sub="total logged" color={COLORS.blue} />
        <StatCard icon={<Dumbbell size={18} />} label="Gym Sessions" value={fmt(s.gymSessions)} sub={fmtTime(s.gymDuration) + ' total'} color={COLORS.orange} />
        <StatCard icon={<FileText size={18} />} label="Notes Created" value={fmt(s.notes)} sub={`${s.streak} day streak`} color={COLORS.green} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text-primary)]">Weekly Activity</h2>
            <div className="flex gap-1 p-1 bg-[var(--surface-2)] rounded-lg">
              {['study', 'gym'].map(t => (
                <button key={t} onClick={() => setChartTab(t)}
                  className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-all ${chartTab === t ? 'bg-[var(--surface-1)] text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            {chartTab === 'study' ? (
              <AreaChart data={data?.chartData || []}>
                <defs>
                  <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="questions" name="Questions" stroke={COLORS.accent} fill="url(#qGrad)" strokeWidth={2} />
              </AreaChart>
            ) : (
              <BarChart data={data?.chartData || []}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="gymDuration" name="Duration (min)" fill={COLORS.orange} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Goals Summary */}
        <div className="card p-5">
          <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Target size={16} className="text-[var(--accent)]" /> Active Goals
          </h2>
          {activeGoals.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">No active goals yet</p>
          ) : (
            <div className="space-y-4">
              {activeGoals.slice(0, 4).map(g => {
                const p = pct(g.current, g.target);
                return (
                  <div key={g._id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm">{g.icon}</span>
                        <span className="text-xs font-medium text-[var(--text-primary)] truncate">{g.title}</span>
                      </div>
                      <span className="text-xs font-bold shrink-0 ml-2" style={{ color: g.color }}>{p}%</span>
                    </div>
                    <ProgressBar value={g.current} max={g.target} color={g.color} />
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{fmt(g.current)} / {fmt(g.target)} {g.unit}</p>
                  </div>
                );
              })}
            </div>
          )}
          {completedGoals.length > 0 && (
            <p className="text-xs text-green-400 mt-4 flex items-center gap-1">✅ {completedGoals.length} goal{completedGoals.length > 1 ? 's' : ''} completed</p>
          )}
        </div>
      </div>

      {/* Recent Daily Logs */}
      <div className="card p-5">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Calendar size={16} className="text-[var(--accent)]" /> Recent Activity
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {(data?.recentDaily || []).slice(-14).map(log => (
            <div key={log.date} className="text-center">
              <p className="text-[10px] text-[var(--text-muted)] mb-1">{new Date(log.date).toLocaleDateString('en', { weekday: 'narrow' })}</p>
              <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs ${log.studied && log.workedOut ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : log.studied ? 'bg-blue-500/20 text-blue-400' : log.workedOut ? 'bg-orange-500/20 text-orange-400' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                {log.studied && log.workedOut ? '⚡' : log.studied ? '📚' : log.workedOut ? '💪' : '·'}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">{log.date.slice(5)}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 flex-wrap">
          {[['⚡', 'Both'], ['📚', 'Study'], ['💪', 'Gym'], ['·', 'Rest']].map(([icon, label]) => (
            <span key={label} className="text-xs text-[var(--text-muted)] flex items-center gap-1">{icon} {label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}
