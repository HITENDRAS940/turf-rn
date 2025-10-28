import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, themes } from '../contexts/ThemeContext';

const ThemeShowcaseScreen = ({ navigation }: any) => {
  const { theme, setTheme } = useTheme();

  const renderThemePreview = (themeOption: typeof themes.default) => {
    const isActive = theme.id === themeOption.id;
    
    return (
      <TouchableOpacity
        key={themeOption.id}
        style={[
          styles.themeCard,
          { 
            backgroundColor: themeOption.colors.card,
            borderColor: isActive ? themeOption.colors.primary : themeOption.colors.border,
            borderWidth: isActive ? 2 : 1,
          }
        ]}
        onPress={() => setTheme(themeOption.id)}
        activeOpacity={0.7}
      >
        <View style={styles.themeHeader}>
          <Text style={[styles.themeName, { color: themeOption.colors.text }]}>
            {themeOption.name}
          </Text>
          {isActive && (
            <Ionicons name="checkmark-circle" size={20} color={themeOption.colors.primary} />
          )}
        </View>
        
        <View style={styles.colorStrip}>
          <View style={[styles.colorBlock, { backgroundColor: themeOption.colors.primary }]} />
          <View style={[styles.colorBlock, { backgroundColor: themeOption.colors.secondary }]} />
          <View style={[styles.colorBlock, { backgroundColor: themeOption.colors.accent }]} />
          <View style={[styles.colorBlock, { backgroundColor: themeOption.colors.background }]} />
        </View>
        
        <View style={[styles.sampleContent, { backgroundColor: themeOption.colors.background }]}>
          <Text style={[styles.sampleTitle, { color: themeOption.colors.text }]}>
            Sample Content
          </Text>
          <Text style={[styles.sampleText, { color: themeOption.colors.textSecondary }]}>
            This is how text looks in this theme
          </Text>
          <View style={[styles.sampleButton, { backgroundColor: themeOption.colors.primary }]}>
            <Text style={styles.buttonText}>Button</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Theme Showcase</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Choose from 4 professional themes. Current theme: {theme.name}
        </Text>
        
        <View style={styles.themesGrid}>
          {Object.values(themes).map(renderThemePreview)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  themesGrid: {
    gap: 16,
  },
  themeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '600',
  },
  colorStrip: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  colorBlock: {
    flex: 1,
  },
  sampleContent: {
    padding: 12,
    borderRadius: 8,
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sampleText: {
    fontSize: 14,
    marginBottom: 12,
  },
  sampleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ThemeShowcaseScreen;
