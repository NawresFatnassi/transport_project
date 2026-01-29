import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { getActiveTrips, getGPSMock } from '../services/mockDb';

// Fix Leaflet Default Icon in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Bus Icon
const busIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:#4F46E5; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display:flex; align-items:center; justify-content:center; box-shadow: 0 0 10px rgba(0,0,0,0.3);">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.34-.1-.66-.31-.91L19.8 11"/><path d="M2 12v3a2 2 0 0 0 2 2h2"/><path d="M17 18h-2a2 2 0 0 1-2-2v-3"/><path d="M12 12v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3"/><path d="M4.5 18H2"/></svg>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

export const GPSMap = () => {
  const [activeTrips, setActiveTrips] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);

  useEffect(() => {
    // Load initial Data
    getActiveTrips().then(setActiveTrips);
    
    // Poll for bus positions
    const fetchPositions = () => {
      getGPSMock().then(setBuses);
    };

    fetchPositions();
    const interval = setInterval(fetchPositions, 5000); // 5s refresh

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-lg relative z-0">
      <MapContainer center={[36.4, 10.2]} zoom={8} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw Route Paths */}
        {activeTrips.map((trip) => (
          <Polyline 
            key={trip.tripId} 
            positions={trip.path} 
            color="#4F46E5" // Indigo 600
            weight={4} 
            opacity={0.7} 
          />
        ))}

        {/* Draw Buses */}
        {buses.map((bus) => (
          <Marker key={bus.busId} position={[bus.lat, bus.lng]} icon={busIcon}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-indigo-700">{bus.busId}</h3>
                <p className="text-xs text-gray-500 font-semibold">{bus.status}</p>
                <div className="mt-2 text-sm">
                   <p>Vitesse: <span className="font-bold">{bus.speed} km/h</span></p>
                   <p className="text-xs text-gray-400 mt-1">Lat: {bus.lat.toFixed(4)}, Lng: {bus.lng.toFixed(4)}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};