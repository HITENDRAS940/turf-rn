export interface User {
  phone: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  token: string;
  name?: string;
  isNewUser?: boolean;
}

export interface Turf {
  id: number;
  name: string;
  location: string;
  rating: number;
  image: string;
  availability?: boolean;
  images?: string[];
  description?: string;
  turfType?: string;
  contactNumber?: string;
  openingTime?: string;
  closingTime?: string;
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
  isBooked?: boolean;
  slotId?: number; // Add slotId for mapping with availability API
}

export interface SlotAvailability {
  slotId: number;
  available: boolean;
  price: number;
}

export interface BookingRequest {
  turfId: number;
  slotIds: number[];
  bookingDate: string;
  paymentDetails: {
    method: string;
    transactionId: string;
    amount: number;
    cardNumber?: string;
    upiId?: string;
  };
}

export interface BookingSlot {
  slotId: number;
  startTime: string;
  endTime: string;
  price: number;
}

export interface BookingResponse {
  id: number;
  reference: string;
  amount: number;
  status: string;
  turfName: string;
  slotTime: string;
  slots: BookingSlot[];
  bookingDate: string;
  createdAt: string;
}

export interface Booking {
  id: number;
  turfId?: number;
  turfName: string;
  date: string;
  slots: Array<{
    slotId?: number;
    startTime: string;
    endTime: string;
    price?: number;
  }>;
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'COMPLETED';
  createdAt?: string;
  playerName?: string;
  phone?: string;
  reference?: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeTurfs: number;
  todayBookings: number;
}

// New Turf Creation Flow Types
export interface TurfDetails {
  name: string;
  location: string;
  description: string;
  contactNumber?: string;
}

export interface TurfCreationResponse {
  id: number;
  name: string;
  location: string;
  description: string;
  contactNumber?: string;
  images: string[];
  slots: any[];
}

export interface SlotConfig {
  slotId: number;
  startTime: string;
  endTime: string;
  price?: number;
  enabled: boolean;
}

export interface SlotUpdate {
  slotId: number;
  price?: number;
  enabled: boolean;
  priceChanged: boolean;
  enabledChanged: boolean;
}
