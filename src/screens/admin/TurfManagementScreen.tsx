import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { turfAPI, adminAPI } from '../../services/api';
import { Turf, TurfDetails, TurfCreationResponse, SlotConfig, SlotUpdate } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/shared/Button';
import AdminTurfCard from '../../components/admin/AdminTurfCard';
import Toast from 'react-native-toast-message';

// 24 Default Slots
const DEFAULT_SLOTS: SlotConfig[] = [
  { slotId: 1, startTime: "00:00:00", endTime: "01:00:00", enabled: true },
  { slotId: 2, startTime: "01:00:00", endTime: "02:00:00", enabled: true },
  { slotId: 3, startTime: "02:00:00", endTime: "03:00:00", enabled: true },
  { slotId: 4, startTime: "03:00:00", endTime: "04:00:00", enabled: true },
  { slotId: 5, startTime: "04:00:00", endTime: "05:00:00", enabled: true },
  { slotId: 6, startTime: "05:00:00", endTime: "06:00:00", enabled: true },
  { slotId: 7, startTime: "06:00:00", endTime: "07:00:00", enabled: true },
  { slotId: 8, startTime: "07:00:00", endTime: "08:00:00", enabled: true },
  { slotId: 9, startTime: "08:00:00", endTime: "09:00:00", enabled: true },
  { slotId: 10, startTime: "09:00:00", endTime: "10:00:00", enabled: true },
  { slotId: 11, startTime: "10:00:00", endTime: "11:00:00", enabled: true },
  { slotId: 12, startTime: "11:00:00", endTime: "12:00:00", enabled: true },
  { slotId: 13, startTime: "12:00:00", endTime: "13:00:00", enabled: true },
  { slotId: 14, startTime: "13:00:00", endTime: "14:00:00", enabled: true },
  { slotId: 15, startTime: "14:00:00", endTime: "15:00:00", enabled: true },
  { slotId: 16, startTime: "15:00:00", endTime: "16:00:00", enabled: true },
  { slotId: 17, startTime: "16:00:00", endTime: "17:00:00", enabled: true },
  { slotId: 18, startTime: "17:00:00", endTime: "18:00:00", enabled: true },
  { slotId: 19, startTime: "18:00:00", endTime: "19:00:00", enabled: true },
  { slotId: 20, startTime: "19:00:00", endTime: "20:00:00", enabled: true },
  { slotId: 21, startTime: "20:00:00", endTime: "21:00:00", enabled: true },
  { slotId: 22, startTime: "21:00:00", endTime: "22:00:00", enabled: true },
  { slotId: 23, startTime: "22:00:00", endTime: "23:00:00", enabled: true },
  { slotId: 24, startTime: "23:00:00", endTime: "00:00:00", enabled: true },
];

type ModalStep = 'none' | 'details' | 'slots' | 'availability';

