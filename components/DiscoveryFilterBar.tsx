import React from 'react';
import { View } from 'react-native';
import KeywordSearchInput from './filtering/KeywordSearchInput';
import SortSelector from './filtering/SortSelector';
import TagSelector from './filtering/TagSelector';

interface DiscoveryFilterBarProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  keyword: string;
  onKeywordChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
}

export default function DiscoveryFilterBar({
  selectedTags,
  onTagsChange,
  keyword,
  onKeywordChange,
  sort,
  onSortChange,
}: DiscoveryFilterBarProps) {
  return (
    <View>
      <KeywordSearchInput value={keyword} onChange={onKeywordChange} />
      <TagSelector
        tags={['music', 'sports', 'tech', 'art', 'food']}
        selectedTags={selectedTags}
        onChange={onTagsChange}
      />
      <SortSelector
        options={[
          { label: 'Upcoming', value: 'upcoming' },
          { label: 'Popular', value: 'popular' },
          { label: 'Newest', value: 'newest' },
        ]}
        selected={sort}
        onChange={onSortChange}
      />
    </View>
  );
}
