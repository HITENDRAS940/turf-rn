// filepath: /Users/hitendrasingh/Desktop/EzTurf/src/screens/admin/AdminTurfDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { adminAPI, turfAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';

// Shared Components
import RevenueCard from '../../components/shared/cards/RevenueCard';
import SlotGridCard from '../../components/shared/cards/SlotGridCard';
import BookingCard from '../../components/shared/cards/BookingCard';
import TurfDetailsModal, { TurfDetailsData } from '../../components/shared/modals/TurfDetailsModal';
import SlotsManagementModal from '../../components/shared/modals/SlotsManagementModal';
import AvailabilityModal from '../../components/shared/modals/AvailabilityModal';
import ImageManagementModal from '../../components/shared/modals/ImageManagementModal';

// Utilities
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';
import { calculateRevenueData } from '../../utils/revenueUtils';
import { mapSlotsWithBookingInfo, getBookedSlotIds } from '../../utils/slotUtils';

// Types
import { SlotConfig } from '../../types';

interface TurfSlot {
  id: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
  isBooked?: boolean;
}

interface TurfBooking {
  id: number;
  user: {
    name: string;
    phone: string;
  };
  reference: string;
  amount: number;
  status: string;
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
}

interface RevenueData {
  totalRevenue: number;
  totalBookings: number;
  bookedSlots: number;
  availableSlots: number;
}

type ModalStep = 'none' | 'details' | 'slots' | 'availability' | 'images';

const AdminTurfDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const { turf } = route.params;
  
  // State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<TurfBooking[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [slotsWithBookings, setSlotsWithBookings] = useState<TurfSlot[]>([]);
  const [currentStep, setCurrentStep] = useState<ModalStep>('none');
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  
  // Modal-specific state
  const [turfDetailsData, setTurfDetailsData] = useState<TurfDetailsData>({
    name: turf.name || '',
    location: turf.location || '',
    price: '',
    amenities: '',
    description: turf.description || '',
  });
  const [slots, setSlots] = useState<SlotConfig[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Data Fetching
  useEffect(() => {
    fetchTurfData();
  }, [selectedDate]);

  const fetchTurfData = async () => {
    try {
      const dateStr = formatDateToYYYYMMDD(selectedDate);
      
      // Fetch bookings for this turf on the selected date
      const bookingsData = await adminAPI.getTurfBookings(turf.id, dateStr);
      
      let bookingsList: TurfBooking[] = [];
      
      if (Array.isArray(bookingsData)) {
        bookingsList = bookingsData;
      } else if (bookingsData && Array.isArray(bookingsData.bookings)) {
        bookingsList = bookingsData.bookings;
      } else if (bookingsData && bookingsData.data && Array.isArray(bookingsData.data)) {
        bookingsList = bookingsData.data;
      }
      
      // Filter bookings to only show those matching the selected date
      const filteredBookings = bookingsList.filter((b: TurfBooking) => {
        return b.bookingDate === dateStr;
      });
      
      setBookings(filteredBookings);

      // Calculate revenue using utility
      const revenueData = calculateRevenueData(filteredBookings, turf.slots || []);
      setRevenue(revenueData);

      // Map slots with booking info using utility
      const bookedSlotIds = getBookedSlotIds(filteredBookings);
      const slotsData = mapSlotsWithBookingInfo(turf.slots || [], bookedSlotIds);
      setSlotsWithBookings(slotsData);

    } catch (error: any) {
      console.error('Error fetching turf data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to fetch turf data',
      });
      
      setBookings([]);
      const defaultRevenue = calculateRevenueData([], turf.slots || []);
      setRevenue(defaultRevenue);
      const slotsData = mapSlotsWithBookingInfo(turf.slots || [], new Set());
      setSlotsWithBookings(slotsData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTurfData();
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    setLoading(true);
  };

  // Management Actions
  const handleEditTurf = async () => {
    // Load current turf data
    try {
      const response = await turfAPI.getTurfById(turf.id);
      const turfData = response.data;
      
      setTurfDetailsData({
        name: turfData.name || '',
        location: turfData.location || '',
        price: turfData.price?.toString() || '',
        amenities: turfData.amenities || '',
        description: turfData.description || '',
      });
      
      setCurrentStep('details');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to fetch turf details',
      });
    }
  };
  
  const loadSlots = async () => {
    setSlotsLoading(true);
    try {
      const response = await adminAPI.getTurfSlots(turf.id);
      const dbSlots = response.data;
      
      if (dbSlots && dbSlots.length > 0) {
        const mappedSlots = dbSlots.map((dbSlot: any, index: number) => ({
          slotId: dbSlot.id || dbSlot.slotId || (index + 1),
          startTime: dbSlot.startTime,
          endTime: dbSlot.endTime,
          price: dbSlot.price,
          enabled: dbSlot.enabled === true,
        }));
        
        setSlots(mappedSlots);
      }
    } catch (error: any) {
      console.error('Error loading slots:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load slots',
      });
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDeleteTurf = () => {
    Alert.alert(
      'Delete Turf',
      `Are you sure you want to delete "${turf.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await adminAPI.deleteTurf(turf.id);
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Turf deleted successfully',
              });
              navigation.goBack();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to delete turf',
              });
            }
          }
        },
      ]
    );
  };

  const handleManageImages = () => {
    setCurrentStep('images');
  };

  // Modal Callbacks
  const handleTurfDetailsSave = async (details: TurfDetailsData) => {
    try {
      await adminAPI.updateTurfDetails(turf.id, {
        name: details.name,
        location: details.location,
        description: details.description,
        contactNumber: '', // Add if needed
      });
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Turf details updated successfully',
      });
      
      fetchTurfData();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to update turf details',
      });
    }
  };

  const handleSlotsSave = async (updatedSlots: SlotConfig[]) => {
    try {
      // Update each slot
      for (const slot of updatedSlots) {
        if (slot.price !== undefined) {
          await adminAPI.updateSlotPrice(turf.id, slot.slotId, slot.price);
        }
        
        if (slot.enabled) {
          await adminAPI.enableSlot(turf.id, slot.slotId);
        } else {
          await adminAPI.disableSlot(turf.id, slot.slotId);
        }
      }
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Slot configurations saved successfully',
      });
      
      fetchTurfData();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to save slot configurations',
      });
    }
  };

  const handleAvailabilitySave = async (isAvailable: boolean) => {
    try {
      if (isAvailable) {
        await adminAPI.setTurfAvailable(turf.id);
      } else {
        await adminAPI.setTurfNotAvailable(turf.id);
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Turf set as ${isAvailable ? 'available' : 'not available'} successfully`,
      });

      fetchTurfData();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to set turf availability',
      });
    }
  };

  const handleImageUpload = async (images: any[]) => {
    try {
      const formData = new FormData();
      images.forEach((asset, index) => {
        formData.append('images', {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any);
      });

      await adminAPI.uploadTurfImages(turf.id, formData);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Images uploaded successfully',
      });
      
      setImageRefreshKey(Date.now());
      fetchTurfData();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to upload images',
      });
      throw error;
    }
  };

  const handleImageDelete = async (imageUrls: string[]) => {
    try {
      await adminAPI.deleteTurfImages(turf.id, imageUrls);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Images deleted successfully',
      });
      
      setImageRefreshKey(Date.now());
      fetchTurfData();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to delete images',
      });
      throw error;
    }
  };

  const closeModal = () => {
    setCurrentStep('none');
  };

  const closeImagesModal = () => {
    setCurrentStep('none');
    setImageRefreshKey(Date.now());
  };

  // Render Bookings List
  const renderBookingsList = () => {
    if (bookings.length === 0) {
      return (
        <View style={styles.emptyBookings}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No bookings for this date
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.bookingsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Bookings ({bookings.length})
        </Text>

        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            variant="admin"
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border || 'rgba(0,0,0,0.05)' }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, { backgroundColor: theme.colors.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {turf.name}
          </Text>
          <View style={styles.headerLocationRow}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {turf.location}
            </Text>
          </View>
        </View>
      </View>

      {/* Management Action Buttons */}
      <View style={[styles.actionButtonsRow, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          style={[styles.actionButtonItem, { borderRightColor: theme.colors.border }]}
          onPress={handleManageImages}
        >
          <Ionicons name="images" size={20} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Images</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButtonItem, { borderRightColor: theme.colors.border }]}
          onPress={handleEditTurf}
        >
          <Ionicons name="pencil" size={20} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButtonItem}
          onPress={handleDeleteTurf}
        >
          <Ionicons name="trash" size={20} color={theme.colors.error} />
          <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
      <View style={[styles.dateSelector, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity 
          onPress={() => changeDate(-1)}
          style={styles.dateButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.dateDisplay}>
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {format(selectedDate, 'EEE, MMM dd, yyyy')}
          </Text>
          {formatDateToYYYYMMDD(selectedDate) === formatDateToYYYYMMDD(new Date()) && (
            <View style={[styles.todayBadge, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.todayText, { color: theme.colors.primary }]}>Today</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          onPress={() => changeDate(1)}
          style={styles.dateButton}
        >
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading data...
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        >
          <View style={styles.content}>
            {revenue && (
              <RevenueCard
                data={{
                  totalRevenue: revenue.totalRevenue,
                  totalBookings: revenue.totalBookings,
                  bookedSlots: revenue.bookedSlots,
                  availableSlots: revenue.availableSlots,
                }}
              />
            )}
            
            {slotsWithBookings.length > 0 && (
              <SlotGridCard
                slots={slotsWithBookings}
              />
            )}
            
            {renderBookingsList()}
          </View>
        </ScrollView>
      )}

      {/* Modals */}
      <TurfDetailsModal
        visible={currentStep === 'details'}
        onClose={closeModal}
        onSave={handleTurfDetailsSave}
        onSkipToSlots={() => {
          loadSlots();
          setCurrentStep('slots');
        }}
        initialData={turfDetailsData}
        showSkipButton={true}
      />

      <SlotsManagementModal
        visible={currentStep === 'slots'}
        onClose={closeModal}
        onSave={handleSlotsSave}
        onSkip={() => setCurrentStep('availability')}
        slots={slots}
        loading={slotsLoading}
        showRefresh={true}
        onRefresh={() => loadSlots()}
        turfName={turf.name}
      />

      <AvailabilityModal
        visible={currentStep === 'availability'}
        onClose={closeModal}
        onSave={handleAvailabilitySave}
        currentAvailability={turf.isAvailable || false}
        turfName={turf.name}
      />

      <ImageManagementModal
        visible={currentStep === 'images'}
        onClose={closeImagesModal}
        onUpload={handleImageUpload}
        onDelete={handleImageDelete}
        existingImages={turf.images || []}
        turfName={turf.name}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderRightWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateButton: {
    padding: 8,
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  todayText: {
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  bookingsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyBookings: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});

export default AdminTurfDetailScreen;
