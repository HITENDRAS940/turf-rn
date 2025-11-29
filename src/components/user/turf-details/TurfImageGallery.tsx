import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

interface TurfImageGalleryProps {
  images: string[];
  turfName: string;
  scrollY: Animated.Value;
  onBackPress: () => void;
}

const TurfImageGallery: React.FC<TurfImageGalleryProps> = ({
  images,
  turfName,
  scrollY,
  onBackPress,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  
  const imageScrollViewRef = useRef<any>(null);
  const imageScrollX = useRef(new Animated.Value(0)).current;

  // Constants
  const HEADER_MAX_HEIGHT = 300;
  const HEADER_MIN_HEIGHT = 100;
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const handleImageLoadStart = (imageUri: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageUri]: true }));
  };

  const handleImageLoadEnd = (imageUri: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageUri]: false }));
  };

  const handleImageError = (imageUri: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageUri]: false }));
    setImageErrors(prev => ({ ...prev, [imageUri]: true }));
  };

  const handleImageScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageIndex = Math.round(contentOffset.x / screenWidth);
    const newIndex = Math.max(0, Math.min(imageIndex, images.length - 1));
    
    if (Platform.OS === 'android') {
      requestAnimationFrame(() => {
        setCurrentImageIndex(newIndex);
      });
    } else {
      setCurrentImageIndex(newIndex);
    }
  };

  // Animation interpolations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-200, -100, 0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1.5, 1.3, 1, 0.98, 0.95],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -15, -30],
    extrapolate: 'clamp',
  });

  const bounceScale = scrollY.interpolate({
    inputRange: [-100, -50, 0],
    outputRange: [1.08, 1.04, 1],
    extrapolate: 'clamp',
  });

  const overlayOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 4, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0.1, 0.3, 0.6],
    extrapolate: 'clamp',
  });

  const backButtonOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 4, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0.9, 0.7],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE - 80, HEADER_SCROLL_DISTANCE - 40, HEADER_SCROLL_DISTANCE - 10],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE - 80, HEADER_SCROLL_DISTANCE - 40, HEADER_SCROLL_DISTANCE - 10],
    outputRange: [20, 10, 0],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE - 80, HEADER_SCROLL_DISTANCE - 10],
    outputRange: [0.8, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.imageGalleryContainer, { height: headerHeight }]}>
      {/* Background container that slides in sync with scroll */}
      <Animated.View 
        style={[
          styles.backgroundContainer,
          {
            width: images.length * screenWidth,
            transform: [
              { scale: imageScale },
              { scaleY: bounceScale },
              { translateY: imageTranslateY },
              { 
                translateX: imageScrollX.interpolate({
                  inputRange: [0, images.length * screenWidth],
                  outputRange: [0, -images.length * screenWidth],
                  extrapolate: 'clamp',
                })
              }
            ]
          }
        ]}
      >
        {images.map((imageUri, index) => (
          <View
            key={`bg-${index}`}
            style={[
              styles.backgroundImageWrapper,
              {
                left: index * screenWidth,
                width: screenWidth,
                height: '100%',
              }
            ]}
          >
            <Image 
              source={{ uri: imageUri }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </Animated.View>
      
      {/* Transparent foreground for touch handling */}
      <View style={styles.foregroundContainer}>
        <Animated.ScrollView 
          ref={imageScrollViewRef}
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          style={styles.foregroundScrollView}
          contentContainerStyle={{
            width: images.length * screenWidth,
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: imageScrollX } } }],
            { 
              useNativeDriver: false,
              listener: handleImageScroll,
            }
          )}
          scrollEventThrottle={Platform.OS === 'ios' ? 8 : 16}
          decelerationRate={Platform.OS === 'ios' ? 'fast' : 'normal'}
          bounces={Platform.OS === 'ios'}
          scrollEnabled={images.length > 1}
          snapToInterval={screenWidth}
          snapToAlignment="start"
          directionalLockEnabled={true}
          overScrollMode={Platform.OS === 'android' ? 'never' : 'auto'}
          nestedScrollEnabled={Platform.OS === 'android'}
        >
          {images.map((imageUri, index) => (
            <View 
              key={index} 
              style={styles.imageContainer}
            >
              {imageErrors[imageUri] ? (
                <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.lightGray }]}>
                  <Ionicons name="image-outline" size={64} color={theme.colors.gray} />
                  <Text style={[styles.placeholderText, { color: theme.colors.textSecondary }]}>
                    Image not available
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.transparentImage} />
                  {imageLoadingStates[imageUri] && (
                    <View style={styles.imageLoader}>
                      <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                  )}
                </>
              )}
            </View>
          ))}
        </Animated.ScrollView>
      </View>
      
      {/* UI Overlays */}
      <Animated.View 
        style={[styles.scrollOverlay, { opacity: overlayOpacity }]} 
      />
      
      <Animated.View style={[styles.backButton, { opacity: backButtonOpacity, top: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={onBackPress}
          style={styles.backButtonTouchable}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        style={[
          styles.collapsedTitle,
          {
            opacity: titleOpacity,
            top: insets.top + 20,
            transform: [
              { translateY: titleTranslateY },
              { scale: titleScale }
            ]
          }
        ]}
      >
        <Text style={styles.collapsedTitleText} numberOfLines={1}>
          {turfName}
        </Text>
      </Animated.View>

      {images.length > 1 && (
        <Animated.View 
          style={[styles.imageIndicators, { opacity: backButtonOpacity }]}
        >
          {images.map((_, index) => (
            <Animated.View 
              key={index} 
              style={[
                styles.indicator, 
                { 
                  backgroundColor: index === currentImageIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                  transform: [{ scale: index === currentImageIndex ? 1.3 : 1 }],
                  opacity: index === currentImageIndex ? 1 : 0.7
                }
              ]} 
            />
          ))}
        </Animated.View>
      )}

      {images.length > 1 && (
        <Animated.View 
          style={[styles.imageCounter, { opacity: backButtonOpacity }]}
        >
          <Text style={styles.imageCounterText}>
            {currentImageIndex + 1} / {images.length}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  imageGalleryContainer: {
    width: '100%',
    overflow: 'hidden',
    zIndex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    flexDirection: 'row',
  },
  backgroundImageWrapper: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  foregroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  foregroundScrollView: {
    flex: 1,
  },
  imageContainer: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transparentImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 3,
    pointerEvents: 'none',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    elevation: 5,
  },
  backButtonTouchable: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapsedTitle: {
    position: 'absolute',
    left: 70,
    right: 20,
    zIndex: 10,
    height: 40,
    justifyContent: 'center',
  },
  collapsedTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 4,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  imageCounter: {
    position: 'absolute',
    top: 45,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 4,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TurfImageGallery;
