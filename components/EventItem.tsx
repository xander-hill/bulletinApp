import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface EventItemProps {
  title: string;
  hostName: string;
  rsvpCount: number;
  date: string; // ISO string or readable date
  description: string;
  reserveMiniMapSpace?: boolean;
  onPress?: () => void;
}

export default function EventItem({
  title,
  hostName,
  rsvpCount,
  date,
  description,
  reserveMiniMapSpace = false,
  onPress,
}: EventItemProps) {
  // You can adjust how to parse & color the date
  const getDateBadgeColor = () => {
    const eventDate = new Date(date);
    const now = new Date();
    const diff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 1) return '#FF3B30'; // today = red
    if (diff < 2) return '#FF9500'; // tomorrow = orange
    return '#34C759'; // future = green
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.container,
        reserveMiniMapSpace && { paddingRight: 180 },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <View
          style={[
            styles.dateBadge,
            { backgroundColor: getDateBadgeColor() },
          ]}
        >
          <Text style={styles.dateBadgeText}>
            {new Date(date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <Text style={styles.host}>Hosted by {hostName}</Text>
      <Text style={styles.rsvp}>{rsvpCount} going</Text>

      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
    marginRight: 12,
  },
  dateBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  dateBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  host: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  rsvp: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
