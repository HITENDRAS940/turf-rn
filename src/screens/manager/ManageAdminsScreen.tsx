import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { managerAPI } from '../../services/api';
import { AdminResponse } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import GradientHeader from '../../components/shared/GradientHeader';

const ManageAdminsScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [admins, setAdmins] = useState<AdminResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const data = await managerAPI.getAllAdmins();
      setAdmins(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch admins');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdmins();
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Admin',
      'Are you sure you want to delete this admin?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await managerAPI.deleteAdmin(id);
              setAdmins(admins.filter(a => a.id !== id));
              Alert.alert('Success', 'Admin deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete admin');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: AdminResponse }) => (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
        }
      ]}
      onPress={() => navigation.navigate('AdminDetail', { admin: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
          <Text style={[styles.business, { color: theme.colors.primary }]}>{item.businessName}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="mail-outline" size={14} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{item.businessAddress}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['left', 'right', 'bottom']}
    >
      <GradientHeader
        title="Manage Admins"
        subtitle="View and manage platform administrators"
        showBack={true}
        rightElement={
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateAdmin')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={admins}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: theme.colors.textSecondary }}>No admins found</Text>
            </View>
          }
        />
      )}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
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
  list: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  business: {
    fontSize: 14,
    fontWeight: '600',
  },
  details: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
});

export default ManageAdminsScreen;