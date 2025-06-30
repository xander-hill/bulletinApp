import { FilterType } from "./filterType";

export type EventFeedProps = {
  headerTitle?: string;
  userId?: string;
  initialFilter?: FilterType; // keep if using 'upcoming', 'my', etc.
  additionalFilters?: Record<string, any>; // for discovery and advanced filtering
};

