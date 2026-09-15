import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  FileText,
  Shuffle,
  BookOpen,
  Layers,
  HelpCircle,
  LifeBuoy,
  X,
  Moon,
  Sun,
  GraduationCap,
  House,
  User,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { checkHealth } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from './RoleBadge.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat', label: 'Tanya AI', icon: MessageSquareText },
  { to: '/rangkumin', label: 'Rangkumin', icon: FileText },
  { to: '/parafrase', label: 'Parafrase', icon: Shuffle },
  { to: '/referensi', label: 'Referensi', icon: BookOpen },
  { to: '/kartu-belajar', label: 'Kartu Belajar', icon: Layers },
  { to: '/quiz', label: 'Quiz', icon: HelpCircle },
  { to: '/bantuan', label: 'Bantuan', icon: LifeBuoy },
];

export default function Sidebar({ open, onClose, theme, onToggleTheme }) {
  const [health, setHealth] = useState(null);
  const { user, profile, isAdmin, isDisabled, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkHealth().then(setHealth);
    const interval = setInterval(() => checkHealth().then(setHealth), 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    await signOut();
    navigate('/', { replace: true });
  }

  const navClass = ({ isActive }) => `
    flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[14px] font-medium
    transition-colors duration-120
    ${isActive ? 'bg-accent-soft text-accent-deep' : 'text-muted hover:bg-surface-hover hover:text-main'}
  `;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-[240px]
          bg-surface border-r border-app
          flex flex-col
          transform transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:fixed
        `}
      >
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-app">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center shrink-0">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-extrabold text-[15px] tracking-tight">Ngampus AI</div>
              <div className="text-[11px] text-subtle -mt-0.5">Asisten belajar mahasiswa</div>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-1.5 -mr-1 rounded-lg hover:bg-surface-hover">
            <X size={18} />
          </button>
        </div>

        {/* User card — role aware */}
        {user && (
          <Link to="/akun" className={`mx-3 mt-3 flex items-center gap-2.5 p-2.5 rounded-[10px] border transition-colors ${isAdmin ? 'bg-ink-900 text-white border-ink-800' : 'bg-bg-subtle border-app hover:border-strong'}`}>
            <span className={`w-9 h-9 rounded-full font-extrabold text-[15px] flex items-center justify-center shrink-0 ${isAdmin ? 'bg-white text-ink-900' : 'bg-accent-soft text-accent-deep'}`}>
              {(profile?.nama || user.email || '?').charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block font-semibold text-[13px] truncate ${isAdmin ? 'text-white' : ''}`}>{profile?.nama || 'Pengguna'}</span>
              <span className={`block text-[11px] truncate ${isAdmin ? 'text-white/60' : 'text-subtle'}`}>{user.email}</span>
            </span>
            <RoleBadge role={profile?.role} disabled={isDisabled} />
          </Link>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'} className={navClass}>
                <Icon size={18} className="shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
          {isAdmin ? (
            <>
              <div className="mt-3 mb-1 px-3 text-[11px] font-bold tracking-[0.12em] text-subtle uppercase">Admin</div>
              <NavLink to="/admin" className={navClass}>
                <ShieldCheck size={18} className="shrink-0" />
                Panel Admin
              </NavLink>
            </>
          ) : null}
          <NavLink to="/akun" className={navClass}>
            <User size={18} className="shrink-0" />
            Akun Saya
          </NavLink>
        </nav>

        {/* Footer: theme + status */}
        <div className="px-3 py-3 border-t border-app space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[14px] font-medium text-muted hover:bg-surface-hover hover:text-main transition-colors"
          >
            <House size={18} />
            Beranda
          </Link>
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[14px] font-medium text-muted hover:bg-surface-hover hover:text-main transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          </button>
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[14px] font-medium text-danger hover:bg-danger-soft transition-colors"
            >
              <LogOut size={18} />
              Keluar
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5">
            <span className={`w-2 h-2 rounded-full ${health?.geminiReady ? 'bg-success' : 'bg-danger'}`} />
            <span className="text-[11px] text-subtle">
              {health?.geminiReady ? 'Gemini API siap' : 'API key belum diset'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
