import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { OtpInput } from 'react-native-otp-entry';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/shared/Button';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';

const OTPVerificationScreen = ({ route, navigation }: any) => {
  const { phone } = route.params;
  const { login } = useAuth();
  const { theme } = useTheme();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

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

      const userData = { 
        id: userId,
        token, 
        phone, 
        role, 
        isNewUser: newUser,
        name: undefined // Initialize name as undefined, will be set later in SetNameScreen
      } as User;

      await login(userData);
      
      // If it's a new user and not admin, navigate to set name screen
      if (newUser && role === 'ROLE_USER') {
        navigation.replace('SetName');
        return;
      }
      
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
    <ScreenWrapper style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backText, { color: theme.colors.primary }]}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Verify OTP</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter the 6-digit code sent to {formatPhoneForDisplay(phone)}
          </Text>
        </View>

        <View style={styles.form}>
          <OtpInput
            numberOfDigits={6}
            onTextChange={setOtp}
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: {
                ...styles.otpBox,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border 
              },
              pinCodeTextStyle: {
                ...styles.otpText,
                color: theme.colors.text
              },
              focusedPinCodeContainerStyle: {
                ...styles.otpBoxFocused,
                borderColor: theme.colors.primary 
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
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    marginTop: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginTop: 40,
  },
  otpContainer: {
    marginBottom: 32,
  },
  otpBox: {
    borderWidth: 1,
    borderRadius: 12,
  },
  otpBoxFocused: {
    // Dynamic styles applied in theme
  },
  otpText: {
    fontSize: 24,
  },
  verifyButton: {
    marginBottom: 24,
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
    fontWeight: '600',
  },
});

export default OTPVerificationScreen;
