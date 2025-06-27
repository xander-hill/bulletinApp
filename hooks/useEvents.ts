// hooks/useEvents.ts
import { fetchEventsWithFilters } from '@/lib/filters/fetchEventsWithFilters';
import { Event } from '@/lib/types/event';
import { FilterType } from '@/lib/types/filterType';
import { UseEventsOptions } from '@/lib/types/useEventsOptions';
import { useCallback, useEffect, useMemo, useState } from 'react';

const PAGE_SIZE = 10;

export function useEvents({ userId, initialFilter = 'upcoming', additionalFilters = {} }: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>(initialFilter);

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
  }, [hasMore, loading, filterType, userId, additionalFilters]);

  const filters = useMemo(() => ({
    upcoming: filterType === 'upcoming',
    userId,
    rsvped: filterType === 'rsvped',
    ...additionalFilters,
  }), [filterType, userId, additionalFilters]);

  const onRefresh = useCallback(async () => {
    if ((filterType === 'my' || filterType === 'rsvped') && !userId) return;

    setRefreshing(true);
    setHasMore(true);
    try {
      const refreshed = await fetchEventsWithFilters(filters);
      setEvents(refreshed);
    } catch (err) {
      console.error('Error refreshing events:', err);
    } finally {
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);


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
