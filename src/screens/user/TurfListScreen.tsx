import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  TextInput,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { turfAPI } from '../../services/api';
import { Turf } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingState from '../../components/shared/LoadingState';
import EmptyState from '../../components/shared/EmptyState';
import TurfCard from '../../components/user/TurfCard';
import Toast from 'react-native-toast-message';

const TurfListScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Turf[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    try {
      // Fetch all turfs first
      const response = await turfAPI.getAllTurfs();
      console.log('All turfs from API:', response.data);
      
      // Client-side filter to show only turfs with availability: true
      // Handle cases where availability might be undefined, null, or false
      const availableTurfs = response.data.filter((turf: Turf) => {
        // Only show turfs that are explicitly set to available (true)
        return turf.availability === true;
      });
      
      console.log('Filtered available turfs:', availableTurfs);
      console.log(`Total turfs: ${response.data.length}, Available turfs: ${availableTurfs.length}`);
      
      setTurfs(availableTurfs);
    } catch (error) {
      console.error('Error fetching turfs:', error);
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

  const handleSearch = () => {
    setShowSearchModal(true);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const performSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    
    // Filter turfs based on name containing the search query (case-insensitive)
    // Note: turfs array already contains only available turfs (filtered client-side)
    const filtered = turfs.filter(turf =>
      turf.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      turf.location.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
    
    setSearchResults(filtered);
    setSearching(false);
  };

  // Perform search whenever query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(performSearch, 300); // Debounce search
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, turfs]);

  const renderTurfCard = ({ item }: { item: Turf }) => (
    <TurfCard
      turf={item}
      onPress={() => navigation.navigate('TurfDetail', { turfId: item.id })}
    />
  );

  const renderSearchResult = ({ item }: { item: Turf }) => (
    <TouchableOpacity 
      style={[styles.searchResultItem, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}
      onPress={() => {
        closeSearchModal();
        navigation.navigate('TurfDetail', { turfId: item.id });
      }}
    >
      <View style={styles.searchResultContent}>
        <Text style={[styles.searchResultName, { color: theme.colors.text }]}>{item.name}</Text>
        <View style={styles.searchResultLocationRow}>
          <Ionicons name="location-outline" size={14} color={theme.colors.gray} />
          <Text style={[styles.searchResultLocation, { color: theme.colors.textSecondary }]}>{item.location}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.gray} />
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Find Your Turf</Text>
        <TouchableOpacity onPress={handleSearch}>
          <Ionicons name="search-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {turfs.length === 0 ? (
        <EmptyState
          icon="football-outline"
          title="No Available Turfs"
          description="All turfs are currently unavailable. Check back later for available turfs to book."
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

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSearchModal}
      >
        <SafeAreaView style={[styles.searchModalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.searchModalHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity 
              style={styles.searchBackButton}
              onPress={closeSearchModal}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.searchModalTitle, { color: theme.colors.text }]}>Search Turfs</Text>
            <View style={styles.searchBackButton} />
          </View>

          <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Ionicons name="search-outline" size={20} color={theme.colors.gray} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search by turf name or location..."
              placeholderTextColor={theme.colors.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={theme.colors.gray} />
              </TouchableOpacity>
            )}
          </View>

          {searching ? (
            <View style={styles.searchingContainer}>
              <Text style={[styles.searchingText, { color: theme.colors.textSecondary }]}>Searching...</Text>
            </View>
          ) : searchQuery.trim() && searchResults.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color={theme.colors.gray} />
              <Text style={[styles.noResultsText, { color: theme.colors.text }]}>No turfs found</Text>
              <Text style={[styles.noResultsSubtext, { color: theme.colors.textSecondary }]}>
                Try searching with different keywords
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.searchResultsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    paddingBottom: 40, // Extra space for bottom navigation
  },
  // Search Modal Styles
  searchModalContainer: {
    flex: 1,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  searchBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  clearButton: {
    padding: 4,
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchingText: {
    fontSize: 16,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  searchResultsList: {
    padding: 16,
    paddingBottom: 40, // Extra space for phones with home indicator/navbar
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderBottomWidth: 1,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchResultLocation: {
    fontSize: 14,
  },
});

export default TurfListScreen;
