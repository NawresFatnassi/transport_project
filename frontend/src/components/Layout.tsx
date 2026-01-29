
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { BusIcon, LogOutIcon, MenuIcon, UserIcon, XIcon } from './icon';

const Footer = () => (
  <footer className="bg-brand-dark text-white py-10 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <BusIcon className="h-8 w-8 text-sky-400" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-sky-400">
              Transport Manager
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Voyagez en toute sérénité à travers la Tunisie. Confort, sécurité et ponctualité garantis.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>contact@transportmanager.tn</li>
            <li>+216 71 454 121</li>
            <li>Support 24/7</li>
            <li>Tunis, Tunisie</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Informations</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-sky-400">CGV</a></li>
            <li><a href="#" className="hover:text-sky-400">Politique de confidentialité</a></li>
            <li><a href="#" className="hover:text-sky-400">FAQ</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
        &copy; 2025 Transport Manager. Tous droits réservés.
      </div>
    </div>
  </footer>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path ? 'text-white font-bold' : 'text-indigo-100 hover:text-white';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <nav className="bg-gradient-to-r from-brand-purple to-brand-purple-dark shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BusIcon className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white tracking-wide">Transport Manager</span>
            </Link>

            <div className="hidden md:flex space-x-8 items-center">
              {user?.role === UserRole.CLIENT && (
                <>
                  <Link to="/client/search" className={isActive('/client/search')}>Rechercher</Link>
                  <Link to="/client/reservations" className={isActive('/client/reservations')}>Mes Réservations</Link>
                </>
              )}
              {user?.role === UserRole.DRIVER && (
                 <Link to="/driver/dashboard" className={isActive('/driver/dashboard')}>Dashboard Chauffeur</Link>
              )}
              {user?.role === UserRole.ADMIN && (
                 <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>Dashboard Admin</Link>
              )}

              {user ? (
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-indigo-400">
                  <div className="flex items-center text-white space-x-2">
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <UserIcon size={18} />
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-indigo-100 hover:text-white transition-colors"
                  >
                    <LogOutIcon size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link to="/login" className="text-white hover:text-indigo-100 font-medium px-3 py-2">Connexion</Link>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                {mobileMenuOpen ? <XIcon className="h-7 w-7" /> : <MenuIcon className="h-7 w-7" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-indigo-800 px-4 pt-2 pb-4 space-y-2">
             {user ? (
                <>
                  {user.role === UserRole.CLIENT && <Link to="/client/search" className="block text-white py-2">Rechercher</Link>}
                  {user.role === UserRole.CLIENT && <Link to="/client/reservations" className="block text-white py-2">Mes Réservations</Link>}
                  {user.role === UserRole.DRIVER && <Link to="/driver/dashboard" className="block text-white py-2">Dashboard</Link>}
                  {user.role === UserRole.ADMIN && <Link to="/admin/dashboard" className="block text-white py-2">Admin</Link>}
                  <button onClick={handleLogout} className="block text-red-300 w-full text-left py-2">Déconnexion</button>
                </>
             ) : (
               <>
                <Link to="/login" className="block text-white py-2">Connexion</Link>
               </>
             )}
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
};
