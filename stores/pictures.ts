// Type definition for pictures query

import type {QueryComponent} from "~/composables/queryStrings";
import {defineStore} from "pinia";

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

export type ListPictureData = {
    id: number,
    name: string,
    width: number,
    height: number,
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

export interface PictureDetails {
    picture: Picture;
    tags_ids: number[];
    ratings: Rating[];
}

export const usePicturesStore = defineStore('pictures', () => {

    const pictures = ref<ListPictureData[]>([])
    const selected_pictures = ref<number[]>([])
    const loading = ref<boolean>(false)

    // Stores the last query using either names or ids or the original version
    const last_query_components_ids = ref<QueryComponent[]>([])
    const last_query_string_names = ref<string>('')
    const last_query_string_ids = ref<string>('')
    const last_query_string = ref<string>('')
    const page = ref<number>(1)

    const route = useRoute();
    const checkUpdateRoute = () => {
        const q = route.query.q?.toString();
        if (q && q != last_query_string_ids.value) {
            page.value = 1;
            let _ = query(q)
        }
    }
    watch(route, checkUpdateRoute)
    onMounted(checkUpdateRoute)

    /**
     * Return true if the last_query is a config query (should open a config pane instead of a picture list)
     */
    const is_config = computed(() => {
        return last_query_components_ids.value.some(c => c.key == 'config');
    })
    const config_component = computed(() => {
        if (is_config){
            return last_query_components_ids.value.find(c => c.key == 'config');
        }
        return null;
    })

    // Public
    const query_more = async () => {
        if(is_config)
        page.value += 1;
        await query_components()
    }
    const query = async (query_str: string, to_names = true) => {
        page.value = 1;
        console.log("Query:", query_str, "Page:", page.value);

        const components = parse_query(query_str);
        last_query_components_ids.value = await convertQueryComponentToIds(components);
        if (!is_config.value) loading.value = true;

        last_query_string_ids.value = queryComponentsToString(last_query_components_ids.value);
        last_query_string_names.value = queryComponentsToString(await convertQueryComponentToNames(components));
        last_query_string.value = to_names ? last_query_string_names.value : query_str;

        await useRouter().push({query: {q: last_query_string_ids.value}});
        if (!is_config.value) {
            await query_components()
        }
    }
    const back = async () => {
        // TODO: Prevent going back to another page
        useRouter().back()
    }
    const get_pictures_details = async (picture_ids: number[]) => {
        await usePostApi<number[], Picture>(false, '/pictures_details', picture_ids)
            .then((data: Picture) => {
                console.log("Picture details:", data);
            })
            .catch((error: ApiError | null) => {
                useToastService().apiError(error, "Unable to fetch picture details");
            })
    }

    // Privave
    const query_components = async () => {
        console.log("Querying components");
        const query = build_query(last_query_components_ids.value, page.value)
        console.log("Built query:", query);
        await fetch(query)
        loading.value = false;
    }
    const fetch = async (query: PicturesQuery) => {
        await usePostApi<PicturesQuery, ListPictureData[]>(false, '/query_pictures', query)
            .then((data: ListPictureData[]) => {
                if(query.page == 1)
                    pictures.value = data;
                else
                    pictures.value = pictures.value.concat(data);
            })
            .catch((error: ApiError | null) => {
                useToastService().apiError(error, "Unable to fetch pictures list");
            })
    }

    return {
        pictures,
        selected_pictures,
        loading,
        last_query_string_names,
        last_query_string_ids,
        last_query_string,
        page,
        query,
        query_more,
        back,
        is_config,
        config_component,
        get_pictures_details,
    }
});
