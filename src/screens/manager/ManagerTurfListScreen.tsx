import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { managerAPI } from '../../services/api';
import { ManagerTurfResponse } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import GradientHeader from '../../components/shared/GradientHeader';

const ManagerTurfListScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [turfs, setTurfs] = useState<ManagerTurfResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    try {
      const data = await managerAPI.getAllTurfsManager();
      setTurfs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ManagerTurfResponse }) => (
    <View style={[
      styles.card, 
      { 
        backgroundColor: theme.colors.card,
        shadowColor: theme.colors.shadow,
      }
    ]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
        <Ionicons name="football" size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.turfName, { color: theme.colors.text }]}>{item.name}</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.location, { color: theme.colors.textSecondary }]}>{item.location}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.adminName, { color: theme.colors.textSecondary }]}>
            Managed by: <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{item.createdByName}</Text>
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </View>
  );

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['left', 'right', 'bottom']}
    >
      <GradientHeader
        title="All Turfs"
        subtitle="View all platform turfs"
        showBack={true}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={turfs}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: theme.colors.textSecondary }}>No turfs found</Text>
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
  list: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  turfName: {
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    fontSize: 14,
    flex: 1,
  },
  adminName: {
    fontSize: 13,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
});

export default ManagerTurfListScreen;
