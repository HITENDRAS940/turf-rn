import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image, StatusBar, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { managerAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { Alert } from 'react-native';
import GradientHeader from '../../components/shared/GradientHeader';

interface AdminTurf {
  id: number;
  name: string;
  location: string;
  description: string;
  contactNumber: string;
  availability: boolean;
  createdByAdminId: number;
  createdByAdminName: string;
  createdByAdminPhone: string;
  images: string[];
  slots: Array<{
    id: number;
    startTime: string;
    endTime: string;
    price: number;
    enabled: boolean;
  }>;
}

const AdminTurfsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const { adminProfileId, adminName } = route.params;
  
  const [turfs, setTurfs] = useState<AdminTurf[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imagesLoading, setImagesLoading] = useState<{[key: number]: boolean}>({});

  const handleImageLoadStart = (id: number) => {
    setImagesLoading(prev => ({ ...prev, [id]: true }));
  };

  const handleImageLoadEnd = (id: number) => {
    setImagesLoading(prev => ({ ...prev, [id]: false }));
  };

  useEffect(() => {
    fetchAdminTurfs();
  }, []);

  const fetchAdminTurfs = async () => {
    try {
      const data = await managerAPI.getAdminTurfs(adminProfileId);
      setTurfs(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch turfs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminTurfs();
  };

  const getLowestPrice = (slots: AdminTurf['slots']) => {
    if (!slots || slots.length === 0) return 'N/A';
    const enabledSlots = slots.filter(slot => slot.enabled);
    if (enabledSlots.length === 0) return 'N/A';
    const lowestPrice = Math.min(...enabledSlots.map(slot => slot.price));
    return `₹${lowestPrice}`;
  };

  const getActiveSlots = (slots: AdminTurf['slots']) => {
    if (!slots || slots.length === 0) return 0;
    return slots.filter(slot => slot.enabled).length;
  };

  const renderTurfCard = ({ item }: { item: AdminTurf }) => (
    <TouchableOpacity
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
        }
      ]}
      activeOpacity={0.7}
      onPress={() => {
        navigation.navigate('ManagerTurfDetail', { turf: item });
      }}
    >
      {/* Turf Image */}
      <View style={styles.imageContainer}>
        {item.images && item.images.length > 0 ? (
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: item.images[0] }} 
              style={styles.turfImage}
              onLoadStart={() => handleImageLoadStart(item.id)}
              onLoadEnd={() => handleImageLoadEnd(item.id)}
            />
            {imagesLoading[item.id] && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme.colors.border || 'rgba(0,0,0,0.05)' }]}>
            <Ionicons name="football-outline" size={40} color={theme.colors.textSecondary} />
          </View>
        )}
        
        {/* Availability Badge */}
        <View style={[
          styles.availabilityBadge, 
          { backgroundColor: item.availability ? '#10B981' : '#EF4444' }
        ]}>
          <Text style={styles.availabilityText}>
            {item.availability ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>

      {/* Turf Details */}
      <View style={styles.cardContent}>
        <Text style={[styles.turfName, { color: theme.colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.location, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {item.location}
          </Text>
        </View>

        {item.description && (
          <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statItem, { backgroundColor: theme.colors.primary + '15' }]}>
            <Ionicons name="time-outline" size={14} color={theme.colors.primary} />
            <Text style={[styles.statText, { color: theme.colors.primary }]}>
              {getActiveSlots(item.slots)}/24 Slots
            </Text>
          </View>
          
          <View style={[styles.statItem, { backgroundColor: '#10B981' + '15' }]}>
            <Ionicons name="cash-outline" size={14} color="#10B981" />
            <Text style={[styles.statText, { color: '#10B981' }]}>
              From {getLowestPrice(item.slots)}
            </Text>
          </View>
        </View>

        {/* Contact Number */}
        {item.contactNumber && (
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.contactText, { color: theme.colors.textSecondary }]}>
              {item.contactNumber}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      safeAreaEdges={['left', 'right', 'bottom']}
    >
      <GradientHeader
        title="Turfs"
        subtitle={`Managed by ${adminName}`}
        showBack={true}
      />

      {/* Turfs List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading turfs...
          </Text>
        </View>
      ) : (
        <FlatList
          data={turfs}
          renderItem={renderTurfCard}
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
            <View style={styles.emptyState}>
              <Ionicons name="football-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No Turfs Found
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                This admin hasn't created any turfs yet
              </Text>
            </View>
          }
          ListHeaderComponent={
            turfs.length > 0 ? (
              <View style={[styles.statsHeader, { backgroundColor: theme.colors.card, shadowColor: theme.colors.shadow }]}>
                <View style={styles.statsHeaderItem}>
                  <Text style={[styles.statsHeaderValue, { color: theme.colors.primary }]}>
                    {turfs.length}
                  </Text>
                  <Text style={[styles.statsHeaderLabel, { color: theme.colors.textSecondary }]}>
                    Total Turfs
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.colors.border || 'rgba(0,0,0,0.1)' }]} />
                <View style={styles.statsHeaderItem}>
                  <Text style={[styles.statsHeaderValue, { color: '#10B981' }]}>
                    {turfs.filter(t => t.availability).length}
                  </Text>
                  <Text style={[styles.statsHeaderLabel, { color: theme.colors.textSecondary }]}>
                    Available
                  </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: theme.colors.border || 'rgba(0,0,0,0.1)' }]} />
                <View style={styles.statsHeaderItem}>
                  <Text style={[styles.statsHeaderValue, { color: '#EF4444' }]}>
                    {turfs.filter(t => !t.availability).length}
                  </Text>
                  <Text style={[styles.statsHeaderLabel, { color: theme.colors.textSecondary }]}>
                    Unavailable
                  </Text>
                </View>
              </View>
            ) : null
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
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsHeaderItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsHeaderValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsHeaderLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: '100%',
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.5)',
  },
  turfImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  availabilityText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  turfName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    flex: 1,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  contactText: {
    fontSize: 13,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AdminTurfsScreen;
