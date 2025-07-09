import { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import DiscoveryFilterBar from './DiscoveryFilterBar';
import EventFeed from './EventFeed';
import EventMap from './EventMap';

export default function DiscoveryFeed() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('upcoming');
  const [viewMode, setViewMode] = useState<'card' | 'map'>('card');

  const additionalFilters = useMemo(() => ({
    tags: selectedTags.length ? selectedTags : undefined,
    keyword: keyword || undefined,
    sort: sort || undefined,
  }), [selectedTags, keyword, sort]);

  console.log(selectedTags);

  return (
    <View style={{ flex: 1 }}>
      <DiscoveryFilterBar
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        keyword={keyword}
        onKeywordChange={setKeyword}
        sort={sort}
        onSortChange={setSort}
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
        <EventMap additionalFilters={additionalFilters} />
      )}
    </View>
  );
}
