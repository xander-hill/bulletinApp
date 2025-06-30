import { useMemo, useState } from 'react';
import { View } from 'react-native';
import DiscoveryFilterBar from './DiscoveryFilterBar';
import EventFeed from './EventFeed';

export default function DiscoveryFeed() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('upcoming');

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
      <EventFeed
        headerTitle="Discover Events"
        initialFilter="upcoming"
        additionalFilters={additionalFilters}
      />
    </View>
  );
}
