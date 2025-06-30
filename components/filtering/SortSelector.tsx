import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SortSelectorProps {
  options: { label: string; value: string }[];
  selected: string;
  onChange: (val: string) => void;
}

export default function SortSelector({ options, selected, onChange }: SortSelectorProps) {
  return (
    <View style={styles.container}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[styles.button, selected === opt.value && styles.buttonActive]}
        >
          <Text style={[styles.text, selected === opt.value && styles.textActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#eee',
    flexWrap: 'wrap',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#ccc',
    margin: 4,
  },
  buttonActive: {
    backgroundColor: '#0066cc',
  },
  text: {
    color: '#333',
    fontWeight: '500',
  },
  textActive: {
    color: 'white',
  },
});
