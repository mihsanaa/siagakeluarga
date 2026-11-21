import { useEffect } from 'react';

export function Button({ variant = 'primary', size, block, className = '', children, ...rest }) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size === 'sm' && 'btn-sm',
    size === 'lg' && 'btn-lg',
    block && 'btn-block',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Spinner({ label }) {
  return (
    <span className="row gap-sm" role="status">
      <span className="spinner" aria-hidden="true" />
      {label && <span>{label}</span>}
    </span>
  );
}

export function Alert({ tone = 'info', children }) {
  return <div className={`alert alert-${tone}`} role={tone === 'danger' ? 'alert' : undefined}>{children}</div>;
}

export function Badge({ tone = 'neutral', children }) {
  const cls = tone === 'neutral' ? 'badge' : `badge badge-${tone}`;
  return <span className={cls}>{children}</span>;
}

export function Card({ tone, className = '', children, ...rest }) {
  const cls = ['card', tone && `card-${tone}`, className].filter(Boolean).join(' ');
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}

export function Field({ label, hint, error, htmlFor, children }) {
  return (
    <div className="field">
      {label && (
        <label className="label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? <span className="small" style={{ color: 'var(--danger)' }}>{error}</span> : hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function Progress({ value = 0, tone }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`progress ${tone === 'navy' ? 'progress-navy' : ''}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="card center" style={{ padding: 40 }}>
      <h4>{title}</h4>
      {children && <p className="muted mt-sm">{children}</p>}
      {action && <div className="mt">{action}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-head">
          <h3 id="modal-title">{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>
        {children}
        {footer && <div className="row gap-sm mt-lg" style={{ justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <p className="small" style={{ color: 'var(--danger)' }}>{children}</p>;
}
