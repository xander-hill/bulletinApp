// components/EventFeed.tsx
// Simplified to use our new master EventCard component for a consistent look.

import EventCard from '@/components/EventCard'; // Import our new master component
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

export default function EventFeed({ additionalFilters = {} }) {
  const { user } = useAuth();

  const {
    events,
    loading,
    refreshing,
    fetchMore,
    onRefresh,
  } = useEvents({
    userId: user?.id,
    initialFilter: 'upcoming',
    additionalFilters,
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />} // Use the new EventCard
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={<Text style={styles.header}>Discover Events</Text>}
        ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <Text style={styles.emptyText}>No events to show.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', padding: 16, backgroundColor: '#fff' },
  emptyText: { marginTop: 40, textAlign: 'center', color: '#777' },
});