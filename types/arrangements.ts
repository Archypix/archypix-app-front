import type {ArrangementStrategy, StrategyFiltering} from './grouping';

// Response types
export interface ArrangementResponse {
  arrangement: ArrangementResponseArrangement;
  groups: Group[];
  to_be_deleted_groups: Group[];
}
export interface ArrangementResponseArrangement {
  id: number;
  user_id: number;
  name: string;
  strong_match_conversion: boolean;
  strategy: ArrangementStrategy | null;
}
export interface Group {
  id: number;
  arrangement_id: number;
  share_match_conversion: boolean;
  name: string;
  to_be_deleted: boolean;
}

// Request types
export interface ArrangementRequest {
  strong_match_conversion: boolean;
  name: string;
  strategy: ArrangementStrategyRequest | null;
}
export interface ArrangementStrategyRequest {
  filter: StrategyFiltering;
  groupings: StrategyGroupingRequest;
  preserve_unicity: boolean;
}

export type StrategyGroupingRequest =
    | { GroupByFilter: FilterGroupingRequest }
    | { GroupByTags: TagGroupingRequest };

export interface TagGroupingRequest {
  tag_group_id: number;
  group_names_format: string;
}
export interface FilterGroupingRequest {
  filters: Record<string, StrategyFiltering>; // Key is the group name, value is the filter
}
