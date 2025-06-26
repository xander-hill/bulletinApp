// lib/filters/filterFns.ts

import { EventFilters } from '../types/eventFilter';

type FilterFn = (query: any, filters: EventFilters) => any;

export const simpleFilters: FilterFn[] = [
  (q, f) => (f.upcoming ? q.gte('start_time', new Date().toISOString()) : q),

  (q, f) =>
    f.keyword
      ? q.or(
          `title.ilike.%${f.keyword}%,description.ilike.%${f.keyword}%,location_name.ilike.%${f.keyword}%`
        )
      : q,

  (q, f) => (f.tags?.length ? q.contains('tags', f.tags) : q),

  (q, f) => (f.userId && !f.rsvped ? q.eq('creator_id', f.userId) : q),
];
