/**
 * SlotsManagementModal Component
 * Reusable modal for managing turf slot configurations
 * - 24-hour slot enable/disable
 * - Individual or bulk pricing
 * - Real-time slot loading from database
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import Button from '../Button';
import { SlotConfig } from '../../../types';
import { validatePrice } from '../../../utils/validationUtils';
import { sortSlotConfigsByTime } from '../../../utils/slotUtils';

interface SlotsManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (slots: SlotConfig[]) => void;
  onSkip?: () => void;
  slots: SlotConfig[];
  loading?: boolean;
  showRefresh?: boolean;
  onRefresh?: () => void;
  turfName?: string;
}

const SlotsManagementModal: React.FC<SlotsManagementModalProps> = ({
  visible,
  onClose,
  onSave,
  onSkip,
  slots: initialSlots,
  loading = false,
  showRefresh = false,
  onRefresh,
  turfName,
}) => {
  const { theme } = useTheme();
  const [slots, setSlots] = React.useState<SlotConfig[]>(initialSlots);
  const [samePriceForAll, setSamePriceForAll] = React.useState(false);
  const [masterPrice, setMasterPrice] = React.useState('');
  const [priceError, setPriceError] = React.useState('');

  // Update slots when initialSlots change
  React.useEffect(() => {
    setSlots(sortSlotConfigsByTime([...initialSlots]));
  }, [initialSlots]);

  const handleSamePriceToggle = (value: boolean) => {
    setSamePriceForAll(value);
    if (value && masterPrice) {
      // Apply master price to all enabled slots
      const price = parseFloat(masterPrice);
      if (!isNaN(price)) {
        setSlots(prev =>
          prev.map(slot => ({
            ...slot,
            price: slot.enabled ? price : slot.price,
          }))
        );
      }
    }
  };

  const handleMasterPriceChange = (text: string) => {
    setMasterPrice(text);
    setPriceError('');

    const validation = validatePrice(text);
    if (!validation.isValid && text !== '') {
      setPriceError(validation.error || 'Invalid price');
      return;
    }

    // Apply to all enabled slots
    const price = parseFloat(text);
    if (!isNaN(price) && price > 0) {
      setSlots(prev =>
        prev.map(slot => ({
          ...slot,
          price: slot.enabled ? price : slot.price,
        }))
      );
    }
  };

  const toggleSlotEnabled = (slotId: number) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.slotId === slotId
          ? { ...slot, enabled: !slot.enabled }
          : slot
      )
    );
  };

  const updateSlotPrice = (slotId: number, priceText: string) => {
    const price = parseFloat(priceText);
    if (isNaN(price) && priceText !== '') return;

    setSlots(prev =>
      prev.map(slot =>
        slot.slotId === slotId
          ? { ...slot, price: priceText === '' ? 0 : price }
          : slot
      )
    );
  };

  const validateSlots = (): boolean => {
    const enabledSlots = slots.filter(s => s.enabled);
    
    if (enabledSlots.length === 0) {
      setPriceError('At least one slot must be enabled');
      return false;
    }

    // Check if all enabled slots have valid prices
    const invalidPrices = enabledSlots.filter(s => !s.price || s.price <= 0);
    if (invalidPrices.length > 0) {
      setPriceError('All enabled slots must have a valid price');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateSlots()) {
      onSave(slots);
    }
  };

  const getEnabledCount = () => slots.filter(s => s.enabled).length;
  const getDisabledCount = () => slots.filter(s => !s.enabled).length;

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
                Slot Management
              </Text>
              {turfName && (
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  {turfName}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Loading Indicator */}
          {loading && (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.card }]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Loading slot configurations...
              </Text>
            </View>
          )}

          {/* Info Banner */}
          {!loading && slots.length > 0 && (
            <View style={[styles.infoContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <View style={styles.infoRow}>
                <View style={styles.infoTextContainer}>
                  <Ionicons name="information-circle" size={16} color={theme.colors.primary} />
                  <Text style={[styles.infoText, { color: theme.colors.text }]}>
                    {getEnabledCount()} enabled • {getDisabledCount()} disabled
                  </Text>
                </View>
                {showRefresh && onRefresh && (
                  <TouchableOpacity
                    onPress={onRefresh}
                    style={styles.refreshButton}
                    disabled={loading}
                  >
                    <Ionicons
                      name={loading ? 'refresh-outline' : 'refresh'}
                      size={16}
                      color={loading ? theme.colors.textSecondary : theme.colors.primary}
                    />
                    <Text style={[styles.refreshText, { color: theme.colors.primary }]}>
                      Refresh
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Bulk Price Control */}
          <View style={[styles.priceControlContainer, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.samePriceToggle}>
              <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                Same Price for All Slots
              </Text>
              <Switch
                value={samePriceForAll}
                onValueChange={handleSamePriceToggle}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={samePriceForAll ? '#FFFFFF' : '#f4f3f4'}
                disabled={loading}
              />
            </View>

            {samePriceForAll && (
              <View style={styles.masterPriceContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>
                  Master Price (₹/hour)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.card,
                      color: theme.colors.text,
                      borderColor: priceError ? theme.colors.error : theme.colors.border,
                    },
                  ]}
                  value={masterPrice}
                  onChangeText={handleMasterPriceChange}
                  placeholder="Enter price for all slots"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>
            )}

            {priceError && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {priceError}
              </Text>
            )}
          </View>

          {/* Slots List */}
          <ScrollView
            style={styles.slotsContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.slotsContent}
          >
            {slots.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No slots available
                </Text>
              </View>
            ) : (
              slots.map((slot, index) => (
                <View
                  key={slot.slotId}
                  style={[
                    styles.slotCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.slotHeader}>
                    <View style={styles.slotInfo}>
                      <Text style={[styles.slotNumber, { color: theme.colors.textSecondary }]}>
                        #{index + 1}
                      </Text>
                      <Text style={[styles.slotTime, { color: theme.colors.text }]}>
                        {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                      </Text>
                    </View>
                    <Switch
                      value={slot.enabled}
                      onValueChange={() => toggleSlotEnabled(slot.slotId)}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      thumbColor={slot.enabled ? '#FFFFFF' : '#f4f3f4'}
                      disabled={loading}
                    />
                  </View>

                  {slot.enabled && (
                    <View style={styles.priceInputContainer}>
                      <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>
                        Price (₹)
                      </Text>
                      <TextInput
                        style={[
                          styles.priceInput,
                          {
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            borderColor: theme.colors.border,
                          },
                        ]}
                        value={slot.price?.toString() || ''}
                        onChangeText={(text) => updateSlotPrice(slot.slotId, text)}
                        placeholder="Price"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="numeric"
                        editable={!samePriceForAll && !loading}
                      />
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          {/* Actions */}
          <View style={[styles.modalActions, { borderTopColor: theme.colors.border }]}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.actionButton}
              disabled={loading}
            />
            {onSkip && (
              <Button
                title="Skip"
                onPress={onSkip}
                variant="outline"
                style={styles.actionButton}
                disabled={loading}
              />
            )}
            <Button
              title={loading ? 'Saving...' : 'Save & Continue'}
              onPress={handleSave}
              style={styles.actionButton}
              disabled={loading}
            />
          </View>
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
    maxWidth: 600,
    maxHeight: '90%',
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  infoContainer: {
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceControlContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  samePriceToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  masterPriceContainer: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
  },
  slotsContainer: {
    flex: 1,
  },
  slotsContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  slotCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slotNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '600',
  },
  priceInputContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceLabel: {
    fontSize: 13,
    width: 60,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
});

export default SlotsManagementModal;
