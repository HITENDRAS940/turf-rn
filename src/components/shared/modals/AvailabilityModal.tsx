/**
 * AvailabilityModal Component
 * Reusable modal for toggling turf availability
 * - Enable/disable turf bookings
 * - Confirmation workflow
 * - Success feedback
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import Button from '../Button';

interface AvailabilityModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (isAvailable: boolean) => void;
  currentAvailability: boolean;
  loading?: boolean;
  turfName?: string;
}

const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  visible,
  onClose,
  onSave,
  currentAvailability,
  loading = false,
  turfName,
}) => {
  const { theme } = useTheme();
  const [isAvailable, setIsAvailable] = React.useState(currentAvailability);

  // Update when currentAvailability changes
  React.useEffect(() => {
    setIsAvailable(currentAvailability);
  }, [currentAvailability]);

  const handleToggle = (value: boolean) => {
    setIsAvailable(value);
  };

  const handleSave = () => {
    onSave(isAvailable);
  };

  const hasChanged = isAvailable !== currentAvailability;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Turf Availability
              </Text>
              {turfName && (
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  {turfName}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Current Status Banner */}
            <View
              style={[
                styles.statusBanner,
                {
                  backgroundColor: currentAvailability
                    ? theme.colors.success + '15'
                    : theme.colors.error + '15',
                },
              ]}
            >
              <Ionicons
                name={currentAvailability ? 'checkmark-circle' : 'close-circle'}
                size={24}
                color={currentAvailability ? theme.colors.success : theme.colors.error}
              />
              <View style={styles.statusTextContainer}>
                <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                  Current Status
                </Text>
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: currentAvailability
                        ? theme.colors.success
                        : theme.colors.error,
                    },
                  ]}
                >
                  {currentAvailability ? 'Available for Booking' : 'Not Available'}
                </Text>
              </View>
            </View>

            {/* Availability Toggle */}
            <View style={[styles.toggleContainer, { borderColor: theme.colors.border }]}>
              <View style={styles.toggleLeft}>
                <Ionicons
                  name={isAvailable ? 'calendar' : 'calendar-outline'}
                  size={28}
                  color={isAvailable ? theme.colors.success : theme.colors.textSecondary}
                />
                <View style={styles.toggleTextContainer}>
                  <Text style={[styles.toggleTitle, { color: theme.colors.text }]}>
                    Accept Bookings
                  </Text>
                  <Text style={[styles.toggleDescription, { color: theme.colors.textSecondary }]}>
                    {isAvailable
                      ? 'Users can book this turf'
                      : 'Turf is hidden from users'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isAvailable}
                onValueChange={handleToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.success }}
                thumbColor={isAvailable ? '#FFFFFF' : '#f4f3f4'}
                disabled={loading}
              />
            </View>

            {/* Warning Message */}
            {!isAvailable && hasChanged && (
              <View
                style={[
                  styles.warningContainer,
                  { backgroundColor: theme.colors.warning + '15' },
                ]}
              >
                <Ionicons name="warning" size={20} color={theme.colors.warning} />
                <Text style={[styles.warningText, { color: theme.colors.warning }]}>
                  Making this turf unavailable will hide it from all users. Existing bookings
                  will not be affected.
                </Text>
              </View>
            )}

            {/* Info Message */}
            {isAvailable && hasChanged && (
              <View
                style={[
                  styles.infoContainer,
                  { backgroundColor: theme.colors.primary + '15' },
                ]}
              >
                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                <Text style={[styles.infoText, { color: theme.colors.primary }]}>
                  Making this turf available will show it to all users in the turf list.
                </Text>
              </View>
            )}

            {/* Features List */}
            <View style={styles.featuresContainer}>
              <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
                When {isAvailable ? 'Available' : 'Unavailable'}:
              </Text>
              {isAvailable ? (
                <>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark" size={18} color={theme.colors.success} />
                    <Text style={[styles.featureText, { color: theme.colors.text }]}>
                      Visible in turf listings
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark" size={18} color={theme.colors.success} />
                    <Text style={[styles.featureText, { color: theme.colors.text }]}>
                      Users can view details and slots
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="checkmark" size={18} color={theme.colors.success} />
                    <Text style={[styles.featureText, { color: theme.colors.text }]}>
                      Bookings can be made
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.featureItem}>
                    <Ionicons name="close" size={18} color={theme.colors.error} />
                    <Text style={[styles.featureText, { color: theme.colors.text }]}>
                      Hidden from turf listings
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="close" size={18} color={theme.colors.error} />
                    <Text style={[styles.featureText, { color: theme.colors.text }]}>
                      Not accessible to users
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="close" size={18} color={theme.colors.error} />
                    <Text style={[styles.featureText, { color: theme.colors.text }]}>
                      New bookings disabled
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.modalActions, { borderTopColor: theme.colors.border }]}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.actionButton}
              disabled={loading}
            />
            <Button
              title={loading ? 'Saving...' : 'Save Changes'}
              onPress={handleSave}
              style={styles.actionButton}
              disabled={loading || !hasChanged}
            />
          </View>

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <View style={[styles.loadingBox, { backgroundColor: theme.colors.card }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                  Updating availability...
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 13,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AvailabilityModal;
