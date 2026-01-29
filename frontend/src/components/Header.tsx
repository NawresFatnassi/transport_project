import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BusIcon, QuestionMarkCircleIcon } from './icon';

interface HeaderProps {
    title: string;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="relative bg-gradient-to-r from-brand-purple to-blue-500 text-white shadow-md p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                        <BusIcon className="w-6 h-6 text-white"/>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Transport Manager</h1>
                        <p className="text-sm opacity-90">{title}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    {children}
                    <div className="flex items-center space-x-2">
                        {user && (
                            <>
                                <span className="hidden sm:block font-medium">{user.email}</span>
                                <button 
                                    onClick={handleLogout} 
                                    className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Déconnexion
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Help button positioned inside header to ensure visibility */}
                <Link
                    to="/help"
                    aria-label="Guide d'utilisation"
                    className="fixed right-6 top-4 z-[9999] flex items-center gap-2 bg-white text-indigo-700 px-3 py-2 rounded-full shadow-lg border"
                    style={{ pointerEvents: 'auto' }}
                >
                    <QuestionMarkCircleIcon className="w-5 h-5 text-indigo-700" />
                    <span className="inline">Aide</span>
                </Link>
            </div>
        </header>
    );
};

export default Header;