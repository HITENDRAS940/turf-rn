import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bookingAPI } from '../../services/api';
import { Booking } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import BookingCard from '../../components/user/BookingCard';
import EmptyState from '../../components/shared/EmptyState';

const MyBookingsScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Check if there's a new booking to display (from successful booking flow)
  const newBooking = route.params?.newBooking;
  const showSuccess = route.params?.showSuccess;

  const fetchBookings = async () => {
    try {
      console.log('Fetching user bookings...');
      const response = await bookingAPI.getUserBookings();
      console.log('Bookings response:', response.data);
      
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
        const dateA = new Date(a.createdAt || a.bookingDate || a.date || '').getTime();
        const dateB = new Date(b.createdAt || b.bookingDate || b.date || '').getTime();
        return dateB - dateA;
      });
      
      setBookings(sortedBookings);
      
      // Show success alert if coming from successful booking
      if (showSuccess && newBooking) {
        Alert.alert('Booking Successful! 🎉', `Reference: ${newBooking.reference}`);
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching bookings:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to fetch bookings';
      
      Alert.alert('Error', errorMessage);
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
    // Alert.alert('Booking Details', `Booking #${booking.id} - ${booking.turfName}`);
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
      
      await bookingAPI.cancelBooking(booking.id);
      
      // Update the booking status locally
      setBookings(prevBookings =>
        prevBookings.map(b =>
          b.id === booking.id
            ? { ...b, status: 'CANCELLED' as const }
            : b
        )
      );
      
      Alert.alert('Booking Cancelled', `Your booking at ${booking.turfName} has been cancelled`);
      
    } catch (error: any) {
      console.error('❌ Error cancelling booking:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to cancel booking';
      
      Alert.alert('Cancellation Failed', errorMessage);
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

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 10 }]}
      >
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>Manage your upcoming games</Text>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle="light-content" />
        {renderLoadingState()}
      </View>
    );
  }

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['bottom', 'left', 'right']}
    >
      <StatusBar barStyle="light-content" />
      
      {renderHeader()}

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
    </ScreenWrapper>
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
  headerContainer: {
    marginBottom: 0,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listContent: {
    padding: 16,
    paddingTop: 24,
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
