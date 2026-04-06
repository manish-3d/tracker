import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, BookOpen, Dumbbell, Target,
  CalendarDays, LogOut, Sun, Moon, ChevronLeft, ChevronRight,
  Zap, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/notes', icon: FileText, label: 'Notes' },
  { to: '/study', icon: BookOpen, label: 'Study' },
  { to: '/gym', icon: Dumbbell, label: 'Gym' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/daily', icon: CalendarDays, label: 'Daily Log' },
];

export default function Sidebar({ open, onToggle }) {
  const { user, logout, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <aside
      className="relative flex flex-col border-r border-[var(--border)] bg-[var(--surface-1)] transition-all duration-200 shrink-0"
      style={{ width: open ? 220 : 60 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-[var(--border)] shrink-0">
        <div className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center shrink-0">
          <TrendingUp size={14} className="text-white" />
        </div>
        {open && <span className="font-bold text-base tracking-tight text-[var(--text-primary)]">Trackr</span>}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[72px] w-6 h-6 bg-[var(--surface-2)] border border-[var(--border)] rounded-full flex items-center justify-center z-10 hover:bg-[var(--surface-3)] transition-colors"
      >
        {open ? <ChevronLeft size={12} className="text-[var(--text-muted)]" /> : <ChevronRight size={12} className="text-[var(--text-muted)]" />}
      </button>

      {/* Streak badge */}
      {open && user?.streak > 0 && (
        <div className="mx-3 mt-3 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center gap-2">
          <Zap size={14} className="text-orange-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-orange-400">{user.streak} day streak</p>
            <p className="text-[10px] text-[var(--text-muted)]">Keep it up!</p>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''} ${!open ? 'justify-center px-0' : ''}`
            }
            title={!open ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {open && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 pb-4 space-y-0.5 border-t border-[var(--border)] pt-3">
        <button onClick={toggleTheme} className={`sidebar-link w-full ${!open ? 'justify-center px-0' : ''}`} title="Toggle theme">
          {user?.theme === 'dark' ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          {open && <span>Toggle theme</span>}
        </button>
        <button onClick={handleLogout} className={`sidebar-link w-full text-red-400 hover:text-red-400 hover:bg-red-500/10 ${!open ? 'justify-center px-0' : ''}`} title="Logout">
          <LogOut size={18} className="shrink-0" />
          {open && <span>Logout</span>}
        </button>

        {/* Avatar */}
        {open && (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-2 rounded-lg bg-[var(--surface-2)]">
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user?.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
