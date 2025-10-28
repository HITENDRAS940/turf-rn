import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Toast from 'react-native-toast-message';

const AdminMoreScreen = () => {
  const { logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Toast.show({
                type: 'success',
                text1: 'Logged Out',
                text2: 'You have been logged out successfully',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to logout',
              });
            }
          },
        },
      ]
    );
  };

  const menuSections = [
    {
      title: 'General',
      items: [
        {
          title: 'Theme Settings',
          subtitle: 'Customize app appearance',
          icon: 'color-palette-outline',
          onPress: () => {
            Toast.show({
              type: 'info',
              text1: 'Coming Soon',
              text2: 'Theme settings will be available soon',
            });
          },
        },
        {
          title: 'Notifications',
          subtitle: 'Manage notification preferences',
          icon: 'notifications-outline',
          onPress: () => {
            Toast.show({
              type: 'info',
              text1: 'Coming Soon',
              text2: 'Notification settings will be available soon',
            });
          },
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help & FAQ',
          subtitle: 'Get help and find answers',
          icon: 'help-circle-outline',
          onPress: () => {
            Toast.show({
              type: 'info',
              text1: 'Coming Soon',
              text2: 'Help section will be available soon',
            });
          },
        },
        {
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          icon: 'mail-outline',
          onPress: () => {
            Toast.show({
              type: 'info',
              text1: 'Coming Soon',
              text2: 'Contact support will be available soon',
            });
          },
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          icon: 'document-text-outline',
          onPress: () => {
            Toast.show({
              type: 'info',
              text1: 'Coming Soon',
              text2: 'Terms of service will be available soon',
            });
          },
        },
        {
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          icon: 'shield-checkmark-outline',
          onPress: () => {
            Toast.show({
              type: 'info',
              text1: 'Coming Soon',
              text2: 'Privacy policy will be available soon',
            });
          },
        },
      ],
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.menuItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.lightGray }]}>
          <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.menuItemContent}>
          <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
    </TouchableOpacity>
  );

  const renderSection = (section: any) => (
    <View key={section.title} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
      <View style={styles.sectionItems}>
        {section.items.map(renderMenuItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>More</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Admin settings and options</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {menuSections.map(renderSection)}

        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={[styles.logoutButton, { borderColor: theme.colors.error, backgroundColor: theme.colors.card }]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.version, { color: theme.colors.textSecondary }]}>TurfBooking Admin v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionItems: {
    gap: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
  },
  logoutSection: {
    marginTop: 20,
    paddingTop: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
  },
});

export default AdminMoreScreen;
