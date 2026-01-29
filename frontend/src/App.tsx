import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { BookingPage } from './pages/Booking';
import { AdminDashboard } from './pages/AdminDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { ClientDashboard } from './pages/ClientDashboard';
import HelpPage from './pages/HelpPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
            <Route path="/my-reservations" element={<ClientDashboard />} />
            <Route path="/client/reservations" element={<ClientDashboard />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
