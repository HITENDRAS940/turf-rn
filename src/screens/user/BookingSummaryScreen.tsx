import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { turfAPI, bookingAPI } from '../../services/api';
import { Turf, TimeSlot } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/shared/LoadingState';
import Button from '../../components/shared/Button';
import TimeSlotCard from '../../components/user/TimeSlotCard';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';

const BookingSummaryScreen = ({ route, navigation }: any) => {
  const { theme } = useTheme();
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch turf details',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!turfData && !turfId) return;

    try {
      const id = turfData?.id || turfId;
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await turfAPI.getAvailableSlots(id, dateStr);
      setAvailableSlots(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch available slots',
      });
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
      Toast.show({
        type: 'error',
        text1: 'No Slots Selected',
        text2: 'Please select at least one time slot',
      });
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Are you sure you want to book ${selectedSlots.length} slot(s) for ₹${calculateTotal()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: confirmBooking },
      ]
    );
  };

  const confirmBooking = async () => {
    setBookingLoading(true);
    try {
      const bookingData = {
        turfId: turfData?.id || turfId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        slotIds: selectedSlots.map(s => s.slotId || s.id), // Use slotId for API
        totalAmount: calculateTotal(),
      };

      await bookingAPI.createBooking(bookingData);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Booking confirmed successfully!',
      });

      navigation.navigate('Bookings');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Booking Failed',
        text2: error.response?.data?.message || 'Failed to create booking',
      });
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Book Slot</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.turfInfo, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.turfName, { color: theme.colors.text }]}>{currentTurf.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={theme.colors.gray} />
            <Text style={[styles.location, { color: theme.colors.textSecondary }]}>{currentTurf.location}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Date</Text>
          <View style={[styles.dateCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {format(selectedDate, 'EEEE, dd MMMM yyyy')}
            </Text>
          </View>
          <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
            Tap on time slots below to select
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Time Slots</Text>
          {availableSlots.length === 0 ? (
            <View style={[styles.emptySlots, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="time-outline" size={48} color={theme.colors.gray} />
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

        {selectedSlots.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Selected Slots</Text>
            <View style={styles.selectedSlotsContainer}>
              {selectedSlots.map((slot) => (
                <View key={slot.id} style={[styles.selectedSlotChip, { backgroundColor: theme.colors.lightGray, borderColor: theme.colors.primary }]}>
                  <Text style={[styles.selectedSlotText, { color: theme.colors.text }]}>
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
      </ScrollView>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  turfInfo: {
    padding: 20,
    borderBottomWidth: 1,
  },
  turfName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
  },
  emptySlots: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectedSlotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    gap: 16,
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
    fontSize: 24,
    fontWeight: '700',
  },
  totalSlots: {
    fontSize: 12,
    marginTop: 2,
  },
  confirmButton: {
    width: '100%',
  },
});

export default BookingSummaryScreen;
