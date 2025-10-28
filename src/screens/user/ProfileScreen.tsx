import React, { useState } from 'react';
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
import { COLORS } from '../../constants/colors';
import Toast from 'react-native-toast-message';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';
import ThemeSelector from '../../components/shared/ThemeSelector';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Debug: Log user data to see what's available
  console.log('ProfileScreen - User data:', JSON.stringify(user, null, 2));

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
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          onPress: () => Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Profile editing feature is under development' }),
        },
        {
          icon: 'card-outline',
          title: 'Payment Methods',
          subtitle: 'Manage your payment options',
          onPress: () => Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Payment methods feature is under development' }),
        },
        {
          icon: 'location-outline',
          title: 'Saved Addresses',
          subtitle: 'Manage your saved locations',
          onPress: () => Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Saved addresses feature is under development' }),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline',
          title: 'Notifications',
          subtitle: 'Manage notification settings',
          onPress: () => Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Notification settings feature is under development' }),
        },
        {
          icon: 'color-palette-outline',
          title: 'App Theme',
          subtitle: 'Choose your preferred theme',
          onPress: () => setShowThemeSelector(true),
        },
        {
          icon: 'eye-outline',
          title: 'Theme Showcase',
          subtitle: 'Preview all available themes',
          onPress: () => navigation.navigate('ThemeShowcase'),
        },
        {
          icon: 'language-outline',
          title: 'Language',
          subtitle: 'Choose your preferred language',
          onPress: () => Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Language settings feature is under development' }),
        },
        {
          icon: 'moon-outline',
          title: 'Dark Mode',
          subtitle: 'Included in theme selection',
          onPress: () => setShowThemeSelector(true),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          onPress: () => Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Help & support feature is under development' }),
        },
        {
          icon: 'bug-outline',
          title: 'Debug Info',
          subtitle: 'View user data for debugging',
          onPress: () => navigation.navigate('UserDebug'),
        },
        {
          icon: 'star-outline',
          title: 'Rate App',
          subtitle: 'Rate our app on the store',
          onPress: () => Toast.show({ type: 'info', text1: 'Thank You!', text2: 'Rate app feature is under development' }),
        },
        {
          icon: 'document-text-outline',
          title: 'Terms & Privacy',
          subtitle: 'Read our terms and privacy policy',
          onPress: () => Toast.show({ type: 'info', text1: 'Coming Soon', text2: 'Terms & privacy feature is under development' }),
        },
        {
          icon: 'information-circle-outline',
          title: 'About',
          subtitle: 'App version and information',
          onPress: () => Toast.show({ type: 'info', text1: 'TurfBooking', text2: 'Version 1.0.0' }),
        },
      ],
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
        <View style={styles.menuItemContent}>
          <Text style={[styles.menuItemText, { color: theme.colors.text }]}>{item.title}</Text>
          <Text style={[styles.menuItemSubtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
    </TouchableOpacity>
  );

  const renderSection = (section: any) => (
    <View key={section.title} style={styles.menuSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
      <View style={[styles.sectionItems, { backgroundColor: theme.colors.card }]}>
        {section.items.map(renderMenuItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.lightGray }]}>
            <Ionicons name="person" size={40} color={theme.colors.primary} />
          </View>
          {user?.name && user.name.trim() !== '' ? (
            <Text style={[styles.name, { color: theme.colors.text }]}>{user.name}</Text>
          ) : (
            <Text style={[styles.name, { color: theme.colors.text }]}>User Name Not Set</Text>
          )}
          <Text style={[styles.phone, { color: theme.colors.textSecondary }]}>
            {formatPhoneForDisplay(user?.phone || '')}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.colors.lightGray }]}>
            <Text style={[styles.roleText, { color: theme.colors.primary }]}>
              {user?.role === 'ROLE_USER' ? 'User' : 'Admin'}
            </Text>
          </View>
        </View>

        {menuSections.map(renderSection)}

        <TouchableOpacity style={[styles.logoutButton, { borderColor: theme.colors.error }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: theme.colors.textSecondary }]}>TurfBooking v1.0.0</Text>
      </View>

      <ThemeSelector 
        visible={showThemeSelector} 
        onClose={() => setShowThemeSelector(false)} 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.navy,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 32,
    margin: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
    textAlign: 'center',
  },
  phone: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionItems: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.red,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  version: {
    fontSize: 12,
    color: COLORS.gray,
  },
});

export default ProfileScreen;
