import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';
import { Booking } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';
import StatusBadge from '../../components/shared/StatusBadge';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';

const AllBookingsScreen = () => {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const filters = [
    { key: 'ALL', label: 'All', count: bookings.length },
    { key: 'CONFIRMED', label: 'Confirmed', count: bookings.filter(b => b.status === 'CONFIRMED').length },
    { key: 'PENDING', label: 'Pending', count: bookings.filter(b => b.status === 'PENDING').length },
    { key: 'CANCELLED', label: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length },
    { key: 'COMPLETED', label: 'Completed', count: bookings.filter(b => b.status === 'COMPLETED').length },
  ];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await adminAPI.getAllBookings();
      setBookings(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch bookings',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const filteredBookings = selectedFilter === 'ALL' 
    ? bookings 
    : bookings.filter(booking => booking.status === selectedFilter);

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <View style={[styles.bookingCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.turfInfo}>
          <Text style={[styles.turfName, { color: theme.colors.text }]}>{item.turfName}</Text>
          <StatusBadge status={item.status} />
        </View>
        <Text style={[styles.referenceText, { color: theme.colors.textSecondary }]}>
          #{item.reference}
        </Text>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color={theme.colors.gray} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {item.user?.name || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color={theme.colors.gray} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {item.user?.phone ? formatPhoneForDisplay(item.user.phone) : 'N/A'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.gray} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {format(new Date(item.bookingDate), 'dd MMM yyyy')}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.gray} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            {item.slotTime || item.slots.map(s => `${s.startTime}-${s.endTime}`).join(', ')}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color={theme.colors.gray} />
          <Text style={[styles.priceText, { color: theme.colors.text }]}>₹{item.amount}</Text>
        </View>

        {item.slots && item.slots.length > 0 && (
          <View style={styles.slotsContainer}>
            <Text style={[styles.slotsHeader, { color: theme.colors.textSecondary }]}>
              Slot Details:
            </Text>
            {item.slots.map((slot, index) => (
              <View key={index} style={styles.slotDetailRow}>
                <Text style={[styles.slotText, { color: theme.colors.text }]}>
                  Slot {slot.slotId}: {slot.startTime}-{slot.endTime}
                </Text>
                <Text style={[styles.slotPrice, { color: theme.colors.primary }]}>
                  ₹{slot.price}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {item.createdAt && (
          <View style={styles.infoRow}>
            <Ionicons name="receipt-outline" size={16} color={theme.colors.gray} />
            <Text style={[styles.infoSubText, { color: theme.colors.textSecondary }]}>
              Booked on {format(new Date(item.createdAt), 'dd MMM yyyy, HH:mm')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderFilterButton = (filter: any) => {
    const isSelected = selectedFilter === filter.key;
    return (
      <TouchableOpacity
        key={filter.key}
        style={[
          styles.filterButton,
          { 
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.lightGray,
            borderColor: theme.colors.border 
          }
        ]}
        onPress={() => setSelectedFilter(filter.key)}
      >
        <Text style={[
          styles.filterText,
          { color: isSelected ? '#FFFFFF' : theme.colors.textSecondary }
        ]}>
          {filter.label} ({filter.count})
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>All Bookings</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Manage all turf bookings
        </Text>
      </View>

      <View style={[styles.filtersContainer, { backgroundColor: theme.colors.surface }]}>
        {filters.map(renderFilterButton)}
      </View>

      {filteredBookings.length === 0 ? (
        <EmptyState 
          icon="calendar-outline"
          title="No Bookings Found"
          description={`No ${selectedFilter.toLowerCase()} bookings available.`}
        />
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 6,
    borderBottomWidth: 1,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  bookingCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  turfInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  turfName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    flex: 1,
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoSubText: {
    fontSize: 12,
    flex: 1,
  },
  referenceText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  slotsContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  slotsHeader: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  slotDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  slotText: {
    fontSize: 13,
    flex: 1,
  },
  slotPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AllBookingsScreen;
