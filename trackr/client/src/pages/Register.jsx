import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-0)] p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="font-bold text-[var(--text-primary)]">Trackr</span>
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Create account</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">Start tracking your progress today</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" placeholder="Arjun Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5 text-base">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-[var(--text-muted)] text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--accent)] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
