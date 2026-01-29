import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDriverTrips, validateTicket, getTripById } from '../services/mockDb';
import { Trip, Booking } from '../types';
import jsQR from 'jsqr';
import { Users, CheckCircle, Clock, QrCode, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const DriverDashboard = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [scanResult, setScanResult] = useState<{status: string, message: string, booking?: Booking} | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [activeTab, setActiveTab] = useState<'trips' | 'scan'>('trips');

  useEffect(() => {
    if (user) {
      getDriverTrips(user.id).then(setTrips);
    }
  }, [user]);

  // Chart Data Mock
  const data = [
    { name: 'Lun', passagers: 40 },
    { name: 'Mar', passagers: 30 },
    { name: 'Mer', passagers: 55 },
    { name: 'Jeu', passagers: 45 },
    { name: 'Ven', passagers: 60 },
  ];

  const handleManualScan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const booking = await validateTicket(manualCode);
      setScanResult({ status: 'success', message: 'Ticket validé avec succès', booking });
    } catch (err: any) {
      setScanResult({ status: 'error', message: err.message });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
             setManualCode(code.data);
             // Auto submit
             validateTicket(code.data)
                .then(b => setScanResult({ status: 'success', message: 'QR scanné et validé', booking: b }))
                .catch(err => setScanResult({ status: 'error', message: err.message }));
          } else {
             setScanResult({ status: 'error', message: "QR Code non détecté dans l'image." });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Espace Chauffeur</h1>
        <div className="bg-white p-1 rounded-lg border">
           <button onClick={() => setActiveTab('trips')} className={`px-4 py-2 rounded-md ${activeTab === 'trips' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Trajets</button>
           <button onClick={() => setActiveTab('scan')} className={`px-4 py-2 rounded-md ${activeTab === 'scan' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>Scanner Ticket</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
           <div className="p-3 bg-blue-100 rounded-full text-blue-600 mr-4"><Users /></div>
           <div><p className="text-gray-500 text-sm">Passagers Aujourd'hui</p><h3 className="text-2xl font-bold">42</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
           <div className="p-3 bg-green-100 rounded-full text-green-600 mr-4"><CheckCircle /></div>
           <div><p className="text-gray-500 text-sm">Trajets Complétés</p><h3 className="text-2xl font-bold">12</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
           <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 mr-4"><Clock /></div>
           <div><p className="text-gray-500 text-sm">Heures Conduite</p><h3 className="text-2xl font-bold">38h</h3></div>
        </div>
      </div>

      {activeTab === 'trips' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold mb-4">Mes Trajets à venir</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trajet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Heure</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passagers</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trips.map(t => (
                      <tr key={t._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{t.origin} - {t.destination}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.departureTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           {/* Approx calc for demo */}
                           {Math.floor(Math.random() * t.availableSeats)} / {t.availableSeats + 10}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold mb-4">Statistiques Semaine</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="passagers" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
           <div className="text-center mb-6">
              <QrCode className="mx-auto h-12 w-12 text-indigo-600 mb-2" />
              <h2 className="text-xl font-bold">Scanner un Ticket</h2>
              <p className="text-gray-500 text-sm">Uploadez une photo du ticket ou entrez le code manuellement.</p>
           </div>
           
           <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                 <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="qr-upload" />
                 <label htmlFor="qr-upload" className="cursor-pointer flex flex-col items-center">
                    <span className="text-indigo-600 font-medium mb-1">Cliquez pour uploader une image</span>
                    <span className="text-xs text-gray-400">JPG, PNG supportés</span>
                 </label>
              </div>

              <div className="relative">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                 <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">OU</span></div>
              </div>

              <form onSubmit={handleManualScan} className="flex gap-2">
                 <input 
                    type="text" 
                    placeholder="Code Ticket (ex: TM-2025...)" 
                    className="flex-1 border rounded-lg p-3"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                 />
                 <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium">Vérifier</button>
              </form>

              {scanResult && (
                <div className={`p-4 rounded-lg mt-4 ${scanResult.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                   <div className="flex items-start">
                      {scanResult.status === 'success' ? <CheckCircle className="text-green-600 mt-1 mr-3" /> : <AlertCircle className="text-red-600 mt-1 mr-3" />}
                      <div>
                        <h4 className={`font-bold ${scanResult.status === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                           {scanResult.message}
                        </h4>
                        {scanResult.booking && (
                           <ul className="text-sm mt-2 text-gray-700">
                              <li><strong>Passager:</strong> {scanResult.booking.passengerName}</li>
                              <li><strong>Siège:</strong> {scanResult.booking.seatNumber}</li>
                              <li><strong>Prix:</strong> {scanResult.booking.price} TND</li>
                           </ul>
                        )}
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};