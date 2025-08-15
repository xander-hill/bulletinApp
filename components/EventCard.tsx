// components/EventCard.tsx
// This is our new "master" component for displaying an event, based on your detailed EventItem.
// It will be used in both the list view and the sliding panel on the map.

import { Event } from '@/lib/types/event'; // Assuming your Event type is defined here
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const {
    title,
    host_name,
    rsvp_count,
    start_time,
    ends_at,
    location,
    tags,
    description,
  } = event;

  const getDateBadgeColor = () => {
    const eventDate = new Date(start_time);
    const now = new Date();
    const diff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 1) return '#FF3B30'; // Red for today
    if (diff < 2) return '#FF9500'; // Orange for tomorrow
    return '#34C759'; // Green for later
  };

  return (
    <View style={styles.eventCard}>
      <View style={styles.topBlock}>
        <Text style={styles.title} numberOfLines={3}>{title}</Text>
        <Text style={styles.host}>Hosted by {host_name}</Text>
        <View style={styles.row}>
          <View style={styles.rsvpBadgeContainer}>
            <Text style={styles.rsvp}>{rsvp_count} going</Text>
            <View style={[styles.dateBadge, { backgroundColor: getDateBadgeColor() }]}>
              <Text style={styles.dateBadgeText}>
                {new Date(start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.location}>📍 {location}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.timeText}>🕒 Starts at {new Date(start_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
        {ends_at && <Text style={styles.timeText}>🕒 Ends at {new Date(ends_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>}
      </View>

      {tags && tags.length > 0 && (
        <View style={styles.section}>
          <View style={styles.tagsContainer}>
            {tags.map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* For a card view, the full description might be too long. Consider showing a snippet. */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Description</Text>
        <Text style={styles.description} numberOfLines={3}>{description}</Text>
      </View>
    </View>
  );
}

// Styles are merged and refined from your EventItem component
const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: '#fffbe6',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    margin: 16,
  },
  topBlock: {
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  host: {
    fontSize: 16,
    color: '#444',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rsvp: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  dateBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  dateBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0000001a'
  },
  location: {
    fontSize: 16,
    color: '#333',
  },
  timeText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: '#eee',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 13,
    color: '#555',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#111',
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 21,
  },
  rsvpBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});