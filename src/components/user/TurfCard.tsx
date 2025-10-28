import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Turf } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import Toast from 'react-native-toast-message';

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
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'Location feature is under development',
    });
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
            <Image 
              key={index}
              source={{ uri: imageUrl }} 
              style={styles.image}
              resizeMode="cover"
              onError={() => console.log(`Failed to load image: ${imageUrl}`)}
            />
          ))}
        </ScrollView>
        
        {hasMultipleImages && (
          <>
            {/* Image indicators */}
            <View style={styles.indicators}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.activeIndicator
                  ]}
                />
              ))}
            </View>
            
            {/* Image counter */}
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1}/{images.length}
              </Text>
            </View>
          </>
        )}
      </View>
      
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: theme.colors.navy }]} numberOfLines={1}>
            {turf.name}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.gray} />
          <Text style={[styles.location, { color: theme.colors.gray }]} numberOfLines={1}>
            {turf.location}
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.locationButton, { backgroundColor: theme.colors.lightGray }]} 
            onPress={handleLocationPress}
            activeOpacity={0.7}
          >
            <Ionicons name="navigate-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.locationButtonText, { color: theme.colors.primary }]}>Get Directions</Text>
          </TouchableOpacity>
          
          {showBookButton && (
            <TouchableOpacity 
              style={[styles.bookButton, { backgroundColor: theme.colors.primary }]} 
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: Dimensions.get('window').width - 32, // Account for card margins
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  imageContainer: {
    position: 'relative',
  },
  imageScrollView: {
    height: 200,
  },
  indicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 12,
  },
  imageCounter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    flex: 1,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TurfCard;