export enum UserRole {
  CLIENT = 'CLIENT',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  licenseNumber?: string;
  city?: string;
  assignedBusId?: string;
  status?: 'Active' | 'Inactive';
}

export interface Bus {
  id: string;
  number: string;
  capacity: number;
  type: 'Standard' | 'Confort' | 'VIP';
  driverId?: string;
  status: 'Active' | 'Maintenance';
}

export interface Trip {
  _id: string;          // ⭐ Obligatoire
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  busId: string;
  driverId: string;
  availableSeats: number;
  status?: 'Active' | 'Closed';
}

export interface Seat {
  number: string;
  isPriority: boolean;
  isBooked: boolean;
}

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  passengerName: string;
  seatNumber: string;
  tripDate: string;
  status: 'CONFIRMED' | 'USED' | 'PENDING_REFUND' | 'REFUNDED' | 'CANCELLED';
  qrCodeData: string;
  price: number;
  bookingDate: string;
  refundReason?: string;
  refundIban?: string;
}

export interface RefundRequest {
  bookingId: string;
  reason: string;
  iban: string;
  phone: string;
}