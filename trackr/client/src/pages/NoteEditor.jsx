import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Pin, Trash2, Eye, Edit3 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Spinner } from '../components/ui';

// Simple markdown renderer (no external dep needed)
function renderMd(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2 text-[var(--text-primary)]">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-5 mb-2 text-[var(--text-primary)]">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3 text-[var(--text-primary)]">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[var(--text-primary)]">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-[var(--surface-3)] rounded text-sm font-mono text-[var(--accent)]">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-[var(--surface-3)] rounded-lg p-4 my-3 overflow-x-auto text-sm font-mono"><code>$1</code></pre>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4 list-disc text-[var(--text-secondary)] my-0.5">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-[var(--text-secondary)] my-0.5">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-[var(--accent)] underline" target="_blank">$1</a>')
    .replace(/^\| (.+)$/gm, (_, row) => `<tr>${row.split('|').map(c => `<td class="border border-[var(--border)] px-3 py-1.5 text-sm">${c.trim()}</td>`).join('')}</tr>`)
    .replace(/\n\n/g, '</p><p class="my-2 text-[var(--text-secondary)]">')
    .replace(/^(?!<[h1-6|pre|li|tr])(.+)$/gm, '<p class="my-1 text-[var(--text-secondary)] leading-relaxed">$1</p>');
}

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [note, setNote] = useState({ title: '', content: '', category: 'General', folder: 'Root', tags: '', isPinned: false, color: '' });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('split'); // 'edit' | 'preview' | 'split'

  useEffect(() => {
    if (!isNew) {
      api.get(`/notes/${id}`)
        .then(r => setNote({ ...r.data.note, tags: r.data.note.tags?.join(', ') || '' }))
        .catch(() => { toast.error('Note not found'); navigate('/notes'); })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const save = async () => {
    if (!note.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = { ...note, tags: note.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (isNew) {
        const { data } = await api.post('/notes', payload);
        toast.success('Note created!');
        navigate(`/notes/${data.note._id}`, { replace: true });
      } else {
        await api.put(`/notes/${id}`, payload);
        toast.success('Saved!');
      }
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const deleteNote = async () => {
    if (!confirm('Delete this note?')) return;
    await api.delete(`/notes/${id}`);
    toast.success('Deleted');
    navigate('/notes');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size={28} /></div>;

  const COLORS = ['', '#7c6fcd', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <button onClick={() => navigate('/notes')} className="btn btn-ghost gap-1.5 px-2">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex-1 min-w-0">
          <input
            className="w-full text-xl font-bold bg-transparent border-0 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            placeholder="Note title..."
            value={note.title}
            onChange={e => setNote(n => ({ ...n, title: e.target.value }))}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* View mode */}
          <div className="flex gap-1 p-1 bg-[var(--surface-2)] rounded-lg">
            {[['edit', <Edit3 size={13} />], ['split', '⬜'], ['preview', <Eye size={13} />]].map(([m, icon]) => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-2 py-1 rounded text-xs transition-all ${mode === m ? 'bg-[var(--surface-1)] text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                {icon}
              </button>
            ))}
          </div>
          {!isNew && (
            <button onClick={deleteNote} className="btn btn-danger p-2"><Trash2 size={15} /></button>
          )}
          <button onClick={save} disabled={saving} className="btn btn-primary">
            <Save size={15} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-muted)]">Category:</label>
          <input className="input py-1 text-xs w-28" value={note.category} onChange={e => setNote(n => ({ ...n, category: e.target.value }))} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-muted)]">Folder:</label>
          <input className="input py-1 text-xs w-24" value={note.folder} onChange={e => setNote(n => ({ ...n, folder: e.target.value }))} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-muted)]">Tags:</label>
          <input className="input py-1 text-xs w-40" placeholder="dsa, arrays..." value={note.tags} onChange={e => setNote(n => ({ ...n, tags: e.target.value }))} />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-[var(--text-muted)]">Color:</label>
          {COLORS.map(c => (
            <button key={c} onClick={() => setNote(n => ({ ...n, color: c }))}
              className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${note.color === c ? 'border-[var(--text-primary)] scale-110' : 'border-transparent'}`}
              style={{ background: c || 'var(--surface-3)' }} />
          ))}
        </div>
        <button onClick={() => setNote(n => ({ ...n, isPinned: !n.isPinned }))}
          className={`btn p-1.5 ${note.isPinned ? 'btn-primary' : 'btn-ghost'}`}>
          <Pin size={14} />
        </button>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            className="flex-1 input resize-none font-mono text-sm leading-relaxed"
            placeholder="Write in markdown..."
            value={note.content}
            onChange={e => setNote(n => ({ ...n, content: e.target.value }))}
            style={{ fontFamily: 'DM Mono, monospace' }}
          />
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div
            className="flex-1 card p-5 overflow-y-auto prose-custom"
            dangerouslySetInnerHTML={{ __html: renderMd(note.content || '_Nothing to preview yet..._') }}
          />
        )}
      </div>
    </div>
  );
}
