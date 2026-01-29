import { User, Trip, Bus, Booking } from '../types';

const API_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:5000`;

// ------------------------
// Generic API Wrapper
// ------------------------
const api = async (endpoint: string, method: string = 'GET', body?: any) => {
  const headers = { 'Content-Type': 'application/json' };
  const config: RequestInit = { method, headers };

  if (body) config.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_URL}/api${endpoint}`, config);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Une erreur est survenue');

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ------------------------
// INITIALIZATION / RESET
// ------------------------
export const initMockDb = async () => {
  try {
    await api('/seed', 'POST');
    console.log("Database Connection Verified & Seeded if necessary");
  } catch (e) {
    console.warn("Could not connect to API. Ensure server.js is running.");
  }
};

export const resetDb = async () => {
  await api('/reset', 'POST');
  await initMockDb();
  window.location.reload();
};

// ------------------------
// AUTH
// ------------------------
export const mockLogin = async (email: string, password: string): Promise<User> =>
  api('/auth/login', 'POST', { email, password });

export const mockSignup = async (user: Omit<User, '_id'>): Promise<User> =>
  api('/auth/signup', 'POST', user);

// ------------------------
// TRIPS (PUBLIC SEARCH)
// ------------------------
export const getTrips = async (
  search?: { origin?: string; destination?: string; date?: string }
): Promise<Trip[]> => {
  const params = new URLSearchParams(search as any).toString();
  return api(`/trips?${params}`);
};

export const getTripById = async (id: string): Promise<Trip> =>
  api(`/trips/${id}`);

// ------------------------
// SEATS
// ------------------------
export const getOccupiedSeats = async (tripId: string): Promise<string[]> =>
  api(`/trips/${tripId}/occupied-seats`);

// ------------------------
// BOOKINGS
// ------------------------
export const createBooking = async (data: any): Promise<Booking> =>
  api('/bookings', 'POST', data);

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  // Defensive: ensure caller provides a userId
  if (!userId) {
    throw new Error('getUserBookings called without userId');
  }
  return api(`/bookings/user/${userId}`);
};

export const requestRefund = async (req: {
  bookingId: string;
  reason: string;
  iban: string;
}) => api('/bookings/refund', 'POST', req);

// ------------------------
// DRIVER
// ------------------------
export const getDriverTrips = async (driverId: string): Promise<Trip[]> =>
  api(`/driver/trips/${driverId}`);

export const validateTicket = async (qrCode: string): Promise<Booking> =>
  api('/driver/validate-ticket', 'POST', { qrCode });

// ------------------------
// ADMIN
// ------------------------
export const getAllUsers = async (): Promise<User[]> =>
  api('/admin/users');

export const getAllBuses = async (): Promise<Bus[]> =>
  api('/admin/buses');

export const getAllTrips = async (): Promise<Trip[]> =>
  api('/admin/trips');

export const saveTrip = async (trip: Partial<Trip>) =>
  api('/admin/trips', 'POST', trip);

export const deleteTrip = async (id: string) =>
  api(`/admin/trips/${id}`, 'DELETE');

export const saveBus = async (bus: Partial<Bus>) =>
  api('/admin/buses', 'POST', bus);

export const deleteBus = async (id: string) =>
  api(`/admin/buses/${id}`, 'DELETE');

export const saveUser = async (user: Partial<User>) =>
  api('/admin/users', 'POST', user);

export const deleteUser = async (id: string) =>
  api(`/admin/users/${id}`, 'DELETE');

// ------------------------
// ADMIN WIDGETS
// ------------------------
export const getDailyTripStats = async () => api('/admin/stats/daily-trips');
export const getBusOccupationStats = async () => api('/admin/stats/bus-occupation');
export const getBusAlerts = async () => api('/admin/stats/alerts');
export const getReservationsHeatmap = async () => api('/admin/stats/reservations-heatmap');
export const getPrioritySeatStats = async () => api('/admin/stats/priority-seats');
export const getPaymentHistory = async () => api('/admin/payments/history');

// ------------------------
// GPS
// ------------------------
export const getGPSMock = async () => api('/admin/buses/active');
export const getActiveTrips = async () => api('/admin/active-trips');
export const getBusGPS = async (busId: string) => api(`/gps/${busId}`);
