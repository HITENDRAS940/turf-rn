import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingAPI } from '../../services/api';
import { Booking } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import BookingCard from '../../components/user/BookingCard';
import Toast from 'react-native-toast-message';

const MyBookingsScreen = () => {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getUserBookings();
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

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await bookingAPI.cancelBooking(bookingId);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Booking cancelled successfully',
      });
      fetchBookings();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to cancel booking',
      });
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <BookingCard
      booking={item}
      onCancel={() => handleCancelBooking(item.id)}
    />
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Bookings</Text>
      </View>

      {bookings.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No Bookings Yet"
          description="Your booking history will appear here"
        />
      ) : (
        <FlatList
          data={bookings}
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
    fontSize: 24,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingBottom: 40, // Extra space for bottom navigation
  },
});

export default MyBookingsScreen;
