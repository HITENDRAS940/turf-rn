/**
 * SlotGridCard Component
 * Reusable card for displaying slot status in a grid layout
 * - Visual slot status (Available, Booked, Disabled)
 * - Color-coded chips
 * - Legend display
 * - Lock icon for booked slots
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatTime, getSlotColors } from '../../../utils/slotUtils';

interface SlotData {
  id: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
  isBooked?: boolean;
}

interface SlotGridCardProps {
  slots: SlotData[];
  style?: any;
  showTitle?: boolean;
  title?: string;
  showLegend?: boolean;
  onSlotPress?: (slot: SlotData) => void;
}

const SlotGridCard: React.FC<SlotGridCardProps> = ({
  slots,
  style,
  showTitle = true,
  title,
  showLegend = true,
  onSlotPress,
}) => {
  const { theme } = useTheme();

  if (slots.length === 0) return null;

  const enabledCount = slots.filter((s) => s.enabled).length;
  const defaultTitle = `Slot Status (${enabledCount} Active)`;

  return (
    <View style={[styles.container, style]}>
      {showTitle && (
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title || defaultTitle}
        </Text>
      )}

      {showLegend && (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
              Available
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
              Booked
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
              Disabled
            </Text>
          </View>
        </View>
      )}

      <View style={styles.grid}>
        {slots.map((slot) => {
          const colors = getSlotColors(slot.enabled, slot.isBooked);
          
          return (
            <View
              key={slot.id}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.backgroundColor,
                  borderColor: colors.borderColor,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: colors.textColor }]}>
                {formatTime(slot.startTime)}
              </Text>
              {slot.isBooked && (
                <Ionicons name="lock-closed" size={10} color={colors.textColor} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SlotGridCard;