const TurfManagementScreen = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [currentStep, setCurrentStep] = useState<ModalStep>('none');
  const [currentTurfId, setCurrentTurfId] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Step 1: Turf Details
  const [turfDetails, setTurfDetails] = useState<TurfDetails>({
    name: '',
    location: '',
    description: '',
    contactNumber: '',
  });
  
  // Step 2: Slots (was Step 3)
  const [slots, setSlots] = useState<SlotConfig[]>(DEFAULT_SLOTS);
  const [samePriceForAll, setSamePriceForAll] = useState(false);
  const [masterPrice, setMasterPrice] = useState('');
  const [slotsLoadedFromDB, setSlotsLoadedFromDB] = useState(false);

  useEffect(() => {
    fetchTurfs();
  }, []);

  // Load slot configurations when entering slots step in edit mode
  useEffect(() => {
    if (currentStep === 'slots' && isEditMode && currentTurfId && !slotsLoadedFromDB) {
      fetchSlotConfigurations(currentTurfId);
    }
  }, [currentStep, isEditMode, currentTurfId, slotsLoadedFromDB]);

  const fetchTurfs = async () => {
    try {
      const response = await turfAPI.getAllTurfs();
      setTurfs(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch turfs',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTurfs();
  };

  const resetModalState = () => {
    setCurrentStep('none');
    setCurrentTurfId(null);
    setTurfDetails({ name: '', location: '', description: '', contactNumber: '' });
    setSlots(DEFAULT_SLOTS);
    setSamePriceForAll(false);
    setMasterPrice('');
    setProcessing(false);
    setIsEditMode(false);
    setSlotsLoadedFromDB(false);
  };

  const startTurfCreation = () => {
    resetModalState();
    setCurrentStep('details');
  };

  const startTurfEdit = async (turf: Turf) => {
    resetModalState();
    setIsEditMode(true);
    setCurrentTurfId(turf.id);
    
    try {
      // Fetch detailed turf data
      const response = await turfAPI.getTurfById(turf.id);
      const turfData = response.data;
      
      setTurfDetails({
        name: turfData.name,
        location: turfData.location,
        description: turfData.description,
        contactNumber: turfData.contactNumber || '',
      });
      
      setCurrentStep('details');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to fetch turf details',
      });
    }
  };

  // Step 1: Handle Turf Details Submission
  const handleTurfDetailsSubmit = async () => {
    if (!turfDetails.name || !turfDetails.location || !turfDetails.description) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields',
      });
      return;
    }

    // Validate contact number format if provided
    if (turfDetails.contactNumber && !/^\+?[\d\s\-\(\)]{10,15}$/.test(turfDetails.contactNumber)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid contact number',
      });
      return;
    }

    setProcessing(true);
    try {
      if (isEditMode && currentTurfId) {
        // Update existing turf
        await adminAPI.updateTurfDetails(currentTurfId, turfDetails);
        
        // Load slot configurations if not already loaded
        if (!slotsLoadedFromDB) {
          await fetchSlotConfigurations(currentTurfId);
        }
        setCurrentStep('slots');
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Turf details updated successfully',
        });
      } else {
        // Create new turf
        const response = await adminAPI.createTurfDetails(turfDetails);
        const turfData: TurfCreationResponse = response.data;
        setCurrentTurfId(turfData.id);
        setCurrentStep('slots');
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Turf details saved successfully',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'save'} turf details`,
      });
    } finally {
      setProcessing(false);
    }
  };

  // Step 2: Handle Slot Management
  const skipSlotManagement = () => {
    setCurrentStep('availability');
  };

  const skipToSlotsManagement = async () => {
    // Skip turf details update and go directly to slots
    if (!slotsLoadedFromDB && currentTurfId) {
      await fetchSlotConfigurations(currentTurfId);
    }
    setCurrentStep('slots');
  };

  const skipAvailabilityAndFinish = () => {
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: `Turf ${isEditMode ? 'updated' : 'created'} successfully`,
    });

    resetModalState();
    fetchTurfs(); // Refresh the turf list
  };

  // Fetch slot configurations from database
  const fetchSlotConfigurations = async (turfId: number) => {
    if (slotsLoadedFromDB) return; // Don't reload if already loaded

    setProcessing(true);
    try {
      const response = await adminAPI.getTurfSlots(turfId);
      const dbSlots = response.data;
      
      if (dbSlots && dbSlots.length > 0) {
        // Map database slots to our SlotConfig format
        const mappedSlots = dbSlots.map((dbSlot: any, index: number) => ({
          slotId: dbSlot.id || dbSlot.slotId || (index + 1), // Use id from API, fallback to index+1
          startTime: dbSlot.startTime,
          endTime: dbSlot.endTime,
          price: dbSlot.price,
          enabled: dbSlot.enabled === true, // Explicitly check for true
        }));
        
        // Sort slots by slotId to ensure correct chronological order (1-24)
        const sortedSlots = mappedSlots.sort((a: any, b: any) => a.slotId - b.slotId);
        
        setSlots(sortedSlots);
        setSlotsLoadedFromDB(true);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `Loaded ${sortedSlots.length} slot configurations from database`,
        });
      } else {
        // No slots in database, use default slots
        setSlots(DEFAULT_SLOTS);
        setSlotsLoadedFromDB(true);
        
        Toast.show({
          type: 'info',
          text1: 'Info',
          text2: 'No existing slots found, using default 24-hour slots',
        });
      }
    } catch (error: any) {
      console.error('Error fetching slot configurations:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to fetch slot configurations',
      });
      // Fall back to default slots
      setSlots(DEFAULT_SLOTS);
      setSlotsLoadedFromDB(true);
    } finally {
      setProcessing(false);
    }
  };

  // Force reload slot configurations (for manual refresh)
  const reloadSlotConfigurations = async (turfId: number) => {
    console.log('🔄 Reloading slot configurations for turf ID:', turfId);
    setSlotsLoadedFromDB(false); // Reset flag to force reload
    setProcessing(true); // Set processing state for UI feedback
    
    try {
      console.log('📡 Making API call to fetch slots...');
      const response = await adminAPI.getTurfSlots(turfId);
      console.log('📥 API Response:', response.data);
      const dbSlots = response.data;
      
      if (dbSlots && dbSlots.length > 0) {
        // Map database slots to our SlotConfig format
        // API returns: { id, startTime, endTime, price, enabled }
        const mappedSlots = dbSlots.map((dbSlot: any, index: number) => ({
          slotId: dbSlot.id || (index + 1), // Use API id field
          startTime: dbSlot.startTime,
          endTime: dbSlot.endTime,
          price: dbSlot.price,
          enabled: dbSlot.enabled === true, // Explicit boolean check
        }));
        
        // Sort slots by slotId to ensure correct chronological order (1-24)
        const sortedSlots = mappedSlots.sort((a: any, b: any) => a.slotId - b.slotId);
        
        console.log('✅ Mapped and sorted slots from API:', sortedSlots);
        setSlots(sortedSlots);
        setSlotsLoadedFromDB(true);
        
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `Refreshed ${sortedSlots.length} slot configurations from database`,
        });
      } else {
        console.log('⚠️ No slots found in database, using defaults');
        // No slots in database, use default slots
        setSlots(DEFAULT_SLOTS);
        setSlotsLoadedFromDB(true);
        
        Toast.show({
          type: 'info',
          text1: 'Info',
          text2: 'No slots found in database, using default slots',
        });
      }
    } catch (error: any) {
      console.error('❌ Error refreshing slot configurations:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to refresh slot configurations',
      });
      // Keep current slots on error
    } finally {
      setProcessing(false);
      console.log('🏁 Slot refresh completed');
    }
  };

  // Step 3: Handle Slot Management
  const updateSlotPrice = (slotId: number, price: string) => {
    setSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.slotId === slotId ? { ...slot, price: parseFloat(price) || undefined } : slot
      )
    );
  };

  const toggleSlotEnabled = (slotId: number) => {
    setSlots(prevSlots =>
      prevSlots.map(slot =>
        slot.slotId === slotId ? { ...slot, enabled: !slot.enabled } : slot
      )
    );
  };

  const handleSamePriceToggle = (enabled: boolean) => {
    setSamePriceForAll(enabled);
    if (enabled && masterPrice) {
      const price = parseFloat(masterPrice);
      setSlots(prevSlots =>
        prevSlots.map(slot => ({ ...slot, price }))
      );
    }
  };

  const handleMasterPriceChange = (price: string) => {
    setMasterPrice(price);
    if (samePriceForAll) {
      const priceValue = parseFloat(price) || undefined;
      setSlots(prevSlots =>
        prevSlots.map(slot => ({ ...slot, price: priceValue }))
      );
    }
  };

  const saveSlotConfigurations = async () => {
    if (!currentTurfId) return;

    setProcessing(true);
    try {
      // Create array of slot updates
      const slotUpdates: SlotUpdate[] = slots.map(slot => ({
        slotId: slot.slotId,
        price: slot.price,
        enabled: slot.enabled,
        priceChanged: slot.price !== undefined,
        enabledChanged: true, // We'll update all slots
      }));

      // Process all slot updates
      for (const update of slotUpdates) {
        if (update.priceChanged && update.price !== undefined) {
          await adminAPI.updateSlotPrice(currentTurfId, update.slotId, update.price);
        }
        
        if (update.enabled) {
          await adminAPI.enableSlot(currentTurfId, update.slotId);
        } else {
          await adminAPI.disableSlot(currentTurfId, update.slotId);
        }
      }

      setCurrentStep('availability');
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Slot configurations saved successfully',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to save slot configurations',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Step 4: Handle Availability Setting
  const setTurfAvailability = async (available: boolean) => {
    if (!currentTurfId) return;

    setProcessing(true);
    try {
      if (available) {
        await adminAPI.setTurfAvailable(currentTurfId);
      } else {
        await adminAPI.setTurfNotAvailable(currentTurfId);
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Turf set as ${available ? 'available' : 'not available'} successfully`,
      });

      resetModalState();
      fetchTurfs(); // Refresh the turf list
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to set turf availability',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (turf: Turf) => {
    Alert.alert(
      'Delete Turf',
      `Are you sure you want to delete "${turf.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTurf(turf.id) },
      ]
    );
  };

  const deleteTurf = async (turfId: number) => {
    setLoading(true); // Show loading circle
    try {
      await adminAPI.deleteTurf(turfId);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Turf deleted successfully',
      });
      await fetchTurfs(); // Wait for turfs to be fetched
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to delete turf',
      });
      setLoading(false); // Hide loading circle on error
    }
  };

  const renderTurfCard = ({ item }: { item: Turf }) => (
    <AdminTurfCard
      turf={item}
      onEdit={() => startTurfEdit(item)}
      onDelete={() => handleDelete(item)}
      onImagesUpdated={fetchTurfs}
    />
  );

  // Render Step 1: Turf Details Modal
  const renderTurfDetailsModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={currentStep === 'details'}
      onRequestClose={() => resetModalState()}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.modalTitle}>
                {isEditMode ? 'Edit Turf Details' : 'Add Turf Details'}
              </Text>
              {isEditMode && (
                <Text style={styles.editModeHint}>
                  💡 Tip: Use "Skip to Slots" to avoid API costs if no changes needed
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={() => resetModalState()}>
              <Ionicons name="close" size={24} color={theme.colors.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.form} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formContent}
          >
            <View style={styles.formGroup}>
              <Text style={styles.label}>Turf Name *</Text>
              <TextInput
                style={styles.input}
                value={turfDetails.name}
                onChangeText={(text) => setTurfDetails({...turfDetails, name: text})}
                placeholder="Enter turf name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                value={turfDetails.location}
                onChangeText={(text) => setTurfDetails({...turfDetails, location: text})}
                placeholder="Enter location"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={turfDetails.description}
                onChangeText={(text) => setTurfDetails({...turfDetails, description: text})}
                placeholder="Enter description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                style={styles.input}
                value={turfDetails.contactNumber}
                onChangeText={(text) => setTurfDetails({...turfDetails, contactNumber: text})}
                placeholder="Enter contact number (optional)"
                keyboardType="phone-pad"
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => resetModalState()}
              style={styles.cancelButton}
              textStyle={styles.buttonText}
            />
            {isEditMode && (
              <Button
                title="Slots"
                variant="outline"
                onPress={skipToSlotsManagement}
                style={styles.skipButton}
                textStyle={styles.buttonText}
              />
            )}
            <Button
              title={isEditMode ? 'Update' : 'Next'}
              onPress={handleTurfDetailsSubmit}
              style={styles.saveButton}
              textStyle={styles.buttonText}
              disabled={processing}
              loading={processing}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render Step 2: Slot Management Modal
  const renderSlotsModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={currentStep === 'slots'}
      onRequestClose={() => resetModalState()}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '95%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditMode ? 'Update Slot Management' : 'Slot Management'}
            </Text>
            <TouchableOpacity onPress={() => resetModalState()}>
              <Ionicons name="close" size={24} color={theme.colors.gray} />
            </TouchableOpacity>
          </View>

          {isEditMode && !slotsLoadedFromDB && processing && (
            <View style={styles.loadingContainer}>
              <Ionicons name="refresh-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading current slot configurations...</Text>
            </View>
          )}

          {isEditMode && slotsLoadedFromDB && (
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Text style={styles.infoText}>
                  ℹ️ Showing current database slot configurations ({slots.length} slots)
                </Text>
                {currentTurfId && (
                  <TouchableOpacity 
                    onPress={() => reloadSlotConfigurations(currentTurfId)}
                    style={[styles.refreshButton, processing && styles.refreshButtonDisabled]}
                    disabled={processing}
                  >
                    <Ionicons 
                      name={processing ? "refresh-outline" : "refresh"} 
                      size={16} 
                      color={processing ? "#999" : "#1976D2"} 
                    />
                    <Text style={[styles.refreshText, processing && styles.refreshTextDisabled]}>
                      {processing ? 'Refreshing...' : 'Refresh'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={styles.priceControlContainer}>
            <View style={styles.samePriceToggle}>
              <Text style={styles.toggleLabel}>Same Price for All Slots</Text>
              <Switch
                value={samePriceForAll}
                onValueChange={handleSamePriceToggle}
                trackColor={{ false: theme.colors.lightGray, true: theme.colors.primary }}
                thumbColor={samePriceForAll ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>
            
            {samePriceForAll && (
              <View style={styles.masterPriceContainer}>
                <Text style={styles.label}>Master Price</Text>
                <TextInput
                  style={styles.input}
                  value={masterPrice}
                  onChangeText={handleMasterPriceChange}
                  placeholder="Enter price for all slots"
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          <ScrollView style={styles.slotsContainer}>
            {!slotsLoadedFromDB && isEditMode ? (
              <View style={styles.slotsLoadingContainer}>
                <Ionicons name="hourglass-outline" size={24} color={theme.colors.gray} />
                <Text style={styles.slotsLoadingText}>Loading slots from database...</Text>
              </View>
            ) : (
              slots.map((slot) => (
                <View key={slot.slotId} style={styles.slotCard}>
                  <View style={styles.slotHeader}>
                    <Text style={styles.slotTime}>
                      {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                    </Text>
                    <Switch
                      value={slot.enabled}
                      onValueChange={() => toggleSlotEnabled(slot.slotId)}
                      trackColor={{ false: theme.colors.lightGray, true: theme.colors.primary }}
                      thumbColor={slot.enabled ? '#FFFFFF' : '#f4f3f4'}
                    />
                  </View>
                  
                  {slot.enabled && (
                    <TextInput
                      style={[styles.input, { marginTop: 8 }]}
                      value={slot.price?.toString() || ''}
                      onChangeText={(text) => updateSlotPrice(slot.slotId, text)}
                      placeholder="Enter price"
                      keyboardType="numeric"
                      editable={!samePriceForAll}
                    />
                  )}
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => resetModalState()}
              style={styles.cancelButton}
              textStyle={styles.buttonText}
            />
            {isEditMode && (
              <Button
                title="Skip"
                variant="outline"
                onPress={skipSlotManagement}
                style={styles.skipButton}
                textStyle={styles.buttonText}
              />
            )}
            <Button
              title={isEditMode ? "Update" : "Save"}
              onPress={saveSlotConfigurations}
              style={styles.saveButton}
              textStyle={styles.buttonText}
              disabled={processing}
              loading={processing}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render Step 3: Availability Modal
  const renderAvailabilityModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={currentStep === 'availability'}
      onRequestClose={() => resetModalState()}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditMode ? 'Update Turf Availability' : 'Turf Availability'}
            </Text>
            <TouchableOpacity onPress={() => resetModalState()}>
              <Ionicons name="close" size={24} color={theme.colors.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.availabilityContainer}>
            <Text style={styles.availabilityQuestion}>
              {isEditMode 
                ? 'Update turf availability status - is this turf available for users now or later?'
                : 'Is this turf available for users now or will it be available later?'
              }
            </Text>

            <View style={styles.availabilityButtons}>
              <Button
                title="Available Now"
                onPress={() => setTurfAvailability(true)}
                style={styles.availabilityButton}
                disabled={processing}
                loading={processing}
              />
              <Button
                title="Available Later"
                variant="outline"
                onPress={() => setTurfAvailability(false)}
                style={styles.availabilityButton}
                disabled={processing}
              />
              {isEditMode && (
                <Button
                  title="Skip & Finish"
                  variant="outline"
                  onPress={skipAvailabilityAndFinish}
                  style={styles.availabilityButton}
                  disabled={processing}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Turf Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={startTurfCreation}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {turfs.length === 0 ? (
        <EmptyState
          icon="football-outline"
          title="No Turfs Available"
          description="Add your first turf to get started"
        />
      ) : (
        <FlatList
          data={turfs}
          renderItem={renderTurfCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      {/* Render all modals */}
      {renderTurfDetailsModal()}
      {renderSlotsModal()}
      {renderAvailabilityModal()}
    </SafeAreaView>
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
    padding: 20,
    backgroundColor: theme.colors.surface,
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
  },
  list: {
    padding: 16,
    paddingBottom: 40, // Extra space for bottom navigation
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  editModeHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  form: {
    padding: 20,
    flexGrow: 1,
    maxHeight: 350,
  },
  formContent: {
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 6,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexWrap: 'nowrap', // Prevent wrapping to ensure single line
    backgroundColor: theme.colors.surface,
    minHeight: 72,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    minWidth: 80,
    maxWidth: 120,
    minHeight: 44,
    paddingHorizontal: 12, // Override default padding
  },
  skipButton: {
    flex: 1,
    minWidth: 80,
    maxWidth: 120,
    minHeight: 44,
    paddingHorizontal: 12, // Override default padding
  },
  saveButton: {
    flex: 1,
    minWidth: 80,
    maxWidth: 120,
    minHeight: 44,
    paddingHorizontal: 12, // Override default padding
  },
  buttonText: {
    fontSize: 14, // Smaller font size for three-button layout
    fontWeight: '600',
  },
  // Slot management styles
  priceControlContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  samePriceToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  masterPriceContainer: {
    marginTop: 8,
  },
  slotsContainer: {
    padding: 20,
    maxHeight: 400,
  },
  slotsLoadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotsLoadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  slotCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTime: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  // Availability modal styles
  availabilityContainer: {
    padding: 40,
    alignItems: 'center',
  },
  availabilityQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  availabilityButtons: {
    width: '100%',
    gap: 16,
  },
  availabilityButton: {
    width: '100%',
  },
  // Loading and info styles
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginLeft: 8,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: theme.colors.info,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.infoText,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.accent + '20',
    borderRadius: 6,
  },
  refreshText: {
    fontSize: 12,
    color: theme.colors.accent,
    marginLeft: 4,
  },
  refreshButtonDisabled: {
    backgroundColor: theme.colors.textSecondary + '20',
  },
  refreshTextDisabled: {
    color: theme.colors.textSecondary,
  },
});

export default TurfManagementScreen;