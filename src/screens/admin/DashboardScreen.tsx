import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardScreen = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Admin Overview</Text>
        </View>

        {/* Coming Soon Banner */}
        <View style={[styles.comingSoonBanner, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.bannerIconContainer, { backgroundColor: theme.colors.lightGray }]}>
            <Ionicons name="construct-outline" size={64} color={theme.colors.primary} />
          </View>
          <Text style={[styles.bannerTitle, { color: theme.colors.text }]}>Coming Soon</Text>
          <Text style={[styles.bannerDescription, { color: theme.colors.textSecondary }]}>
            We're working on bringing you an amazing dashboard experience.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  comingSoonBanner: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxWidth: 320,
    width: '100%',
  },
  bannerIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  bannerDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default DashboardScreen;