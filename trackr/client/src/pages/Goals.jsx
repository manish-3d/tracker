import { useState, useEffect } from 'react';
import { Plus, Target, Trash2, CheckCircle2, Trophy, Calendar } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { fmt, pct, COLORS } from '../lib/utils';
import { Modal, PageHeader, EmptyState, Spinner, ProgressRing, ProgressBar } from '../components/ui';

const GOAL_TYPES = [
  { value: 'study_questions', label: '🧠 Study Questions', unit: 'questions' },
  { value: 'study_time', label: '⏱️ Study Hours', unit: 'hours' },
  { value: 'gym_days', label: '💪 Gym Days', unit: 'days' },
  { value: 'gym_sessions', label: '🏋️ Gym Sessions', unit: 'sessions' },
  { value: 'notes_created', label: '📝 Notes Created', unit: 'notes' },
  { value: 'custom', label: '🎯 Custom Goal', unit: '' },
];

const PRESET_COLORS = ['#7c6fcd', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6'];
const PRESET_ICONS = ['🎯', '🧠', '💪', '📚', '🏆', '⚡', '🔥', '🚀', '💡', '📝', '🌟', '⏱️'];

const defaultForm = () => ({
  title: '',
  description: '',
  type: 'study_questions',
  target: '',
  unit: 'questions',
  deadline: '',
  color: '#7c6fcd',
  icon: '🎯',
});

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active' | 'completed' | 'all'

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/goals');
      setGoals(data.goals);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleTypeChange = (type) => {
    const gt = GOAL_TYPES.find(g => g.value === type);
    setForm(f => ({ ...f, type, unit: gt?.unit || '' }));
  };

  const submit = async () => {
    if (!form.title.trim()) { toast.error('Goal title is required'); return; }
    if (!form.target || +form.target <= 0) { toast.error('Set a valid target'); return; }
    setSaving(true);
    try {
      await api.post('/goals', { ...form, target: +form.target });
      toast.success('Goal created! 🎯');
      setShowModal(false);
      setForm(defaultForm());
      fetchGoals();
    } catch { toast.error('Failed to create goal'); }
    finally { setSaving(false); }
  };

  const deleteGoal = async (id) => {
    if (!confirm('Delete this goal?')) return;
    await api.delete(`/goals/${id}`);
    setGoals(g => g.filter(x => x._id !== id));
    toast.success('Goal deleted');
  };

  const updateProgress = async (goal, delta) => {
    const newVal = Math.max(0, Math.min(goal.target, goal.current + delta));
    try {
      const { data } = await api.put(`/goals/${goal._id}`, { current: newVal });
      setGoals(g => g.map(x => x._id === goal._id ? data.goal : x));
    } catch { toast.error('Failed to update'); }
  };

  const filtered = goals.filter(g =>
    filter === 'all' ? true : filter === 'completed' ? g.isCompleted : !g.isCompleted
  );
  const activeCount = goals.filter(g => !g.isCompleted).length;
  const completedCount = goals.filter(g => g.isCompleted).length;

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={28} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        subtitle={`${activeCount} active · ${completedCount} completed`}
        actions={
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={16} /> New Goal
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[['active', 'Active'], ['completed', 'Completed'], ['all', 'All']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`btn text-sm py-1.5 ${filter === val ? 'btn-primary' : 'btn-ghost border border-[var(--border)]'}`}>
            {label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === val ? 'bg-white/20' : 'bg-[var(--surface-3)]'}`}>
              {val === 'active' ? activeCount : val === 'completed' ? completedCount : goals.length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={filter === 'completed' ? '🏆' : '🎯'}
          title={filter === 'completed' ? 'No completed goals yet' : 'No goals yet'}
          desc={filter === 'completed' ? 'Complete some goals to see them here.' : 'Set your first goal and start tracking progress.'}
          action={filter !== 'completed' && (
            <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} />New Goal</button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(goal => {
            const p = pct(goal.current, goal.target);
            const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000) : null;
            return (
              <div key={goal._id}
                className={`card p-5 relative overflow-hidden transition-all hover:shadow-lg animate-fade-in ${goal.isCompleted ? 'opacity-75' : ''}`}
                style={{ borderTop: `3px solid ${goal.color}` }}>

                {/* Completed overlay */}
                {goal.isCompleted && (
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 bg-green-500/15 text-green-400 rounded-full px-2 py-0.5 text-xs font-semibold">
                      <CheckCircle2 size={11} /> Done
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <ProgressRing pct={p} size={56} stroke={4} color={goal.color}>
                    <span className="text-lg">{goal.icon}</span>
                  </ProgressRing>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-tight">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{goal.description}</p>
                    )}
                    <p className="text-xs mt-1 font-semibold" style={{ color: goal.color }}>{p}% complete</p>
                  </div>
                </div>

                {/* Progress bar */}
                <ProgressBar value={goal.current} max={goal.target} color={goal.color} className="mb-2" />

                {/* Numbers */}
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-4">
                  <span>{fmt(goal.current)} {goal.unit}</span>
                  <span>{fmt(goal.target)} {goal.unit}</span>
                </div>

                {/* Deadline */}
                {daysLeft !== null && !goal.isCompleted && (
                  <div className={`flex items-center gap-1 text-xs mb-3 ${daysLeft <= 7 ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>
                    <Calendar size={11} />
                    {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today!' : `${Math.abs(daysLeft)} days overdue`}
                  </div>
                )}

                {/* Manual progress controls (for custom goals) */}
                {!goal.isCompleted && goal.type === 'custom' && (
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => updateProgress(goal, -1)} className="btn btn-ghost border border-[var(--border)] py-1 px-3 text-sm">−</button>
                    <div className="flex-1 text-center text-sm font-semibold text-[var(--text-primary)]">{fmt(goal.current)}</div>
                    <button onClick={() => updateProgress(goal, 1)} className="btn btn-ghost border border-[var(--border)] py-1 px-3 text-sm">+</button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)] flex-1 capitalize">
                    {GOAL_TYPES.find(g => g.value === goal.type)?.label || goal.type}
                  </span>
                  <button onClick={() => deleteGoal(goal._id)} className="btn btn-danger py-1 px-2 text-xs">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Goal Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Goal">
        <div className="space-y-4">
          {/* Icon + Title */}
          <div className="flex gap-2">
            <div>
              <label className="label">Icon</label>
              <div className="grid grid-cols-6 gap-1 p-2 bg-[var(--surface-2)] rounded-lg">
                {PRESET_ICONS.map(icon => (
                  <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`text-lg p-1 rounded-md transition-all hover:bg-[var(--surface-3)] ${form.icon === icon ? 'bg-[var(--surface-3)] ring-2 ring-[var(--accent)]' : ''}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-3">
                <label className="label">Title *</label>
                <input className="input" placeholder="300 DSA Questions" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input" placeholder="Optional description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="label">Goal Type</label>
            <select className="input" value={form.type} onChange={e => handleTypeChange(e.target.value)}>
              {GOAL_TYPES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>

          {/* Target + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target *</label>
              <input type="number" className="input" min="1" placeholder="300" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input" placeholder="questions" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="label">Deadline (optional)</label>
            <input type="date" className="input" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>

          {/* Color */}
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--surface-1)] ring-white scale-110' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-[var(--surface-2)] rounded-xl flex items-center gap-3">
            <ProgressRing pct={0} size={48} stroke={4} color={form.color}>
              <span>{form.icon}</span>
            </ProgressRing>
            <div>
              <p className="font-semibold text-sm text-[var(--text-primary)]">{form.title || 'Your Goal'}</p>
              <p className="text-xs text-[var(--text-muted)]">0 / {form.target || '?'} {form.unit}</p>
            </div>
          </div>

          <button onClick={submit} disabled={saving} className="btn btn-primary w-full justify-center py-2.5">
            {saving ? 'Creating...' : '🎯 Create Goal'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
