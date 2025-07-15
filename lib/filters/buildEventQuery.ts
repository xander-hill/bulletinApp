import { supabase } from '../supabase';
import { EventFilters } from '../types/eventFilter';
import { simpleFilters } from './filterFns';

export function buildEventQuery(filters: EventFilters) {
  let query = supabase.from('events_with_details').select('*');

  for (const apply of simpleFilters) {
    query = apply(query, filters);
  }

  console.log("Filters passed to buildEventQuery:", filters);

  
  if (filters.sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (filters.sort === 'upcoming') {
    query = query.order('start_time', { ascending: true });
  } else if (filters.sort === 'popular') {
    query = query.order('rsvp_count', { ascending: false });
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
