import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

function Center({ children }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      {children}
    </div>
  );
}

export function RequireAuth({ children }) {
  const { configured, user, isDisabled, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Center><Loader2 className="animate-spin text-accent" size={28} /></Center>;
  }
  if (isDisabled) {
    return (
      <Center>
        <div className="text-center max-w-sm px-6">
          <p className="font-bold text-lg">Akun dinonaktifkan</p>
          <p className="text-sm text-muted mt-1">Hubungi admin via halaman Bantuan untuk aktivasi kembali.</p>
        </div>
      </Center>
    );
  }
  if (!configured || !user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export function RequireAdmin({ children }) {
  const { configured, user, isAdmin, isDisabled, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Center><Loader2 className="animate-spin text-accent" size={28} /></Center>;
  }
  if (isDisabled) {
    return (
      <Center>
        <div className="text-center max-w-sm px-6">
          <p className="font-bold text-lg">Akun dinonaktifkan</p>
          <p className="text-sm text-muted mt-1">Akun admin dinonaktifkan. Hubungi pemilik sistem.</p>
        </div>
      </Center>
    );
  }
  if (!configured || !user) {
    return <Navigate to="/admin-masuk" replace state={{ from: location.pathname }} />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
