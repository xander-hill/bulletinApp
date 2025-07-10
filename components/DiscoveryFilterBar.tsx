import React, { useState } from 'react';
import { View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import KeywordSearchInput from './filtering/KeywordSearchInput';
import SortSelector from './filtering/SortSelector';

interface DiscoveryFilterBarProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  keyword: string;
  onKeywordChange: (val: string) => void;
  sort?: string;
  onSortChange?: (val: string) => void;
}

const AVAILABLE_TAGS = [
  "music", "sports", "tech", "art", "food", "networking", "fitness",
  "gaming", "outdoors", "wellness", "startup", "education", "coding",
  "dance", "film", "volunteering", "culture", "comedy",
];

export default function DiscoveryFilterBar({
  selectedTags,
  onTagsChange,
  keyword,
  onKeywordChange,
  sort,
  onSortChange,
}: DiscoveryFilterBarProps) {

  const [open, setOpen] = useState(false);
  const [tagOptions, setTagOptions] = useState(
    AVAILABLE_TAGS.map(tag => ({ label: tag, value: tag }))
  );

  return (
    <View>
      <KeywordSearchInput value={keyword} onChange={onKeywordChange} />
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        multiple
        value={selectedTags}
        setValue={onTagsChange}
        items={tagOptions}
        setItems={setTagOptions}
        placeholder="Select Interests"
        mode="BADGE"
        searchable
      />
      {sort !== undefined && onSortChange && (
        <SortSelector
          options={[
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Popular', value: 'popular' },
            { label: 'Newest', value: 'newest' },
          ]}
          selected={sort}
          onChange={onSortChange}
        />
      )}
    </View>
  );
}
