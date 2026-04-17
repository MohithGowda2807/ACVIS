import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import AppLayout from '@/components/layout/AppLayout';

// Public pages
import Home from '@/pages/public/Home';

// Auth pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Company pages
import Overview from '@/pages/company/Overview';
import Analyze from '@/pages/company/Analyze';
import Features from '@/pages/company/Features';
import Trends from '@/pages/company/Trends';
import Alerts from '@/pages/company/Alerts';
import Actions from '@/pages/company/Actions';
import Reports from '@/pages/company/Reports';
import SettingsPage from '@/pages/company/Settings';

// User pages
import SubmitReview from '@/pages/user/SubmitReview';
import MyReviews from '@/pages/user/MyReviews';
import ProductInsights from '@/pages/user/ProductInsights';

function ProtectedRoute({ children, allowedRole }: { children: JSX.Element, allowedRole: string }) {
  const { token, role } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (allowedRole === 'company' && role !== 'company') {
    return <Navigate to="/user" replace />;
  }
  if (allowedRole === 'user' && role !== 'user') {
    return <Navigate to="/company" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<AppLayout />}>
          {/* Company Portal */}
          <Route path="/company" element={<ProtectedRoute allowedRole="company"><Overview /></ProtectedRoute>} />
          <Route path="/company/analyze" element={<ProtectedRoute allowedRole="company"><Analyze /></ProtectedRoute>} />
          <Route path="/company/features" element={<ProtectedRoute allowedRole="company"><Features /></ProtectedRoute>} />
          <Route path="/company/trends" element={<ProtectedRoute allowedRole="company"><Trends /></ProtectedRoute>} />
          <Route path="/company/alerts" element={<ProtectedRoute allowedRole="company"><Alerts /></ProtectedRoute>} />
          <Route path="/company/actions" element={<ProtectedRoute allowedRole="company"><Actions /></ProtectedRoute>} />
          <Route path="/company/reports" element={<ProtectedRoute allowedRole="company"><Reports /></ProtectedRoute>} />
          <Route path="/company/settings" element={<ProtectedRoute allowedRole="company"><SettingsPage /></ProtectedRoute>} />

          {/* User Portal */}
          <Route path="/user" element={<ProtectedRoute allowedRole="user"><SubmitReview /></ProtectedRoute>} />
          <Route path="/user/my-reviews" element={<ProtectedRoute allowedRole="user"><MyReviews /></ProtectedRoute>} />
          <Route path="/user/insights" element={<ProtectedRoute allowedRole="user"><ProductInsights /></ProtectedRoute>} />

        </Route>
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
