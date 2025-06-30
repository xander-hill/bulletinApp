import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { EventFeedProps } from '@/lib/types/eventFeedProps';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import EventCard from './EventCard';

export default function EventFeed({
  headerTitle = "Events",
  userId,
  initialFilter,
  additionalFilters = {}, // for discovery or advanced filtering
}: EventFeedProps) {
  const { user } = useAuth();

  const {
    events,
    loading,
    refreshing,
    fetchMore,
    onRefresh,
  } = useEvents({
    userId: userId ?? user?.id,
    initialFilter,
    additionalFilters,
  });

  const renderHeader = () => (
    <View style={{ padding: 16 }}>
      <Text style={styles.title}>{headerTitle}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={EventCard}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.4}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
        ListEmptyComponent={
          !loading && !refreshing ? (
            <Text style={styles.emptyText}>No events to show.</Text>
          ) : null
        }
        contentContainerStyle={styles.container}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold' },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#777',
  },
});


