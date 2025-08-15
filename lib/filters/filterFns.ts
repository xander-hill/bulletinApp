import { FilterFn } from '../types/filterFunction';

export const simpleFilters: FilterFn[] = [
  // This filter uses the database's clock to reliably get future events.
  (q, f) => (f.upcoming ? q.gte('start_time', 'now()') : q),

  (q, f) =>
    f.keyword
      ? q.or(
          `title.ilike.%${f.keyword}%,description.ilike.%${f.keyword}%,location.ilike.%${f.keyword}%`
        )
      : q,

  (q, f) => (f.tags?.length ? q.overlaps('tags', f.tags) : q),

  (q, f) => (f.userId && !f.rsvped ? q.eq('creator_id', f.userId) : q),
];
