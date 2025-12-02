/**
 * useTurfManagement Hook
 * Custom hook for managing turf CRUD operations
 * - Fetch turf data
 * - Create/update/delete turfs
 * - Loading and error states
 * - Success/error notifications
 */

import { useState, useCallback } from 'react';
import { adminAPI, turfAPI } from '../services/api';
import { Alert } from 'react-native';
import { TurfDetails, SlotConfig } from '../types';

interface UseTurfManagementOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface Turf extends TurfDetails {
  id: number;
  isAvailable?: boolean;
  [key: string]: any;
}

export const useTurfManagement = (options?: UseTurfManagementOptions) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turf, setTurf] = useState<Turf | null>(null);

  /**
   * Fetch turf by ID
   */
  const fetchTurf = useCallback(async (turfId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await turfAPI.getTurfById(turfId);
      setTurf(response.data);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch turf details';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  /**
   * Create new turf
   */
  const createTurf = useCallback(async (turfData: {
    name: string;
    location: string;
    price: number;
    description?: string;
    amenities?: string;
    contactNumber?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.createTurf(turfData);
      const successMsg = 'Turf created successfully';
      options?.onSuccess?.(successMsg);
      Alert.alert('Success', successMsg);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create turf';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  /**
   * Update turf details
   */
  const updateTurf = useCallback(async (turfId: number, turfData: {
    name?: string;
    location?: string;
    price?: number;
    description?: string;
    amenities?: string;
    contactNumber?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.updateTurf(turfId, turfData);
      const successMsg = 'Turf updated successfully';
      Alert.alert('Success', successMsg);

      // Update local state
      if (turf && turf.id === turfId) {
        setTurf({ ...turf, ...turfData });
      }

      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update turf';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [turf, options]);

  /**
   * Delete turf
   */
  const deleteTurf = useCallback(async (turfId: number) => {
    setLoading(true);
    setError(null);
    try {
      await adminAPI.deleteTurf(turfId);
      const successMsg = 'Turf deleted successfully';
      options?.onSuccess?.(successMsg);
      Alert.alert('Success', successMsg);

      // Clear local state if deleted turf was loaded
      if (turf && turf.id === turfId) {
        setTurf(null);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete turf';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [turf, options]);

  /**
   * Set turf availability
   */
  const setAvailability = useCallback(async (turfId: number, isAvailable: boolean) => {
    setLoading(true);
    setError(null);
    try {
      // Use the correct API methods
      if (isAvailable) {
        await adminAPI.setTurfAvailable(turfId);
      } else {
        await adminAPI.setTurfNotAvailable(turfId);
      }

      const successMsg = 'Availability updated successfully';
      Alert.alert('Success', successMsg);

      // Update local state
      if (turf && turf.id === turfId) {
        setTurf({ ...turf, isAvailable });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update availability';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [turf, options]);

  /**
   * Fetch all turfs (using manager API or admin API based on availability)
   */
  const fetchAllTurfs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Note: adminAPI doesn't have getAllTurfs, so this would need to be implemented
      // or use a different approach. For now, returning empty array.
      console.warn('getAllTurfs not implemented in adminAPI');
      return [];
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch turfs';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      Alert.alert('Error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setTurf(null);
  }, []);

  return {
    // State
    loading,
    error,
    turf,

    // Actions
    fetchTurf,
    createTurf,
    updateTurf,
    deleteTurf,
    setAvailability,
    fetchAllTurfs,
    clearError,
    reset,
  };
};
