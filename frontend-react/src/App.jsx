import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookResource from './pages/BookResource';
import Resources from './pages/Resources';
import MyBookings from './pages/MyBookings';
import BookedResources from './pages/BookedResources';
import CalendarPage from './pages/Calendar';
import Analytics from './pages/Analytics';
import CampusMap from './pages/CampusMap';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';
import ClassTimetable from './pages/ClassTimetable';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/resources" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/resources' : '/book'} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: 'Inter, sans-serif', fontSize: 13, borderRadius: 12, padding: '10px 16px' },
            success: { style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' } },
            error:   { style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login"  element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />

          {/* Protected routes inside AppShell */}
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/book"          element={<BookResource />} />
            <Route path="/resources"     element={<Resources />} />
            <Route path="/my-bookings"   element={<MyBookings />} />
            <Route path="/booked"        element={<BookedResources />} />
            <Route path="/calendar"      element={<CalendarPage />} />
            <Route path="/timetable"     element={<ClassTimetable />} />
            <Route path="/analytics"     element={<Analytics />} />
            <Route path="/map"           element={<CampusMap />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/admin"         element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
