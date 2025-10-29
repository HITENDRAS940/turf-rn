import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimeSlot } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface TimeSlotCardProps {
  slot: TimeSlot;
  isSelected: boolean;
  onPress: () => void;
}

const TimeSlotCard: React.FC<TimeSlotCardProps> = ({ 
  slot, 
  isSelected, 
  onPress 
}) => {
  const { theme } = useTheme();
  
  const getCardStyle = () => {
    if (!slot.isAvailable) {
      return [styles.card, styles.cardDisabled, { 
        backgroundColor: theme.colors.lightGray,
        borderColor: theme.colors.border 
      }];
    }
    if (isSelected) {
      return [styles.card, { 
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.background 
      }];
    }
    return [styles.card, { 
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border 
    }];
  };

  const getTextColor = () => {
    if (!slot.isAvailable) return theme.colors.gray;
    if (isSelected) return theme.colors.primary;
    return theme.colors.text;
  };

  return (
    <TouchableOpacity
      style={getCardStyle()}
      onPress={onPress}
      disabled={!slot.isAvailable}
      activeOpacity={0.7}
    >
      <View style={styles.timeContainer}>
        <Ionicons
          name={isSelected ? 'checkmark-circle' : 'time-outline'}
          size={20}
          color={getTextColor()}
        />
        <Text style={[styles.timeText, { color: getTextColor() }]}>
          {slot.startTime} - {slot.endTime}
        </Text>
      </View>
      
      <Text style={[styles.priceText, { color: getTextColor() }]}>
        ₹{slot.price}
      </Text>

      {!slot.isAvailable && (
        <View style={[
          styles.bookedBadge, 
          { backgroundColor: slot.isPast ? theme.colors.gray : theme.colors.error }
        ]}>
          <Text style={styles.bookedText}>
            {slot.isPast ? 'Past' : 'Booked'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  bookedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bookedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TimeSlotCard;
