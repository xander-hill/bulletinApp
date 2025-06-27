import { FilterOption } from "./filterOption";
import { FilterType } from "./filterType";

export type EventFeedProps = {
  filterOptions?: FilterOption[];
  headerTitle?: string;
  userId?: string;
  initialFilter?: FilterType;
};
