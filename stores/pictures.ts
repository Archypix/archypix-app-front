import {defineStore} from 'pinia';
import type {ApiError} from "~/composables/fetchApi";
import {useToastService} from "~/composables/useToastService";
import {build_query, convertQueryComponentToNames, parse_query, queryComponentsToString} from "~/composables/queryFiles";

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

    const pictures = ref<ListPictureData[]>([])
    const query_string = ref<string>('')
    const page = ref<number>(1)

    // Methods
    const query = async (query_string: string, page: number) => {
        console.log("Query:", query_string, "Page:", page);
        const components = parse_query(query_string);
        console.log("Parsed query:", components);

        const query = build_query(components, page)
        console.log("Built query:", query);
        console.log("Stringified query:", queryComponentsToString(convertQueryComponentToNames(components)));
        await fetch(query)
    }
    const fetch = async (query: PicturesQuery) => {
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
