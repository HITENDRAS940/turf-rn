import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { OtpInput } from 'react-native-otp-entry';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/shared/Button';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';
import { Ionicons } from '@expo/vector-icons';

const OTPVerificationScreen = ({ route, navigation }: any) => {
  const { phone } = route.params;
  const { login } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(phone, otp);
      const { token, newUser } = response.data;
      
      // Decode JWT to get role and user details
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role || 'ROLE_USER';
      const userId = payload.userId;
      const name = payload.name;

      // If name is missing in the token (new user or existing user without name),
      // navigate to SetName screen to complete profile
      if (!name && role === 'ROLE_USER') {
        navigation.replace('SetName', {
          token,
          phone,
          userId,
          isNewUser: newUser
        });
        return;
      }

      const userData = { 
        id: userId,
        token, 
        phone, 
        role, 
        isNewUser: newUser,
        name: name // Use the name from payload
      } as User;

      await login(userData);
      
      Alert.alert('Success', role === 'ROLE_ADMIN' ? 'Welcome Admin!' : 'Login successful!');
      
      Alert.alert('Success', role === 'ROLE_ADMIN' ? 'Welcome Admin!' : 'Login successful!');
    } catch (error: any) {
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authAPI.sendOTP(phone);
      Alert.alert('OTP Resent', 'Check your phone for the new code');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }
            ]}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {!isKeyboardVisible && (
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.title}>Verify OTP</Text>
              </View>
            )}

            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text style={{ 
                color: theme.colors.textSecondary, 
                marginBottom: 24,
                fontSize: 14,
                fontWeight: '500',
                opacity: 0.8,
                textAlign: 'center',
                paddingHorizontal: 0,
              }}>
                Enter the 6-digit code sent to {formatPhoneForDisplay(phone)}
              </Text>
              <View style={styles.form}>
                <OtpInput
                  numberOfDigits={6}
                  onTextChange={setOtp}
                  theme={{
                    containerStyle: styles.otpContainer,
                    pinCodeContainerStyle: {
                      ...styles.otpBox,
                      backgroundColor: theme.colors.lightGray,
                      borderColor: theme.colors.border 
                    },
                    pinCodeTextStyle: {
                      ...styles.otpText,
                      color: theme.colors.text
                    },
                    focusedPinCodeContainerStyle: {
                      ...styles.otpBoxFocused,
                      borderColor: theme.colors.primary,
                      backgroundColor: '#FFFFFF',
                    },
                  }}
                />

                <Button
                  title="Verify OTP"
                  onPress={handleVerifyOTP}
                  loading={loading}
                  style={styles.verifyButton}
                />

                <View style={styles.resendContainer}>
                  <Text style={[styles.resendText, { color: theme.colors.textSecondary }]}>Didn't receive the code? </Text>
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={[styles.resendButton, { color: theme.colors.primary }]}>Resend OTP</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  form: {
    width: '100%',
  },
  otpContainer: {
    marginBottom: 32,
    gap: 6,
    width: '100%',
    justifyContent: 'center',
  },
  otpBox: {
    width: 40,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
  },
  otpBoxFocused: {
    borderWidth: 2,
  },
  otpText: {
    fontSize: 24,
    fontWeight: '700',
  },
  verifyButton: {
    marginBottom: 24,
    height: 56,
    borderRadius: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
  },
  resendButton: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default OTPVerificationScreen;
