import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const UserDebugScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const debugInfo = [
    { label: 'User Object Exists', value: user ? 'Yes' : 'No' },
    { label: 'Phone', value: user?.phone || 'Not set' },
    { label: 'Role', value: user?.role || 'Not set' },
    { label: 'Name', value: user?.name || 'Not set' },
    { label: 'Name Type', value: typeof user?.name },
    { label: 'Name Length', value: user?.name?.length?.toString() || '0' },
    { label: 'Is New User', value: user?.isNewUser?.toString() || 'Not set' },
    { label: 'Has Token', value: user?.token ? 'Yes' : 'No' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Debug Information</Text>
          
          {debugInfo.map((item, index) => (
            <View key={index} style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.colors.text }]}>{item.label}:</Text>
              <Text style={[styles.value, { color: theme.colors.textSecondary }]}>{item.value}</Text>
            </View>
          ))}
          
          <View style={styles.rawDataSection}>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>Raw User Object:</Text>
            <Text style={[styles.rawData, { color: theme.colors.textSecondary }]}>
              {JSON.stringify(user, null, 2)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
  },
  rawDataSection: {
    marginTop: 20,
  },
  rawData: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});

export default UserDebugScreen;
