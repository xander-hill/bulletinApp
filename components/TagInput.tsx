import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export default function TagInput({ tags, setTags }: TagInputProps) {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    const normalized = trimmed.toLowerCase();
    if (normalized && !tags.includes(normalized)) {
      setTags([...tags, normalized]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <View>
      <View style={styles.row}>
        <TextInput
          value={tagInput}
          onChangeText={setTagInput}
          style={[styles.input, { flex: 1 }]}
          placeholder="Enter tag"
        />
        <Button title="Add" onPress={handleAddTag} />
      </View>
      <View style={styles.tagList}>
        {tags.map((tag) => (
          <TouchableOpacity key={tag} onPress={() => handleRemoveTag(tag)} style={styles.tagPill}>
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
