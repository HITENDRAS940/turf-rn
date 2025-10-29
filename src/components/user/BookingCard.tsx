import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import StatusBadge from '../shared/StatusBadge';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ 
  booking, 
  onPress,
  onCancel,
  showActions = true 
}) => {
  const { theme } = useTheme();
  
  const formatSlots = (slots: any[]) => {
    if (slots.length === 1) {
      return `${slots[0].startTime} - ${slots[0].endTime}`;
    }
    return `${slots.length} slots`;
  };

  const isBookingCancellable = () => {
    const bookingDate = new Date(booking.bookingDate || booking.date || '');
    const now = new Date();
    const diffHours = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Allow cancellation if booking is at least 2 hours in the future
    return diffHours >= 2 && booking.status === 'CONFIRMED';
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.colors.card }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.turfName, { color: theme.colors.text }]}>{booking.turfName}</Text>
          <StatusBadge status={booking.status} />
        </View>
        <Text style={[styles.bookingId, { color: theme.colors.textSecondary }]}>
          #{booking.reference || booking.id}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.gray} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {format(new Date(booking.bookingDate || booking.date || ''), 'dd MMM yyyy')}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.gray} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {booking.slotTime || formatSlots(booking.slots)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color={theme.colors.gray} />
          <Text style={[styles.priceText, { color: theme.colors.primary }]}>
            ₹{booking.amount || booking.totalAmount}
          </Text>
        </View>

        {booking.createdAt && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.gray} />
            <Text style={[styles.infoSubText, { color: theme.colors.textSecondary }]}>
              Booked on {format(new Date(booking.createdAt), 'dd MMM yyyy')}
            </Text>
          </View>
        )}
      </View>

      {showActions && isBookingCancellable() && onCancel && (
        <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.colors.error }]}
            onPress={onCancel}
          >
            <Ionicons name="close-circle-outline" size={16} color={theme.colors.error} />
            <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    gap: 8,
  },
  turfName: {
    fontSize: 18,
    fontWeight: '600',
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  content: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoSubText: {
    fontSize: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FEF2F2',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BookingCard;
