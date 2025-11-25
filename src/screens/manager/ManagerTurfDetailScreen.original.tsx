import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { managerAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';

interface TurfSlot {
  id: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
  isBooked?: boolean;
  bookingId?: number;
  bookedBy?: string;
  bookedByPhone?: string;
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

const ManagerTurfDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const { turf } = route.params;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<TurfBooking[]>([]);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [slotsWithBookings, setSlotsWithBookings] = useState<TurfSlot[]>([]);

  useEffect(() => {
    fetchTurfData();
  }, [selectedDate]);

  const fetchTurfData = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Fetch bookings and revenue data
      const bookingsData = await managerAPI.getTurfBookings(turf.id, dateStr);
      
      // Extract bookings array from response - handle multiple possible formats
      let bookingsList: TurfBooking[] = [];
      
      if (Array.isArray(bookingsData)) {
        bookingsList = bookingsData;
      } else if (bookingsData && Array.isArray(bookingsData.bookings)) {
        bookingsList = bookingsData.bookings;
      } else if (bookingsData && bookingsData.data && Array.isArray(bookingsData.data)) {
        bookingsList = bookingsData.data;
      }
      
      // Filter bookings to only show those matching the selected date
      const filteredBookings = bookingsList.filter((booking: TurfBooking) => {
        return booking.bookingDate === dateStr;
      });
      
      setBookings(filteredBookings);

      // Calculate revenue from bookings
      const totalRevenue = filteredBookings.reduce((sum: number, b: TurfBooking) => {
        return sum + (b.amount || 0);
      }, 0);
      
      const totalBookings = filteredBookings.length;

      // Map slots with booking information
      const bookedSlotIds = new Set(
        filteredBookings.flatMap((b: TurfBooking) => (b.slots || []).map(s => s.slotId))
      );

      const slotsData = (turf.slots || []).map((slot: TurfSlot) => ({
        ...slot,
        isBooked: bookedSlotIds.has(slot.id),
      }));

      setSlotsWithBookings(slotsData);

      // Calculate slot statistics
      const enabledSlots = slotsData.filter((s: TurfSlot) => s.enabled);
      const bookedSlots = slotsData.filter((s: TurfSlot) => s.enabled && s.isBooked).length;
      const availableSlots = enabledSlots.length - bookedSlots;

      setRevenue({
        totalRevenue,
        totalBookings,
        bookedSlots,
        availableSlots,
      });
    } catch (error: any) {
      console.error('Error fetching turf data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to fetch turf data',
      });
      
      // Set empty state on error
      setBookings([]);
      setRevenue({
        totalRevenue: 0,
        totalBookings: 0,
        bookedSlots: 0,
        availableSlots: turf.slots.filter((s: TurfSlot) => s.enabled).length,
      });
      setSlotsWithBookings(turf.slots.map((slot: TurfSlot) => ({ ...slot, isBooked: false })));
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

  const formatTime = (time: string) => {
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const renderSlotGrid = () => {
    return (
      <View style={styles.slotsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Slot Status ({slotsWithBookings.filter(s => s.enabled).length} Active)
        </Text>
        
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Disabled</Text>
          </View>
        </View>

        <View style={styles.slotsGrid}>
          {slotsWithBookings.map((slot) => (
            <View
              key={slot.id}
              style={[
                styles.slotChip,
                { 
                  backgroundColor: !slot.enabled 
                    ? '#E5E7EB' 
                    : slot.isBooked 
                      ? '#FEE2E2' 
                      : '#D1FAE5',
                  borderColor: !slot.enabled 
                    ? '#9CA3AF' 
                    : slot.isBooked 
                      ? '#EF4444' 
                      : '#10B981',
                }
              ]}
            >
              <Text style={[
                styles.slotChipText,
                { 
                  color: !slot.enabled 
                    ? '#6B7280' 
                    : slot.isBooked 
                      ? '#991B1B' 
                      : '#047857'
                }
              ]}>
                {formatTime(slot.startTime)}
              </Text>
              {slot.isBooked && (
                <Ionicons name="lock-closed" size={10} color="#991B1B" />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRevenueCard = () => {
    if (!revenue) return null;

    return (
      <View style={[styles.revenueCard, { backgroundColor: theme.colors.card }]}>
        <View style={styles.revenueHeader}>
          <Ionicons name="analytics-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.revenueTitle, { color: theme.colors.text }]}>
            Revenue Analytics
          </Text>
        </View>

        <View style={styles.revenueStats}>
          <View style={styles.revenueStatItem}>
            <Text style={[styles.revenueStatValue, { color: '#10B981' }]}>
              ₹{revenue.totalRevenue.toLocaleString()}
            </Text>
            <Text style={[styles.revenueStatLabel, { color: theme.colors.textSecondary }]}>
              Total Revenue
            </Text>
          </View>

          <View style={[styles.revenueDivider, { backgroundColor: theme.colors.border || 'rgba(0,0,0,0.1)' }]} />

          <View style={styles.revenueStatItem}>
            <Text style={[styles.revenueStatValue, { color: theme.colors.primary }]}>
              {revenue.totalBookings}
            </Text>
            <Text style={[styles.revenueStatLabel, { color: theme.colors.textSecondary }]}>
              Bookings
            </Text>
          </View>

          <View style={[styles.revenueDivider, { backgroundColor: theme.colors.border || 'rgba(0,0,0,0.1)' }]} />

          <View style={styles.revenueStatItem}>
            <Text style={[styles.revenueStatValue, { color: '#F59E0B' }]}>
              {revenue.bookedSlots}/{revenue.bookedSlots + revenue.availableSlots}
            </Text>
            <Text style={[styles.revenueStatLabel, { color: theme.colors.textSecondary }]}>
              Slots Booked
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
          <View key={booking.id} style={[styles.bookingCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.bookingHeader}>
              <View style={[styles.bookingAvatar, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.bookingAvatarText, { color: theme.colors.primary }]}>
                  {booking.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bookingUserName, { color: theme.colors.text }]}>
                  {booking.user?.name || 'Unknown User'}
                </Text>
                <View style={styles.bookingPhoneRow}>
                  <Ionicons name="call-outline" size={12} color={theme.colors.textSecondary} />
                  <Text style={[styles.bookingPhone, { color: theme.colors.textSecondary }]}>
                    {booking.user?.phone || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={[styles.amountBadge, { backgroundColor: '#10B981' + '20' }]}>
                <Text style={[styles.amountText, { color: '#10B981' }]}>
                  ₹{booking.amount || 0}
                </Text>
              </View>
            </View>

            <View style={styles.bookingSlotsContainer}>
              <Text style={[styles.bookingSlotsLabel, { color: theme.colors.textSecondary }]}>
                Booked Slots:
              </Text>
              <View style={styles.bookingSlotsWrapper}>
                {(booking.slots || []).map((slot, slotIndex) => (
                  <View key={`${booking.id}-${slot.slotId}-${slotIndex}`} style={[styles.bookingSlotChip, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Text style={[styles.bookingSlotText, { color: theme.colors.primary }]}>
                      {formatTimeRange(slot.startTime, slot.endTime)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.paymentStatusRow, { borderTopColor: theme.colors.border || 'rgba(0,0,0,0.05)' }]}>
              <Ionicons 
                name={booking.status === 'CONFIRMED' ? 'checkmark-circle' : 'time-outline'} 
                size={16} 
                color={booking.status === 'CONFIRMED' ? '#10B981' : '#F59E0B'} 
              />
              <Text style={[styles.paymentStatusText, { 
                color: booking.status === 'CONFIRMED' ? '#10B981' : '#F59E0B' 
              }]}>
                {booking.status || 'PENDING'}
              </Text>
            </View>
          </View>
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
          {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && (
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
            {renderRevenueCard()}
            {renderSlotGrid()}
            {renderBookingsList()}
          </View>
        </ScrollView>
      )}
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
  revenueCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  revenueTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  revenueStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  revenueStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  revenueStatValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  revenueStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  revenueDivider: {
    width: 1,
    height: '100%',
  },
  slotsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  slotChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingsContainer: {
    marginBottom: 20,
  },
  bookingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bookingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingAvatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  bookingUserName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  bookingPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingPhone: {
    fontSize: 12,
  },
  amountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  bookingSlotsContainer: {
    marginBottom: 12,
  },
  bookingSlotsLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  bookingSlotsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  bookingSlotChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bookingSlotText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paymentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
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

export default ManagerTurfDetailScreen;
