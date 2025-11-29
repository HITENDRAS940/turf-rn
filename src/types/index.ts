export interface User {
  id: number;
  phone: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MANAGER';
  token: string;
  name?: string;
  email?: string;
  isNewUser?: boolean;
  // Admin specific fields
  businessName?: string;
  businessAddress?: string;
  enabled?: boolean;
  createdAt?: string;
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
  price?: number;
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
  isBooked?: boolean;
  isPast?: boolean; // Add isPast to distinguish past slots from booked slots
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
  user: {
    name: string;
    phone: string;
  };
  reference: string;
  amount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING' | 'COMPLETED';
  turfName: string;
  slotTime: string;
  slots: Array<{
    slotId: number;
    startTime: string;
    endTime: string;
    price: number;
  }>;
  bookingDate: string;
  createdAt: string;
  // Backwards compatibility fields
  turfId?: number;
  date?: string;
  totalAmount?: number;
  playerName?: string;
  phone?: string;
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

export interface CreateAdminPayload {
  phone: string;
  email: string;
  name: string;
  businessName: string;
  businessAddress: string;
}

export interface AdminResponse {
  id: number;
  phone: string;
  email: string;
  name: string;
  role: 'ROLE_ADMIN';
  enabled: boolean;
  createdAt: string;
  businessName: string;
  businessAddress: string;
}

export interface ManagerTurfResponse {
  id: number;
  name: string;
  location: string;
  createdBy: number;
  createdByName: string;
}
