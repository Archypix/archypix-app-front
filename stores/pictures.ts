// Type definition for pictures query

import type {QueryComponent} from "~/composables/queryStrings";
import {defineStore} from "pinia";
import type {ListPictureData, Picture, PicturesQuery} from "~/types/pictures";
import {useInitializeStore} from "~/composables/useInitializeStore";

export const usePicturesStore = defineStore('pictures', () => {

    const pictures = ref<ListPictureData[]>([])
    const selected_pictures = ref<number[]>([])
    const selected_picture = ref<number | null>(null)
    const loading = ref<boolean>(false)

    // Stores the last query using either names or ids or the original version
    const last_query_components_ids = ref<QueryComponent[]>([])
    const last_query_string_names = ref<string>('')
    const last_query_string_ids = ref<string>('')
    const last_query_string = ref<string>('')
    const page = ref<number>(1)

    const route = useRoute();

    /**
     * Return true if the last_query is a config query (should open a config pane instead of a picture list)
     */
    const is_config = computed(() => {
        return last_query_components_ids.value.some(c => c.key == 'config');
    })
    const config_component = computed(() => {
        if (is_config) {
            return last_query_components_ids.value.find(c => c.key == 'config');
        }
        return null;
    })

    // Public
    const clear_selection = () => {
        selected_pictures.value = [];
        selected_picture.value = null;
    }
    const select = (picture_id: number) => {
        if (selected_pictures.value.length == 1 && selected_picture.value === picture_id) {
            selected_picture.value = null
            selected_pictures.value = []
        } else {
            selected_picture.value = picture_id
            selected_pictures.value = [picture_id]
        }
    }
    const select_toggle = (picture_id: number) => {
        if (selected_pictures.value.includes(picture_id)) {
            selected_pictures.value = selected_pictures.value.filter(id => id != picture_id)
            if (selected_picture.value === picture_id) {
                selected_picture.value = selected_pictures.value.at(-1) || null
            }
        } else {
            selected_picture.value = picture_id
            selected_pictures.value.push(picture_id)
        }
    }
    const select_to = (picture_id: number) => {
        // Selects from selected_picture to picture_id, unselecting any already selected pictures in the other direction

        // Find the index of selected_picture and of picture_id
        const selected_picture_index = pictures.value.findIndex(p => p.id == selected_picture.value);
        const picture_id_index = pictures.value.findIndex(p => p.id == picture_id);
        const min_index = Math.min(selected_picture_index, picture_id_index);
        const max_index = Math.max(selected_picture_index, picture_id_index);

        // Unselect any pictures in the selected list till reaching selected_picture (any selected picture with this function)
        selected_pictures.value = selected_pictures.value
            .slice(0, selected_picture_index)
            .concat(pictures.value.slice(min_index, max_index + 1).map(p => p.id))
    }
    const select_all = () => {
        selected_pictures.value = pictures.value.map(p => p.id)
        selected_picture.value = selected_pictures.value.at(-1) || null
    }
    const query_more = async () => {
        if (is_config)
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

        clear_selection();
        await useRouter().push({query: {q: last_query_string_ids.value}});
        if (!is_config.value) {
            await query_components()
        }
    }
    const back = async () => {
        // TODO: Prevent going back to another website
        clear_selection();
        useRouter().back()
    }
    const get_pictures_details = async (picture_ids: number[]) => {
        await postApi<number[], Picture>('/pictures_details', picture_ids)
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
        await postApi<PicturesQuery, ListPictureData[]>('/query_pictures', query)
            .then((data: ListPictureData[]) => {
                if (query.page == 1)
                    pictures.value = data;
                else
                    pictures.value = pictures.value.concat(data);
            })
            .catch((error: ApiError | null) => {
                useToastService().apiError(error, "Unable to fetch pictures list");
            })
    }

    // Initialize & update when url changes
    const checkUpdateRoute = () => {
        const q = route.query.q?.toString();
        if (q && q != last_query_string_ids.value) {
            page.value = 1;
            let _ = query(q)
        }
    }
    watch(route, checkUpdateRoute)
    const _promise = useInitializeStore(checkUpdateRoute);

    return {
        pictures,
        selected_picture,
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

        select,
        select_toggle,
        select_to,
        select_all,
        clear_selection
    }
});
