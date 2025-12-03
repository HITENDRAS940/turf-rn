import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';
import { CreateAdminPayload, AdminResponse, ManagerTurfResponse, BookingRequest, BookingResponse } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  sendOTP: (phone: string) => api.post('/auth/request-otp', { phone }),
  verifyOTP: (phone: string, otp: string) =>
    api.post(`/auth/verify-otp/${encodeURIComponent(phone)}`, { otp }),
};

// User APIs
export const userAPI = {
  setName: (name: string) => api.post('/user/setname', { name }),
};

// Turf APIs
export const turfAPI = {
  getAllTurfs: () => api.get('/turfs'),
  getTurfById: (id: number) => api.get(`/turfs/${id}`),
  getAvailableSlots: (turfId: number, date: string) =>
    api.get(`/turfs/${turfId}/slots?date=${date}`),
  getSlotAvailability: (turfId: number, date: string) =>
    api.get(`/turf-slots/${turfId}/availability?date=${date}`),
  getLowestPrice: (turfId: number) =>
    api.get(`/turfs/${turfId}/lowest-price`),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (data: BookingRequest) => api.post<BookingResponse>('/bookings/user', data),
  getUserBookings: () => api.get('/user/bookings'),
  cancelBooking: (id: number) => api.delete(`/user/bookings/${id}`),
};

// Admin APIs
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllBookings: () => api.get('/admin/bookings'),
  createTurf: (data: any) => api.post('/admin/turf-details', data),
  updateTurf: (id: number, data: any) => api.put(`/admin/turfs/${id}`, data),
  deleteTurf: (id: number) => api.delete(`/admin/turf/${id}`),
  updateSlotPricing: (data: any) => api.post('/admin/slots/pricing', data),

  // Get turfs for specific admin
  getAdminTurfs: (userId: number) => api.get(`/admin/${userId}/turfs`),

  // Get bookings for a specific turf
  getTurfBookings: async (turfId: number, date?: string) => {
    const url = date
      ? `/admin/turf/${turfId}/bookings?date=${date}`
      : `/admin/turf/${turfId}/bookings`;
    const response = await api.get(url);
    return response.data;
  },

  // New Turf Creation Flow APIs
  createTurfDetails: (data: { name: string; location: string; description: string; contactNumber?: string }) =>
    api.post('/admin/turf-details', data),
  updateTurfDetails: (turfId: number, data: { name: string; location: string; description: string; contactNumber?: string }) =>
    api.put(`/admin/turf/${turfId}`, data),
  getTurfSlots: (turfId: number) =>
    api.get(`/admin/turf/${turfId}/slots`),
  uploadTurfImages: (turfId: number, formData: FormData) =>
    api.post(`/admin/turf/${turfId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteTurfImages: (turfId: number, imageUrls: string[]) => {
    console.log('🗑️ NEW API: Deleting images with URLs:', imageUrls);
    console.log('📋 NEW API: Request payload (array format):', imageUrls);
    console.log('📡 NEW API: Making DELETE request to:', `/admin/turf/${turfId}/images`);
    console.log('📄 NEW API: Request body will be:', JSON.stringify(imageUrls));

    // Send the array directly as the request body (not wrapped in an object)
    return api.delete(`/admin/turf/${turfId}/images`, {
      data: imageUrls,  // Send array directly: ["url1", "url2"]
      headers: { 'Content-Type': 'application/json' }
    });
  },
  updateSlotPrice: (turfId: number, slotId: number, price: number) =>
    api.patch(`/admin/turf/${turfId}/slot/${slotId}/price?price=${price}`),
  enableSlot: (turfId: number, slotId: number) =>
    api.patch(`/admin/turf/${turfId}/slot/${slotId}/enable`),
  disableSlot: (turfId: number, slotId: number) =>
    api.patch(`/admin/turf/${turfId}/slot/${slotId}/disable`),
  setTurfAvailable: (turfId: number) =>
    api.patch(`/admin/turf/${turfId}/available`),
  setTurfNotAvailable: (turfId: number) =>
    api.patch(`/admin/turf/${turfId}/notAvailable`),
  getTurfAvailability: (turfId: number) =>
    api.get(`/admin/turf/${turfId}/availability`),

  // Manual Booking by Admin
  createManualBooking: (data: { turfId: number; slotIds: number[]; bookingDate: string }) =>
    api.post('/admin/booking', data),
};

// Manager APIs
export const managerAPI = {
  createAdmin: async (data: CreateAdminPayload) => {
    const response = await api.post<AdminResponse>('/manager/admins', data);
    return response.data;
  },

  getAllAdmins: async () => {
    const response = await api.get<AdminResponse[]>('/manager/admins');
    return response.data;
  },

  deleteAdmin: async (adminId: number) => {
    const response = await api.delete<{ message: string }>(`/manager/admins/${adminId}`);
    return response.data;
  },

  getAllTurfsManager: async () => {
    const response = await api.get<ManagerTurfResponse[]>('/manager/turfs');
    return response.data;
  },

  getAdminTurfs: async (adminProfileId: number) => {
    const response = await api.get(`/manager/admins/${adminProfileId}/turfs`);
    return response.data;
  },

  getTurfBookings: async (turfId: number, date?: string) => {
    const url = date
      ? `/manager/turfs/${turfId}/bookings?date=${date}`
      : `/manager/turfs/${turfId}/bookings`;
    const response = await api.get(url);
    return response.data;
  },

  getTurfRevenue: async (turfId: number, date: string) => {
    const response = await api.get(`/manager/turfs/${turfId}/revenue?date=${date}`);
    return response.data;
  },
};

// Export combined API object for convenience
export { api };
export default {
  ...api,
  ...managerAPI,
  auth: authAPI,
  user: userAPI,
  turf: turfAPI,
  booking: bookingAPI,
  admin: adminAPI,
  manager: managerAPI,
};
