import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Dumbbell, Clock, Flame, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { fmt, fmtTime, fmtDate, COLORS, CATEGORY_COLORS, MOOD_EMOJI } from '../lib/utils';
import { Modal, StatCard, PageHeader, EmptyState, Spinner, Tabs, Badge } from '../components/ui';

const CATEGORIES = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full_body', 'other'];
const MOODS = ['terrible', 'bad', 'okay', 'good', 'great'];

const newSet = (n) => ({ setNumber: n, reps: '', weight: '', unit: 'kg', completed: true });
const newExercise = () => ({ name: '', category: 'chest', sets: [newSet(1)], notes: '' });
const defaultForm = () => ({
  title: 'Workout',
  exercises: [newExercise()],
  duration: '',
  caloriesBurned: '',
  mood: 'good',
  notes: '',
  date: new Date().toISOString().split('T')[0],
});

export default function Gym() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('overview');
  const [expandedLog, setExpandedLog] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([api.get('/gym/logs'), api.get('/gym/stats')]);
      setLogs(logsRes.data.logs);
      setStats(statsRes.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateExercise = (i, field, val) => {
    const exs = [...form.exercises];
    exs[i] = { ...exs[i], [field]: val };
    setForm(f => ({ ...f, exercises: exs }));
  };

  const addSet = (exIdx) => {
    const exs = [...form.exercises];
    exs[exIdx].sets = [...exs[exIdx].sets, newSet(exs[exIdx].sets.length + 1)];
    setForm(f => ({ ...f, exercises: exs }));
  };

  const updateSet = (exIdx, setIdx, field, val) => {
    const exs = [...form.exercises];
    exs[exIdx].sets[setIdx] = { ...exs[exIdx].sets[setIdx], [field]: val };
    setForm(f => ({ ...f, exercises: exs }));
  };

  const removeExercise = (i) => setForm(f => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }));

  const submit = async () => {
    if (!form.exercises.some(e => e.name.trim())) { toast.error('Add at least one exercise'); return; }
    setSaving(true);
    try {
      await api.post('/gym/logs', form);
      toast.success('Workout logged! 💪');
      setShowModal(false);
      setForm(defaultForm());
      fetchAll();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const deleteLog = async (id) => {
    if (!confirm('Delete this workout?')) return;
    await api.delete(`/gym/logs/${id}`);
    setLogs(l => l.filter(x => x._id !== id));
    toast.success('Deleted');
  };

  const chartData = Object.entries(stats?.dailyMap || {}).slice(-14).map(([date, d]) => ({
    date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    duration: d.duration,
    calories: d.calories,
  }));

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={28} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gym Tracker"
        subtitle="Log workouts and track progress"
        actions={<button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} />Log Workout</button>}
      />

      <Tabs
        tabs={[{ value: 'overview', label: 'Overview' }, { value: 'history', label: 'History' }]}
        active={tab} onChange={setTab}
      />

      {tab === 'overview' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={<Dumbbell size={18} />} label="Total Sessions" value={fmt(stats?.allTime?.sessions)} color={COLORS.orange} />
            <StatCard icon={<Clock size={18} />} label="Total Duration" value={fmtTime(stats?.allTime?.totalDuration)} color={COLORS.accent} />
            <StatCard icon={<Flame size={18} />} label="Calories Burned" value={fmt(stats?.allTime?.totalCalories)} color={COLORS.red} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Workout Duration (14 days)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="duration" name="Duration (min)" fill={COLORS.orange} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Top Exercises</h3>
              <div className="space-y-2">
                {(stats?.byExercise || []).slice(0, 7).map((ex, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[ex.category] || COLORS.accent }} />
                      <span className="text-[var(--text-secondary)] truncate">{ex._id}</span>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-muted)] shrink-0 ml-2">{ex.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2 animate-fade-in">
          {logs.length === 0 ? (
            <EmptyState icon="💪" title="No workouts logged" desc="Log your first workout to start tracking."
              action={<button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} />Log Workout</button>} />
          ) : logs.map(log => (
            <div key={log._id} className="card p-4 hover:border-[var(--accent)]/30 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${COLORS.orange}18` }}>
                    <Dumbbell size={16} style={{ color: COLORS.orange }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[var(--text-primary)]">{log.title}</span>
                      <span className="text-base">{MOOD_EMOJI[log.mood]}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{fmtDate(log.date)} · {log.exercises?.length} exercises</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-orange-400">{log.duration} <span className="text-[var(--text-muted)] font-normal text-xs">min</span></p>
                    <p className="text-xs text-[var(--text-muted)]">{log.caloriesBurned} kcal</p>
                  </div>
                  <button onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)} className="btn btn-ghost p-1.5">
                    {expandedLog === log._id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <button onClick={() => deleteLog(log._id)} className="btn btn-danger p-1.5"><Trash2 size={14} /></button>
                </div>
              </div>
              {expandedLog === log._id && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <div className="space-y-2">
                    {log.exercises?.map((ex, i) => (
                      <div key={i} className="bg-[var(--surface-2)] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[ex.category] }} />
                          <span className="text-sm font-semibold text-[var(--text-primary)]">{ex.name}</span>
                          <span className="text-xs text-[var(--text-muted)] capitalize">{ex.category}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ex.sets?.map((s, si) => (
                            <span key={si} className="badge bg-[var(--surface-3)] text-[var(--text-secondary)] text-[11px]">
                              {s.reps} reps × {s.weight}{s.unit}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Log Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Workout" wide>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Workout Title</label>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="label">Duration (min)</label>
              <input type="number" className="input" min="0" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} />
            </div>
            <div>
              <label className="label">Calories Burned</label>
              <input type="number" className="input" min="0" value={form.caloriesBurned} onChange={e => setForm(f => ({ ...f, caloriesBurned: +e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="label">Mood</label>
            <div className="flex gap-2">
              {MOODS.map(m => (
                <button key={m} onClick={() => setForm(f => ({ ...f, mood: m }))}
                  className={`flex-1 btn py-1.5 text-sm ${form.mood === m ? 'btn-primary' : 'btn-ghost border border-[var(--border)]'}`}>
                  {MOOD_EMOJI[m]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Exercises</label>
              <button onClick={() => setForm(f => ({ ...f, exercises: [...f.exercises, newExercise()] }))} className="btn btn-ghost text-xs py-1 px-2">
                <Plus size={12} /> Add Exercise
              </button>
            </div>
            <div className="space-y-3">
              {form.exercises.map((ex, i) => (
                <div key={i} className="bg-[var(--surface-2)] rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    <input className="input flex-1 py-1.5 text-sm" placeholder="Exercise name" value={ex.name} onChange={e => updateExercise(i, 'name', e.target.value)} />
                    <select className="input w-32 py-1.5 text-sm" value={ex.category} onChange={e => updateExercise(i, 'category', e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={() => removeExercise(i)} className="btn btn-danger p-1.5"><Trash2 size={13} /></button>
                  </div>
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-4 gap-1.5">
                      {['Set', 'Reps', 'Weight', 'Unit'].map(h => (
                        <p key={h} className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">{h}</p>
                      ))}
                    </div>
                    {ex.sets.map((s, si) => (
                      <div key={si} className="grid grid-cols-4 gap-1.5 items-center">
                        <span className="text-xs text-[var(--text-muted)] font-mono px-1">{si + 1}</span>
                        <input type="number" className="input py-1 text-sm text-center" min="0" value={s.reps} onChange={e => updateSet(i, si, 'reps', +e.target.value)} />
                        <input type="number" className="input py-1 text-sm text-center" min="0" value={s.weight} onChange={e => updateSet(i, si, 'weight', +e.target.value)} />
                        <select className="input py-1 text-sm" value={s.unit} onChange={e => updateSet(i, si, 'unit', e.target.value)}>
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => addSet(i)} className="btn btn-ghost text-xs py-1 px-2"><Plus size={11} />Set</button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="How was the workout?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          <button onClick={submit} disabled={saving} className="btn btn-primary w-full justify-center py-2.5">
            {saving ? 'Saving...' : '💪 Log Workout'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
