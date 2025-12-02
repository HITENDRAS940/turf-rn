import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

import { User } from '../../types';

const SetNameScreen = ({ route, navigation }: any) => {
  const { token, userId, phone, isNewUser } = route.params || {};
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleSetName = async () => {
    if (!name.trim()) {
      Alert.alert('Invalid Name', 'Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Name must be at least 2 characters long');
      return;
    }

    setLoading(true);
    try {
      // Store token temporarily for the API call to work
      if (token) {
        await AsyncStorage.setItem('token', token);
      }

      await userAPI.setName(name.trim());
      
      // Construct full user object
      const userData: User = {
        id: userId,
        token: token,
        phone: phone,
        role: 'ROLE_USER',
        name: name.trim(),
        isNewUser: false
      };

      // Complete login
      await login(userData);
      
      Alert.alert('Welcome!', 'Your profile has been set up successfully');
      // Navigation will be handled by AuthContext state change or we can force it if needed
      // But usually login() updates state which triggers navigation in AppNavigator
    } catch (error: any) {
      // If failed, remove the token we just set so we don't leave bad state
      await AsyncStorage.removeItem('token');
      
      Alert.alert('Error', error.response?.data?.message || 'Failed to set name');
    } finally {
      setLoading(false);
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
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="person-add-outline" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Welcome to TurfBook!</Text>
              <Text style={styles.subtitle}>
                Let's get you set up. What should we call you?
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.form}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Your Name</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.colors.lightGray,
                    borderColor: theme.colors.border,
                    color: theme.colors.text 
                  }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                  autoCapitalize="words"
                  autoComplete="name"
                  maxLength={50}
                />

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: theme.colors.primary },
                    loading && styles.buttonDisabled
                  ]}
                  onPress={handleSetName}
                  disabled={loading || !name.trim()}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Continue</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </>
                  )}
                </TouchableOpacity>
                
                <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                  You can always change this later in your profile settings
                </Text>
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
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    height: 56,
  },
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SetNameScreen;
