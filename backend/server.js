// backend/server.js
import 'dotenv/config';
import express from 'express';
import os from 'os';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

const app = express();

// ------------------- CONFIG -------------------
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ------------------- CONNECT DB -------------------
connectDB();

// =================================================
//                    SCHEMAS
// =================================================
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, enum: ['CLIENT', 'DRIVER', 'ADMIN'], default: 'CLIENT' },

  // Chauffeur
  licenseNumber: String,
  licenseExpiry: String,
  city: String,
  status: { type: String, default: 'Active' },
  assignedBusId: String
});

const busSchema = new mongoose.Schema({
  number: String,
  capacity: Number,
  type: String,
  driverId: String,
  status: { type: String, enum: ['Active', 'Maintenance'], default: 'Active' },
  gpsTracking: Boolean,
  gpsDeviceId: String
});

const tripSchema = new mongoose.Schema({
  origin: String,
  destination: String,
  date: String,              // ex: "2025-11-29"
  departureTime: String,     // ex: "12:00"
  arrivalTime: String,       // ex: "13:10"
  price: Number,
  busId: String,
  driverId: String,
  availableSeats: Number,
  status: { type: String, default: 'Active' }
});

const bookingSchema = new mongoose.Schema({
  tripId: String,
  userId: String,
  passengerName: String,
  seatNumber: String,
  tripDate: String,
  price: Number,
  qrCodeData: String,
  bookingDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['CONFIRMED', 'USED', 'PENDING_REFUND', 'REFUNDED', 'CANCELLED'],
    default: 'CONFIRMED'
  },
  refundReason: String,
  refundIban: String
});

// ------------------- FIX DUPLICATION -------------------
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Bus = mongoose.models.Bus || mongoose.model('Bus', busSchema);
const Trip = mongoose.models.Trip || mongoose.model('Trip', tripSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// =================================================
//                     SEED + RESET
// =================================================

// Seed minimal (admin uniquement, le reste tu le gères dans l’admin)
app.post('/api/seed', async (req, res) => {
  try {
    // Create admin if missing
    const adminExists = await User.findOne({ email: 'admin@transport.tn' });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@transport.tn',
        password: 'password123',
        phone: '71000000',
        role: 'ADMIN'
      });
      console.log('✔ Admin créé');
    }

    // Create sample drivers if none exist
    const driversCount = await User.countDocuments({ role: 'DRIVER' });
    let sampleDrivers = [];
    if (driversCount === 0) {
      sampleDrivers = await User.create([
        { name: 'Ali Ben', email: 'ali.driver@transport.tn', password: 'driver123', phone: '71200001', role: 'DRIVER', licenseNumber: 'D-1001', city: 'Tunis' },
        { name: 'Mouna Habib', email: 'mouna.driver@transport.tn', password: 'driver123', phone: '71200002', role: 'DRIVER', licenseNumber: 'D-1002', city: 'Sousse' },
        { name: 'Karim Saad', email: 'karim.driver@transport.tn', password: 'driver123', phone: '71200003', role: 'DRIVER', licenseNumber: 'D-1003', city: 'Sfax' }
      ]);
      console.log(`✔ ${sampleDrivers.length} drivers créés`);
    } else {
      sampleDrivers = await User.find({ role: 'DRIVER' });
      console.log(`ℹ Drivers existants: ${driversCount}`);
    }

    // Create sample buses if none exist
    const busesCount = await Bus.countDocuments();
    let sampleBuses = [];
    if (busesCount === 0) {
      sampleBuses = await Bus.create([
        { number: 'TN-1001', capacity: 50, type: 'Standard', driverId: sampleDrivers[0]?._id?.toString() || '', status: 'Active' },
        { number: 'TN-1002', capacity: 40, type: 'Standard', driverId: sampleDrivers[1]?._id?.toString() || '', status: 'Active' },
        { number: 'TN-1003', capacity: 30, type: 'Mini', driverId: sampleDrivers[2]?._id?.toString() || '', status: 'Active' }
      ]);
      console.log(`✔ ${sampleBuses.length} bus créés`);
    } else {
      sampleBuses = await Bus.find();
      console.log(`ℹ Buses existants: ${busesCount}`);
    }

    // Create sample trips if none exist
    const tripsCount = await Trip.countDocuments();
    if (tripsCount === 0) {
      const today = new Date();
      const mkDate = (d) => d.toISOString().slice(0, 10);

      const tripsToCreate = [
        {
          origin: 'Tunis', destination: 'Sousse', date: mkDate(new Date(today.getTime() + 24*60*60*1000)),
          departureTime: '08:00', arrivalTime: '10:00', price: 15, busId: sampleBuses[0]?._id?.toString() || '', driverId: sampleDrivers[0]?._id?.toString() || '', availableSeats: 50
        },
        {
          origin: 'Sousse', destination: 'Monastir', date: mkDate(new Date(today.getTime() + 24*60*60*1000)),
          departureTime: '11:00', arrivalTime: '12:00', price: 8, busId: sampleBuses[1]?._id?.toString() || '', driverId: sampleDrivers[1]?._id?.toString() || '', availableSeats: 40
        },
        {
          origin: 'Sfax', destination: 'Gabes', date: mkDate(new Date(today.getTime() + 2*24*60*60*1000)),
          departureTime: '09:30', arrivalTime: '12:00', price: 20, busId: sampleBuses[2]?._id?.toString() || '', driverId: sampleDrivers[2]?._id?.toString() || '', availableSeats: 30
        }
      ];

      const created = await Trip.create(tripsToCreate);
      console.log(`✔ ${created.length} trips créés`);
    } else {
      console.log(`ℹ Trips existants: ${tripsCount}`);
    }

    res.json({ message: 'Seed exécuté !' });
  } catch (err) {
    console.error('Seed Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Reset BDD (utilisé par le bouton "Réinitialiser BDD")
app.post('/api/reset', async (req, res) => {
  try {
    await Booking.deleteMany({});
    await Trip.deleteMany({});
    await Bus.deleteMany({});
    await User.deleteMany({});
    console.log('🧹 BDD vidée');

    // on recrée juste l’admin
    await User.create({
      name: 'Super Admin',
      email: 'admin@transport.tn',
      password: 'password123',
      phone: '71000000',
      role: 'ADMIN'
    });

    res.json({ message: 'Base réinitialisée' });
  } catch (err) {
    console.error('Reset Error:', err);
    res.status(500).json({ message: 'Erreur reset' });
  }
});

// =================================================
//                     AUTH
// =================================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const u = await User.findOne({ email, password });
  if (!u) return res.status(401).json({ message: 'Identifiants incorrects' });
  res.json(u);
});

