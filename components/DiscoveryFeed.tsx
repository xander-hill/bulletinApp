import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import DiscoveryFilterBar from './DiscoveryFilterBar';
import EventFeed from './EventFeed';
import EventMap from './EventMap';

export default function DiscoveryFeed() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('upcoming');
  const [viewMode, setViewMode] = useState<'card' | 'map'>('card');
  const [userLat, setUserLat] = useState<number | undefined>(undefined);
  const [userLng, setUserLng] = useState<number | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLat(location.coords.latitude);
      setUserLng(location.coords.longitude);
    })();
  }, []);



  const additionalFilters = useMemo(() => ({
    tags: selectedTags.length ? selectedTags : undefined,
    keyword: keyword || undefined,
    sort,
    userLat: userLat ?? undefined,
    userLng: userLng ?? undefined,
  }), [selectedTags, keyword, sort, userLat, userLng]);

  return (
    <View style={{ flex: 1 }}>
      <DiscoveryFilterBar
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        keyword={keyword}
        onKeywordChange={setKeyword}
        {...(viewMode === 'card' && {
          sort,
          onSortChange: setSort,
        })}
      />

      {/* View Mode Toggle */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 8 }}>
        <TouchableOpacity onPress={() => setViewMode('card')}>
          <Text style={{ padding: 8, color: viewMode === 'card' ? 'blue' : 'gray' }}>
            Card View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewMode('map')}>
          <Text style={{ padding: 8, color: viewMode === 'map' ? 'blue' : 'gray' }}>
            Map View
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'card' ? (
        <EventFeed
          headerTitle="Discover Events"
          initialFilter="upcoming"
          additionalFilters={additionalFilters}
        />
      ) : (
        <EventMap 
          additionalFilters={additionalFilters} 
          initialFilter="upcoming"
        />
      )}
    </View>
  );
}
