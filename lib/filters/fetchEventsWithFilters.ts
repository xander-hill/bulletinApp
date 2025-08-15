import { supabase } from '../supabase';
import { Event } from '../types/event';
import { EventFilters } from '../types/eventFilter';

export async function fetchEventsWithFilters(filters: EventFilters): Promise<Event[]> {
  const { data, error } = await supabase
    .rpc('get_filtered_events', {
      sort_type: filters.sort,
      user_lat: filters.userLat,
      user_lng: filters.userLng,
      search_keyword: filters.keyword,
      filter_tags: filters.tags,
    });

  if (error) {
    console.error("Error calling get_filtered_events:", error);
    throw error;
  }

  return data ?? [];
}