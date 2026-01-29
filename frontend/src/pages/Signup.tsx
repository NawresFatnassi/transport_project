import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockSignup } from '../services/mockDb';
import { UserRole } from '../types';

export const Signup = () => {
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', licenseNumber: '', city: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const newUser = await mockSignup({
        ...formData,
        role: role,
        // Simulation: assignation automatique d'un bus pour la démo chauffeur
        assignedBusId: role === UserRole.DRIVER ? 'bus-1' : undefined 
      });
      login(newUser);
      navigate(role === UserRole.DRIVER ? '/driver-dashboard' : '/');
    } catch (err: any) {
      setError(err.message || "Erreur d'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">Créer un compte</h2>
        
        {/* Custom Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              role === UserRole.CLIENT 
                ? 'bg-white shadow-sm text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setRole(UserRole.CLIENT)}
          >
            Passager
          </button>
          <button
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
              role === UserRole.DRIVER 
                ? 'bg-white shadow-sm text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setRole(UserRole.DRIVER)}
          >
            Chauffeur
          </button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>}
          
          <input
            type="text" 
            placeholder="Nom complet" 
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input
            type="email" 
            placeholder="Email" 
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="tel" 
            placeholder="Téléphone" 
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
          <input
            type="password" 
            placeholder="Mot de passe" 
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})}
          />

          {role === UserRole.DRIVER && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <input
                type="text" 
                placeholder="Numéro de Permis" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                value={formData.licenseNumber} 
                onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
              />
               <input
                type="text" 
                placeholder="Ville" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400"
                value={formData.city} 
                onChange={e => setFormData({...formData, city: e.target.value})}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#4F46E5] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-6"
          >
            {isLoading ? 'Chargement...' : 'S\'inscrire'}
          </button>
          
          <div className="text-center mt-6">
             <span className="text-sm text-gray-600">Déjà inscrit ? </span>
             <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Se connecter</Link>
          </div>
        </form>
      </div>
    </div>
  );
};