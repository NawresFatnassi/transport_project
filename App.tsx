
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { type UserRole } from './types';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/client/SearchPage';
import MyReservationsPage from './pages/client/MyReservationsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import FleetManagementPage from './pages/admin/FleetManagementPage';
import DriverManagementPage from './pages/admin/DriverManagementPage';
import DriverDashboard from './pages/driver/DriverDashboard';
import ScanTicketPage from './pages/driver/ScanTicketPage';
import HelpPage from './pages/HelpPage';
import { BusIcon } from './components/icons';
import AdminLayout from './pages/admin/AdminLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';

// --- Protected Route Component ---
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: UserRole[] }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};


// --- Main App Component ---
const App: React.FC = () => {
  return (
    <AuthProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route path="/" element={<HomeRedirect />} />
              
              {/* Help Route - Accessible to all */}
              <Route path="/help" element={<HelpPage />} />

              {/* Client Routes */}
              <Route element={<ProtectedRoute allowedRoles={[UserRole.CLIENT]} />}>
                  <Route path="/client/search" element={<SearchPage />} />
                  <Route path="/client/reservations" element={<MyReservationsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                  <Route element={<AdminLayout />}>
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="/admin/buses" element={<FleetManagementPage />} />
                      <Route path="/admin/drivers" element={<DriverManagementPage />} />
                  </Route>
              </Route>

              {/* Driver Routes */}
              <Route element={<ProtectedRoute allowedRoles={[UserRole.DRIVER]} />}>
                  <Route path="/driver/dashboard" element={<DriverDashboard />} />
                  <Route path="/driver/scan" element={<ScanTicketPage />} />
              </Route>
              
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </HashRouter>
    </AuthProvider>
  );
};

// Helper component to use auth context for redirect
const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
      case UserRole.ADMIN: return <Navigate to="/admin/dashboard" />;
      case UserRole.CLIENT: return <Navigate to="/client/search" />;
      case UserRole.DRIVER: return <Navigate to="/driver/dashboard" />;
      default: return <Navigate to="/login" />;
  }
};

const UnauthorizedPage = () => (
    <div className="flex flex-col items-center justify-center h-full py-20">
        <BusIcon className="w-24 h-24 text-brand-purple" />
        <h1 className="text-4xl font-bold mt-4 text-slate-700">Accès non autorisé</h1>
        <p className="text-slate-500 mt-2">Vous n'avez pas la permission d'accéder à cette page.</p>
        <a href="/" className="mt-6 px-6 py-2 bg-brand-purple text-white rounded-lg shadow hover:bg-brand-purple-dark transition-colors">
            Retour à l'accueil
        </a>
    </div>
);


export default App;
