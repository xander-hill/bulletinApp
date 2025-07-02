import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LabeledDatePickerProps {
  label: string;
  value: Date;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
}

export default function LabeledDatePicker({
  label,
  value,
  onChange,
  mode = 'datetime',
}: LabeledDatePickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <DateTimePicker value={value} onChange={onChange} mode={mode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
