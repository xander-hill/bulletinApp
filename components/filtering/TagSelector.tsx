import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TagSelectorProps {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagSelector({ tags, selectedTags, onChange }: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <View style={styles.container}>
      {tags.map((tag) => {
        const selected = selectedTags.includes(tag);
        return (
          <TouchableOpacity
            key={tag}
            onPress={() => toggleTag(tag)}
            style={[styles.tagButton, selected && styles.tagButtonActive]}
          >
            <Text style={[styles.tagText, selected && styles.tagTextActive]}>
              {tag}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#eee',
  },
  tagButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#ddd',
    margin: 4,
  },
  tagButtonActive: {
    backgroundColor: '#0066cc',
  },
  tagText: {
    color: '#333',
    fontWeight: '500',
  },
  tagTextActive: {
    color: 'white',
  },
});
