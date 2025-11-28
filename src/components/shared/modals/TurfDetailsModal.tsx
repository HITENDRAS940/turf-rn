/**
 * TurfDetailsModal – Clean Final Version (with reusable FormField)
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScreenWrapper } from "../ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";

import Button from "../Button";
import FormField from "../FormField";

import {
  validateTurfName,
  validateLocation,
  validatePrice,
  validateDescription,
  validateAmenities,
} from "../../../utils/validationUtils";

export interface TurfDetailsData {
  name: string;
  location: string;
  price: string;
  amenities: string;
  description: string;
}

interface TurfDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (details: TurfDetailsData) => void;
  onSkipToSlots?: () => void;
  initialData: TurfDetailsData;
  loading?: boolean;
  showSkipButton?: boolean;
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
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof TurfDetailsData, string>>
  >({});
  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Reset closing state when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setIsClosing(false);
    }
  }, [visible]);

  const handleChange = (field: keyof TurfDetailsData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof TurfDetailsData, string>> = {};

    const validations = {
      name: validateTurfName(formData.name),
      location: validateLocation(formData.location),
      price: validatePrice(formData.price),
      amenities: validateAmenities(formData.amenities),
      description: validateDescription(formData.description),
    };

    for (const key in validations) {
      const result = validations[key as keyof TurfDetailsData];
      if (!result.isValid) newErrors[key as keyof TurfDetailsData] = result.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      await onSave(formData);
      // Trigger smooth close animation
      setIsClosing(true);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSkipToSlots = () => {
    if (onSkipToSlots) {
      setIsClosing(true);
      setTimeout(() => {
        onSkipToSlots();
      }, 300);
    }
  };

  // -------------------------------
  // HEADER
  // -------------------------------
  const renderHeader = () => (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border || "rgba(0,0,0,0.15)",
        },
      ]}
    >
      <TouchableOpacity
        onPress={handleClose}
        style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
      >
        <Ionicons name="close" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={{ marginLeft: 16 }}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Edit Turf Details</Text>

        {showSkipButton && (
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Skip to Slots if no changes needed
          </Text>
        )}
      </View>
    </View>
  );

  // -------------------------------
  // FORM FIELDS
  // -------------------------------
  const renderForm = () => (
    <View>
      <FormField
        label="Turf Name"
        icon="business-outline"
        required
        value={formData.name}
        error={errors.name}
        placeholder="Enter turf name"
        onChange={(v) => handleChange("name", v)}
      />

      <FormField
        label="Location"
        icon="location-outline"
        required
        value={formData.location}
        error={errors.location}
        placeholder="Enter location"
        onChange={(v) => handleChange("location", v)}
      />

      <FormField
        label="Base Price (₹/hour)"
        icon="pricetag-outline"
        required
        keyboardType="numeric"
        value={formData.price}
        error={errors.price}
        placeholder="Enter base price"
        onChange={(v) => handleChange("price", v)}
      />

      <FormField
        label="Amenities (comma-separated)"
        icon="list-outline"
        multiline
        value={formData.amenities}
        error={errors.amenities}
        placeholder="Parking, Washroom, Changing Room"
        onChange={(v) => handleChange("amenities", v)}
      />

      <FormField
        label="Description"
        icon="document-text-outline"
        multiline
        large
        value={formData.description}
        error={errors.description}
        placeholder="Enter turf description"
        onChange={(v) => handleChange("description", v)}
      />
    </View>
  );

  // -------------------------------
  // MAIN MODAL LAYOUT
  // -------------------------------
  return (
    <Modal
      visible={visible && !isClosing}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <ScreenWrapper style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <View style={{ flex: 1 }}>
            {renderHeader()}

            <ScrollView
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 200,
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {renderForm()}
            </ScrollView>

            {/* Fixed Action Bar */}
            <View
              style={[
                styles.bottomBar,
                {
                  backgroundColor: theme.colors.card,
                  borderTopColor: theme.colors.border,
                },
              ]}
            >
              {showSkipButton && onSkipToSlots && (
                <Button
                  title="Skip to Slots"
                  variant="outline"
                  style={{ marginBottom: 10 }}
                  onPress={handleSkipToSlots}
                  disabled={loading}
                />
              )}

              <Button
                title={loading ? "Saving..." : "Save & Continue"}
                onPress={handleSave}
                loading={loading}
                disabled={loading}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </Modal>
  );
};

// ----------------------------------
// STYLES
// ----------------------------------
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
});

export default TurfDetailsModal;