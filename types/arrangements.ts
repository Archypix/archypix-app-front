import type {ArrangementStrategy, StrategyFiltering, StrategyGrouping, StrategyGroupingMap} from './grouping';

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

export interface StrategyGroupingRequestMap {
  GroupByFilter: FilterGroupingRequest;
  GroupByTags: TagGroupingRequest;
}
export const getGroupingRequestType = (grouping: StrategyGroupingRequest): keyof StrategyGroupingRequestMap => {
  if ('GroupByFilter' in grouping) {
    return 'GroupByFilter';
  }
  if ('GroupByTags' in grouping) {
    return 'GroupByTags';
  }
  throw new Error('Invalid StrategyGroupingRequest type');
}

export type StrategyGroupingRequest = {
  [K in keyof StrategyGroupingRequestMap]: { [P in K]: StrategyGroupingRequestMap[K] };
}[keyof StrategyGroupingRequestMap];

export interface TagGroupingRequest {
  tag_group_id: number;
  group_names_format: string;
}

export interface FilterGroupingRequest {
  filters: FilterGroupingValueRequest[];
}

export interface FilterGroupingValueRequest {
  id: number;
  name: string;
  filter: StrategyFiltering;
}
