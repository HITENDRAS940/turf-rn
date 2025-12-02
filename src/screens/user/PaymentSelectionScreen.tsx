import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/shared/Button';
import { simulateCashfreePayment } from '../../utils/paymentUtils';
import { bookingAPI } from '../../services/api';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { BookingRequest, BookingResponse } from '../../types';

const PAYMENT_METHODS = [
  { 
    id: 'upi', 
    name: 'UPI', 
    icon: 'phone-portrait-outline', 
    description: 'Google Pay, PhonePe, Paytm',
    recommended: true 
  },
  { 
    id: 'card', 
    name: 'Credit / Debit Card', 
    icon: 'card-outline', 
    description: 'Visa, Mastercard, RuPay' 
  },
  { 
    id: 'netbanking', 
    name: 'Net Banking', 
    icon: 'globe-outline', 
    description: 'All Indian banks' 
  },
  { 
    id: 'wallet', 
    name: 'Wallets', 
    icon: 'wallet-outline', 
    description: 'Paytm, Amazon Pay, etc.' 
  },
];

const PaymentSelectionScreen = ({ route, navigation }: any) => {
  const { bookingRequest, totalAmount } = route.params;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [selectedMethod, setSelectedMethod] = useState<string | null>('upi'); // Default to UPI
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Select Payment Method', 'Please choose a payment method to proceed.');
      return;
    }

    setProcessing(true);

    try {
      // Simulate Cashfree Payment
      const { success, paymentId } = await simulateCashfreePayment(totalAmount);

      if (!success) {
        Alert.alert('Payment Failed', 'Transaction could not be completed.');
        setProcessing(false);
        return;
      }

      // Update booking request with payment details
      const finalBookingRequest: BookingRequest = {
        ...bookingRequest,
        paymentDetails: {
          method: selectedMethod === 'upi' ? 'UPI' : 
                  selectedMethod === 'card' ? 'Card' : 
                  selectedMethod === 'netbanking' ? 'NetBanking' : 'Wallet',
          transactionId: paymentId || `TXN_${Date.now()}`,
          amount: totalAmount,
        }
      };

      console.log('📋 Finalizing booking with:', finalBookingRequest);

      const response = await bookingAPI.createBooking(finalBookingRequest);
      const bookingResponse: BookingResponse = response.data;

      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your booking has been successfully placed.\nReference: ${bookingResponse.reference}`,
        [
          {
            text: 'View My Bookings',
            onPress: () => {
              navigation.popToTop(); // Go back to stack root
              navigation.navigate('Bookings'); // Switch to Bookings tab
            }
          },
          {
            text: 'OK',
            onPress: () => {
              navigation.popToTop(); // Go back to stack root (TurfList)
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Booking error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to create booking';
      
      Alert.alert('Booking Failed', errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: theme.colors.background }]}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Payment Method</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Summary Card */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.amountCard}
        >
          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.amountValue}>₹{totalAmount}</Text>
            </View>
            <View style={styles.payIconContainer}>
              <Ionicons name="card" size={24} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.bookingDetails}>
            <Text style={styles.bookingId}>Booking for {format(new Date(bookingRequest.bookingDate), 'dd MMM yyyy')}</Text>
            <Text style={styles.slotCount}>
              {bookingRequest.slotIds?.length} Slot{bookingRequest.slotIds?.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </LinearGradient>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Payment Mode</Text>

        {/* Payment Methods */}
        <View style={styles.methodsContainer}>
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard, 
                  { 
                    backgroundColor: theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : 'transparent',
                    borderWidth: isSelected ? 2 : 0,
                    shadowOpacity: isSelected ? 0.1 : 0.05,
                  }
                ]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.9}
              >
                <View style={[styles.iconContainer, { backgroundColor: isSelected ? theme.colors.primary + '15' : theme.colors.lightGray }]}>
                  <Ionicons 
                    name={method.icon as any} 
                    size={24} 
                    color={isSelected ? theme.colors.primary : theme.colors.textSecondary} 
                  />
                </View>
                
                <View style={styles.methodInfo}>
                  <View style={styles.methodTitleRow}>
                    <Text style={[styles.methodName, { color: theme.colors.text, fontWeight: isSelected ? '700' : '600' }]}>
                      {method.name}
                    </Text>
                    {method.recommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.methodDesc, { color: theme.colors.textSecondary }]}>{method.description}</Text>
                </View>

                <View style={[
                  styles.radioOuter, 
                  { borderColor: isSelected ? theme.colors.primary : theme.colors.border }
                ]}>
                  {isSelected && (
                    <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { 
        backgroundColor: theme.colors.surface, 
        paddingBottom: Math.max(20, insets.bottom + 10),
        borderTopColor: theme.colors.border
      }]}>
        <View style={styles.secureBadge}>
          <Ionicons name="shield-checkmark" size={14} color={theme.colors.primary} />
          <Text style={[styles.secureText, { color: theme.colors.textSecondary }]}>
            100% Secure Payments via Cashfree
          </Text>
        </View>
        
        <Button
          title={`Pay ₹${totalAmount}`}
          onPress={handlePayment}
          loading={processing}
          disabled={!selectedMethod}
          style={styles.payButton}
          textStyle={styles.payButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  amountCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  payIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingId: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  slotCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginLeft: 4,
  },
  methodsContainer: {
    gap: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  methodName: {
    fontSize: 16,
  },
  recommendedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
  },
  methodDesc: {
    fontSize: 13,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  payButton: {
    height: 56,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  secureBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  secureText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PaymentSelectionScreen;
