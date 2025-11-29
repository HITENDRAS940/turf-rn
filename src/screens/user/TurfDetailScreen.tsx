/**
 * TurfDetailScreen - Enhanced with sliding image animation
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Alert,
  StatusBar,
  Linking,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { turfAPI } from '../../services/api';
import { Turf, TimeSlot, SlotAvailability, BookingRequest } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/shared/LoadingState';
import Button from '../../components/shared/Button';
import { format } from 'date-fns';
import CustomCalendar from '../../components/user/CustomCalendar';

// Extracted Components
import TurfImageGallery from '../../components/user/turf-details/TurfImageGallery';
import TurfInfo from '../../components/user/turf-details/TurfInfo';
import TurfBookingSection from '../../components/user/turf-details/TurfBookingSection';

const TurfDetailScreen = ({ route, navigation }: any) => {
  const { turfId } = route.params;
  const [turf, setTurf] = useState<Turf | null>(null);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  
  // Booking functionality state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingSection, setShowBookingSection] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Refs
  const scrollViewRef = React.useRef<any>(null);
  
  // Animation values
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const contentOpacity = React.useRef(new Animated.Value(1)).current;
  
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Utility function to check if a slot is in the past for today's date
  const isSlotInPast = (slotId: number, selectedDate: Date): boolean => {
    const today = new Date();
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
    
    if (!isToday) {
      return false; // Future or past dates don't need time validation
    }
    
    const currentHour = today.getHours();
    const slotStartHour = slotId - 1; // slotId 1 = hour 0 (00:00-01:00)
    
    // If current time is past the slot start time, it's in the past
    return currentHour >= slotStartHour;
  };

  // Utility function to generate time slots based on slotId (1-24 for 24 hours)
  const generateTimeSlot = (slotId: number, isAvailable: boolean, price: number, selectedDate: Date): TimeSlot => {
    const hour = slotId - 1; // slotId 1 = hour 0 (00:00-01:00)
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    
    // Handle the wrap-around for 24th slot (23:00-00:00)
    const endHour = slotId === 24 ? 0 : slotId;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
    
    // Check if this slot is in the past for today's date
    const isPastSlot = isSlotInPast(slotId, selectedDate);
    
    // If slot is in the past, mark it as unavailable regardless of API response
    const finalAvailability = isPastSlot ? false : isAvailable;
    
    return {
      id: slotId, // Use slotId as the id
      slotId: slotId,
      startTime: startTime,
      endTime: endTime,
      price: price, // Use the price from API response
      isAvailable: finalAvailability,
      isBooked: !isAvailable && !isPastSlot, // Only mark as booked if not past and not available
      isPast: isPastSlot, // Add isPast flag
    };
  };

  useEffect(() => {
    fetchTurfDetails();
  }, []);

  useEffect(() => {
    if (turf?.id) {
      fetchMinPrice();
    }
  }, [turf]);

  useEffect(() => {
    if (showBookingSection && turf) {
      fetchAvailableSlots();
    }
  }, [selectedDate, showBookingSection, turf]);

  const fetchTurfDetails = async () => {
    try {
      const response = await turfAPI.getTurfById(turfId);
      setTurf(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch turf details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchMinPrice = async () => {
    if (!turf?.id) return;
    
    setPriceLoading(true);
    try {
      const response = await turfAPI.getLowestPrice(turf.id);
      // API returns a simple double value like 1500.0 directly
      setMinPrice(response.data);
    } catch (error) {
      // If API fails, we'll show loading state or handle gracefully
      setMinPrice(null);
    } finally {
      setPriceLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!turf) return;

    setSlotsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      console.log(`🔄 Fetching slot availability for turf ${turf.id} on ${dateStr}`);
      
      const response = await turfAPI.getSlotAvailability(turf.id, dateStr);
      const slotAvailabilityData: SlotAvailability[] = response.data;
      
      // Sort slots by slotId to ensure correct chronological order (1-24)
      const sortedSlotData = slotAvailabilityData.sort((a, b) => a.slotId - b.slotId);
      
      // Generate time slots based on the availability response
      const timeSlots: TimeSlot[] = sortedSlotData.map(slot => {
        const timeSlot = generateTimeSlot(slot.slotId, slot.available, slot.price, selectedDate);
        return timeSlot;
      });
      
      setAvailableSlots(timeSlots);
    } catch (error) {
      console.error('❌ Error fetching slot availability:', error);
      Alert.alert('Error', 'Failed to fetch available slots');
      // Fallback: show empty slots
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const toggleSlotSelection = (slot: TimeSlot) => {
    // Check if the slot is in the past (only if slotId is available)
    const isPastSlot = slot.slotId ? isSlotInPast(slot.slotId, selectedDate) : false;
    
    // Only allow selection of available slots
    if (!slot.isAvailable || slot.isBooked) {
      if (isPastSlot) {
        Alert.alert('Past Time Slot', 'Cannot book slots that have already passed');
      } else {
        Alert.alert('Slot Unavailable', 'This time slot is already booked');
      }
      return;
    }

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
      Alert.alert('No Slots Selected', 'Please select at least one time slot');
      return;
    }

    const totalAmount = calculateTotal();

    // Prepare booking request data
    const bookingRequest: Partial<BookingRequest> = {
      turfId: turf?.id || turfId,
      slotIds: selectedSlots.map(s => s.slotId || s.id),
      bookingDate: format(selectedDate, 'yyyy-MM-dd'),
    };

    // Navigate to Payment Selection Screen
    navigation.navigate('PaymentSelection', {
      bookingRequest,
      totalAmount,
    });
  };

  // confirmBooking function is no longer needed here as it's moved to PaymentSelectionScreen
  // keeping it commented out or removing it is fine. I will remove it to clean up.

  const handleBookNow = useCallback(() => {
    // Stage 1: Clear selected slots immediately for faster state update
    setSelectedSlots([]);
    
    // Stage 2: Fade out content slightly for smooth transition
    Animated.timing(contentOpacity, {
      toValue: 0.7,
      duration: 150,
      useNativeDriver: true,
    }).start();
    
    // Stage 3: Update state and scroll to booking section
    setTimeout(() => {
      setShowBookingSection(true);
      
      // Stage 4: Scroll to end with animation
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        
        // Stage 5: Fade content back in
        setTimeout(() => {
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }, 200);
      });
    }, 100);
  }, [contentOpacity]);

  const handleCallTurf = async () => {
    if (!turf?.contactNumber) return;

    const phoneNumber = `tel:${turf.contactNumber}`;
    
    try {
      const canOpen = await Linking.canOpenURL(phoneNumber);
      if (canOpen) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert(
          'Cannot Make Call',
          'Your device does not support making phone calls.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to open phone dialer. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlots([]); // Reset selected slots when date changes
  };

  const renderCalendar = () => {
    return (
      <CustomCalendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
      />
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!turf) {
    return null;
  }

  const images = turf.images && turf.images.length > 0 
    ? turf.images 
    : turf.image 
      ? [turf.image] 
      : ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <Animated.ScrollView 
        ref={scrollViewRef} 
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TurfImageGallery
          images={images}
          turfName={turf.name}
          scrollY={scrollY}
          onBackPress={() => navigation.goBack()}
        />
        
        <Animated.View 
          style={[
            styles.contentContainer, 
            { 
              backgroundColor: theme.colors.background,
              opacity: contentOpacity 
            }
          ]}
        >
          <TurfInfo 
            turf={turf}
            onCallPress={handleCallTurf}
          />

          {showBookingSection && (
            <TurfBookingSection
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
              availableSlots={availableSlots}
              selectedSlots={selectedSlots}
              onSlotToggle={toggleSlotSelection}
              slotsLoading={slotsLoading}
              bookingLoading={bookingLoading}
              onConfirmBooking={handleConfirmBooking}
              onClose={() => setShowBookingSection(false)}
              totalAmount={calculateTotal()}
            />
          )}
        </Animated.View>
      </Animated.ScrollView>

      <View style={[styles.footer, { 
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        paddingBottom: Math.max(20, insets.bottom + 10),
      }]}>
        {showBookingSection ? (
          <>
            <View style={styles.totalContainer}>
              <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>Total Amount</Text>
              <Text style={[styles.totalAmount, { color: theme.colors.text }]}>₹{calculateTotal()}</Text>
              {selectedSlots.length > 0 && (
                <Text style={[styles.slotCount, { color: theme.colors.textSecondary }]}>
                  {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
                </Text>
              )}
            </View>
            
            <Button
              title="Confirm Booking"
              onPress={handleConfirmBooking}
              loading={bookingLoading}
              disabled={selectedSlots.length === 0}
              style={styles.confirmButton}
            />
          </>
        ) : (
          <>
            <View>
              <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>Starting from</Text>
              <Text style={[styles.priceValue, { color: theme.colors.primary }]}>
                {minPrice !== null ? `₹${minPrice}/hr` : 'Check Slots'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.bookButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleBookNow}
              activeOpacity={0.8}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {renderCalendar()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: 32,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
    gap: 20,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  bookButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '800',
  },
  slotCount: {
    fontSize: 12,
    marginTop: 2,
  },
  confirmButton: {
    flex: 1.5,
    height: 56,
    borderRadius: 16,
  },
});

export default TurfDetailScreen;

