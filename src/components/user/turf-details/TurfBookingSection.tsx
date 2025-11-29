import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { TimeSlot } from '../../../types';
import { format } from 'date-fns';
import CustomCalendar from '../../user/CustomCalendar';
import TimeSlotCard from '../../user/TimeSlotCard';
import Button from '../../shared/Button';

interface TurfBookingSectionProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  availableSlots: TimeSlot[];
  selectedSlots: TimeSlot[];
  onSlotToggle: (slot: TimeSlot) => void;
  slotsLoading: boolean;
  bookingLoading: boolean;
  onConfirmBooking: () => void;
  onClose: () => void;
  totalAmount: number;
}

const TurfBookingSection: React.FC<TurfBookingSectionProps> = ({
  selectedDate,
  onDateSelect,
  showDatePicker,
  setShowDatePicker,
  availableSlots,
  selectedSlots,
  onSlotToggle,
  slotsLoading,
  onClose,
}) => {
  const { theme } = useTheme();

  return (
    <>
      <View style={styles.section}>
        <View style={styles.bookingSectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Book This Turf</Text>
          <TouchableOpacity 
            onPress={onClose}
            style={[styles.closeBookingButton, { backgroundColor: theme.colors.lightGray }]}
          >
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.dateCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color={theme.colors.primary} />
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {format(selectedDate, 'EEEE, dd MMMM yyyy')}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <CustomCalendar
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Slots</Text>
        
        {slotsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading slots...</Text>
          </View>
        ) : availableSlots.length === 0 ? (
          <View style={[styles.emptySlots, { backgroundColor: theme.colors.lightGray }]}>
            <Ionicons name="time-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No slots available for this date
            </Text>
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
                  onPress={() => onSlotToggle(slot)}
                />
              );
            })}
          </View>
        )}
      </View>

    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  bookingSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  closeBookingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptySlots: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  slotsGrid: {
    paddingVertical: 20,
    gap: 6,
  },
});

export default TurfBookingSection;
