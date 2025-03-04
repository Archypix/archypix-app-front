import { defineStore } from 'pinia';
import type {ApiError} from "~/composables/fetchApi";
import {useToastService} from "~/composables/useToastService";

// Type definition for pictures query
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

export type ListPictureData = {
    id: number,
    name: string,
    width: number,
    height: number,
}

export const usePicturesStore = defineStore('pictures', () => {
    // Data
    const pictures = ref<ListPictureData[]>([])

    // Methods
    const query = async (query: PicturesQuery) => {
        await usePostApi<PicturesQuery, ListPictureData[]>(false, '/query_pictures', query)
            .then((data: ListPictureData[]) => {
                pictures.value = data;
            })
            .catch((error: ApiError | null) => {
                useToastService().apiError(error, "Unable to fetch pictures list");
            })
    }

    return {
        pictures,
        query,
    }
});