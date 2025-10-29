import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingAPI } from '../../services/api';
import { Booking } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import BookingCard from '../../components/user/BookingCard';
import EmptyState from '../../components/shared/EmptyState';
import Toast from 'react-native-toast-message';

const MyBookingsScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check if there's a new booking to display (from successful booking flow)
  const newBooking = route.params?.newBooking;
  const showSuccess = route.params?.showSuccess;

  const fetchBookings = async () => {
    try {
      console.log('📋 Fetching user bookings...');
      const response = await bookingAPI.getUserBookings();
      console.log('📋 Bookings response:', response.data);
      
      let bookingsData = response.data;
      
      // If the response is an object with bookings array, extract it
      if (bookingsData && typeof bookingsData === 'object' && bookingsData.bookings) {
        bookingsData = bookingsData.bookings;
      }
      
      // Ensure it's an array
      if (!Array.isArray(bookingsData)) {
        console.warn('⚠️ Bookings data is not an array:', bookingsData);
        bookingsData = [];
      }
      
      // Sort bookings by created date (newest first)
      const sortedBookings = bookingsData.sort((a: Booking, b: Booking) => {
        const dateA = new Date(a.createdAt || a.date).getTime();
        const dateB = new Date(b.createdAt || b.date).getTime();
        return dateB - dateA;
      });
      
      setBookings(sortedBookings);
      
      // Show success toast if coming from successful booking
      if (showSuccess && newBooking) {
        Toast.show({
          type: 'success',
          text1: 'Booking Successful! 🎉',
          text2: `Reference: ${newBooking.reference}`,
          visibilityTime: 4000,
        });
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching bookings:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to fetch bookings';
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, []);

  const handleBookingPress = (booking: Booking) => {
    // Navigate to booking details screen (implement if needed)
    console.log('📱 Booking pressed:', booking.id);
    Toast.show({
      type: 'info',
      text1: 'Booking Details',
      text2: `Booking #${booking.id} - ${booking.turfName}`,
    });
  };

  const handleCancelBooking = async (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking at ${booking.turfName}?\n\nThis action cannot be undone.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => confirmCancelBooking(booking),
        },
      ]
    );
  };

  const confirmCancelBooking = async (booking: Booking) => {
    try {
      console.log('🚫 Cancelling booking:', booking.id);
      
      Toast.show({
        type: 'info',
        text1: 'Cancelling Booking',
        text2: 'Please wait...',
        visibilityTime: 2000,
      });
      
      await bookingAPI.cancelBooking(booking.id);
      
      // Update the booking status locally
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b.id === booking.id
            ? { ...b, status: 'CANCELLED' as const }
            : b
        )
      );
      
      Toast.show({
        type: 'success',
        text1: 'Booking Cancelled',
        text2: `Your booking at ${booking.turfName} has been cancelled`,
        visibilityTime: 3000,
      });
      
    } catch (error: any) {
      console.error('❌ Error cancelling booking:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to cancel booking';
      
      Toast.show({
        type: 'error',
        text1: 'Cancellation Failed',
        text2: errorMessage,
      });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Clear route params after showing success message
  useEffect(() => {
    if (showSuccess) {
      navigation.setParams({ showSuccess: false, newBooking: null });
    }
  }, [showSuccess, navigation]);

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <BookingCard
      booking={item}
      onPress={() => handleBookingPress(item)}
      onCancel={() => handleCancelBooking(item)}
      showActions={true}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="calendar-outline"
      title="No Bookings Yet"
      description="Your turf bookings will appear here once you make your first booking."
    />
  );

  const renderLoadingState = () => (
    <View style={[styles.container, styles.centered]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
        Loading your bookings...
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={bookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          bookings.length === 0 && styles.emptyContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra space for tab bar
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});

export default MyBookingsScreen;
