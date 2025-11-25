/**
 * RevenueCard Component
 * Reusable card for displaying revenue analytics
 * - Total revenue
 * - Total bookings
 * - Booked/available slots
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatCurrency } from '../../../utils/revenueUtils';

export interface RevenueCardData {
  totalRevenue: number;
  totalBookings: number;
  bookedSlots: number;
  availableSlots: number;
}

interface RevenueCardProps {
  data: RevenueCardData;
  style?: any;
  showTitle?: boolean;
  title?: string;
}

const RevenueCard: React.FC<RevenueCardProps> = ({
  data,
  style,
  showTitle = true,
  title = 'Revenue Analytics',
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }, style]}>
      {showTitle && (
        <View style={styles.header}>
          <Ionicons name="analytics-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        {/* Total Revenue */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {formatCurrency(data.totalRevenue)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Total Revenue
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        {/* Total Bookings */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {data.totalBookings}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Bookings
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        {/* Slots Booked */}
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>
            {data.bookedSlots}/{data.bookedSlots + data.availableSlots}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Slots Booked
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 8,
  },
});

export default RevenueCard;
