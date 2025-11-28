// filepath: /Users/hitendrasingh/Desktop/EzTurf/src/screens/admin/TurfManagementScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/shared/ScreenWrapper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { turfAPI, adminAPI } from '../../services/api';
import { Turf } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Shared Components
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/shared/Button';
import AdminTurfCard from '../../components/admin/AdminTurfCard';
import TurfDetailsModal, { TurfDetailsData } from '../../components/shared/modals/TurfDetailsModal';
import SlotsManagementModal from '../../components/shared/modals/SlotsManagementModal';
import AvailabilityModal from '../../components/shared/modals/AvailabilityModal';

// Types
import { SlotConfig } from '../../types';

type ModalStep = 'none' | 'details' | 'slots' | 'availability';

const TurfManagementScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const styles = createStyles(theme);
  
  // State
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStep, setCurrentStep] = useState<ModalStep>('none');
  const [currentTurfId, setCurrentTurfId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Modal data
  const [turfDetailsData, setTurfDetailsData] = useState<TurfDetailsData>({
    name: '',
    location: '',
    price: '',
    amenities: '',
    description: '',
  });
  const [slots, setSlots] = useState<SlotConfig[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    fetchTurfs();
  }, []);

  // Handle edit navigation from AdminTurfDetailScreen
  useEffect(() => {
    if (route.params?.editTurf) {
      startTurfEdit(route.params.editTurf);
      navigation.setParams({ editTurf: undefined });
    }
  }, [route.params?.editTurf]);

  const fetchTurfs = async () => {
    try {
      if (!user?.id) {
        setTurfs([]);
        return;
      }
      const response = await adminAPI.getAdminTurfs(user.id);
      const turfList = response.data || response || [];
      setTurfs(Array.isArray(turfList) ? turfList : []);
    } catch (error: any) {
      console.error('Error fetching turfs:', error);
      console.error('Error fetching turfs:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch turfs');
      setTurfs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTurfs();
  };

  // Create/Edit Handlers
  const startTurfCreation = () => {
    setIsEditMode(false);
    setCurrentTurfId(null);
    setTurfDetailsData({
      name: '',
      location: '',
      price: '',
      amenities: '',
      description: '',
    });
    setCurrentStep('details');
  };

  const startTurfEdit = async (turf: Turf) => {
    setIsEditMode(true);
    setCurrentTurfId(turf.id);
    
    try {
      const response = await turfAPI.getTurfById(turf.id);
      const turfData = response.data;
      
      setTurfDetailsData({
        name: turfData.name || '',
        location: turfData.location || '',
        price: turfData.price?.toString() || '',
        amenities: turfData.amenities || '',
        description: turfData.description || '',
      });
      
      setCurrentStep('details');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch turf details');
    }
  };

  const loadSlots = async (turfId: number) => {
    setSlotsLoading(true);
    try {
      const response = await adminAPI.getTurfSlots(turfId);
      const dbSlots = response.data;
      
      if (dbSlots && dbSlots.length > 0) {
        const mappedSlots = dbSlots.map((dbSlot: any, index: number) => ({
          slotId: dbSlot.id || dbSlot.slotId || (index + 1),
          startTime: dbSlot.startTime,
          endTime: dbSlot.endTime,
          price: dbSlot.price,
          enabled: dbSlot.enabled === true,
        }));
        
        setSlots(mappedSlots);
      }
    } catch (error) {
      console.error('Error fetching turfs:', error);
      Alert.alert('Error', 'Failed to fetch turfs');
    } finally {
      setSlotsLoading(false);
    }
  };

  // Modal Callbacks
  const handleTurfDetailsSave = async (details: TurfDetailsData) => {
    try {
      if (isEditMode && currentTurfId) {
        // Update existing turf
        await adminAPI.updateTurfDetails(currentTurfId, {
          name: details.name,
          location: details.location,
          description: details.description,
          contactNumber: '',
        });
        
        Alert.alert('Success', 'Turf details updated successfully');
      } else {
        // Create new turf
        const response = await adminAPI.createTurf({
          name: details.name,
          location: details.location,
          description: details.description,
          contactNumber: '',
        });
        
        const newTurfId = response.data?.id || response.data?.turf?.id;
        setCurrentTurfId(newTurfId);
        
        Alert.alert('Success', 'Turf created successfully');
      }
      
      fetchTurfs();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} turf`);
      throw error;
    }
  };

  const handleSlotsSave = async (updatedSlots: SlotConfig[]) => {
    if (!currentTurfId) return;
    
    try {
      for (const slot of updatedSlots) {
        if (slot.price !== undefined) {
          await adminAPI.updateSlotPrice(currentTurfId, slot.slotId, slot.price);
        }
        
        if (slot.enabled) {
          await adminAPI.enableSlot(currentTurfId, slot.slotId);
        } else {
          await adminAPI.disableSlot(currentTurfId, slot.slotId);
        }
      }
      
      // Refresh turfs to reflect latest DB state
      fetchTurfs();
    } catch (error: any) {
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleAvailabilitySave = async (isAvailable: boolean) => {
    if (!currentTurfId) return;
    
    try {
      if (isAvailable) {
        await adminAPI.setTurfAvailable(currentTurfId);
      } else {
        await adminAPI.setTurfNotAvailable(currentTurfId);
      }

      Alert.alert('Success', `Turf set as ${isAvailable ? 'available' : 'not available'} successfully`);

      fetchTurfs();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to set turf availability');
      throw error;
    }
  };

  const closeModal = () => {
    setCurrentStep('none');
    setCurrentTurfId(null);
    setIsEditMode(false);
  };

  const handleTurfPress = (turf: Turf) => {
    navigation.navigate('AdminTurfDetail', { turf });
  };

  const renderTurfCard = ({ item }: { item: Turf }) => (
    <AdminTurfCard 
      turf={item} 
      onPress={() => handleTurfPress(item)}
    />
  );

  return (
    <ScreenWrapper style={styles.container} safeAreaEdges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Turf Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={startTurfCreation}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Turf List */}
      {loading ? (
        <LoadingState />
      ) : turfs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="golf"
            title="No Turfs Yet"
            description="Create your first turf to get started"
          />
          <Button
            title="Create Turf"
            onPress={startTurfCreation}
            style={styles.createButton}
          />
        </View>
      ) : (
        <FlatList
          data={turfs}
          renderItem={renderTurfCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modals */}
      <TurfDetailsModal
        visible={currentStep === 'details'}
        onClose={closeModal}
        onSave={handleTurfDetailsSave}
        onSkipToSlots={() => {
          if (currentTurfId) {
            loadSlots(currentTurfId);
            setCurrentStep('slots');
          }
        }}
        initialData={turfDetailsData}
        showSkipButton={isEditMode}
      />

      <SlotsManagementModal
        visible={currentStep === 'slots'}
        onClose={closeModal}
        onSave={handleSlotsSave}
        onSkip={() => setCurrentStep('availability')}
        slots={slots}
        loading={slotsLoading}
        showRefresh={isEditMode}
        onRefresh={() => currentTurfId && loadSlots(currentTurfId)}
        turfName={turfDetailsData.name}
      />

      <AvailabilityModal
        visible={currentStep === 'availability'}
        onClose={closeModal}
        onSave={handleAvailabilitySave}
        currentAvailability={false}
        turfName={turfDetailsData.name}
      />
    </ScreenWrapper>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border || 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  listContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    marginTop: 20,
    paddingHorizontal: 40,
  },
});

export default TurfManagementScreen;
