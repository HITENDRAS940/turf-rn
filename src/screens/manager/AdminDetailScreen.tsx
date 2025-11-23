import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminResponse } from '../../types';
import Toast from 'react-native-toast-message';

const AdminDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const admin: AdminResponse = route.params?.admin;

  const actionCards = [
    {
      title: 'View Turfs',
      subtitle: 'See all turfs managed by this admin',
      icon: 'football',
      color: '#10B981',
      action: () => {
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'View turfs feature under development',
        });
      }
    },
    {
      title: 'View Revenue',
      subtitle: 'Check earnings and financial stats',
      icon: 'cash-outline',
      color: '#F59E0B',
      action: () => {
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Revenue analytics under development',
        });
      }
    },
    {
      title: 'View Bookings',
      subtitle: 'See all bookings for this admin',
      icon: 'calendar-outline',
      color: '#3B82F6',
      action: () => {
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Bookings view under development',
        });
      }
    },
    {
      title: 'Activity Log',
      subtitle: 'Track admin actions and history',
      icon: 'time-outline',
      color: '#8B5CF6',
      action: () => {
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Activity log under development',
        });
      }
    },
    {
      title: 'Edit Admin',
      subtitle: 'Update admin details and permissions',
      icon: 'create-outline',
      color: '#6366F1',
      action: () => {
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Edit admin feature under development',
        });
      }
    },
    {
      title: 'Send Notification',
      subtitle: 'Send custom message to admin',
      icon: 'notifications-outline',
      color: '#EC4899',
      action: () => {
        Toast.show({
          type: 'info',
          text1: 'Coming Soon',
          text2: 'Notifications feature under development',
        });
      }
    },
    {
      title: 'Suspend Account',
      subtitle: 'Temporarily disable admin access',
      icon: 'pause-circle-outline',
      color: '#EF4444',
      action: () => {
        Alert.alert(
          'Suspend Account',
          'Are you sure you want to suspend this admin account?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Suspend',
              style: 'destructive',
              onPress: () => {
                Toast.show({
                  type: 'info',
                  text1: 'Coming Soon',
                  text2: 'Account suspension under development',
                });
              }
            }
          ]
        );
      }
    },
  ];

  const InfoRow = ({ icon, label, value }: any) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border || 'rgba(0,0,0,0.05)' }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.backButton, { backgroundColor: theme.colors.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Admin Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Admin Info Card */}
        <View style={[styles.adminCard, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </Text>
          </View>
          
          <Text style={[styles.adminName, { color: theme.colors.text }]}>{admin?.name}</Text>
          <Text style={[styles.businessName, { color: theme.colors.primary }]}>{admin?.businessName}</Text>
          
          <View style={[styles.statusBadge, { backgroundColor: '#10B981' + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.statusText, { color: '#10B981' }]}>Active</Text>
          </View>

          <View style={styles.divider} />

          <InfoRow icon="call-outline" label="Phone" value={admin?.phone} />
          <InfoRow icon="mail-outline" label="Email" value={admin?.email} />
          <InfoRow icon="location-outline" label="Address" value={admin?.businessAddress || 'N/A'} />
        </View>

        {/* Action Cards */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            {actionCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
                onPress={card.action}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: card.color + '15' }]}>
                  <Ionicons name={card.icon as any} size={24} color={card.color} />
                </View>
                <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{card.title}</Text>
                <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                  {card.subtitle}
                </Text>
                <View style={[styles.actionArrow, { backgroundColor: theme.colors.border || 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  adminCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
  },
  adminName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionGrid: {
    gap: 16,
  },
  actionCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdminDetailScreen;
