import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Booking, Trip } from '../types';
import { getUserBookings, getTripById, requestRefund } from '../services/mockDb';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode'; // Need to bundle this or use a simple generator
import { Download, AlertCircle, Clock } from 'lucide-react';

export const ClientDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<(Booking & { tripDetails?: Trip })[]>([]);
  const [refundModalOpen, setRefundModalOpen] = useState<string | null>(null); // Booking ID
  const [refundData, setRefundData] = useState({ reason: '', iban: '', phone: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (!user.id) {
      setErrorMessage('Utilisateur invalide : identifiant manquant. Veuillez vous reconnecter.');
      return;
    }
    const load = async () => {
      setErrorMessage(null);
      const bks = await getUserBookings(user.id);
      try {
        const enhanced = await Promise.all(bks.map(async (b) => {
        const trip = await getTripById(b.tripId);
        // normalize id field (backend returns _id)
        const normalized = { ...(b as any), id: (b as any).id || (b as any)._id };
        return { ...normalized, tripDetails: trip };
        }));
        setBookings(enhanced as any);
      } catch (err: any) {
        console.error('Erreur chargement réservations:', err);
        setErrorMessage(err.message || 'Erreur lors du chargement des réservations');
      }
    };
    load();
  }, [user]);

  const generatePDF = async (booking: Booking & { tripDetails?: Trip }) => {
    const doc = new jsPDF();
    const qrUrl = await QRCode.toDataURL(booking.qrCodeData);
    
    // Header
    doc.setFillColor(79, 70, 229); // Indigo
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Transport Manager TN", 105, 20, { align: "center" });
    
    // Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("Ticket de Voyage", 105, 60, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Passager: ${booking.passengerName}`, 20, 80);
    doc.text(`De: ${booking.tripDetails?.origin}`, 20, 90);
    doc.text(`Vers: ${booking.tripDetails?.destination}`, 20, 100);
    doc.text(`Date: ${booking.tripDetails?.date}`, 20, 110);
    doc.text(`Heure: ${booking.tripDetails?.departureTime}`, 20, 120);
    doc.text(`Siège: ${booking.seatNumber}`, 150, 80);
    doc.text(`Prix: ${booking.price} TND`, 150, 90);

    // QR Code
    doc.addImage(qrUrl, 'PNG', 80, 130, 50, 50);
    doc.text(booking.qrCodeData, 105, 185, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Ce ticket doit être présenté au chauffeur.", 105, 200, { align: "center" });

    doc.save(`ticket-${booking.id}.pdf`);
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalOpen) return;
    try {
      await requestRefund({
        bookingId: refundModalOpen,
        reason: refundData.reason,
        iban: refundData.iban
      });
      alert("Demande de remboursement envoyée avec succès.");
      setRefundModalOpen(null);
      // Reload bookings
        const bks = await getUserBookings(user!.id);
        const enhanced = await Promise.all(bks.map(async (b) => {
          const trip = await getTripById(b.tripId);
          const normalized = { ...(b as any), id: (b as any).id || (b as any)._id };
          return { ...normalized, tripDetails: trip };
        }));
        setBookings(enhanced as any);
    } catch (err: any) {
      console.error('Erreur refund:', err);
      setErrorMessage(err.message || 'Erreur lors de la demande de remboursement');
      alert(err.message || 'Erreur lors de la demande de remboursement');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mes Réservations</h1>
      {errorMessage && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{errorMessage}</div>}
      {!user && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded">Vous devez vous connecter pour voir vos réservations.</div>
      )}
      {user && !user.id && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded">Identifiant utilisateur manquant — reconnectez-vous.</div>
      )}

      <div className="grid gap-6">
        {bookings.length === 0 && <p className="text-gray-500">Aucune réservation trouvée.</p>}
        {bookings.map(booking => (
          <div key={booking.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500 flex flex-col md:flex-row justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                  booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                  booking.status === 'PENDING_REFUND' ? 'bg-orange-100 text-orange-700' :
                  booking.status === 'REFUNDED' ? 'bg-gray-100 text-gray-600' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {booking.status}
                </span>
                <span className="text-sm text-gray-500">#{booking.id}</span>
              </div>
              <h3 className="text-xl font-bold">{booking.tripDetails?.origin} → {booking.tripDetails?.destination}</h3>
              <p className="text-gray-600 flex items-center mt-1">
                 <Clock className="w-4 h-4 mr-1" />
                 {booking.tripDetails?.date} à {booking.tripDetails?.departureTime}
              </p>
              <p className="text-indigo-600 font-medium mt-1">Siège {booking.seatNumber} • {booking.price} TND</p>
            </div>
            
            <div className="flex flex-col space-y-2 mt-4 md:mt-0">
               {booking.status === 'CONFIRMED' && (
                 <>
                  <button 
                    onClick={() => generatePDF(booking)}
                    className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" /> Télécharger Ticket
                  </button>
                  <button 
                    onClick={() => setRefundModalOpen(booking.id)}
                    className="flex items-center justify-center border border-red-200 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" /> Annuler / Rembourser
                  </button>
                 </>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Demande de remboursement</h3>
            <p className="text-sm text-gray-500 mb-4">Remboursement possible jusqu'à 4h avant le départ.</p>
            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <textarea 
                placeholder="Motif de l'annulation" required
                className="w-full border rounded p-2"
                value={refundData.reason} onChange={e => setRefundData({...refundData, reason: e.target.value})}
              />
              <input 
                type="text" placeholder="IBAN / RIB" required
                className="w-full border rounded p-2"
                value={refundData.iban} onChange={e => setRefundData({...refundData, iban: e.target.value})}
              />
              <input 
                type="tel" placeholder="Téléphone" required
                className="w-full border rounded p-2"
                value={refundData.phone} onChange={e => setRefundData({...refundData, phone: e.target.value})}
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button type="button" onClick={() => setRefundModalOpen(null)} className="px-4 py-2 text-gray-600">Fermer</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};