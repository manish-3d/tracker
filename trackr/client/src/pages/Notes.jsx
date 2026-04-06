import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Pin, Trash2, FolderOpen, Tag, Edit3 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { PageHeader, EmptyState, Spinner } from '../components/ui';

const NOTE_COLORS = ['', '#7c6fcd', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export default function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeFolder, setActiveFolder] = useState('');

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (activeCategory) params.category = activeCategory;
      if (activeFolder) params.folder = activeFolder;
      const [notesRes, catsRes] = await Promise.all([
        api.get('/notes', { params }),
        api.get('/notes/categories'),
      ]);
      setNotes(notesRes.data.notes);
      setCategories(catsRes.data.categories);
      setFolders(catsRes.data.folders);
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, [search, activeCategory, activeFolder]);

  const deleteNote = async (id, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(n => n.filter(x => x._id !== id));
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const togglePin = async (note, e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const { data } = await api.put(`/notes/${note._id}`, { isPinned: !note.isPinned });
      setNotes(n => n.map(x => x._id === note._id ? data.note : x));
    } catch { toast.error('Failed to update'); }
  };

  const pinned = notes.filter(n => n.isPinned);
  const unpinned = notes.filter(n => !n.isPinned);

  return (
    <div className="flex gap-6 h-[calc(100vh-48px)]">
      {/* Sidebar */}
      <div className="w-48 shrink-0 flex flex-col gap-4">
        <div>
          <p className="label">Folders</p>
          <div className="space-y-0.5">
            <button onClick={() => setActiveFolder('')}
              className={`sidebar-link w-full text-left ${!activeFolder ? 'active' : ''}`}>
              <FolderOpen size={15} /> All Notes
            </button>
            {folders.map(f => (
              <button key={f} onClick={() => setActiveFolder(f === activeFolder ? '' : f)}
                className={`sidebar-link w-full text-left ${activeFolder === f ? 'active' : ''}`}>
                <FolderOpen size={15} /> {f}
              </button>
            ))}
          </div>
        </div>
        {categories.length > 0 && (
          <div>
            <p className="label">Categories</p>
            <div className="space-y-0.5">
              {categories.map(c => (
                <button key={c} onClick={() => setActiveCategory(c === activeCategory ? '' : c)}
                  className={`sidebar-link w-full text-left ${activeCategory === c ? 'active' : ''}`}>
                  <Tag size={15} /> {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <PageHeader
          title="Notes"
          subtitle={`${notes.length} note${notes.length !== 1 ? 's' : ''}`}
          actions={
            <Link to="/notes/new" className="btn btn-primary">
              <Plus size={16} /> New Note
            </Link>
          }
        />

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input className="input pl-9" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1"><Spinner size={28} /></div>
        ) : notes.length === 0 ? (
          <EmptyState icon="📝" title="No notes yet" desc="Create your first note to start documenting your journey."
            action={<Link to="/notes/new" className="btn btn-primary"><Plus size={16} />New Note</Link>} />
        ) : (
          <div className="overflow-y-auto flex-1 space-y-4">
            {pinned.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1"><Pin size={11} /> Pinned</p>
                <NoteGrid notes={pinned} onDelete={deleteNote} onPin={togglePin} />
              </div>
            )}
            {unpinned.length > 0 && (
              <div>
                {pinned.length > 0 && <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 mt-4">Other</p>}
                <NoteGrid notes={unpinned} onDelete={deleteNote} onPin={togglePin} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NoteGrid({ notes, onDelete, onPin }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {notes.map(note => (
        <Link key={note._id} to={`/notes/${note._id}`}
          className="card p-4 hover:border-[var(--accent)]/40 transition-all group block relative animate-fade-in"
          style={note.color ? { borderLeft: `3px solid ${note.color}` } : {}}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-tight truncate">{note.title}</h3>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button onClick={e => onPin(note, e)} className="p-1 rounded hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--accent)]">
                <Pin size={13} className={note.isPinned ? 'text-[var(--accent)]' : ''} />
              </button>
              <button onClick={e => onDelete(note._id, e)} className="p-1 rounded hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3 leading-relaxed">
            {note.content.replace(/[#*`\[\]]/g, '').slice(0, 120) || 'No content'}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {note.category && <span className="badge bg-[var(--surface-3)] text-[var(--text-muted)]">{note.category}</span>}
            {note.tags?.slice(0, 2).map(t => <span key={t} className="badge bg-[var(--accent-muted)] text-[var(--accent)]">#{t}</span>)}
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-2">
            {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </Link>
      ))}
    </div>
  );
}