app.post('/api/auth/signup', async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) return res.status(400).json({ message: 'Email déjà utilisé' });
  const user = await User.create(req.body);
  res.json(user);
});

// =================================================
//                  TRIPS PUBLICS
// =================================================

// Liste / recherche trajets
app.get('/api/trips', async (req, res) => {
  try {
    let q = { status: 'Active' };

    if (req.query.origin && req.query.origin.trim() !== '') {
      q.origin = new RegExp(req.query.origin.trim(), 'i');
    }
    if (req.query.destination && req.query.destination.trim() !== '') {
      q.destination = new RegExp(req.query.destination.trim(), 'i');
    }

    if (req.query.date && req.query.date.trim() !== '') {
      let d = req.query.date.trim();
      if (d.includes('/')) {
        const [day, month, year] = d.split('/');
        d = `${year}-${month}-${day}`;
      }
      q.date = d;
    }

    console.log('🔎 Filtre TRIPS :', q);
    const trips = await Trip.find(q);
    console.log('🚍 Trajets trouvés :', trips.length);
    res.json(trips);
  } catch (err) {
    console.error('❌ Erreur recherche trajets :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Détail trajet par id (pour la page paiement)
app.get('/api/trips/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trajet introuvable' });
    res.json(trip);
  } catch (err) {
    console.error('Erreur GET trip by id :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Sièges occupés pour un trajet
app.get('/api/trips/:id/occupied-seats', async (req, res) => {
  try {
    const bookings = await Booking.find({
      tripId: req.params.id,
      status: { $nin: ['CANCELLED', 'REFUNDED'] }
    }).select('seatNumber -_id');

    res.json(bookings.map(b => b.seatNumber));
  } catch (err) {
    console.error('Erreur seats :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// =================================================
/// =================================================
//                     BOOKINGS
// =================================================
app.post('/api/bookings', async (req, res) => {
  try {
    const { tripId, seatNumber, userId, passengerName, price, tripDate } = req.body;

    console.log("📥 Nouvelle réservation reçue :", req.body);

    // 1️⃣ Vérifier ID MongoDB valide
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      console.log("❌ tripId invalide :", tripId);
      return res.status(400).json({ message: "ID trajet invalide" });
    }

    // 2️⃣ Charger le trajet
    const trip = await Trip.findById(tripId);
    if (!trip) {
      console.log("❌ Trajet introuvable pour tripId :", tripId);
      return res.status(404).json({ message: "Trajet introuvable" });
    }

    console.log("✔ Trajet chargé :", trip.origin, trip.destination, trip.date);

    // 3️⃣ Vérifier règle des 30 minutes
    const departure = new Date(`${trip.date}T${trip.departureTime}`);
    const limit = new Date(departure.getTime() - 30 * 60000);

    console.log("⏳ Heure limite réservation :", limit);
    console.log("⏱ Temps actuel :", new Date());

    if (new Date() > limit) {
      return res.status(400).json({ message: "Réservation fermée (<30 min)" });
    }

    // 4️⃣ Vérifier si siège déjà réservé
    const exists = await Booking.findOne({
      tripId,
      seatNumber,
      status: { $nin: ["CANCELLED", "REFUNDED"] }
    });

    if (exists) {
      console.log("❌ Siège déjà réservé :", seatNumber);
      return res.status(400).json({ message: "Siège déjà réservé" });
    }

    // 5️⃣ Créer la réservation
    const booking = await Booking.create({
      tripId,
      userId,
      passengerName,
      seatNumber,
      tripDate,
      price,
      qrCodeData: `TM-${tripId}-${seatNumber}-${Date.now()}`,
      status: "CONFIRMED"
    });

    // 6️⃣ Décrémenter les places disponibles
    trip.availableSeats = Math.max((trip.availableSeats || 1) - 1, 0);
    await trip.save();

    console.log("🎉 Réservation confirmée :", booking);

    res.json(booking);

  } catch (err) {
    console.error("❌ ERREUR BOOKING :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// réservations d’un utilisateur
app.get('/api/bookings/user/:userId', async (req, res) => {
  const list = await Booking.find({ userId: req.params.userId });
  res.json(list);
});

// demande de remboursement
app.post('/api/bookings/refund', async (req, res) => {
  const { bookingId, reason, iban } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: 'Réservation introuvable' });

  booking.status = 'PENDING_REFUND';
  booking.refundReason = reason;
  booking.refundIban = iban;
  await booking.save();

  res.json(booking);
});

// =================================================
//                    DRIVER
// =================================================
app.get('/api/driver/trips/:driverId', async (req, res) => {
  const trips = await Trip.find({ driverId: req.params.driverId });
  res.json(trips);
});

app.post('/api/driver/validate-ticket', async (req, res) => {
  const booking = await Booking.findOne({ qrCodeData: req.body.qrCode });
  if (!booking) return res.status(404).json({ message: 'Ticket introuvable' });
  if (booking.status === 'USED') return res.status(400).json({ message: 'Déjà utilisé' });

  booking.status = 'USED';
  await booking.save();
  res.json(booking);
});

// =================================================
//                    ADMIN CRUD
// =================================================

// LISTES
app.get('/api/admin/users', async (req, res) => res.json(await User.find()));
app.get('/api/admin/buses', async (req, res) => res.json(await Bus.find()));
app.get('/api/admin/trips', async (req, res) => res.json(await Trip.find()));

// CREATE / UPDATE
app.post('/api/admin/users', async (req, res) => {
  const u = req.body.id
    ? await User.findByIdAndUpdate(req.body.id, req.body, { new: true })
    : await User.create(req.body);
  res.json(u);
});

app.post('/api/admin/buses', async (req, res) => {
  const bus = req.body.id
    ? await Bus.findByIdAndUpdate(req.body.id, req.body, { new: true })
    : await Bus.create(req.body);
  res.json(bus);
});

app.post('/api/admin/trips', async (req, res) => {
  const trip = req.body.id
    ? await Trip.findByIdAndUpdate(req.body.id, req.body, { new: true })
    : await Trip.create(req.body);
  res.json(trip);
});

// DELETE
app.delete('/api/admin/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User supprimé' });
});

app.delete('/api/admin/buses/:id', async (req, res) => {
  await Bus.findByIdAndDelete(req.params.id);
  res.json({ message: 'Bus supprimé' });
});

app.delete('/api/admin/trips/:id', async (req, res) => {
  await Trip.findByIdAndDelete(req.params.id);
  res.json({ message: 'Trip supprimé' });
});

// =================================================
//                    ADMIN STATS (simples)
// =================================================

app.get('/api/admin/stats/daily-trips', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const scheduled = await Trip.countDocuments({ date: today });
  const completed = 0;
  const ongoing = 0;
  res.json({ scheduled, ongoing, completed });
});

app.get('/api/admin/stats/bus-occupation', async (req, res) => {
  const buses = await Bus.find();
  const data = buses.map(b => ({
    name: b.number,
    occupation: Math.round(Math.random() * 100)
  }));
  res.json({ data });
});

app.get('/api/admin/stats/alerts', async (req, res) => {
  res.json({ maintenance: [], verificationNeeded: [] });
});

app.get('/api/admin/stats/reservations-heatmap', async (req, res) => {
  const labelsX = ['6h', '9h', '12h', '15h', '18h', '21h'];
  const labelsY = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const data = labelsY.map(() =>
    labelsX.map(() => Math.floor(Math.random() * 10))
  );
  res.json({ labelsX, labelsY, data });
});

app.get('/api/admin/stats/priority-seats', async (req, res) => {
  res.json({ standard: 80, handicap: 15, pregnant: 5 });
});

app.get('/api/admin/payments/history', async (req, res) => {
  // petit historique simulé
  const payments = await Booking.find({ status: { $in: ['CONFIRMED', 'USED'] } })
    .sort({ bookingDate: -1 })
    .limit(20);

  const mapped = payments.map(b => ({
    date: b.bookingDate.toISOString().slice(0, 10),
    method: 'Carte bancaire',
    amount: b.price || 0,
    status: 'Success'
  }));

  res.json(mapped);
});

// =================================================
//                    GPS / FLOTTE
// =================================================

// Buses actifs pour la carte
app.get('/api/admin/buses/active', async (req, res) => {
  const buses = await Bus.find({ status: 'Active' });
  const points = buses.map((b, idx) => ({
    id: b._id.toString(),
    number: b.number,
    lat: 36.8 + idx * 0.01,
    lng: 10.1 + idx * 0.01,
    speed: 40 + idx * 3
  }));
  res.json(points);
});

// Trajets actifs (ex: pour suivi temps réel)
app.get('/api/admin/active-trips', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const trips = await Trip.find({ date: today });
  res.json(trips);
});

// Position d’un bus
app.get('/api/gps/:busId', async (req, res) => {
  const baseLat = 36.8;
  const baseLng = 10.1;
  const hash = [...req.params.busId].reduce((a, c) => a + c.charCodeAt(0), 0);
  const lat = baseLat + (hash % 50) * 0.001;
  const lng = baseLng + (hash % 50) * 0.001;
  res.json({ lat, lng });
});
// ================== USER BOOKINGS ==================
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId });

    res.json(bookings);
  } catch (err) {
    console.error("Erreur fetch bookings:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// =================================================
//                    RUN SERVER
// =================================================
const server = app.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  const ips = [];
  Object.keys(nets).forEach((name) => {
    const netInfo = nets[name];
    if (!netInfo) return;
    netInfo.forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) ips.push(iface.address);
    });
  });

  console.log(
    `🚀 Backend accessible sur: http://localhost:${PORT}${ips.length ? ' | LAN: ' + ips.join(', ') : ''}`
  );
});

// Better error message when port is already in use
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Stop the process using that port or set PORT to a different value.`);
    console.error('Suggested commands (PowerShell):');
    console.error('  netstat -aon | findstr :5000');
    console.error('  taskkill /PID <PID> /F');
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});
