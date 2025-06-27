import { FilterOption } from "./filterOption";

export type FilterBarProps = {
  selected: string;
  onChange: (value: string) => void;
  options: FilterOption[];
};
