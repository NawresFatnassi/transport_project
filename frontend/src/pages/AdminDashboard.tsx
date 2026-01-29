import React, { useEffect, useState } from 'react';
import { getAllBuses, getAllUsers, getAllTrips, saveBus, saveUser, saveTrip, deleteBus, deleteUser, deleteTrip, resetDb, 
  getDailyTripStats, getBusOccupationStats, getBusAlerts, getReservationsHeatmap, getPrioritySeatStats, getPaymentHistory, getGPSMock 
} from '../services/mockDb';
import { Bus, User, UserRole, Trip } from '../types';
import { Trash2, Edit, Plus, Bus as BusIcon, User as UserIcon, Map as MapIcon, RotateCcw, LayoutDashboard, AlertTriangle, CreditCard, Activity, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { GPSMap } from '../components/GPSMap';

export const AdminDashboard = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking' | 'buses' | 'drivers' | 'trips'>('overview');
  
  // Modals
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  
  // Forms
  const [editingBus, setEditingBus] = useState<Partial<Bus>>({});
  const [editingDriver, setEditingDriver] = useState<Partial<User>>({});
const [editingTrip, setEditingTrip] = useState<Partial<Trip>>({
  origin: "",
  destination: "",
  date: "",
  departureTime: "",
  arrivalTime: "",
  price: 0,
  busId: "",
  driverId: "",
  availableSeats: 50
});

  // Filters
  const [tripSearch, setTripSearch] = useState('');

  // Stats Data
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [busOccupation, setBusOccupation] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [priorityStats, setPriorityStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  const refresh = async () => {
    setBuses(await getAllBuses());
    const users = await getAllUsers();
    setDrivers(users.filter(u => u.role === UserRole.DRIVER));
    setTrips(await getAllTrips());
  };

  const loadStats = async () => {
    setDailyStats(await getDailyTripStats());
    setBusOccupation(await getBusOccupationStats());
    setAlerts(await getBusAlerts());
    setHeatmap(await getReservationsHeatmap());
    setPriorityStats(await getPrioritySeatStats());
    setPayments(await getPaymentHistory());
  };

  useEffect(() => { 
    refresh(); 
    loadStats();
  }, []);

  const handleResetDb = () => {
    if (confirm("Attention: Cela va effacer toutes les données et recharger la page. Continuer ?")) {
      resetDb();
    }
  };

  // --- CRUD HANDLERS ---
  const handleSaveBus = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    const payload = { ...editingBus, type: editingBus.type || 'Standard', status: editingBus.status || 'Active' };
    await saveBus(payload); setIsBusModalOpen(false); setEditingBus({}); refresh(); 
  };
  const handleDeleteBus = async (id: string) => { if(confirm('Supprimer ?')) { await deleteBus(id); refresh(); } };
  const handleSaveDriver = async (e: React.FormEvent) => { 
    e.preventDefault(); await saveUser({ ...editingDriver, role: UserRole.DRIVER, status: editingDriver.status || 'Active', password: editingDriver.password || 'password123' }); 
    setIsDriverModalOpen(false); setEditingDriver({}); refresh(); 
  };
  const handleDeleteDriver = async (id: string) => { if(confirm('Supprimer ?')) { await deleteUser(id); refresh(); } };
  const handleSaveTrip = async (e: React.FormEvent) => { e.preventDefault(); await saveTrip(editingTrip); setIsTripModalOpen(false); setEditingTrip({}); refresh(); };
  const handleDeleteTrip = async (id: string) => { if(confirm('Supprimer ?')) { await deleteTrip(id); refresh(); } };

  const getDriverName = (id?: string) => drivers.find(d => d.id === id)?.name || '-';
  const getBusNumber = (id?: string) => buses.find(b => b.id === id)?.number || '-';

  // --- WIDGET COMPONENTS ---
  const DailyTripsStats = () => (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
        <p className="text-gray-500 text-sm">Prévus Aujourd'hui</p>
        <h3 className="text-2xl font-bold">{dailyStats?.scheduled || 0}</h3>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-amber-500">
        <p className="text-gray-500 text-sm">En Cours</p>
        <h3 className="text-2xl font-bold">{dailyStats?.ongoing || 0}</h3>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
        <p className="text-gray-500 text-sm">Terminés</p>
        <h3 className="text-2xl font-bold">{dailyStats?.completed || 0}</h3>
      </div>
    </div>
  );

  const BusAlerts = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
      <div className="flex items-center mb-4">
        <AlertTriangle className="text-red-500 mr-2" />
        <h3 className="text-lg font-bold text-gray-800">Alertes Flotte (URGENT)</h3>
      </div>
      <div className="space-y-3">
        {alerts?.maintenance?.map((b:string) => <div key={b} className="bg-red-50 p-2 rounded text-red-700 text-sm flex justify-between"><span>Bus {b} en maintenance</span> <button className="underline">Voir</button></div>)}
        {alerts?.verificationNeeded?.map((b:string) => <div key={b} className="bg-orange-50 p-2 rounded text-orange-700 text-sm flex justify-between"><span>Bus {b} nécessite vérification</span> <button className="underline">Voir</button></div>)}
        {(!alerts || Object.values(alerts).every((a:any) => a.length === 0)) && <p className="text-gray-400 text-sm">Aucune alerte en cours.</p>}
      </div>
    </div>
  );

  const BusOccupationChart = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm h-80">
      <h3 className="text-lg font-bold mb-4 text-gray-800">Taux d'occupation par Bus</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={busOccupation?.data || []}>
          <XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="occupation" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Occupation %" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const PrioritySeatAnalysis = () => {
    const data = [{ name: 'Standard', value: priorityStats?.standard || 0 }, { name: 'Handicap', value: priorityStats?.handicap || 0 }, { name: 'Enceinte', value: priorityStats?.pregnant || 0 }];
    const COLORS = ['#E5E7EB', '#3B82F6', '#EC4899'];
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm h-80">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Analyse Sièges Prioritaires</h3>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip /><Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const ReservationsHeatmap = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm col-span-2">
      <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center"><Activity className="w-5 h-5 mr-2 text-indigo-500"/> Heatmap Réservations</h3>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[auto_repeat(12,_minmax(30px,_1fr))] gap-1 text-xs">
           <div className="h-8"></div>
           {heatmap?.labelsX.map((h:string) => <div key={h} className="h-8 flex items-center justify-center font-bold text-gray-500">{h}</div>)}
           {heatmap?.labelsY.map((day:string, i:number) => (
             <React.Fragment key={day}>
               <div className="h-8 flex items-center font-bold text-gray-500 pr-2">{day}</div>
               {heatmap?.data[i]?.map((val:number, j:number) => (
                 <div key={`${i}-${j}`} className="h-8 rounded" style={{ backgroundColor: `rgba(79, 70, 229, ${val/10})`, border: '1px solid #eef2ff' }} title={`${val} réservations`}></div>
               ))}
             </React.Fragment>
           ))}
        </div>
      </div>
    </div>
  );

  const PaymentHistory = () => (
    <div className="bg-white p-6 rounded-xl shadow-sm col-span-2">
      <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center"><CreditCard className="w-5 h-5 mr-2 text-indigo-500"/> Historique Paiements</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th></tr></thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((p, idx) => (
              <tr key={idx}><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.date}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.method}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{p.amount} TND</td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${p.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
            <div className="text-sm text-gray-500">Super Admin (admin@transport.tn)</div>
          </div>
          <button onClick={handleResetDb} className="flex items-center text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <RotateCcw className="w-4 h-4 mr-2" /> Réinitialiser BDD
          </button>
       </div>

       {/* Tabs */}
       <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          {['overview', 'tracking', 'buses', 'drivers', 'trips'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all shadow-sm capitalize whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
               {tab === 'overview' && <LayoutDashboard className="mr-2 w-5 h-5" />}
               {tab === 'tracking' && <MapPin className="mr-2 w-5 h-5" />}
               {tab === 'buses' && <BusIcon className="mr-2 w-5 h-5" />}
               {tab === 'drivers' && <UserIcon className="mr-2 w-5 h-5" />}
               {tab === 'trips' && <MapIcon className="mr-2 w-5 h-5" />}
               {tab === 'overview' ? 'Vue d\'ensemble' : tab === 'tracking' ? 'Suivi GPS' : `Gestion ${tab}`}
            </button>
          ))}
       </div>

       {/* --- TAB CONTENT: OVERVIEW --- */}
       {activeTab === 'overview' && (
         <div className="space-y-6">
            <DailyTripsStats />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2"><BusOccupationChart /></div>
               <div><BusAlerts /></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2"><ReservationsHeatmap /></div>
               <div><PrioritySeatAnalysis /></div>
            </div>
            <div className="grid grid-cols-1 gap-6">
               <PaymentHistory />
            </div>
         </div>
       )}

       {/* --- TAB CONTENT: GPS TRACKING --- */}
       {activeTab === 'tracking' && (
         <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
               <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-500 animate-pulse"/>
                  Suivi de la Flotte en Temps Réel
               </h2>
               <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Live</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Mise à jour: 5s</span>
               </div>
            </div>
            <GPSMap />
         </div>
       )}

       {/* --- TAB CONTENT: BUSES --- */}
       {activeTab === 'buses' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
             <div className="p-6 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-800">Flotte de Bus</h3>
                <button onClick={() => { setEditingBus({}); setIsBusModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-indigo-700 transition-colors">
                   <Plus className="w-4 h-4 mr-1" /> Ajouter Bus
                </button>
             </div>
             <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chauffeur</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {buses.map(bus => (
                        <tr key={bus.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{bus.number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{bus.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{bus.capacity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">{getDriverName(bus.driverId)}</td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${bus.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{bus.status}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => { setEditingBus(bus); setIsBusModalOpen(true); }} className="text-indigo-600 mr-4"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteBus(bus.id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
              </table>
             </div>
          </div>
       )}

       {/* --- TAB CONTENT: DRIVERS --- */}
       {activeTab === 'drivers' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
             <div className="p-6 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-800">Chauffeurs</h3>
                <button onClick={() => { setEditingDriver({}); setIsDriverModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-indigo-700 transition-colors">
                   <Plus className="w-4 h-4 mr-1" /> Ajouter Chauffeur
                </button>
             </div>
             <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
<thead className="bg-gray-50">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permis</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus Assigné</th>
    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
  </tr>
</thead><tbody className="bg-white divide-y divide-gray-200">
  {drivers.map((d) => {
    
    // Expiration : rouge si expiré
    const expired = d.licenseExpiry && new Date(d.licenseExpiry) < new Date();

    return (
      <tr key={d.id} className="hover:bg-gray-50">

        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{d.name}</td>

        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{d.email}</td>

        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{d.phone}</td>

        <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-bold">
          {d.licenseNumber || "-"}
        </td>

        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 rounded text-xs font-semibold 
            ${expired ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
          >
            {d.licenseExpiry || "-"}
          </span>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
          {getBusNumber(d.assignedBusId)}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <button
            onClick={() => { setEditingDriver(d); setIsDriverModalOpen(true); }}
            className="text-indigo-600 mr-4"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleDeleteDriver(d.id)} className="text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </td>

      </tr>
    );
  })}
</tbody>

              </table>
             </div>
          </div>
       )}

       {/* --- TAB CONTENT: TRIPS --- */}
       {activeTab === 'trips' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
             <div className="p-6 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-800">Trajets</h3>
                <div className="flex gap-2">
                   <input type="text" placeholder="Rechercher..." className="border rounded px-2 text-sm" value={tripSearch} onChange={e => setTripSearch(e.target.value)} />
                   <button onClick={() => { setEditingTrip({}); setIsTripModalOpen(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium hover:bg-indigo-700 transition-colors">
                     <Plus className="w-4 h-4 mr-1" /> Ajouter
                   </button>
                </div>
             </div>
             <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Itinéraire</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trips.filter(t => t.origin.includes(tripSearch) || t.destination.includes(tripSearch)).map(t => (
                      <tr key={t._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{t.date} {t.departureTime}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{t.origin} → {t.destination}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">{t.price} TND</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => { setEditingTrip(t); setIsTripModalOpen(true); }} className="text-indigo-600 mr-4"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteTrip(t._id)} className="text-red-600"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
              </table>
             </div>
          </div>
       )}

       {/* --- MODALS (Unchanged content, kept minimal for clarity) --- */}
      {isBusModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-md">
      <h3 className="font-bold text-lg mb-4">
        {editingBus.id ? 'Modifier Bus' : 'Ajouter Bus'}
      </h3>

      <form
        onSubmit={handleSaveBus}
        className="space-y-4"
      >
        {/* Immatriculation */}
        <input
          type="text"
          placeholder="Immatriculation"
          className="w-full border p-2 rounded"
          value={editingBus.number || ""}
          onChange={e => setEditingBus({
            ...editingBus,
            number: e.target.value
          })}
          required
        />

        {/* Capacité */}
        <input
          type="number"
          placeholder="Capacité"
          className="w-full border p-2 rounded"
          value={editingBus.capacity || ""}
          onChange={e => setEditingBus({
            ...editingBus,
            capacity: Number(e.target.value)
          })}
          min="1"
          required
        />

        {/* Type du bus */}
        <select
          className="w-full border p-2 rounded"
          value={editingBus.type || "Standard"}
          onChange={(e) =>
            setEditingBus({ ...editingBus, type: e.target.value })
          }
        >
          <option value="Standard">Standard</option>
          <option value="VIP">VIP</option>
          <option value="Mini">Mini</option>
        </select>

        {/* Chauffeur */}
        <select
          className="w-full border p-2 rounded"
          value={editingBus.driverId || ""}
          onChange={(e) =>
            setEditingBus({ ...editingBus, driverId: e.target.value })
          }
        >
          <option value="">-- Aucun chauffeur --</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* Statut */}
        <select
          className="w-full border p-2 rounded"
          value={editingBus.status || "Active"}
          onChange={(e) =>
            setEditingBus({ ...editingBus, status: e.target.value })
          }
        >
          <option value="Active">Active</option>
          <option value="Maintenance">En maintenance</option>
        </select>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => setIsBusModalOpen(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Annuler
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {isDriverModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-md">
      <h3 className="font-bold text-lg mb-4">
        {editingDriver.id ? "Modifier Chauffeur" : "Ajouter Chauffeur"}
      </h3>

      <form onSubmit={handleSaveDriver} className="space-y-4">

        {/* Nom */}
        <input
          placeholder="Nom complet"
          className="w-full border p-2 rounded"
          value={editingDriver.name || ""}
          onChange={(e) =>
            setEditingDriver({ ...editingDriver, name: e.target.value })
          }
          required
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={editingDriver.email || ""}
          onChange={(e) =>
            setEditingDriver({ ...editingDriver, email: e.target.value })
          }
          required
        />

        {/* Téléphone */}
        <input
          placeholder="Téléphone"
          className="w-full border p-2 rounded"
          value={editingDriver.phone || ""}
          onChange={(e) =>
            setEditingDriver({ ...editingDriver, phone: e.target.value })
          }
          required
        />

        {/* Numéro du permis */}
        <input
          placeholder="Numéro de permis"
          className="w-full border p-2 rounded"
          value={editingDriver.licenseNumber || ""}
          onChange={(e) =>
            setEditingDriver({
              ...editingDriver,
              licenseNumber: e.target.value,
            })
          }
          required
        />

        {/* Expiration du permis */}
        <input
          type="date"
          className="w-full border p-2 rounded"
          value={editingDriver.licenseExpiry || ""}
          onChange={(e) =>
            setEditingDriver({
              ...editingDriver,
              licenseExpiry: e.target.value,
            })
          }
          required
        />

        {/* Bus assigné */}
        <select
          className="w-full border p-2 rounded"
          value={editingDriver.assignedBusId || ""}
          onChange={(e) =>
            setEditingDriver({
              ...editingDriver,
              assignedBusId: e.target.value,
            })
          }
        >
          <option value="">-- Aucun bus assigné --</option>

          {buses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.number} — {b.type}
            </option>
          ))}
        </select>

        {/* Boutons */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => setIsDriverModalOpen(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Annuler
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {isTripModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white p-6 rounded-lg w-full max-w-md h-[80vh] overflow-y-auto">
      <h3 className="font-bold text-lg mb-4">
        {editingTrip.id ? 'Modifier' : 'Ajouter'} Trajet
      </h3>

      <form onSubmit={handleSaveTrip} className="space-y-4">
        
        {/* Départ - Arrivée */}
        <input
          placeholder="Départ"
          className="w-full border p-2 rounded"
          value={editingTrip.origin || ''}
          onChange={e => setEditingTrip({ ...editingTrip, origin: e.target.value })}
          required
        />

        <input
          placeholder="Arrivée"
          className="w-full border p-2 rounded"
          value={editingTrip.destination || ''}
          onChange={e => setEditingTrip({ ...editingTrip, destination: e.target.value })}
          required
        />

        {/* Date */}
        <input
          type="date"
          className="w-full border p-2 rounded"
          value={editingTrip.date || ''}
          onChange={e => setEditingTrip({ ...editingTrip, date: e.target.value })}
          required
        />

        {/* Heures */}
        <div>
          <label className="text-sm font-semibold">Heure de départ</label>
          <input
            type="time"
            className="w-full border p-2 rounded mt-1"
            value={editingTrip.departureTime || ''}
            onChange={e => setEditingTrip({ ...editingTrip, departureTime: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Heure d’arrivée</label>
          <input
            type="time"
            className="w-full border p-2 rounded mt-1"
            value={editingTrip.arrivalTime || ''}
            onChange={e => setEditingTrip({ ...editingTrip, arrivalTime: e.target.value })}
            required
          />
        </div>

        {/* Prix */}
        <input
          type="number"
          placeholder="Prix (TND)"
          className="w-full border p-2 rounded"
          value={editingTrip.price || ''}
          onChange={e => setEditingTrip({ ...editingTrip, price: Number(e.target.value) })}
          required
        />

        {/* Sélection Bus */}
        <div>
          <label className="text-sm font-semibold">Bus</label>
          <select
            className="w-full border p-2 rounded mt-1"
            value={editingTrip.busId || ''}
            onChange={e => setEditingTrip({ ...editingTrip, busId: e.target.value })}
            required
          >
            <option value="">Choisir un bus</option>
            {buses.map(b => (
              <option value={b.id} key={b.id}>{b.number}</option>
            ))}
          </select>
        </div>

        {/* Sélection Chauffeur */}
        <div>
          <label className="text-sm font-semibold">Chauffeur</label>
          <select
            className="w-full border p-2 rounded mt-1"
            value={editingTrip.driverId || ''}
            onChange={e => setEditingTrip({ ...editingTrip, driverId: e.target.value })}
            required
          >
            <option value="">Choisir un chauffeur</option>
            {drivers.map(d => (
              <option value={d.id} key={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={() => setIsTripModalOpen(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Sauvegarder
          </button>
        </div>

      </form>
    </div>
  </div>
)}

    </div>
  );
};