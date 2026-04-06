import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import NoteEditor from './pages/NoteEditor';
import Study from './pages/Study';
import Gym from './pages/Gym';
import Goals from './pages/Goals';
import DailyLog from './pages/DailyLog';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--surface-0)]">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: '14px' },
            success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
            error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="notes" element={<Notes />} />
            <Route path="notes/new" element={<NoteEditor />} />
            <Route path="notes/:id" element={<NoteEditor />} />
            <Route path="study" element={<Study />} />
            <Route path="gym" element={<Gym />} />
            <Route path="goals" element={<Goals />} />
            <Route path="daily" element={<DailyLog />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
