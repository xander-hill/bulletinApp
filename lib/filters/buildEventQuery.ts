// lib/filters/buildEventQuery.ts

import { supabase } from '../supabase';
import { EventFilters } from '../types/eventFilter';
import { simpleFilters } from './filterFns';

export function buildEventQuery(filters: EventFilters) {
  let query = supabase.from('events').select('*');

  for (const apply of simpleFilters) {
    query = apply(query, filters);
  }

  return query.order('start_time', { ascending: true }).limit(10);
}
