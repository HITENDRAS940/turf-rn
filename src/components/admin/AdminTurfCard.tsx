import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ScrollView, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Turf } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { formatPhoneForDisplay } from '../../utils/phoneUtils';
import { adminAPI } from '../../services/api';
import Toast from 'react-native-toast-message';

interface AdminTurfCardProps {
  turf: Turf;
  onEdit: () => void;
  onDelete: () => void;
  onPress?: () => void;
  onImagesUpdated?: () => void | Promise<void>; // Callback to refresh turf data
}

const AdminTurfCard: React.FC<AdminTurfCardProps> = ({
  turf,
  onEdit,
  onDelete,
  onPress,
  onImagesUpdated,
}) => {
  const { theme } = useTheme();
  const [showImagesModal, setShowImagesModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  
  // Use the availability property directly from the turf data
  const availabilityStatus = turf.availability ?? true;
  
  const hasImages = turf.images && turf.images.length > 0;

  const selectImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'images' as any,
        allowsMultipleSelection: true,
        quality: 0.3,
        aspect: [4, 3],
        base64: true,
        allowsEditing: false,
      });

      if (!result.canceled) {
        setSelectedImages(result.assets);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to select images',
      });
    }
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select images to upload',
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      selectedImages.forEach((asset, index) => {
        formData.append('images', {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any);
      });

      await adminAPI.uploadTurfImages(turf.id, formData);
      
      setSelectedImages([]);
      setShowImagesModal(false);
      
      // Refresh turf data in parent component
      if (onImagesUpdated) {
        await onImagesUpdated();
      }
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Images uploaded successfully',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to upload images',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
  };

  const closeModal = () => {
    setShowImagesModal(false);
    setSelectedImages([]);
    setDeleteMode(false);
    setSelectedImageUrls([]);
    setImageRefreshKey(Date.now()); // Refresh images on modal close
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedImageUrls([]);
  };

  const toggleImageSelection = (imageUrl: string) => {
    if (selectedImageUrls.includes(imageUrl)) {
      setSelectedImageUrls(selectedImageUrls.filter(url => url !== imageUrl));
    } else {
      setSelectedImageUrls([...selectedImageUrls, imageUrl]);
    }
  };

  const deleteSelectedImages = async () => {
    if (selectedImageUrls.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select images to delete',
      });
      return;
    }

    Alert.alert(
      'Delete Images',
      `Are you sure you want to delete ${selectedImageUrls.length} image${selectedImageUrls.length !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              console.log('🗑️ Deleting images:', selectedImageUrls);
              console.log('📍 Turf ID:', turf.id);
              console.log('🔍 Sample URL format:', selectedImageUrls[0]);
              
              await adminAPI.deleteTurfImages(turf.id, selectedImageUrls);
              
              // Clear local state immediately
              setSelectedImageUrls([]);
              setDeleteMode(false);
              
              // Close and reopen modal to force re-render with fresh data
              setShowImagesModal(false);
              
              // Refresh turf data in parent component
              if (onImagesUpdated) {
                await onImagesUpdated();
              }
              
              // Small delay then reopen modal to show updated images
              setTimeout(() => {
                setImageRefreshKey(Date.now()); // Force re-render images
                setShowImagesModal(true);
              }, 100);
              
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Images deleted successfully',
              });
            } catch (error: any) {
              console.error('❌ Delete images error:', error);
              console.error('📄 Error response:', error.response);
              console.error('🔍 Error data:', error.response?.data);
              
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || error.message || 'Failed to delete images',
              });
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { 
        backgroundColor: theme.colors.surface,
        shadowColor: theme.colors.gray 
      }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{turf.name}</Text>
          <Text style={[styles.location, { color: theme.colors.textSecondary }]}>{turf.location}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.background }]} onPress={onEdit}>
            <Ionicons name="pencil" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.background }]} onPress={onDelete}>
            <Ionicons name="trash" size={18} color={theme.colors.error} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.background }]} 
            onPress={() => setShowImagesModal(true)}
          >
            <Ionicons name="images" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Ionicons name="star-outline" size={16} color={theme.colors.warning} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>Rating: {turf.rating || 'N/A'}</Text>
        </View>

        {turf.contactNumber && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{formatPhoneForDisplay(turf.contactNumber)}</Text>
          </View>
        )}

        {turf.description && (
          <View style={styles.descriptionContainer}>
            <Text style={[styles.descriptionLabel, { color: theme.colors.text }]}>Description:</Text>
            <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]} numberOfLines={3}>
              {turf.description}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: availabilityStatus ? theme.colors.success : theme.colors.error }
          ]} />
          <Text style={[
            styles.statusText,
            { color: availabilityStatus ? theme.colors.success : theme.colors.error }
          ]}>
            {availabilityStatus ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <View style={styles.footerRight}>
          {hasImages && (
            <Text style={[styles.imageCount, { color: theme.colors.primary }]}>
              📷 {turf.images!.length} image{turf.images!.length !== 1 ? 's' : ''}
            </Text>
          )}
          <Text style={[styles.turfId, { color: theme.colors.textSecondary }]}>ID: {turf.id}</Text>
        </View>
      </View>

      {/* Images Modal */}
      <Modal
        visible={showImagesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { 
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface 
          }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{turf.name} - Images</Text>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: theme.colors.background }]}
              onPress={closeModal}
            >
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {/* Action Buttons */}
          <View style={[styles.actionButtonsContainer, { borderBottomColor: theme.colors.border }]}>
            {!deleteMode ? (
              <>
                <TouchableOpacity 
                  style={[styles.addImageButton, { backgroundColor: theme.colors.primary }]}
                  onPress={selectImages}
                  disabled={uploading || deleting}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={[styles.addImageButtonText, { color: '#FFFFFF' }]}>Add Images</Text>
                </TouchableOpacity>
                
                {hasImages && (
                  <TouchableOpacity 
                    style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
                    onPress={toggleDeleteMode}
                    disabled={uploading || deleting}
                  >
                    <Ionicons name="trash" size={20} color="#FFFFFF" />
                    <Text style={[styles.deleteButtonText, { color: '#FFFFFF' }]}>Delete</Text>
                  </TouchableOpacity>
                )}
                
                {selectedImages.length > 0 && (
                  <TouchableOpacity 
                    style={[
                      styles.uploadButton,
                      { backgroundColor: theme.colors.primary },
                      uploading && styles.uploadButtonDisabled
                    ]}
                    onPress={uploadImages}
                    disabled={uploading || deleting}
                  >
                    <Ionicons 
                      name={uploading ? "cloud-upload-outline" : "cloud-upload"} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                    <Text style={[styles.uploadButtonText, { color: '#FFFFFF' }]}>
                      {uploading ? 'Uploading...' : `Upload ${selectedImages.length} image${selectedImages.length !== 1 ? 's' : ''}`}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.cancelDeleteButton, { backgroundColor: theme.colors.background }]}
                  onPress={toggleDeleteMode}
                  disabled={deleting}
                >
                  <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                  <Text style={[styles.cancelDeleteButtonText, { color: theme.colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                
                {selectedImageUrls.length > 0 && (
                  <TouchableOpacity 
                    style={[
                      styles.confirmDeleteButton,
                      { backgroundColor: theme.colors.error },
                      deleting && styles.uploadButtonDisabled
                    ]}
                    onPress={deleteSelectedImages}
                    disabled={deleting}
                  >
                    <Ionicons 
                      name={deleting ? "trash-outline" : "trash"} 
                      size={20} 
                      color="#FFFFFF" 
                    />
                    <Text style={[styles.confirmDeleteButtonText, { color: '#FFFFFF' }]}>
                      {deleting ? 'Deleting...' : `Delete ${selectedImageUrls.length} image${selectedImageUrls.length !== 1 ? 's' : ''}`}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
          
          <ScrollView style={styles.imagesContainer}>
            {/* Selected Images (to be uploaded) */}
            {selectedImages.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>📤 Selected Images (Ready to Upload)</Text>
                {selectedImages.map((asset, index) => (
                  <View key={`selected-${index}`} style={styles.imageWrapper}>
                    <Image 
                      source={{ uri: asset.uri }} 
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                    <View style={styles.selectedImageFooter}>
                      <Text style={styles.imageIndex}>New Image {index + 1}</Text>
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => removeSelectedImage(index)}
                      >
                        <Ionicons name="trash" size={16} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {/* Existing Images */}
            {hasImages && (
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  🖼️ Current Images
                  {deleteMode && selectedImageUrls.length > 0 && (
                    <Text style={[styles.selectionCount, { color: theme.colors.error }]}> ({selectedImageUrls.length} selected)</Text>
                  )}
                </Text>
                {turf.images!.map((imageUrl, index) => (
                  <TouchableOpacity 
                    key={`existing-${index}`} 
                    style={[
                      styles.imageWrapper,
                      { backgroundColor: theme.colors.background },
                      deleteMode && [styles.selectableImageWrapper, { borderColor: theme.colors.border }],
                      deleteMode && selectedImageUrls.includes(imageUrl) && [styles.selectedForDeletionWrapper, { borderColor: theme.colors.error }]
                    ]}
                    onPress={() => deleteMode && toggleImageSelection(imageUrl)}
                    disabled={!deleteMode}
                  >
                    <Image 
                      source={{ 
                        uri: imageUrl,
                        cache: 'reload' // Force reload image from server
                      }} 
                      style={[
                        styles.modalImage,
                        deleteMode && selectedImageUrls.includes(imageUrl) && styles.selectedModalImage
                      ]}
                      resizeMode="cover"
                      onError={() => console.log(`Failed to load image: ${imageUrl}`)}
                      key={`${imageUrl}-${imageRefreshKey}`} // Force re-render with refresh key
                    />
                    {deleteMode && (
                      <View style={styles.selectionOverlay}>
                        <View style={[styles.selectionCheckbox, { 
                          backgroundColor: theme.colors.error,
                          borderColor: theme.colors.surface 
                        }]}>
                          {selectedImageUrls.includes(imageUrl) && (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          )}
                        </View>
                      </View>
                    )}
                    <View style={styles.existingImageFooter}>
                      <Text style={styles.imageIndex}>Image {index + 1}</Text>
                      {deleteMode && (
                        <Text style={[
                          styles.selectionText,
                          selectedImageUrls.includes(imageUrl) && styles.selectedText
                        ]}>
                          {selectedImageUrls.includes(imageUrl) ? 'Selected' : 'Tap to select'}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* No Images State */}
            {!hasImages && selectedImages.length === 0 && (
              <View style={styles.noImagesContainer}>
                <Ionicons name="image-outline" size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.noImagesText, { color: theme.colors.textSecondary }]}>No images available</Text>
                <Text style={[styles.noImagesSubtext, { color: theme.colors.textSecondary }]}>Tap "Add Images" to upload photos</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.selectButton, { backgroundColor: theme.colors.background }]} 
              onPress={selectImages}
              disabled={uploading}
            >
              <Text style={[styles.selectButtonText, { color: theme.colors.text }]}>Select Images</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]} 
              onPress={uploadImages}
              disabled={uploading}
            >
              <Text style={[styles.uploadButtonText, { color: '#FFFFFF' }]}>
                {uploading ? 'Uploading...' : 'Upload Images'}
              </Text>
            </TouchableOpacity>
          </View>

          {selectedImages.length > 0 && (
            <ScrollView horizontal style={styles.selectedImagesContainer}>
              {selectedImages.map((image, index) => (
                <View key={index} style={styles.selectedImageWrapper}>
                  <Image 
                    source={{ uri: image.uri }} 
                    style={styles.selectedImage}
                  />
                  <TouchableOpacity 
                    style={[styles.removeImageButton, { backgroundColor: theme.colors.error }]}
                    onPress={() => removeSelectedImage(index)}
                  >
                    <Ionicons name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  content: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  imageCount: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  turfId: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesContainer: {
    flex: 1,
    padding: 16,
  },
  imageWrapper: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 250,
  },
  imageIndex: {
    fontSize: 14,
    fontWeight: '600',
    padding: 12,
    textAlign: 'center',
  },
  noImagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noImagesText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  noImagesSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  // New styles for image upload functionality
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  addImageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addImageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    minWidth: 100,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  cancelDeleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  confirmDeleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingLeft: 4,
  },
  selectedImageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  selectButton: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  uploadButton: {
    flex: 1,
    marginLeft: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedImagesContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  selectedImageWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Delete mode styles
  selectionCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectableImageWrapper: {
    borderWidth: 2,
  },
  selectedForDeletionWrapper: {
    borderWidth: 3,
  },
  selectedModalImage: {
    opacity: 0.8,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
  },
  selectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  existingImageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedText: {
    fontWeight: '600',
  },
});

export default AdminTurfCard;
