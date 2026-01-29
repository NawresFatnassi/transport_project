import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTrips, getOccupiedSeats, createBooking } from '../services/mockDb';
import { Trip } from '../types';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Check, CreditCard, Accessibility } from 'lucide-react';

export const BookingPage = () => {

  const [step, setStep] = useState(1);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [isPriorityUser, setIsPriorityUser] = useState(false);
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  const [passengerName, setPassengerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ---------------------------
  // LOAD TRIPS BASED ON SEARCH
  // ---------------------------
  useEffect(() => {

    if (user) setPassengerName(user.name);

    const params = new URLSearchParams(location.search);
    const tripId = params.get('tripId');
    const origin = params.get('origin') || '';
    const destination = params.get('destination') || '';
    const date = params.get('date') || '';

    const fetchTrips = async () => {
      setIsLoading(true);

      if (tripId) {
        // direct booking link
        const allTrips = await getTrips();
        const found = allTrips.find(t => t._id === tripId);
        if (found) setTrips([found]);
      } else {
        const results = await getTrips({ origin, destination, date });
        setTrips(results);
      }

      setIsLoading(false);
    };

    fetchTrips();

  }, [location, user]);

  // ---------------------------
  // SELECT TRIP
  // ---------------------------
  const handleTripSelect = async (trip: Trip) => {
    setSelectedTrip(trip);
    setIsLoading(true);
    const occupied = await getOccupiedSeats(trip._id);
    setOccupiedSeats(occupied);
    setIsLoading(false);
    setStep(2);
  };

  // ---------------------------
  // SELECT SEAT
  // ---------------------------
  const handleSeatClick = (seat: string, isPriority: boolean) => {
    if (occupiedSeats.includes(seat)) return;
    if (isPriority && !isPriorityUser) return;
    setSelectedSeat(seat);
  };

  // ---------------------------
  // BOOKING
  // ---------------------------
  const handleBooking = async () => {

    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedTrip) {
      setError("Erreur interne : aucun trajet sélectionné.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
     await createBooking({
      tripId: selectedTrip._id,
      userId: user.id,
      passengerName,
      seatNumber: selectedSeat,
      tripDate: selectedTrip.date,
      price: selectedTrip.price,
    });


      setStep(4);

    } catch (err: any) {
      setError(err.message);
    }

    setIsLoading(false);
  };

  // ============================
  // SUB COMPONENT: TRIP CARD
  // ============================
  const TripCard = ({ trip }: { trip: Trip }) => (
    <div 
      className="bg-white rounded-xl shadow-sm border p-6 flex justify-between items-center hover:shadow-md transition mb-4"
    >
      <div>
        <div className="text-2xl font-bold">{trip.departureTime}</div>
        <div className="text-gray-500">{trip.origin}</div>
      </div>

      <div className="text-right">
        <div className="text-2xl text-indigo-600 font-bold">{trip.price} TND</div>

        <button 
          onClick={() => handleTripSelect(trip)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg mt-2"
        >
          Choisir
        </button>

        <div className="text-xs text-gray-400">
          {trip.availableSeats} sièges libres
        </div>
      </div>
    </div>
  );

  // ============================
  // SUB COMPONENT: SEAT GRID
  // ============================
  const SeatGrid = () => {
    const rows = ['A','B','C','D','E','F'];

    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="font-bold text-lg mb-4">Sélection du siège</h3>

        <div className="flex justify-between mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPriorityUser}
              onChange={e => {
                setIsPriorityUser(e.target.checked);
                setSelectedSeat('');
              }}
            />
            <span className="flex items-center">
              <Accessibility className="w-4 h-4 mr-1 text-blue-500" /> Accès prioritaire
            </span>
          </label>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {rows.map(row => 
            [1,2,3,4].map(num => {
              const seat = `${row}${num}`;
              const priority = ['A1','A2','B1','B2'].includes(seat);
              const occupied = occupiedSeats.includes(seat);

              const disabled = occupied || (priority && !isPriorityUser);
              const selected = selectedSeat === seat;

              return (
                <button
                  key={seat}
                  disabled={disabled}
                  onClick={() => handleSeatClick(seat, priority)}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center 
                    ${occupied ? "bg-gray-300" :
                      selected ? "bg-indigo-600 text-white" :
                        priority ? "bg-blue-50 border-blue-300" : "bg-white"
                    }
                  `}
                >
                  {seat}
                </button>
              );
            })
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            disabled={!selectedSeat}
            onClick={() => setStep(3)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            Continuer ({selectedTrip?.price} TND)
          </button>
        </div>
      </div>
    );
  };

  // ============================
  // RETURN UI
  // ============================
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* ------------------ STEP 1 ------------------ */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Résultats de recherche</h2>

          {isLoading && <div className="py-10 text-center">Chargement...</div>}

          {!isLoading && trips.length > 0 && (
            trips.map(t => <TripCard key={t._id} trip={t} />)
          )}

          {!isLoading && trips.length === 0 && (
            <div className="text-center text-gray-500 py-10">Aucun trajet trouvé.</div>
          )}
        </div>
      )}

      {/* ------------------ STEP 2 ------------------ */}
      {step === 2 && selectedTrip && <SeatGrid />}

      {/* ------------------ STEP 3 ------------------ */}
      {step === 3 && selectedTrip && (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-4">Paiement Sécurisé</h2>

          <div className="bg-gray-50 p-4 rounded mb-4">
            <div className="flex justify-between"><span>Trajet:</span><span>{selectedTrip.origin} → {selectedTrip.destination}</span></div>
            <div className="flex justify-between"><span>Date:</span><span>{selectedTrip.date} {selectedTrip.departureTime}</span></div>
            <div className="flex justify-between"><span>Siège:</span><span>{selectedSeat}</span></div>
            <div className="flex justify-between font-bold text-indigo-600 text-lg mt-2"><span>Total:</span><span>{selectedTrip.price} TND</span></div>
          </div>

          {/* CARD INFO */}
          <div className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute top-3 left-3 text-gray-400" />
              <input 
                value={passengerName}
                onChange={e => setPassengerName(e.target.value)}
                className="pl-10 w-full p-3 border rounded-lg"
                placeholder="Nom du passager"
              />
            </div>

            <div className="relative">
              <CreditCard className="absolute top-3 left-3 text-gray-400" />
              <input className="pl-10 w-full p-3 border rounded-lg" placeholder="Numéro de carte" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input className="p-3 border rounded-lg" placeholder="MM/YY" />
              <input className="p-3 border rounded-lg" placeholder="CVC" />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <button 
            onClick={handleBooking}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg mt-4"
          >
            {isLoading ? "Traitement..." : `Payer ${selectedTrip.price} TND`}
          </button>

        </div>
      )}

      {/* ------------------ STEP 4 ------------------ */}
      {step === 4 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Réservation Confirmée !</h2>
          <p className="text-gray-600 mb-4">Votre ticket a été généré avec succès.</p>
          <button onClick={() => navigate('/my-reservations')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg">
            Voir mes tickets
          </button>
        </div>
      )}

    </div>
  );
};
