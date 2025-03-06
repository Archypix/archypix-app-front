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
    const loading = ref<boolean>(false)
    const query_string = ref<string>('')
    const query_string_names = ref<string>('')
    const query_string_ids = ref<string>('')
    const page = ref<number>(1)

    // Methods
    const query = async (query_str: string, page: number) => {
        loading.value = true;
        console.log("Query:", query_string, "Page:", page);
        const components = parse_query(query_str);

        query_string.value = query_str;
        query_string_names.value = queryComponentsToString(convertQueryComponentToNames(components));
        query_string_ids.value = queryComponentsToString(convertQueryComponentToIds(components));

        const query = build_query(components, page)
        console.log("Built query:", query);
        await fetch(query)
        loading.value = false;
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
        loading,
        query_string,
        query_string_names,
        query_string_ids,
        page,
        query,
    }
});
