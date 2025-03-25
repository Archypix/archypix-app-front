interface AllTagsResponse {
    tag_groups: TagGroupWithTags[];
}

export interface TagGroupWithTags {
    tag_group: TagGroup;
    tags: Tag[];
}

export interface Tag {
    id: number;
    tag_group_id: number;
    name: string;
    color: number[];
    is_default: boolean;
}

export interface TagGroup {
    id: number;
    user_id: number;
    name: string;
    multiple: boolean;
    default_tag_id?: number;
    required: boolean;
}


export const useTagsStore = defineStore('tags', () => {

    const all_tags = ref<TagGroupWithTags[]>([])

    let tagsLoaded: Promise<void>;
    let resolveTagsLoaded: () => void;
    tagsLoaded = new Promise((resolve) => {
        resolveTagsLoaded = resolve;
    });


    const fetch_tags = () => {
        useGetApi<AllTagsResponse>(false, '/tags')
            .then((res) => {
                all_tags.value = res.tag_groups
                resolveTagsLoaded();
            })
            .catch((error: ApiError | null) => {
                useToastService().apiError(error, "Unable to fetch tags");
            })
    }

    onMounted(() => {
        fetch_tags();
    });

    const tagIdToTagName = async (tag_id: number): Promise<string | null> => {
        await tagsLoaded;
        for (const tag_group of all_tags.value) {
            for (const tag of tag_group.tags) {
                if (tag.id === tag_id) {
                    return tag.name;
                }
            }
        }
        return null;
    }
    const tagGroupIdToTagGroupName = async (tag_group_id: number): Promise<string | null> => {
        await tagsLoaded;
        for (const tag_group of all_tags.value) {
            if (tag_group.tag_group.id === tag_group_id) {
                return tag_group.tag_group.name;
            }
        }
        return null;
    }
    const tagGroupIdAndTagNameToTagId = async (tag_group_id: number, tag_name: string): Promise<number | null> => {
        await tagsLoaded;
        for (const tag_group of all_tags.value) {
            if (tag_group.tag_group.id === tag_group_id) {
                for (const tag of tag_group.tags) {
                    if (tag.name.toLowerCase() === tag_name.toLowerCase()) {
                        return tag.id;
                    }
                }
            }
        }
        return null;
    }
    const tagGroupNameToTagGroupId = async (tag_group_name: string): Promise<number | null> => {
        await tagsLoaded;
        for (const tag_group of all_tags.value) {
            if (tag_group.tag_group.name.toLowerCase() === tag_group_name.toLowerCase()) {
                return tag_group.tag_group.id;
            }
        }
        return null;
    }

    return {
        all_tags,
        tagIdToTagName,
        tagGroupIdToTagGroupName,
        tagGroupIdAndTagNameToTagId,
        tagGroupNameToTagGroupId
    }

})
