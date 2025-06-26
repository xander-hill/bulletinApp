import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed
import { supabase } from '@/lib/supabase';
import { Event } from '@/lib/types/event';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import EventCard from './EventCard';

const PAGE_SIZE = 10;

export default function EventFeed() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'upcoming' | 'my' | 'rsvped'>('upcoming');

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const userId = user?.id ?? null;

  const renderHeader = () => (
  <View style={{ padding: 16 }}>
    <View style={{ padding: 16 }}>
      <Text style={styles.title}>Welcome to Bulletin 🎉</Text>
    </View>
    <View style={styles.filterBar}>
        {['upcoming', 'my', 'rsvped'].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => {
              setFilter(f as any);
              setEvents([]);
              setHasMore(true);
            }}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
  </View>
);

  // Helper: build query for filters other than 'rsvped'
  const buildQuery = (cursor: string | null) => {
    if (filter === 'upcoming') {
      let q = supabase
        .from('events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(PAGE_SIZE);

      if (cursor) q = q.gt('start_time', cursor);
      return q;
    }
    if (filter === 'my') {
      if (!userId) return null;
      let q = supabase
        .from('events')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (cursor) q = q.lt('created_at', cursor);
      return q;
    }
    return null;
  };

  const fetchEvents = useCallback(async () => {
    if (loading || !hasMore || authLoading) return;
    if (!userId && (filter === 'my' || filter === 'rsvped')) return;

    setLoading(true);
    const cursor =
      events.length > 0
        ? filter === 'upcoming'
          ? events[events.length - 1].start_time
          : events[events.length - 1].created_at
        : null;

    try {
      if (filter === 'rsvped') {
        // Step 1: fetch RSVPed event IDs for user
        const { data: rsvpsData, error: rsvpError } = await supabase
          .from('rsvps')
          .select('event_id')
          .eq('user_id', userId)
          .neq('status', 'not_going');

        if (rsvpError) throw rsvpError;
        if (!rsvpsData || rsvpsData.length === 0) {
          setEvents([]);
          setHasMore(false);
          setLoading(false);
          return;
        }

        const eventIds = rsvpsData.map((r) => r.event_id);

        // Step 2: fetch events by those IDs with pagination
        let query = supabase
          .from('events')
          .select('*')
          .in('id', eventIds)
          .order('created_at', { ascending: false })
          .limit(PAGE_SIZE);

        if (cursor) {
          query = query.lt('created_at', cursor);
        }

        const { data: eventsData, error: eventsError } = await query;
        if (eventsError) throw eventsError;

        setEvents((prev) => {
          const seen = new Set(prev.map((e) => e.id));
          const unique = eventsData.filter((e) => !seen.has(e.id));
          return [...prev, ...unique];
        });

        if (eventsData.length < PAGE_SIZE) setHasMore(false);
        setLoading(false);
        return;
      }

      // For 'upcoming' and 'my'
      const query = buildQuery(cursor);
      if (!query) {
        setLoading(false);
        return;
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching events:', error);
      } else if (data) {
        setEvents((prev) => {
          const seen = new Set(prev.map((e) => e.id));
          const unique = data.filter((e) => !seen.has(e.id));
          return [...prev, ...unique];
        });
        if (data.length < PAGE_SIZE) setHasMore(false);
      }
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setLoading(false);
    }
  }, [events, loading, hasMore, userId, authLoading, filter]);

  const onRefresh = async () => {
    if (authLoading) return;
    if (!userId && (filter === 'my' || filter === 'rsvped')) return;

    setRefreshing(true);
    setHasMore(true);

    try {
      if (filter === 'rsvped') {
        const { data: rsvpsData, error: rsvpError } = await supabase
          .from('rsvps')
          .select('event_id')
          .eq('user_id', userId)
          .neq('status', 'not_going');

        if (rsvpError) throw rsvpError;
        if (!rsvpsData || rsvpsData.length === 0) {
          setEvents([]);
          setHasMore(false);
          setRefreshing(false);
          return;
        }

        const eventIds = rsvpsData.map((r) => r.event_id);

        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds)
          .order('created_at', { ascending: false })
          .limit(PAGE_SIZE);

        if (eventsError) throw eventsError;

        setEvents(eventsData);
        setRefreshing(false);
        return;
      }

      const query = buildQuery(null);
      if (!query) {
        setEvents([]);
        setRefreshing(false);
        return;
      }

      const { data, error } = await query;
      if (error) {
        console.error('Refresh error:', error);
      } else if (data) {
        setEvents(data);
      }
      setRefreshing(false);
    } catch (error) {
      console.error('Refresh error:', error);
      setRefreshing(false);
    }
  };

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [filter, userId])
  );

  // Real-time new event subscription (all events)
  useEffect(() => {
    const channel = supabase
      .channel('events-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'events' },
        (payload) => {
          setEvents((prev) => {
            if (prev.find((e) => e.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/event/${item.id}`)}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>{item.location}</Text>
      <Text style={styles.meta}>
        {new Date(item.start_time).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={EventCard}
        onEndReached={fetchEvents}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={loading ? <ActivityIndicator size="large" /> : null}
        contentContainerStyle={styles.container}
        refreshing={refreshing}
        onRefresh={onRefresh}
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
