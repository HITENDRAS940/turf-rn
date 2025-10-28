import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

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
  createBooking: (data: any) => api.post('/bookings', data),
  getUserBookings: () => api.get('/bookings/user'),
  cancelBooking: (id: number) => api.delete(`/bookings/${id}`),
};

// Admin APIs
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllBookings: () => api.get('/admin/bookings'),
  createTurf: (data: any) => api.post('/admin/turfs', data),
  updateTurf: (id: number, data: any) => api.put(`/admin/turfs/${id}`, data),
  deleteTurf: (id: number) => api.delete(`/admin/turf/${id}`),
  updateSlotPricing: (data: any) => api.post('/admin/slots/pricing', data),
  
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
};

export default api;
