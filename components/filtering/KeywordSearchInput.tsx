import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface KeywordSearchInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function KeywordSearchInput({ value, onChange }: KeywordSearchInputProps) {
  const [text, setText] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(text);
    }, 400); // debounce

    return () => clearTimeout(timeout);
  }, [text]);

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Search events..."
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#eee',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
});
