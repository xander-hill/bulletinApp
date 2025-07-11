// hooks/useEvents.ts
import { fetchEventsWithFilters } from '@/lib/filters/fetchEventsWithFilters';
import { Event } from '@/lib/types/event';
import { FilterType } from '@/lib/types/filterType';
import { UseEventsOptions } from '@/lib/types/useEventsOptions';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PAGE_SIZE = 10;

// helper to compare objects shallowly
function shallowEqual(obj1: any, obj2: any) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

export function useEvents({
  userId,
  initialFilter = 'upcoming',
  additionalFilters = {},
}: UseEventsOptions = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>(initialFilter);

  console.log("use events called");
  console.log("initial filter: ", initialFilter);
  console.log("additional filters: ", additionalFilters)

  const filters = useMemo(() => ({
    upcoming: filterType === 'upcoming',
    userId,
    rsvped: filterType === 'rsvped',
    ...additionalFilters,
  }), [filterType, userId, additionalFilters]);

  const previousFilters = useRef(filters);

  const getCursor = () =>
    events.length > 0
      ? filterType === 'upcoming'
        ? events[events.length - 1].start_time
        : events[events.length - 1].created_at
      : undefined;

  const fetchMore = useCallback(async () => {
    if (loading || refreshing || !hasMore) {
      console.log('fetchMore skipped: loading, refreshing or no more', { loading, refreshing, hasMore });
      return;
    }
    if ((filterType === 'my' || filterType === 'rsvped') && !userId) {
      console.log('fetchMore skipped: filterType needs userId but none provided', { filterType, userId });
      return;
    }

    setLoading(true);
    try {
      const newEvents = await fetchEventsWithFilters(filters, getCursor());
      setEvents(prev => {
        const seen = new Set(prev.map(e => e.id));
        const unique = newEvents.filter(e => !seen.has(e.id));
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
  }, [loading, refreshing, hasMore, filterType, userId, filters]);

  const onRefresh = useCallback(async () => {
    if ((filterType === 'my' || filterType === 'rsvped') && !userId) {
      console.log('onRefresh skipped: filterType needs userId but none provided', { filterType, userId });
      return;
    }

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
  }, [filterType, userId, filters]);

  useEffect(() => {
    if (!shallowEqual(previousFilters.current, filters)) {
      previousFilters.current = filters;
      onRefresh();
    }
  }, [filters, onRefresh]);

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

