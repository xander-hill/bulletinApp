import { supabase } from '../supabase';
import { Event } from '../types/event';
import { EventFilters } from '../types/eventFilter';
import { buildEventQuery } from './buildEventQuery';

export async function fetchEventsWithFilters(filters: EventFilters, cursor?: string): Promise<Event[]> {
  console.log("fetching events with filters: ", filters);

  if (filters.rsvped && filters.userId) {
    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('event_id')
      .eq('user_id', filters.userId)
      .neq('status', 'not_going');

    if (rsvpError) throw rsvpError;
    const ids = rsvps?.map((r) => r.event_id) ?? [];
    if (ids.length === 0) return [];

    const query = buildEventQuery({ ...filters, rsvped: true }).in('id', ids);
    if (cursor) query.lt('created_at', cursor);

    const { data: eventsData, error } = await query;
    if (error) throw error;

    return eventsData ?? [];
  }

  const query = buildEventQuery(filters);
  if (cursor) query.lt('start_time', cursor); 

  const { data: eventsData, error } = await query;
  if (error) throw error;

  return eventsData ?? [];
}
