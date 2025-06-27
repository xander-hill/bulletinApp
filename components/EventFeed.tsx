import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { EventFeedProps } from '@/lib/types/eventFeedProps';
import { FilterType } from '@/lib/types/filterType';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import EventCard from './EventCard';
import FilterBar from './FilterBar';

export default function EventFeed({
  filterOptions = [],
  headerTitle = "Events",
  userId,
  initialFilter,
}: EventFeedProps) {
  const { user, loading: authLoading } = useAuth();
  const {
    events,
    loading,
    refreshing,
    fetchMore,
    onRefresh,
    filterType,
    setFilterType,
  } = useEvents({
    userId: userId ?? user?.id,
    initialFilter,
  });

  const renderHeader = () => (
    <View style={{ padding: 16 }}>
      <Text style={styles.title}>{headerTitle}</Text>
      {filterOptions.length > 0 && (
        <FilterBar
          selected={filterType}
          onChange={(val) => setFilterType(val as FilterType)}
          options={filterOptions}
        />
      )}
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
  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  meta: { fontSize: 14, color: '#555', marginTop: 4 },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#eee',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  filterButtonActive: {
    backgroundColor: '#0066cc',
  },
  filterText: {
    color: '#333',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#777',
  },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
});
