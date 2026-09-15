import { ShieldCheck, User, Ban } from 'lucide-react';

const MAP = {
  admin: { label: 'Admin', cls: 'bg-accent text-white border-accent', icon: ShieldCheck },
  user: { label: 'User', cls: 'bg-bg-subtle border border-app text-muted', icon: User },
  disabled: { label: 'Nonaktif', cls: 'bg-danger-soft border border-danger/20 text-danger', icon: Ban },
};

export default function RoleBadge({ role, disabled, size = 'sm', withIcon = true }) {
  const key = disabled ? 'disabled' : (role === 'admin' ? 'admin' : 'user');
  const cfg = MAP[key];
  const Icon = cfg.icon;
  const sz = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1 font-bold uppercase tracking-wide rounded-full border ${sz} ${cfg.cls}`}>
      {withIcon && <Icon size={size === 'sm' ? 10 : 12} />} {cfg.label}
    </span>
  );
}
