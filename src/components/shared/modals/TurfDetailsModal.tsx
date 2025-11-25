/**
 * TurfDetailsModal Component
 * Reusable modal for editing turf details (name, location, price, amenities, description)
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import Button from '../Button';
import { validateTurfName, validateLocation, validatePrice, validateDescription, validateAmenities } from '../../../utils/validationUtils';

interface TurfDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (details: TurfDetailsData) => void;
  onSkipToSlots?: () => void;
  initialData: TurfDetailsData;
  loading?: boolean;
  showSkipButton?: boolean;
}

export interface TurfDetailsData {
  name: string;
  location: string;
  price: string;
  amenities: string;
  description: string;
}

const TurfDetailsModal: React.FC<TurfDetailsModalProps> = ({
  visible,
  onClose,
  onSave,
  onSkipToSlots,
  initialData,
  loading = false,
  showSkipButton = false,
}) => {
  const { theme } = useTheme();
  const [formData, setFormData] = React.useState<TurfDetailsData>(initialData);
  const [errors, setErrors] = React.useState<Partial<Record<keyof TurfDetailsData, string>>>({});

  // Update form data when initialData changes
  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof TurfDetailsData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TurfDetailsData, string>> = {};

    const nameValidation = validateTurfName(formData.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }

    const locationValidation = validateLocation(formData.location);
    if (!locationValidation.isValid) {
      newErrors.location = locationValidation.error;
    }

    const priceValidation = validatePrice(formData.price);
    if (!priceValidation.isValid) {
      newErrors.price = priceValidation.error;
    }

    const amenitiesValidation = validateAmenities(formData.amenities);
    if (!amenitiesValidation.isValid) {
      newErrors.amenities = amenitiesValidation.error;
    }

    const descriptionValidation = validateDescription(formData.description);
    if (!descriptionValidation.isValid) {
      newErrors.description = descriptionValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

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
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Edit Turf Details
              </Text>
              {showSkipButton && (
                <Text style={[styles.editModeHint, { color: theme.colors.textSecondary }]}>
                  💡 Tip: Use "Skip to Slots" to avoid API costs if no changes needed
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <ScrollView
            style={styles.form}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            {/* Turf Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Turf Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: errors.name ? theme.colors.error : theme.colors.border,
                  },
                ]}
                placeholder="Enter turf name"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                editable={!loading}
              />
              {errors.name && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.name}
                </Text>
              )}
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Location <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: errors.location ? theme.colors.error : theme.colors.border,
                  },
                ]}
                placeholder="Enter location"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.location}
                onChangeText={(value) => handleChange('location', value)}
                editable={!loading}
              />
              {errors.location && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.location}
                </Text>
              )}
            </View>

            {/* Base Price */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Base Price (₹/hour) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: errors.price ? theme.colors.error : theme.colors.border,
                  },
                ]}
                placeholder="Enter base price"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.price}
                onChangeText={(value) => handleChange('price', value)}
                keyboardType="numeric"
                editable={!loading}
              />
              {errors.price && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.price}
                </Text>
              )}
            </View>

            {/* Amenities */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Amenities (comma-separated)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: errors.amenities ? theme.colors.error : theme.colors.border,
                  },
                ]}
                placeholder="e.g., Parking, Washroom, Changing Room"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.amenities}
                onChangeText={(value) => handleChange('amenities', value)}
                multiline
                numberOfLines={2}
                editable={!loading}
              />
              {errors.amenities && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.amenities}
                </Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.card,
                    color: theme.colors.text,
                    borderColor: errors.description ? theme.colors.error : theme.colors.border,
                  },
                ]}
                placeholder="Enter turf description"
                placeholderTextColor={theme.colors.textSecondary}
                value={formData.description}
                onChangeText={(value) => handleChange('description', value)}
                multiline
                numberOfLines={4}
                editable={!loading}
              />
              {errors.description && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {errors.description}
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            {showSkipButton && onSkipToSlots && (
              <Button
                title="Skip to Slots"
                onPress={onSkipToSlots}
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
    maxWidth: 500,
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
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  editModeHint: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionButton: {
    flex: 1,
  },
});

export default TurfDetailsModal;
