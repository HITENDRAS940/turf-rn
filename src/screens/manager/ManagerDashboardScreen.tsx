import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar, Dimensions, Platform } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { managerAPI } from '../../services/api';

const { width } = Dimensions.get('window');

const ManagerDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState({ admins: 0, turfs: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      // const [admins, turfs] = await Promise.all([
      //   managerAPI.getAllAdmins(),
      //   managerAPI.getAllTurfsManager()
      // ]);
      setStats({
        admins: 10,
        turfs: 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchStats();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const menuItems = [
    {
      title: 'Manage Admins',
      subtitle: 'Create & manage system administrators',
      icon: 'people',
      route: 'ManageAdmins',
      color: '#4F46E5'
    },
    {
      title: 'Platform Turfs',
      subtitle: 'Monitor all registered turfs',
      icon: 'football',
      route: 'ManagerTurfList',
      color: '#10B981'
    },
  ];

  const StatCard = ({ title, count, icon, color }: any) => (
    <View style={[styles.statCard, { 
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border || 'rgba(0,0,0,0.05)',
    }]}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={26} color={color} />
        </View>
      </View>
      <View style={styles.statCardContent}>
        <Text style={[styles.statCount, { color: theme.colors.text }]}>
          {loading ? '-' : count.toLocaleString()}
        </Text>
        <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      </View>
    </View>
  );

  return (
    <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]} safeAreaEdges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Section with Badge */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border || 'rgba(0,0,0,0.05)',
      }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {user?.name?.charAt(0).toUpperCase() || 'M'}
            </Text>
          </View>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.name, { color: theme.colors.text }]}>{user?.name || 'Manager'}</Text>
            <View style={[styles.roleBadge, { backgroundColor: '#4F46E5' + '20' }]}>
              <Ionicons name="shield-checkmark" size={12} color="#4F46E5" />
              <Text style={[styles.roleText, { color: '#4F46E5' }]}>Manager</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          onPress={logout} 
          style={[styles.logoutButton, { backgroundColor: theme.colors.error + '15' }]}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Platform Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard 
            title="Total Admins" 
            count={stats.admins} 
            icon="people" 
            color="#4F46E5" 
          />
          <StatCard 
            title="Total Turfs" 
            count={stats.turfs} 
            icon="football" 
            color="#10B981" 
          />
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>Management</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    gap: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  logoutButton: {
    padding: 10,
    borderRadius: 12,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  statCardHeader: {
    marginBottom: 4,
  },
  statCardContent: {
    marginTop: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  menuGrid: {
    gap: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ManagerDashboardScreen;
