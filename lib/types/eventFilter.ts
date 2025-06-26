export type EventFilters = Partial<{
  userId: string;
  rsvped: boolean;
  upcoming: boolean;
  tags: string[];
  keyword: string;
}>;