import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, themes } from '../../contexts/ThemeContext';

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ visible, onClose }) => {
  const { theme, setTheme } = useTheme();

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    onClose();
  };

  const renderThemeOption = (themeOption: typeof themes.default) => {
    const isSelected = theme.id === themeOption.id;
    
    return (
      <TouchableOpacity
        key={themeOption.id}
        style={[
          styles.themeOption,
          { borderColor: theme.colors.border },
          isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
        ]}
        onPress={() => handleThemeSelect(themeOption.id)}
        activeOpacity={0.7}
      >
        <View style={styles.themePreview}>
          <View style={[styles.previewPrimary, { backgroundColor: themeOption.colors.primary }]} />
          <View style={[styles.previewSecondary, { backgroundColor: themeOption.colors.secondary }]} />
          <View style={[styles.previewAccent, { backgroundColor: themeOption.colors.accent }]} />
          <View style={[styles.previewBackground, { backgroundColor: themeOption.colors.background }]} />
        </View>
        
        <View style={styles.themeInfo}>
          <Text style={[styles.themeName, { color: theme.colors.text }]}>
            {themeOption.name}
          </Text>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
              <Text style={[styles.selectedText, { color: theme.colors.primary }]}>
                Active
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Choose Theme
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.themesContainer}>
            {Object.values(themes).map(renderThemeOption)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  themesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  themePreview: {
    flexDirection: 'row',
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    width: 60,
    height: 40,
  },
  previewPrimary: {
    flex: 1,
    height: '100%',
  },
  previewSecondary: {
    flex: 0.8,
    height: '100%',
  },
  previewAccent: {
    flex: 0.6,
    height: '100%',
  },
  previewBackground: {
    flex: 0.4,
    height: '100%',
  },
  themeInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ThemeSelector;
