// hooks/useEvents.ts
import { fetchEventsWithFilters } from '@/lib/filters/fetchEventsWithFilters';
import { Event } from '@/lib/types/event';
import { FilterType } from '@/lib/types/filterType';
import { useCallback, useEffect, useState } from 'react';

const PAGE_SIZE = 10;

export function useEvents(userId?: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('upcoming');

  const filters = {
    upcoming: filterType === 'upcoming',
    userId,
    rsvped: filterType === 'rsvped',
  };

  const getCursor = () =>
    events.length > 0
      ? filterType === 'upcoming'
        ? events[events.length - 1].start_time
        : events[events.length - 1].created_at
      : undefined;

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    if ((filterType === 'my' || filterType === 'rsvped') && !userId) return;

    setLoading(true);
    try {
      const newEvents = await fetchEventsWithFilters(filters, getCursor());

      // always dedupe *against the real prev* inside setEvents
      setEvents((prev) => {
        const seen = new Set(prev.map((e) => e.id));
        const unique = newEvents.filter((e) => !seen.has(e.id));
        return [...prev, ...unique];
      });

      if (newEvents.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching more events:', err);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, filterType, userId]);

  const onRefresh = useCallback(async () => {
    if ((filterType === 'my' || filterType === 'rsvped') && !userId) return;

    setRefreshing(true);
    setHasMore(true);
    try {
      const refreshed = await fetchEventsWithFilters(filters);
      // overwrite with fresh data (should be deduped server-side)
      setEvents(refreshed);
    } catch (err) {
      console.error('Error refreshing events:', err);
    } finally {
      setRefreshing(false);
    }
  }, [filterType, userId]);

  // auto-refresh when filter or user changes
  useEffect(() => {
    onRefresh();
  }, [filterType, userId, onRefresh]);

  return {
    events,
    loading,
    refreshing,
    hasMore,
    fetchMore,
    onRefresh,
    filterType,
    setFilterType,
  };
}
