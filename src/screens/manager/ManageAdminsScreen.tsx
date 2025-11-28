import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { managerAPI } from '../../services/api';
import { AdminResponse } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';

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
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={() => navigation.navigate('AdminDetail', { admin: item })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
          <Text style={[styles.business, { color: theme.colors.primary }]}>{item.businessName}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{item.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>{item.businessAddress}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Manage Admins</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('CreateAdmin')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  business: {
    fontSize: 14,
    fontWeight: '500',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ManageAdminsScreen;