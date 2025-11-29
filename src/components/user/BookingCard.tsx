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
    if (!slots || slots.length === 0) return 'No slots selected';
    if (slots.length === 1) {
      return `${slots[0].startTime} - ${slots[0].endTime}`;
    }
    return `${slots.length} slots • ${slots[0].startTime} - ${slots[slots.length - 1].endTime}`;
  };

  const isBookingCancellable = () => {
    const bookingDate = new Date(booking.bookingDate || booking.date || '');
    const now = new Date();
    const diffHours = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Allow cancellation if booking is at least 2 hours in the future
    return diffHours >= 2 && booking.status === 'CONFIRMED';
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED': return theme.colors.success || '#10B981';
      case 'PENDING': return theme.colors.warning || '#F59E0B';
      case 'CANCELLED': return theme.colors.error || '#EF4444';
      case 'COMPLETED': return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };

  const statusColor = getStatusColor(booking.status);

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.colors.card }]} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.9}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.turfName, { color: theme.colors.text }]} numberOfLines={1}>
            {booking.turfName}
          </Text>
          <Text style={[styles.bookingId, { color: theme.colors.textSecondary }]}>
            ID: #{booking.reference || booking.id}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {booking.status}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={[styles.iconBox, { backgroundColor: `${theme.colors.primary}10` }]}>
            <Ionicons name="calendar" size={18} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Date</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {format(new Date(booking.bookingDate || booking.date || ''), 'EEE, dd MMM yyyy')}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={[styles.iconBox, { backgroundColor: `${theme.colors.secondary}10` }]}>
            <Ionicons name="time" size={18} color={theme.colors.secondary} />
          </View>
          <View>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Time</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {formatSlots(booking.slots)}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={[styles.iconBox, { backgroundColor: '#F59E0B15' }]}>
            <Ionicons name="wallet" size={18} color="#F59E0B" />
          </View>
          <View>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Amount</Text>
            <Text style={[styles.priceValue, { color: theme.colors.primary }]}>
              ₹{booking.amount || booking.totalAmount}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer / Actions */}
      {(booking.createdAt || (showActions && isBookingCancellable() && onCancel)) && (
        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          {booking.createdAt ? (
            <Text style={[styles.bookedOn, { color: theme.colors.textSecondary }]}>
              Booked on {format(new Date(booking.createdAt), 'dd MMM, hh:mm a')}
            </Text>
          ) : <View />}

          {showActions && isBookingCancellable() && onCancel && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.colors.error }]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.error }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  turfName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  bookingId: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginBottom: 16,
    opacity: 0.5,
  },
  detailsContainer: {
    gap: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderStyle: 'dotted',
  },
  bookedOn: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FEF2F2',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default BookingCard;
