import { EventFilters } from "./eventFilter";

export type FilterFn = (query: any, filters: EventFilters) => any;