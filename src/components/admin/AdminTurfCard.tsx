import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Turf } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';

interface AdminTurfCardProps {
  turf: Turf;
  onPress?: () => void;
}

const AdminTurfCard: React.FC<AdminTurfCardProps> = ({
  turf,
  onPress,
}) => {
  const { theme } = useTheme();
  
  const availabilityStatus = turf.availability ?? true;
  const hasImages = turf.images && turf.images.length > 0;

  return (
    <TouchableOpacity 
      style={[styles.card, { 
        backgroundColor: theme.colors.surface,
        shadowColor: theme.colors.gray 
      }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{turf.name}</Text>
          <Text style={[styles.location, { color: theme.colors.textSecondary }]}>{turf.location}</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Ionicons name="star-outline" size={16} color={theme.colors.warning} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>Rating: {turf.rating || 'N/A'}</Text>
        </View>

        {turf.contactNumber && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{formatPhoneForDisplay(turf.contactNumber)}</Text>
          </View>
        )}

        {turf.description && (
          <View style={styles.descriptionContainer}>
            <Text style={[styles.descriptionLabel, { color: theme.colors.text }]}>Description:</Text>
            <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]} numberOfLines={3}>
              {turf.description}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: availabilityStatus ? theme.colors.success : theme.colors.error }
          ]} />
          <Text style={[
            styles.statusText,
            { color: availabilityStatus ? theme.colors.success : theme.colors.error }
          ]}>
            {availabilityStatus ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.footerRight}>
          {hasImages && (
            <Text style={[styles.imageCount, { color: theme.colors.primary }]}>
              📷 {turf.images!.length} image{turf.images!.length !== 1 ? 's' : ''}
            </Text>
          )}
          <Text style={[styles.turfId, { color: theme.colors.textSecondary }]}>ID: {turf.id}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  content: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  imageCount: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  turfId: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AdminTurfCard;
