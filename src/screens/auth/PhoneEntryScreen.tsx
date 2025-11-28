import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { authAPI } from '../../services/api';
import { Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { validatePhoneNumber, getPhoneForAPI } from '../../utils/phoneUtils';

const PhoneEntryScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!validatePhoneNumber(phone)) {

      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = getPhoneForAPI(phone);
      await authAPI.sendOTP(formattedPhone);
      Alert.alert('OTP Sent', 'Check your phone for the verification code');
      navigation.navigate('OTPVerification', { phone: formattedPhone });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Welcome to TurfBook</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Enter your phone number to get started
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Phone Number</Text>
        <View style={[styles.inputContainer, { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border 
        }]}>
          <Text style={[styles.prefix, { color: theme.colors.text }]}>+91</Text>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Enter 10-digit number"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
            loading && styles.buttonDisabled
          ]}
          onPress={handleSendOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
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
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 60,
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
    flex: 1,
    marginTop: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default PhoneEntryScreen;
