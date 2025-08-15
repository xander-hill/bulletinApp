import { supabase } from '../supabase';
import { EventFilters } from '../types/eventFilter';
import { simpleFilters } from './filterFns';

export function buildEventQuery(filters: EventFilters) {
  // --- THIS IS THE FIX: Query 'events' directly, not the view ---
  let query = supabase.from('events').select('*');

  for (const apply of simpleFilters) {
    query = apply(query, filters);
  }
  
  if (filters.sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (filters.sort === 'upcoming') {
    query = query.order('start_time', { ascending: true });
  } else if (filters.sort === 'popular') {
    // Note: 'rsvp_count' is not on the base 'events' table.
    // We will sort by 'start_time' as a fallback for now.
    // To sort by popularity, we'd need a more complex query.
    console.warn("Popularity sort is not yet implemented for this query path.");
    query = query.order('start_time', { ascending: true });
  } else if (filters.sort === 'closest' && filters.userLat && filters.userLng) {
    return supabase
    .rpc('get_events_sorted_by_distance', {
      user_lat: filters.userLat,
      user_lng: filters.userLng,
    });
  } else {
    // fallback
    query = query.order('start_time', { ascending: true });
  }

  return query.limit(10);
}
