import { clsx } from 'clsx';

// ─── Modal ────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-2xl w-full animate-fade-in overflow-hidden', wide ? 'max-w-2xl' : 'max-w-md')}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <h2 className="font-semibold text-[var(--text-primary)]">{title}</h2>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none">&times;</button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = 'var(--accent)', trend }) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18`, color }}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={clsx('text-xs font-medium', trend >= 0 ? 'text-green-400' : 'text-red-400')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--text-primary)] leading-tight">{value}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
        {sub && <p className="text-xs text-[var(--text-secondary)] mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── ProgressRing ─────────────────────────────────────
export function ProgressRing({ pct, size = 60, stroke = 5, color = 'var(--accent)', children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

// ─── ProgressBar ─────────────────────────────────────
export function ProgressBar({ value, max, color = 'var(--accent)', className }) {
  const p = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={clsx('progress-bar', className)}>
      <div className="progress-fill" style={{ width: `${p}%`, background: color }} />
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] mb-4 max-w-xs">{desc}</p>
      {action}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────
export function Badge({ children, color = 'default' }) {
  const colors = {
    default: 'bg-[var(--surface-3)] text-[var(--text-secondary)]',
    green: 'bg-green-500/15 text-green-400',
    orange: 'bg-orange-500/15 text-orange-400',
    purple: 'bg-purple-500/15 text-purple-400',
    red: 'bg-red-500/15 text-red-400',
    blue: 'bg-blue-500/15 text-blue-400',
    yellow: 'bg-yellow-500/15 text-yellow-400',
  };
  return <span className={clsx('badge', colors[color])}>{children}</span>;
}

// ─── Spinner ──────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return <div style={{ width: size, height: size }} className="border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />;
}

// ─── Tabs ─────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-[var(--surface-2)] rounded-lg w-fit">
      {tabs.map(tab => (
        <button key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx('px-3 py-1.5 rounded-md text-sm font-medium transition-all', active === tab.value ? 'bg-[var(--surface-1)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
