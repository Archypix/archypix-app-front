import type {PictureOrientation} from '~/types/pictures';
import type {ValueOf} from "~/composables/tsUtils";
import type {StrategyGroupingRequest} from "~/types/arrangements";

// Arrangement strategies
export interface ArrangementStrategy {
    filter: StrategyFiltering;
    groupings: StrategyGrouping;
    preserve_unicity: boolean;
}

export type StrategyFilteringMap = {
    Or: StrategyFiltering[];
    And: StrategyFiltering[];
    Not: StrategyFiltering;
    Filter: FilterType;
};

export type StrategyFiltering = {
    [K in keyof StrategyFilteringMap]: { [P in K]: StrategyFilteringMap[K] };
}[keyof StrategyFilteringMap];

export const isStrategyFilteringFilter = (filter: StrategyFiltering): filter is { Filter: FilterType } => {
    return 'Filter' in filter;
};
export const isStrategyFilteringNot = (filter: StrategyFiltering): filter is { Not: StrategyFiltering } => {
    return 'Not' in filter;
};
export const isStrategyFilteringAnd = (filter: StrategyFiltering): filter is { And: StrategyFiltering[] } => {
    return 'And' in filter;
};
export const isStrategyFilteringOr = (filter: StrategyFiltering): filter is { Or: StrategyFiltering[] } => {
    return 'Or' in filter;
};
export const getFilterType = (filter: StrategyFiltering): keyof StrategyFilteringMap => {
    if ('Filter' in filter) {
        return 'Filter';
    }
    if ('Or' in filter) {
        return 'Or';
    }
    if ('And' in filter) {
        return 'And';
    }
    if ('Not' in filter) {
        return 'Not';
    }
    throw new Error('Invalid StrategyFiltering type');
}
export const getStrategyFilteringChildren = (filter: StrategyFiltering): StrategyFiltering[] => {
    if (isStrategyFilteringAnd(filter)) {
        return filter.And;
    }
    if (isStrategyFilteringOr(filter)) {
        return filter.Or;
    }
    if (isStrategyFilteringNot(filter)) {
        return [filter.Not];
    }
    return [];
};

export type FilterType =
    | { IncludeTags: number[] }
    | { IncludeGroups: number[] }
    | { ExifEqualTo: ExifDataTypeValue }
    | { ExifInInterval: ExifDataTypeValue };

export type ExifFieldTypeMap = {
    CreationDate: string[];
    EditionDate: string[];
    Latitude: string[];
    Longitude: string[];
    Altitude: number[];
    Orientation: PictureOrientation[];
    Width: number[];
    Height: number[];
    CameraBrand: string[];
    CameraModel: string[];
    FocalLength: string[];
    ExposureTime: [number, number][];
    IsoSpeed: number[];
    FNumber: string[];
};
export type ExifDataTypeValue = {
    [K in keyof ExifFieldTypeMap]: { [P in K]: ExifFieldTypeMap[K] };
}[keyof ExifFieldTypeMap];

export const makeExifDataTypeValue = (type: keyof ExifFieldTypeMap, value: ValueOf<ExifFieldTypeMap>): ExifDataTypeValue => {
    return {
        [type]: value
    } as ExifDataTypeValue;
}
export function extractExifDataTypeAndValue<T extends ExifDataTypeValue>(
    value: T
): [keyof T, T[keyof T]] {
    const type = Object.keys(value)[0] as keyof T;
    if (!(type in value)) {
        throw new Error('Invalid ExifDataTypeValue');
    }
    return [type, value[type]];
}

export type StrategyGroupingMap = {
    GroupByFilter: FilterGrouping;
    GroupByTags: TagGrouping;
    // GroupByExifValues: ExifValuesGrouping;
    // GroupByExifInterval: ExifIntervalGrouping;
    // GroupByLocation: LocationGrouping;
};
export type StrategyGrouping = {
    [K in keyof StrategyGroupingMap]: { [P in K]: StrategyGroupingMap[K] };
}[keyof StrategyGroupingMap];

export const getGroupingType = (grouping: StrategyGrouping): keyof StrategyGroupingMap => {
    if ('GroupByFilter' in grouping) {
        return 'GroupByFilter';
    }
    if ('GroupByTags' in grouping) {
        return 'GroupByTags';
    }
    // if ('GroupByExifValues' in grouping) {
    //     return 'GroupByExifValues';
    // }
    // if ('GroupByExifInterval' in grouping) {
    //     return 'GroupByExifInterval';
    // }
    // if ('GroupByLocation' in grouping) {
    //     return 'GroupByLocation';
    // }
    throw new Error('Invalid StrategyGrouping type');
}
export function getStrategyGroupingTypeAndValue<T extends keyof StrategyGroupingMap>(
    grouping: StrategyGrouping
): [T, StrategyGroupingMap[T]] {
    const type = Object.keys(grouping)[0] as T;
    if (!(type in grouping)) {
        throw new Error('Invalid StrategyGrouping');
    }
    return [type, (grouping as { [K in T]: StrategyGroupingMap[T] })[type]];
}


export interface TagGrouping {
    tag_group_id: number;
    tag_id_to_group_id: Record<number, number>;
    other_group_id: number | null;
    group_names_format: string;
}

export interface FilterGrouping {
    filters: {
        [groupId: number]: StrategyFiltering
    },
    other_group_id: number | null; // Id of the group for the pictures that do not match any filter
}

export interface ExifValuesGrouping {
}

export interface ExifIntervalGrouping {
}

export interface LocationGrouping {
}


