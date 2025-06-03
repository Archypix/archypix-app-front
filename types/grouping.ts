import type { PictureOrientation } from '~/types/pictures';

// Arrangement strategies
export interface ArrangementStrategy {
  filter: StrategyFiltering;
  groupings: StrategyGrouping;
  preserve_unicity: boolean;
}
export type StrategyFiltering =
  | { Or: { value: StrategyFiltering[] } }
  | { And: { value: StrategyFiltering[] } }
  | { Not: { value: StrategyFiltering } }
  | { Filter: FilterType };

export type FilterType =
  | { IncludeTags: number[] }
  | { IncludeGroups: number[] }
  | { ExifEqualTo: ExifDataTypeValue }
  | { ExifInInterval: ExifDataTypeValue };

export type ExifDataTypeValue =
  | { CreationDate: string[] }
  | { EditionDate: string[] }
  | { Latitude: string[] }
  | { Longitude: string[] }
  | { Altitude: number[] }
  | { Orientation: PictureOrientation[] }
  | { Width: number[] }
  | { Height: number[] }
  | { CameraBrand: string[] }
  | { CameraModel: string[] }
  | { FocalLength: string[] }
  | { ExposureTime: [number, number][] }
  | { IsoSpeed: number[] }
  | { FNumber: string[] };

export type StrategyGrouping =
  | { GroupByFilter: FilterGrouping }
  | { GroupByTags: TagGrouping }
  | { GroupByExifValues: ExifValuesGrouping }
  | { GroupByExifInterval: ExifIntervalGrouping }
  | { GroupByLocation: LocationGrouping };


export interface TagGrouping {
  tag_group_id: number;
  tag_id_to_group_id: Record<number, number>;
  other_group_id: number | null;
  group_names_format: string;
}
export interface FilterGrouping {
  filters: Record<number, StrategyFiltering>; // Key is the group id, value is the filter
  other_group_id: number | null; // Id of the group for the pictures that do not match any filter
}

export interface ExifValuesGrouping {}
export interface ExifIntervalGrouping {}
export interface LocationGrouping {}


