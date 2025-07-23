import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface EventItemProps {
  title: string;
  hostName: string;
  rsvpCount: number;
  date: string;
  endTime: string;
  location: string;
  tags: string[];
  description: string;
  reserveMiniMapSpace?: boolean;
}

export default function EventItem({
  title,
  hostName,
  rsvpCount,
  date,
  endTime,
  location,
  tags,
  description,
  reserveMiniMapSpace = false,
}: EventItemProps) {
  const getDateBadgeColor = () => {
    const eventDate = new Date(date);
    const now = new Date();
    const diff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 1) return '#FF3B30';
    if (diff < 2) return '#FF9500';
    return '#34C759';
  };

  return (
    <View style={styles.eventCard}>
      {/* Top Section: Title, Host, RSVP/Date */}
      <View style={styles.topBlock}>
        <Text style={styles.title} numberOfLines={3}>{title}</Text>
        <Text style={styles.host}>Hosted by {hostName}</Text>

        <View style={styles.row}>
            <View style={styles.rsvpBadgeContainer}>
                <Text style={styles.rsvp}>{rsvpCount} going</Text>
                <View style={[styles.dateBadge, { backgroundColor: getDateBadgeColor() }]}>
                <Text style={styles.dateBadgeText}>
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                </View>
            </View>
        </View>

      </View>

      {/* Everything below: Full width, padded spacing */}
      <View style={styles.section}>
        <Text style={styles.location}>📍 {location}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.timeText}>🕒 Starts at {new Date(date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
        <Text style={styles.timeText}>🕒 Ends at {new Date(endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
      </View>

      {tags.length > 0 && (
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

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Description</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.mediaPlaceholder}>
          <Text style={styles.mediaPlaceholderText}>Media coming soon</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  topBlock: {
    minHeight: 180, // Match mini map collapsed height
    justifyContent: 'center',
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
  },
  host: {
    fontSize: 18,
    color: '#444',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rsvp: {
    fontSize: 18,
    color: '#007AFF',
  },
  dateBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  dateBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 18, // Consistent vertical spacing between sections
  },
  location: {
    fontSize: 17,
    color: '#333',
  },
  timeText: {
    fontSize: 16,
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
    fontSize: 14,
    color: '#555',
  },
  sectionHeader: {
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 6,
    color: '#111',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  mediaPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#ddd',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaPlaceholderText: {
    color: '#999',
    fontSize: 14,
  },
  rsvpBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // or use marginLeft on dateBadge if gap not supported
  },
  eventCard: {
    backgroundColor: '#fffbe6', // pale post-it yellow
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  }
});
