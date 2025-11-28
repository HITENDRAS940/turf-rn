
// filepath: /Users/hitendrasingh/Desktop/EzTurf/src/screens/manager/ManagerTurfDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { managerAPI, turfAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { format } from 'date-fns';

// Shared Components
import RevenueCard from '../../components/shared/cards/RevenueCard';
import SlotGridCard from '../../components/shared/cards/SlotGridCard';
import BookingCard from '../../components/shared/cards/BookingCard';

// Utilities
import { formatDateToYYYYMMDD } from '../../utils/dateUtils';
import { calculateRevenueData } from '../../utils/revenueUtils';
import { mapSlotsWithBookingInfo, getBookedSlotIds } from '../../utils/slotUtils';

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

const ManagerTurfDetailScreen = () => {
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

  useEffect(() => {
    fetchTurfData();
  }, [selectedDate]);

  const fetchTurfData = async () => {
    try {
      const dateStr = formatDateToYYYYMMDD(selectedDate);
      
      // Fetch bookings for this turf on the selected date
      const bookingsData = await managerAPI.getTurfBookings(turf.id, dateStr);
      
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
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete images');
      throw error;
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
    <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]} safeAreaEdges={['top']}>
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
        <View style={[styles.managerBadge, { backgroundColor: theme.colors.primary + '20' }]}>
          <Ionicons name="eye-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.managerBadgeText, { color: theme.colors.primary }]}>
            View Only
          </Text>
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
    </ScreenWrapper>
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
  managerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  managerBadgeText: {
    fontSize: 12,
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

export default ManagerTurfDetailScreen;
