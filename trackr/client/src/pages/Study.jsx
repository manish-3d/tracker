import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, BookOpen, Clock, Hash, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { fmt, fmtTime, fmtDate, COLORS } from '../lib/utils';
import { Modal, StatCard, PageHeader, EmptyState, Spinner, Tabs } from '../components/ui';

const SUBJECTS = ['DSA', 'System Design', 'OS', 'DBMS', 'Networks', 'Web Dev', 'Math', 'Other'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DIFF_COLOR = { easy: COLORS.green, medium: COLORS.yellow, hard: COLORS.red };

const defaultForm = () => ({ subject: 'DSA', topics: [{ name: '', questionssolved: 0, timeSpent: 0 }], totalQuestions: 0, totalTime: 0, notes: '', difficulty: 'medium', date: new Date().toISOString().split('T')[0] });

export default function Study() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('overview');
  const [expandedLog, setExpandedLog] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes, subRes] = await Promise.all([
        api.get('/study/logs'),
        api.get('/study/stats'),
        api.get('/study/subjects'),
      ]);
      setLogs(logsRes.data.logs);
      setStats(statsRes.data);
      setSubjects(subRes.data.subjects);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const addTopic = () => setForm(f => ({ ...f, topics: [...f.topics, { name: '', questionssolved: 0, timeSpent: 0 }] }));
  const updateTopic = (i, field, val) => {
    const topics = [...form.topics];
    topics[i] = { ...topics[i], [field]: val };
    const totalQ = topics.reduce((s, t) => s + (+t.questionssolved || 0), 0);
    const totalTime = topics.reduce((s, t) => s + (+t.timeSpent || 0), 0);
    setForm(f => ({ ...f, topics, totalQuestions: totalQ, totalTime }));
  };

  const submit = async () => {
    if (!form.subject) { toast.error('Select a subject'); return; }
    setSaving(true);
    try {
      await api.post('/study/logs', form);
      toast.success('Study session logged! 📚');
      setShowModal(false);
      setForm(defaultForm());
      fetchAll();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const deleteLog = async (id) => {
    if (!confirm('Delete this log?')) return;
    await api.delete(`/study/logs/${id}`);
    setLogs(l => l.filter(x => x._id !== id));
    toast.success('Deleted');
  };

  // Chart data
  const chartData = Object.entries(stats?.dailyMap || {}).slice(-14).map(([date, d]) => ({
    date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    questions: d.questions,
    time: Math.round(d.time / 60 * 10) / 10,
  }));

  const pieData = stats?.bySubject?.map(s => ({ name: s._id, value: s.totalQ })) || [];
  const PIE_COLORS = [COLORS.accent, COLORS.orange, COLORS.green, COLORS.blue, COLORS.yellow, COLORS.red];

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={28} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Tracker"
        subtitle="Track your learning progress"
        actions={
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={16} /> Log Session
          </button>
        }
      />

      <Tabs
        tabs={[{ value: 'overview', label: 'Overview' }, { value: 'logs', label: 'Session History' }]}
        active={tab} onChange={setTab}
      />

      {tab === 'overview' && (
        <div className="space-y-4 animate-fade-in">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Hash size={18} />} label="Total Questions" value={fmt(stats?.allTime?.totalQ)} color={COLORS.accent} />
            <StatCard icon={<Clock size={18} />} label="Total Study Time" value={fmtTime(stats?.allTime?.totalTime)} color={COLORS.blue} />
            <StatCard icon={<BookOpen size={18} />} label="Sessions" value={fmt(stats?.allTime?.sessions)} color={COLORS.green} />
            <StatCard icon={<BookOpen size={18} />} label="Subjects" value={fmt(subjects.length)} color={COLORS.orange} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Questions Solved (14 days)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="questions" name="Questions" stroke={COLORS.accent} fill="url(#studyGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">By Subject</h3>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-[var(--text-secondary)]">{d.name}</span>
                        </div>
                        <span className="font-semibold text-[var(--text-primary)]">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p className="text-sm text-[var(--text-muted)] text-center py-8">No data yet</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="space-y-2 animate-fade-in">
          {logs.length === 0 ? (
            <EmptyState icon="📚" title="No sessions logged" desc="Log your first study session to start tracking."
              action={<button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} />Log Session</button>} />
          ) : logs.map(log => (
            <div key={log._id} className="card p-4 hover:border-[var(--accent)]/30 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${COLORS.accent}18` }}>
                    <BookOpen size={16} style={{ color: COLORS.accent }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[var(--text-primary)]">{log.subject}</span>
                      <span className="badge text-[10px]" style={{ background: `${DIFF_COLOR[log.difficulty]}18`, color: DIFF_COLOR[log.difficulty] }}>{log.difficulty}</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{fmtDate(log.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-sm text-[var(--accent)]">{log.totalQuestions} <span className="text-[var(--text-muted)] font-normal">Qs</span></p>
                    <p className="text-xs text-[var(--text-muted)]">{fmtTime(log.totalTime)}</p>
                  </div>
                  <button onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)} className="btn btn-ghost p-1.5">
                    {expandedLog === log._id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <button onClick={() => deleteLog(log._id)} className="btn btn-danger p-1.5"><Trash2 size={14} /></button>
                </div>
              </div>
              {expandedLog === log._id && log.topics?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
                  {log.topics.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-[var(--surface-2)] rounded-lg px-3 py-2">
                      <span className="text-[var(--text-secondary)]">{t.name || 'Topic'}</span>
                      <div className="flex gap-4 text-[var(--text-muted)]">
                        <span>{t.questionssolved} Qs</span>
                        <span>{fmtTime(t.timeSpent)}</span>
                      </div>
                    </div>
                  ))}
                  {log.notes && <p className="text-xs text-[var(--text-muted)] italic px-1">{log.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Log Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Study Session" wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Subject</label>
              <select className="input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                  className={`btn flex-1 capitalize text-sm py-1.5 ${form.difficulty === d ? 'btn-primary' : 'btn-ghost border border-[var(--border)]'}`}
                  style={form.difficulty === d ? { background: DIFF_COLOR[d] } : {}}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label mb-0">Topics</label>
              <button onClick={addTopic} className="btn btn-ghost text-xs py-1 px-2"><Plus size={12} />Add Topic</button>
            </div>
            <div className="space-y-2">
              {form.topics.map((t, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 bg-[var(--surface-2)] p-2.5 rounded-lg">
                  <input className="input col-span-3 py-1.5 text-sm" placeholder="Topic name (e.g. Arrays)" value={t.name} onChange={e => updateTopic(i, 'name', e.target.value)} />
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] mb-1">Questions</p>
                    <input type="number" className="input py-1.5 text-sm" min="0" value={t.questionssolved} onChange={e => updateTopic(i, 'questionssolved', +e.target.value)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] mb-1">Time (mins)</p>
                    <input type="number" className="input py-1.5 text-sm" min="0" value={t.timeSpent} onChange={e => updateTopic(i, 'timeSpent', +e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-3 bg-[var(--surface-2)] rounded-lg">
            <div className="text-center">
              <p className="text-xl font-bold text-[var(--accent)]">{form.totalQuestions}</p>
              <p className="text-xs text-[var(--text-muted)]">Total Questions</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[var(--accent)]">{fmtTime(form.totalTime)}</p>
              <p className="text-xs text-[var(--text-muted)]">Total Time</p>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="What did you learn today?" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <button onClick={submit} disabled={saving} className="btn btn-primary w-full justify-center py-2.5">
            {saving ? 'Saving...' : '📚 Log Session'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
