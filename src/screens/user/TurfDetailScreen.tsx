/**
 * TurfDetailScreen - Enhanced with sliding image animation
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { turfAPI, bookingAPI } from '../../services/api';
import { Turf, TimeSlot, SlotAvailability, BookingRequest, BookingResponse } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/shared/LoadingState';
import Button from '../../components/shared/Button';
import TimeSlotCard from '../../components/user/TimeSlotCard';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';
import { generateRandomPaymentDetails, simulatePaymentProcessing, formatPaymentMethod } from '../../utils/paymentUtils';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';
import CustomCalendar from '../../components/user/CustomCalendar';

const { width: screenWidth } = Dimensions.get('window');

const TurfDetailScreen = ({ route, navigation }: any) => {
  const { turfId } = route.params;
  const [turf, setTurf] = useState<Turf | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Refs
  const scrollViewRef = React.useRef<ScrollView>(null);
  const imageScrollViewRef = React.useRef<ScrollView>(null);
  
  // Animation values
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const imageScrollX = React.useRef(new Animated.Value(0)).current;
  const contentOpacity = React.useRef(new Animated.Value(1)).current;
  
  // Constants
  const HEADER_MAX_HEIGHT = 300;
  const HEADER_MIN_HEIGHT = 100;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
  
  const { theme } = useTheme();

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
      setCurrentImageIndex(0);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch turf details',
      });
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
      
      console.log(`📊 Received ${slotAvailabilityData.length} slot availability records:`, slotAvailabilityData);
      
      // Sort slots by slotId to ensure correct chronological order (1-24)
      const sortedSlotData = slotAvailabilityData.sort((a, b) => a.slotId - b.slotId);
      
      // Generate time slots based on the availability response
      const timeSlots: TimeSlot[] = sortedSlotData.map(slot => {
        const timeSlot = generateTimeSlot(slot.slotId, slot.available, slot.price, selectedDate);
        
        const isPastSlot = isSlotInPast(slot.slotId, selectedDate);
        const statusText = isPastSlot ? '(past)' : slot.available ? '(available)' : '(booked)';
        
        console.log(`⏰ Generated slot ${slot.slotId}: ${timeSlot.startTime}-${timeSlot.endTime}, ${statusText}, price: ₹${slot.price}`);
        
        return timeSlot;
      });
      
      console.log(`✅ Total slots generated: ${timeSlots.length} (sorted by slotId)`);
      setAvailableSlots(timeSlots);
    } catch (error) {
      console.error('❌ Error fetching slot availability:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch available slots',
      });
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
        Toast.show({
          type: 'info',
          text1: 'Past Time Slot',
          text2: 'Cannot book slots that have already passed',
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Slot Unavailable',
          text2: 'This time slot is already booked',
        });
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
      Toast.show({
        type: 'error',
        text1: 'No Slots Selected',
        text2: 'Please select at least one time slot',
      });
      return;
    }

    const totalAmount = calculateTotal();
    const slotsText = selectedSlots.map(slot => `${slot.startTime}-${slot.endTime}`).join(', ');
    const dateText = format(selectedDate, 'dd MMM yyyy');

    Alert.alert(
      'Confirm Booking',
      `📅 Date: ${dateText}\n⏰ Slots: ${slotsText}\n💰 Total: ₹${totalAmount}\n\nProceed with payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm & Pay', onPress: confirmBooking },
      ]
    );
  };

  const confirmBooking = async () => {
    setBookingLoading(true);
    try {
      // Generate random payment details for mock booking
      const totalAmount = calculateTotal();
      const paymentDetails = generateRandomPaymentDetails(totalAmount);
      
      console.log('💳 Generated payment details:', paymentDetails);
      
      // Simulate payment processing
      Toast.show({
        type: 'info',
        text1: 'Processing Payment',
        text2: `Using ${formatPaymentMethod(paymentDetails)}`,
        visibilityTime: 2000,
      });
      
      const paymentSuccess = await simulatePaymentProcessing();
      
      if (!paymentSuccess) {
        Toast.show({
          type: 'error',
          text1: 'Payment Failed',
          text2: 'Please try again with a different payment method',
        });
        return;
      }
      
      // Create booking request with new API format
      const bookingRequest: BookingRequest = {
        turfId: turf?.id || turfId,
        slotIds: selectedSlots.map(s => s.slotId || s.id),
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        paymentDetails: paymentDetails,
      };

      console.log('📋 Booking request:', bookingRequest);

      const response = await bookingAPI.createBooking(bookingRequest);
      const bookingResponse: BookingResponse = response.data;
      
      console.log('✅ Booking response:', bookingResponse);

      Toast.show({
        type: 'success',
        text1: 'Booking Confirmed! 🎉',
        text2: `Reference: ${bookingResponse.reference}`,
        visibilityTime: 4000,
      });

      // Navigate to bookings with success message
      navigation.navigate('Bookings', { 
        newBooking: bookingResponse,
        showSuccess: true 
      });
      
    } catch (error: any) {
      console.error('❌ Booking error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create booking';
      
      Toast.show({
        type: 'error',
        text1: 'Booking Failed',
        text2: errorMessage,
        visibilityTime: 4000,
      });
    } finally {
      setBookingLoading(false);
    }
  };

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

  const handleBackToDetails = useCallback(() => {
    // Stage 1: Start transition with visual feedback
    setIsTransitioning(true);
    setSelectedSlots([]);
    
    // Stage 2: Fade out content for smooth transition
    Animated.timing(contentOpacity, {
      toValue: 0.3,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    // Stage 3: Smooth scroll animation
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ 
        y: 0, 
        animated: true 
      });
      
      // Stage 4: Update state and fade content back in
      setTimeout(() => {
        setShowBookingSection(false);
        
        // Stage 5: Fade content back in with a slight delay
        setTimeout(() => {
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
          setIsTransitioning(false);
        }, 100);
      }, 350); // Wait for scroll to complete
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

  const handleImageLoadStart = (imageUri: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageUri]: true }));
  };

  const handleImageLoadEnd = (imageUri: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageUri]: false }));
  };

  const handleImageError = (imageUri: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageUri]: false }));
    setImageErrors(prev => ({ ...prev, [imageUri]: true }));
  };

  const renderImageGallery = () => {
    const images = turf?.images && turf.images.length > 0 
      ? turf.images 
      : turf?.image 
        ? [turf.image] 
        : ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

    const handleImageScroll = (event: any) => {
      const contentOffset = event.nativeEvent.contentOffset;
      const imageIndex = Math.round(contentOffset.x / screenWidth);
      const newIndex = Math.max(0, Math.min(imageIndex, images.length - 1));
      
      // Optimize for Android performance
      if (Platform.OS === 'android') {
        requestAnimationFrame(() => {
          setCurrentImageIndex(newIndex);
        });
      } else {
        setCurrentImageIndex(newIndex);
      }
    };

    // Animation interpolations
    const headerHeight = scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      extrapolate: 'clamp',
    });

    const imageScale = scrollY.interpolate({
      inputRange: [-200, -100, 0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [1.5, 1.3, 1, 0.98, 0.95],
      extrapolate: 'clamp',
    });

    const imageTranslateY = scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [0, -15, -30],
      extrapolate: 'clamp',
    });

    const bounceScale = scrollY.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [1.08, 1.04, 1],
      extrapolate: 'clamp',
    });

    const overlayOpacity = scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 4, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      outputRange: [0, 0.1, 0.3, 0.6],
      extrapolate: 'clamp',
    });

    const backButtonOpacity = scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE / 4, HEADER_SCROLL_DISTANCE / 2],
      outputRange: [1, 0.9, 0.7],
      extrapolate: 'clamp',
    });

    const titleOpacity = scrollY.interpolate({
      inputRange: [HEADER_SCROLL_DISTANCE - 80, HEADER_SCROLL_DISTANCE - 40, HEADER_SCROLL_DISTANCE - 10],
      outputRange: [0, 0.5, 1],
      extrapolate: 'clamp',
    });

    const titleTranslateY = scrollY.interpolate({
      inputRange: [HEADER_SCROLL_DISTANCE - 80, HEADER_SCROLL_DISTANCE - 40, HEADER_SCROLL_DISTANCE - 10],
      outputRange: [20, 10, 0],
      extrapolate: 'clamp',
    });

    const titleScale = scrollY.interpolate({
      inputRange: [HEADER_SCROLL_DISTANCE - 80, HEADER_SCROLL_DISTANCE - 10],
      outputRange: [0.8, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.imageGalleryContainer, { height: headerHeight }]}>
        {/* Background container that slides in sync with scroll */}
        <Animated.View 
          style={[
            styles.backgroundContainer,
            {
              width: images.length * screenWidth, // Total width for all images
              transform: [
                { scale: imageScale },
                { scaleY: bounceScale },
                { translateY: imageTranslateY },
                // Move background in opposite direction of scroll to stay in sync
                { 
                  translateX: imageScrollX.interpolate({
                    inputRange: [0, images.length * screenWidth],
                    outputRange: [0, -images.length * screenWidth],
                    extrapolate: 'clamp',
                  })
                }
              ]
            }
          ]}
        >
          {images.map((imageUri, index) => {
            return (
              <View
                key={`bg-${index}`}
                style={[
                  styles.backgroundImageWrapper,
                  {
                    left: index * screenWidth,
                    width: screenWidth,
                    height: '100%',
                  }
                ]}
              >
                <Image 
                  source={{ uri: imageUri }}
                  style={styles.backgroundImage}
                  resizeMode="cover"
                />
              </View>
            );
          })}
        </Animated.View>
        
        {/* Transparent foreground for touch handling */}
        <View style={styles.foregroundContainer}>
          <Animated.ScrollView 
            ref={imageScrollViewRef}
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={styles.foregroundScrollView}
            contentContainerStyle={{
              width: images.length * screenWidth,
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: imageScrollX } } }],
              { 
                useNativeDriver: false,
                listener: handleImageScroll,
              }
            )}
            scrollEventThrottle={Platform.OS === 'ios' ? 8 : 16}
            decelerationRate={Platform.OS === 'ios' ? 'fast' : 'normal'}
            bounces={Platform.OS === 'ios'}
            scrollEnabled={images.length > 1}
            snapToInterval={screenWidth}
            snapToAlignment="start"
            directionalLockEnabled={true}
            overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
            nestedScrollEnabled={Platform.OS === 'android'}
          >
            {images.map((imageUri, index) => (
              <View 
                key={index} 
                style={styles.imageContainer}
              >
                {imageErrors[imageUri] ? (
                  <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.lightGray }]}>
                    <Ionicons name="image-outline" size={64} color={theme.colors.gray} />
                    <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
                      Image not available
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.transparentImage} />
                    {imageLoadingStates[imageUri] && (
                      <View style={styles.imageLoader}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                      </View>
                    )}
                  </>
                )}
              </View>
            ))}
          </Animated.ScrollView>
        </View>
        
        {/* UI Overlays */}
        <Animated.View 
          style={[styles.scrollOverlay, { opacity: overlayOpacity }]} 
        />
        
        <Animated.View style={[styles.backButton, { opacity: backButtonOpacity }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonTouchable}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          style={[
            styles.collapsedTitle,
            {
              opacity: titleOpacity,
              transform: [
                { translateY: titleTranslateY },
                { scale: titleScale }
              ]
            }
          ]}
        >
          <Text style={styles.collapsedTitleText} numberOfLines={1}>
            {turf?.name}
          </Text>
        </Animated.View>

        {images.length > 1 && (
          <Animated.View 
            style={[styles.imageIndicators, { opacity: backButtonOpacity }]}
          >
            {images.map((_, index) => (
              <Animated.View 
                key={index} 
                style={[
                  styles.indicator, 
                  { 
                    backgroundColor: index === currentImageIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                    transform: [{ scale: index === currentImageIndex ? 1.3 : 1 }],
                    opacity: index === currentImageIndex ? 1 : 0.7
                  }
                ]} 
              />
            ))}
          </Animated.View>
        )}

        {images.length > 1 && (
          <Animated.View 
            style={[styles.imageCounter, { opacity: backButtonOpacity }]}
          >
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / {images.length}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!turf) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.ScrollView 
        ref={scrollViewRef} 
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={Platform.OS === 'ios' ? 4 : 16}
        bounces={Platform.OS === 'ios'}
        bouncesZoom={false}
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        nestedScrollEnabled={Platform.OS === 'android'}
        overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
      >
        {renderImageGallery()}
        
        <Animated.View 
          style={[
            styles.content, 
            { 
              backgroundColor: theme.colors.background,
              opacity: contentOpacity 
            }
          ]}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{turf.name}</Text>
              <View style={styles.rating}>
                <Ionicons name="star" size={20} color={theme.colors.warning} />
                <Text style={[styles.ratingText, { color: theme.colors.text }]}>{turf.rating}</Text>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.location, { color: theme.colors.textSecondary }]}>{turf.location}</Text>
            </View>
          </View>

          {turf.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{turf.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pricing</Text>
            <View style={[styles.priceCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>Starting from</Text>
              {priceLoading ? (
                <View style={styles.priceLoader}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.price, { color: theme.colors.primary }]}>Loading...</Text>
                </View>
              ) : (
                <Text style={[styles.price, { color: theme.colors.primary }]}>
                  {minPrice !== null ? `₹${minPrice}/hour` : 'Price not available'}
                </Text>
              )}
            </View>
          </View>

          {turf.contactNumber && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact</Text>
              <TouchableOpacity 
                style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}
                onPress={handleCallTurf}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={20} color={theme.colors.primary} />
                <Text style={[styles.contactText, { color: theme.colors.text }]}>{formatPhoneForDisplay(turf.contactNumber)}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.callHint, { color: theme.colors.textSecondary }]}>
                📞 Tap to call directly
              </Text>
            </View>
          )}

          {/* Booking Section */}
          {showBookingSection && (
            <>
              <View style={styles.section}>
                <View style={styles.bookingSectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Book This Turf</Text>
                  <TouchableOpacity 
                    onPress={() => setShowBookingSection(false)}
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
                  <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
                  Select any date from today onwards
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Time Slots</Text>
                
                {slotsLoading ? (
                  <View style={styles.slotsLoader}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading slots...</Text>
                  </View>
                ) : availableSlots.length === 0 ? (
                  <View style={[styles.emptySlots, { backgroundColor: theme.colors.card }]}>
                    <Ionicons name="time-outline" size={48} color={theme.colors.gray} />
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No slots available for this date</Text>
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
                          onPress={() => toggleSlotSelection(slot)}
                        />
                      );
                    })}
                  </View>
                )}
              </View>

              {selectedSlots.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Selected Slots</Text>
                  <View style={styles.selectedSlotsContainer}>
                    {selectedSlots.map((slot) => (
                      <View key={slot.id} style={[styles.selectedSlotChip, { backgroundColor: theme.colors.lightGray, borderColor: theme.colors.primary }]}>
                        <Text style={[styles.selectedSlotText, { color: theme.colors.text }]}>
                          {slot.startTime} - {slot.endTime}
                        </Text>
                        <TouchableOpacity onPress={() => toggleSlotSelection(slot)}>
                          <Ionicons name="close-circle" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </Animated.View>
      </Animated.ScrollView>

      <View style={[styles.footer, { 
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border 
      }]}>
        {showBookingSection && selectedSlots.length > 0 ? (
          <>
            <View>
              <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>Total Amount</Text>
              <Text style={[styles.footerPrice, { color: theme.colors.text }]}>₹{calculateTotal()}</Text>
              <Text style={[styles.totalSlots, { color: theme.colors.textSecondary }]}>
                {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
              </Text>
            </View>
            <Button
              title="Confirm Booking"
              onPress={handleConfirmBooking}
              loading={bookingLoading}
              style={styles.bookButton}
            />
          </>
        ) : (
          <>
            <View>
              <Text style={[styles.footerLabel, { color: theme.colors.textSecondary }]}>
                {showBookingSection ? 'Select slots to continue' : 'Total Price'}
              </Text>
              <Text style={[styles.footerPrice, { color: theme.colors.text }]}>
                {showBookingSection ? '₹0' : (minPrice !== null ? `₹${minPrice}/hour` : 'Price not available')}
              </Text>
            </View>
            <Button
              title={showBookingSection ? "Back to Details" : "Book Now"}
              onPress={showBookingSection ? handleBackToDetails : handleBookNow}
              loading={isTransitioning}
              style={styles.bookButton}
            />
          </>
        )}
      </View>
      {renderCalendar()}
    </SafeAreaView>
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
  imageGalleryContainer: {
    height: 300,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    zIndex: 1,
    flexDirection: 'row',
  },
  backgroundScrollView: {
    height: '100%',
  },
  backgroundImage: {
    width: screenWidth,
    height: '100%',
  },
  backgroundImageWrapper: {
    width: screenWidth,
    height: '100%',
    position: 'absolute',
    top: 0,
  },
  foregroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
  },
  foregroundScrollView: {
    height: '100%',
  },
  imageContainer: {
    width: screenWidth,
    height: 300,
    position: 'relative',
  },
  transparentImage: {
    width: '100%',
    height: 300,
    backgroundColor: 'transparent',
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scrollOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonTouchable: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  collapsedTitle: {
    position: 'absolute',
    top: 60,
    left: 80,
    right: 20,
    zIndex: 12,
  },
  collapsedTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 4,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  imageCounter: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  priceCard: {
    padding: 16,
    borderRadius: 12,
  },
  priceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
  },
  priceLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  contactText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  callHint: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
  },
  footerLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  footerPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  bookButton: {
    paddingHorizontal: 32,
  },
  bookingSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
  },
  slotsLoader: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptySlots: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  slotsGrid: {
    gap: 12,
  },
  selectedSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedSlotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectedSlotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalSlots: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default TurfDetailScreen;
