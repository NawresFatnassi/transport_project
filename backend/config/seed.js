import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, enum: ["CLIENT", "DRIVER", "ADMIN"], default: "CLIENT" },

  licenseNumber: String,
  licenseExpiry: String,
  city: String,
  status: { type: String, default: "Active" },
  assignedBusId: String
});

const busSchema = new mongoose.Schema({
  number: String,
  capacity: Number,
  type: String,
  driverId: String,
  status: { type: String, enum: ["Active", "Maintenance"], default: "Active" },
  gpsTracking: Boolean,
  gpsDeviceId: String
});

const tripSchema = new mongoose.Schema({
  origin: String,
  destination: String,
  date: String,
  departureTime: String,
  arrivalTime: String,
  price: Number,
  busId: String,
  driverId: String,
  availableSeats: Number,
  status: { type: String, default: "Active" }
});

export const User = mongoose.model("User", userSchema);
export const Bus = mongoose.model("Bus", busSchema);
export const Trip = mongoose.model("Trip", tripSchema);
