export type EventFilters = Partial<{
  keyword: string;
  tags: string[];
  upcoming: boolean;
  userId: string;
  rsvped: boolean;
}>;
