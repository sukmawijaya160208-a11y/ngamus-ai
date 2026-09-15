import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { RequireAuth, RequireAdmin } from './components/guards.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Chat from './pages/Chat.jsx';
import Rangkumin from './pages/Rangkumin.jsx';
import Parafrase from './pages/Parafrase.jsx';
import Referensi from './pages/Referensi.jsx';
import KartuBelajar from './pages/KartuBelajar.jsx';
import Quiz from './pages/Quiz.jsx';
import Bantuan from './pages/Bantuan.jsx';
import Auth from './pages/Auth.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import Akun from './pages/Akun.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ngampus-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('ngampus-theme', theme);
  }, [theme]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const standaloneRoutes = ['/', '/auth', '/masuk', '/daftar', '/admin-masuk'];
  const isStandalone = standaloneRoutes.includes(location.pathname);

  if (isStandalone) {
    return (
      <AuthProvider>
        <div className="bg-app text-main min-h-screen">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-masuk" element={<AdminLogin />} />
            <Route path="/masuk" element={<Navigate to="/auth" replace />} />
            <Route path="/daftar" element={<Navigate to="/auth?mode=daftar" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
    <div className="bg-app text-main min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[240px]">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-20 bg-surface border-b border-app px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-surface-hover focus-ring"
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-[15px]">Ngampus AI</span>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
            <Route path="/rangkumin" element={<RequireAuth><Rangkumin /></RequireAuth>} />
            <Route path="/parafrase" element={<RequireAuth><Parafrase /></RequireAuth>} />
            <Route path="/referensi" element={<RequireAuth><Referensi /></RequireAuth>} />
            <Route path="/kartu-belajar" element={<RequireAuth><KartuBelajar /></RequireAuth>} />
            <Route path="/quiz" element={<RequireAuth><Quiz /></RequireAuth>} />
            <Route path="/bantuan" element={<RequireAuth><Bantuan /></RequireAuth>} />
            <Route path="/akun" element={<RequireAuth><Akun /></RequireAuth>} />
            <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
          </Routes>
        </main>
      </div>
    </div>
    </AuthProvider>
  );
}
