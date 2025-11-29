import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Turf } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { Alert } from 'react-native';

interface TurfCardProps {
  turf: Turf;
  onPress: () => void;
  showBookButton?: boolean;
}

const TurfCard: React.FC<TurfCardProps> = ({ 
  turf, 
  onPress, 
  showBookButton = true 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { theme } = useTheme();
  
  // Get images array, fallback to single image if images array is empty/undefined
  const images = turf.images && turf.images.length > 0 ? turf.images : [turf.image];
  const hasMultipleImages = images.length > 1;

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentImageIndex(index);
  };

  const handleLocationPress = () => {
    Alert.alert('Coming Soon', 'Location feature is under development');
  };

  const [imageLoading, setImageLoading] = useState<{[key: number]: boolean}>({});

  const handleImageLoadStart = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: true }));
  };

  const handleImageLoadEnd = (index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.imageScrollView}
        >
          {images.map((imageUrl, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => handleImageLoadStart(index)}
                onLoadEnd={() => handleImageLoadEnd(index)}
                onError={() => console.log(`Failed to load image: ${imageUrl}`)}
              />
              {imageLoading[index] && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.imageGradient}
              />
            </View>
          ))}
        </ScrollView>
        
        {/* Content Overlay */}
        <View style={styles.contentOverlay}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {turf.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{turf.rating || 'New'}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#E2E8F0" />
            <Text style={styles.location} numberOfLines={1}>
              {turf.location}
            </Text>
          </View>
        </View>

        {hasMultipleImages && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1}/{images.length}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={[styles.priceLabel, { color: theme.colors.textSecondary }]}>Starting from</Text>
          <Text style={[styles.price, { color: theme.colors.primary }]}>
            {turf.price ? `₹${turf.price}/hr` : 'View Price'}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.colors.lightGray }]} 
            onPress={handleLocationPress}
          >
            <Ionicons name="navigate" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          
          {showBookButton && (
            <TouchableOpacity 
              onPress={onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bookButton}
              >
                <Text style={styles.bookButtonText}>Book Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  image: {
    width: Dimensions.get('window').width - 20,
    height: 220,
    backgroundColor: '#F1F5F9',
  },
  imageWrapper: {
    position: 'relative',
    width: Dimensions.get('window').width - 30,
    height: 220,
  },
  imageScrollView: {
    height: 220,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(241, 245, 249, 0.5)',
  },
  imageContainer: {
    position: 'relative',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButton: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default TurfCard;