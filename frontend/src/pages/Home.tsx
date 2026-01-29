import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, ArrowRight, Clock, Star } from 'lucide-react';
import { getTrips } from '../services/mockDb';
import { Trip } from '../types';

export const Home = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [popularTrips, setPopularTrips] = useState<Trip[]>([]);

  useEffect(() => {
    const loadPopular = async () => {
      const all = await getTrips();
      setPopularTrips(all.slice(0, 3));
    };
    loadPopular();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.append('origin', origin);
    if (destination) params.append('destination', destination);
    if (date) params.append('date', date);
    navigate(`/booking?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-brand-start to-brand-end pb-36 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Votre voyage commence ici
          </h1>
          <p className="text-indigo-100 text-lg md:text-xl max-w-3xl mx-auto mb-12 opacity-95">
            Réservez vos tickets de bus en ligne facilement — confort, sécurité et les meilleurs tarifs en Tunisie.
          </p>

          {/* Search Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto transform translate-y-10">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1 text-left">Départ</label>
                <div className="relative">
                  <div className="absolute left-3 top-2 flex items-center justify-center w-9 h-9 bg-indigo-50 rounded-md">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ville de départ"
                    className="pl-14 w-full rounded-xl border-gray-200 border p-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1 text-left">Arrivée</label>
                <div className="relative">
                  <div className="absolute left-3 top-2 flex items-center justify-center w-9 h-9 bg-indigo-50 rounded-md">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Ville d'arrivée"
                    className="pl-14 w-full rounded-xl border-gray-200 border p-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1 text-left">Date</label>
                <div className="relative">
                  <div className="absolute left-3 top-2 flex items-center justify-center w-9 h-9 bg-indigo-50 rounded-md">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                  </div>
                  <input
                    type="date"
                    className="pl-14 w-full rounded-xl border-gray-200 border p-3 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="col-span-1 md:col-span-1">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>Rechercher</span>
                </button>
              </div>
            </form>
            <div className="mt-3 text-sm text-gray-500">Entrez vos informations pour trouver les meilleurs trajets disponibles.</div>
          </div>
        </div>

        {/* Abstract Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute top-0 left-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
        </div>
      </div>

      {/* Popular Trips */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Star className="text-yellow-400 mr-2 fill-current" />
            Trajets Populaires
          </h2>
          <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center">
            Voir tout <ArrowRight className="h-4 w-4 ml-1" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {popularTrips.map((trip, idx) => (
            <div key={trip._id ?? `popular-${idx}`} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-50">
              <div className="h-40 bg-gray-200 relative">
                 <img src={`https://picsum.photos/seed/${trip.destination}/900/400`} alt={trip.destination} className="w-full h-full object-cover" />
                 <div className="absolute top-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">{trip.price} TND</div>
                 <div className="absolute top-3 right-3 bg-white/80 px-2 py-1 rounded-md text-xs font-medium text-gray-800">{trip.seatsLeft ?? '—'} sièges</div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{trip.origin} → {trip.destination}</h3>
                    <p className="text-gray-500 text-sm mt-1">{new Date(trip.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Durée</div>
                    <div className="text-base font-semibold">{trip.duration ?? '—'}</div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  {trip.departureTime} - {trip.arrivalTime}
                </div>
                <button 
                  onClick={() => navigate(`/booking?tripId=${trip._id ?? idx}`)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow hover:scale-[1.01] transition-transform duration-200 text-sm flex items-center justify-center space-x-2"
                >
                  <span>Réserver maintenant</span>
                  <ArrowRight className="h-4 w-4 opacity-90" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-2xl shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <Clock size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">Ponctualité</h3>
              <p className="text-gray-500">Départs et arrivées respectés, avec suivi en temps réel.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <Star size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">Confort</h3>
              <p className="text-gray-500">Bus modernes climatisés et sièges confortables pour un trajet agréable.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <MapPin size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">Couverture</h3>
              <p className="text-gray-500">Un large réseau couvrant plus de 50 destinations en Tunisie.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};