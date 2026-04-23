import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ReportItemPage from './pages/ReportItemPage';
import ItemDetailPage from './pages/ItemDetailPage';
import MyItemsPage from './pages/MyItemsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout><DashboardPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <AppLayout><ReportItemPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/items/:id"
                element={
                  <ProtectedRoute>
                    <AppLayout><ItemDetailPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-items"
                element={
                  <ProtectedRoute>
                    <AppLayout><MyItemsPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <AppLayout><NotificationsPage /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin-only route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AppLayout><AdminDashboardPage /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
