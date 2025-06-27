import { FilterType } from "./filterType";

export type UseEventsOptions = {
  userId?: string;
  initialFilter?: FilterType;
  additionalFilters?: Record<string, any>; // for tags, proximity, etc.
};