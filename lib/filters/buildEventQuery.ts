import { supabase } from '../supabase';
import { EventFilters } from '../types/eventFilter';
import { simpleFilters } from './filterFns';

export function buildEventQuery(filters: EventFilters) {
  let query = supabase.from('events').select('*');

  for (const apply of simpleFilters) {
    query = apply(query, filters);
  }
  
  // Sorting logic here
  if (filters.sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (filters.sort === 'upcoming') {
    query = query.order('start_time', { ascending: true });
  } else {
    // fallback/default
    query = query.order('start_time', { ascending: true });
  }

  return query.limit(10);
}
