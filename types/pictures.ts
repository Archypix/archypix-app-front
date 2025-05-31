
// Request types
export interface PicturesQuery {
    filters: PictureFilter[];
    sorts: PictureSort[];
    page: number;
}

export interface PictureFilter {
    type: PictureFilterType;
    invert: boolean;
    ids?: number[];
}
export enum PictureFilterType {
    Arrangement = "Arrangement",
    Group = "Group",
    Deleted = "Deleted",
    Owned = "Owned",
    TagGroup = "TagGroup",
    Tag = "Tag",
}
export interface PictureSort {
    type: PictureSortType;
    ascend: boolean;
}
export enum PictureSortType {
    CreationDate = "CreationDate",
    EditionDate = "EditionDate",
}
// Response types
export type ListPictureData = {
    id: number,
    name: string,
    width: number,
    height: number,
}

// Picture data/response types
export interface PictureDetails {
    picture: Picture;
    tags_ids: number[];
    ratings: Rating[];
}
export interface Picture {
    id: number;
    name: string;
    comment: string;
    owner_id: number;
    author_id: number;
    deleted_date: string | null;
    copied: boolean;
    creation_date: string;
    edition_date: string;
    latitude: string | null;
    longitude: string | null;
    altitude: number | null;
    orientation: PictureOrientation;
    width: number;
    height: number;
    camera_brand: string | null;
    camera_model: string | null;
    focal_length: string | null;
    exposure_time_num: number | null;
    exposure_time_den: number | null;
    iso_speed: number | null;
    f_number: string | null;
    size_ko: number;
}
export interface Rating {
    user_id: number;
    picture_id: number;
    rating: number;
}
export enum PictureOrientation {
    Unspecified = "Unspecified",
    Normal = "Normal",
    HorizontalFlip = "HorizontalFlip",
    Rotate180 = "Rotate180",
    VerticalFlip = "VerticalFlip",
    Rotate90HorizontalFlip = "Rotate90HorizontalFlip",
    Rotate90 = "Rotate90",
    Rotate90VerticalFlip = "Rotate90VerticalFlip",
    Rotate270 = "Rotate270",
}

