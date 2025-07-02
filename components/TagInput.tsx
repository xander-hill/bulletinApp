import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

const AVAILABLE_TAGS = [
  "music",
  "sports",
  "tech",
  "art",
  "food",
  "networking",
  "fitness",
  "gaming",
  "outdoors",
  "wellness",
  "startup",
  "education",
  "coding",
  "dance",
  "film",
  "volunteering",
  "culture",
  "comedy",
];

export default function TagInput({ tags, setTags }: TagInputProps) {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (tagToAdd?: string) => {
    const trimmed = (tagToAdd ?? tagInput).trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const filteredSuggestions =
    tagInput.length > 0
      ? AVAILABLE_TAGS.filter(
          (tag) => tag.startsWith(tagInput.toLowerCase()) && !tags.includes(tag)
        )
      : [];

  return (
    <View>
      <View style={styles.row}>
        <TextInput
          value={tagInput}
          onChangeText={setTagInput}
          style={[styles.input, { flex: 1 }]}
          placeholder="Enter tag"
        />
        <Button title="Add" onPress={() => handleAddTag()} />
      </View>

      {filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {filteredSuggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              onPress={() => handleAddTag(suggestion)}
              style={styles.suggestionPill}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.tagList}>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => handleRemoveTag(tag)}
            style={styles.tagPill}
          >
            <Text>{tag} ✕</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  suggestionPill: {
    backgroundColor: "#ddd",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: {
    color: "#333",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tagPill: {
    backgroundColor: "#eee",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
});
