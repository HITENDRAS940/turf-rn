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
  ActivityIndicator,
} from "react-native";
import { ScreenWrapper } from "../ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";

import Button from "../Button";
import FormField from "../FormField";

import {
  validateTurfName,
  validateLocation,
  validateDescription,
  validateAmenities,
} from "../../../utils/validationUtils";

export interface TurfDetailsData {
  name: string;
  location: string;
  amenities: string;
  description: string;
}

interface TurfDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (details: TurfDetailsData) => void;
  initialData: TurfDetailsData;
  loading?: boolean;
  isEditMode?: boolean;
}

const TurfDetailsModal: React.FC<TurfDetailsModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
  loading = false,
  isEditMode = false,
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
      <View style={styles.headerTop}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {isEditMode ? "Edit Turf Details" : "Create New Turf"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleClose}
          style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
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
              <Button
                title={loading ? "Saving..." : (isEditMode ? "Save Changes" : "Create Turf")}
                onPress={handleSave}
                loading={loading}
                disabled={loading}
              />
            </View>

            {/* Loading Overlay */}
            {loading && (
              <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.loadingContainer, { backgroundColor: theme.colors.card }]}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                    {isEditMode ? "Making changes please wait..." : "Creating new Turf please wait..."}
                  </Text>
                </View>
              </View>
            )}
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default TurfDetailsModal;