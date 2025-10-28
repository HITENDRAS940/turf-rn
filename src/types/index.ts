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
}

export interface Booking {
  id: number;
  turfId: number;
  turfName: string;
  date: string;
  slots: TimeSlot[];
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
  createdAt: string;
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
