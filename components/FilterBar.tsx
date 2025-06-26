// components/FilterBar.tsx
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type FilterOption = {
  label: string;
  value: string;
};

type Props = {
  selected: string;
  onChange: (value: string) => void;
  options: FilterOption[];
};

export default function FilterBar({ selected, onChange, options }: Props) {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[
            styles.button,
            selected === option.value && styles.buttonActive,
          ]}
        >
          <Text
            style={[
              styles.text,
              selected === option.value && styles.textActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#eee',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  buttonActive: {
    backgroundColor: '#0066cc',
  },
  text: {
    color: '#333',
    fontWeight: '600',
  },
  textActive: {
    color: 'white',
  },
});
