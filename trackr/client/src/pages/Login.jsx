import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const fillDemo = () => setForm({ email: 'demo@trackr.app', password: 'Demo@123' });

  return (
    <div className="min-h-screen flex bg-[var(--surface-0)]">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-[var(--surface-1)] border-r border-[var(--border)] p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-[var(--text-primary)]">Trackr</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-[var(--text-primary)] leading-tight mb-4">
            Your personal<br />command center.
          </h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Track study sessions, gym workouts, goals, and daily logs all in one place. Stay consistent. Build streaks. Grow.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[['📚', 'Study Tracker', 'Log questions & time'], ['💪', 'Gym Logger', 'Sets, reps, progress'], ['🎯', 'Goals', 'Auto-tracked progress'], ['🔥', 'Streaks', 'Daily consistency']].map(([icon, title, desc]) => (
              <div key={title} className="p-3 rounded-xl bg-[var(--surface-2)]">
                <p className="text-xl mb-1">{icon}</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
                <p className="text-xs text-[var(--text-muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">© 2025 Trackr. Built for builders.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="font-bold text-[var(--text-primary)]">Trackr</span>
          </div>

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Sign in</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">Enter your credentials to continue</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5 text-base">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-[var(--surface-2)] rounded-xl">
            <p className="text-xs text-[var(--text-muted)] mb-2">Try the demo account:</p>
            <button onClick={fillDemo} className="btn btn-ghost border border-[var(--border)] w-full justify-center text-sm py-2">
              🚀 Fill Demo Credentials
            </button>
          </div>

          <p className="text-sm text-[var(--text-muted)] text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--accent)] font-medium hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
