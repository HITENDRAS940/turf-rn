import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { turfAPI, bookingAPI } from '../../services/api';
import { Turf, TimeSlot, BookingRequest, BookingResponse } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/shared/LoadingState';
import Button from '../../components/shared/Button';
import TimeSlotCard from '../../components/user/TimeSlotCard';
import { generateRandomPaymentDetails, simulatePaymentProcessing, formatPaymentMethod } from '../../utils/paymentUtils';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BookingSummaryScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { turf, turfId } = route.params;
  const [turfData, setTurfData] = useState<Turf | null>(turf || null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(!turf);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!turf && turfId) {
      fetchTurfData();
    }
    fetchAvailableSlots();
  }, [selectedDate]);

  const fetchTurfData = async () => {
    try {
      const response = await turfAPI.getTurfById(turfId);
      setTurfData(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch turf details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Utility function to generate time slots based on slotId (1-24 for 24 hours)
  const generateTimeSlot = (slotId: number, isAvailable: boolean, price: number): TimeSlot => {
    const hour = slotId - 1; // slotId 1 = hour 0 (00:00-01:00)
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    
    // Handle the wrap-around for 24th slot (23:00-00:00)
    const endHour = slotId === 24 ? 0 : slotId;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
    
    return {
      id: slotId, // Use slotId as the id
      slotId: slotId,
      startTime: startTime,
      endTime: endTime,
      price: price, // Use the price from API response
      isAvailable: isAvailable,
      isBooked: !isAvailable,
    };
  };

  const fetchAvailableSlots = async () => {
    if (!turfData && !turfId) return;

    try {
      const id = turfData?.id || turfId;
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const response = await turfAPI.getSlotAvailability(id, dateStr);
      const slotAvailabilityData = response.data;
      
      // Sort slots by slotId to ensure correct chronological order (1-24)
      const sortedSlotData = slotAvailabilityData.sort((a: any, b: any) => a.slotId - b.slotId);
      
      // Generate time slots based on the availability response
      const timeSlots: TimeSlot[] = sortedSlotData.map((slot: any) => {
        const timeSlot = generateTimeSlot(slot.slotId, slot.available, slot.price);
        return timeSlot;
      });
      
      setAvailableSlots(timeSlots);
    } catch (error) {
      console.error('❌ Error fetching slot availability:', error);
      Alert.alert('Error', 'Failed to fetch available slots');
      // Fallback: show empty slots
      setAvailableSlots([]);
    }
  };

  const toggleSlotSelection = (slot: TimeSlot) => {
    if (!slot.isAvailable) return;

    const isSelected = selectedSlots.find(s => s.id === slot.id);
    if (isSelected) {
      setSelectedSlots(selectedSlots.filter(s => s.id !== slot.id));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const calculateTotal = () => {
    return selectedSlots.reduce((total, slot) => total + slot.price, 0);
  };

  const handleConfirmBooking = async () => {
    if (selectedSlots.length === 0) {
      Alert.alert('No Slots Selected', 'Please select at least one time slot');
      return;
    }

    const totalAmount = calculateTotal();
    const slotsText = selectedSlots.map(slot => `${slot.startTime}-${slot.endTime}`).join(', ');
    const dateText = format(selectedDate, 'dd MMM yyyy');

    Alert.alert(
      'Confirm Booking',
      `📅 Date: ${dateText}\n⏰ Slots: ${slotsText}\n💰 Total: ₹${totalAmount}\n\nProceed with payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm & Pay', onPress: confirmBooking },
      ]
    );
  };

  const confirmBooking = async () => {
    setBookingLoading(true);
    try {
      // Generate random payment details for mock booking
      const totalAmount = calculateTotal();
      const paymentDetails = generateRandomPaymentDetails(totalAmount);
      
      // Simulate payment processing
      const paymentSuccess = await simulatePaymentProcessing();
      
      if (!paymentSuccess) {
        Alert.alert('Payment Failed', 'Please try again with a different payment method');
        return;
      }
      
      // Create booking request with new API format
      const bookingRequest: BookingRequest = {
        turfId: turfData?.id || turfId,
        slotIds: selectedSlots.map(s => s.slotId || s.id),
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        paymentDetails: paymentDetails,
      };

      const response = await bookingAPI.createBooking(bookingRequest);
      const bookingResponse: BookingResponse = response.data;
      
      Alert.alert(
        'Booking Confirmed! 🎉',
        `Reference: ${bookingResponse.reference}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to bookings with success message
              navigation.navigate('Bookings', { 
                newBooking: bookingResponse,
                showSuccess: true 
              });
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Booking error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create booking';
      
      Alert.alert('Booking Failed', errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  const currentTurf = turfData;
  if (!currentTurf) return null;

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Book Slot</Text>
              <Text style={styles.headerSubtitle}>Select your preferred time</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Turf Info Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.turfName, { color: theme.colors.text }]}>{currentTurf.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={theme.colors.primary} />
            <Text style={[styles.location, { color: theme.colors.textSecondary }]}>{currentTurf.location}</Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Date</Text>
          <View style={[styles.dateCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>Date</Text>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {format(selectedDate, 'EEEE, dd MMMM yyyy')}
              </Text>
            </View>
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Time Slots</Text>
          {availableSlots.length === 0 ? (
            <View style={[styles.emptySlots, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="time-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No slots available for this date</Text>
            </View>
          ) : (
            <View style={styles.slotsGrid}>
              {availableSlots.map((slot) => {
                const isSelected = selectedSlots.find(s => s.id === slot.id);

                return (
                  <TimeSlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={!!isSelected}
                    onPress={() => toggleSlotSelection(slot)}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* Selected Slots Summary */}
        {selectedSlots.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Selected Slots</Text>
            <View style={styles.selectedSlotsContainer}>
              {selectedSlots.map((slot) => (
                <View key={slot.id} style={[styles.selectedSlotChip, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary }]}>
                  <Text style={[styles.selectedSlotText, { color: theme.colors.primary }]}>
                    {slot.startTime} - {slot.endTime}
                  </Text>
                  <TouchableOpacity onPress={() => toggleSlotSelection(slot)}>
                    <Ionicons name="close-circle" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <View style={styles.totalContainer}>
          <View>
            <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>Total Amount</Text>
            <Text style={[styles.totalAmount, { color: theme.colors.text }]}>₹{calculateTotal()}</Text>
            {selectedSlots.length > 0 && (
              <Text style={[styles.totalSlots, { color: theme.colors.textSecondary }]}>
                {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
              </Text>
            )}
          </View>
        </View>
        <Button
          title="Confirm Booking"
          onPress={handleConfirmBooking}
          loading={bookingLoading}
          disabled={selectedSlots.length === 0}
          style={styles.confirmButton}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  turfName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySlots: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  slotsGrid: {
    gap: 12,
  },
  selectedSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedSlotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
  },
  selectedSlotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
    gap: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '800',
  },
  totalSlots: {
    fontSize: 12,
    marginTop: 4,
  },
  confirmButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
  },
});

export default BookingSummaryScreen;
