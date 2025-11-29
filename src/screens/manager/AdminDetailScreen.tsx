import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { AdminResponse } from '../../types';
import GradientHeader from '../../components/shared/GradientHeader';

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
        navigation.navigate('AdminTurfs', { 
          adminProfileId: admin.id, 
          adminName: admin.name 
        });
      }
    },
    {
      title: 'View Revenue',
      subtitle: 'Check earnings and financial stats',
      icon: 'cash-outline',
      color: '#F59E0B',
      action: () => {
        Alert.alert('Coming Soon', 'Revenue analytics under development');
      }
    },
    {
      title: 'View Bookings',
      subtitle: 'See all bookings for this admin',
      icon: 'calendar-outline',
      color: '#3B82F6',
      action: () => {
        Alert.alert('Coming Soon', 'Bookings view under development');
      }
    },
    {
      title: 'Activity Log',
      subtitle: 'Track admin actions and history',
      icon: 'time-outline',
      color: '#8B5CF6',
      action: () => {
        Alert.alert('Coming Soon', 'Activity log under development');
      }
    },
    {
      title: 'Edit Admin',
      subtitle: 'Update admin details and permissions',
      icon: 'create-outline',
      color: '#6366F1',
      action: () => {
        Alert.alert('Coming Soon', 'Edit admin feature under development');
      }
    },
    {
      title: 'Send Notification',
      subtitle: 'Send custom message to admin',
      icon: 'notifications-outline',
      color: '#EC4899',
      action: () => {
        Alert.alert('Coming Soon', 'Notifications feature under development');
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
                Alert.alert('Coming Soon', 'Account suspension under development');
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
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name={icon} size={16} color={theme.colors.textSecondary} />
        </View>
        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['left', 'right', 'bottom']}
    >
      <GradientHeader
        title="Admin Details"
        subtitle="Manage admin profile and permissions"
        showBack={true}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Admin Info Card */}
        <View style={[
          styles.adminCard, 
          { 
            backgroundColor: theme.colors.card,
            shadowColor: theme.colors.shadow,
          }
        ]}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '15' }]}>
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
                style={[
                  styles.actionCard, 
                  { 
                    backgroundColor: theme.colors.card,
                    shadowColor: theme.colors.shadow,
                  }
                ]}
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
                <View style={[styles.actionArrow, { backgroundColor: theme.colors.surface }]}>
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingTop: 10,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  adminCard: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
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
    fontSize: 32,
    fontWeight: '800',
  },
  adminName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 20,
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
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  actionGrid: {
    gap: 16,
  },
  actionCard: {
    padding: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    paddingRight: 24,
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
