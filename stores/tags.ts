import {useDeleteApi, usePatchApi} from "~/composables/fetchApi";

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

    let tags_loaded_promise: Promise<void>;
    let resolveTagsLoaded: () => void;
    tags_loaded_promise = new Promise((resolve) => {
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

    /// EDITING FUNCTIONS

    /**
     * Create a new tag group with its tags
     * @param tagGroup The tag group to create
     * @param tags The tags to create within the tag group
     */
    const createTagGroup = async (tagGroup: Omit<TagGroup, 'id' | 'user_id'>, tags: Omit<Tag, 'id' | 'tag_group_id'>[]) => {
        const payload: TagGroupWithTags = {
            tag_group: {
                ...tagGroup,
                id: 0,  // Backend will generate this
                user_id: 0,     // Backend will set this from authenticated user
            },
            tags: tags.map(tag => ({
                ...tag,
                id: 0,           // Backend will generate this
                tag_group_id: 0, // Backend will set this after tag group creation
            }))
        };

        try {
            const response = await usePostApi<TagGroupWithTags, TagGroupWithTags>(false, '/tag_group', payload);

            // Update local state
            all_tags.value.push(response);

            return true;
        } catch (error) {
            useToastService().apiError(error as ApiError, "Failed to create tag group");
            return false
        }
    }

    /**
     * Create a new tag within an existing tag group
     * @param tag The tag to create
     */
    const createTag = async (tag: Tag) => {
        try {
            const response = await usePostApi<Tag, Tag>(false, '/tag', tag);

            // Update local state
            const index = all_tags.value.findIndex(tg => tg.tag_group.id === tag.tag_group_id);
            if (index !== -1) {
                all_tags.value[index].tags.push(response);
            }

            return true;
        } catch (error) {
            useToastService().apiError(error as ApiError, "Failed to create tag");
            return false;
        }
    }

    /**
     * Edit an existing tag group
     * @param tagGroup The tag group with updated values
     */
    const editTagGroup = async (tagGroup: TagGroup) => {
        try {
            const response = await usePatchApi<TagGroup, TagGroup>(false, '/tag_group', tagGroup);

            // Update local state
            const index = all_tags.value.findIndex(tg => tg.tag_group.id === tagGroup.id);
            if (index !== -1) {
                all_tags.value[index].tag_group = response;
            }

            return true;
        } catch (error) {
            useToastService().apiError(error as ApiError, "Failed to update tag group");
            return false;
        }
    }

    /**
     * Edit an existing tag
     * @param tag The tag with updated values
     */
    const editTag = async (tag: Tag) => {
        try {
            const response = await usePatchApi<Tag, Tag>(false, '/tag', tag);

            // Update local state
            const tagGroupIndex = all_tags.value.findIndex(tg => tg.tag_group.id === tag.tag_group_id);
            if (tagGroupIndex !== -1) {
                const tagIndex = all_tags.value[tagGroupIndex].tags.findIndex(t => t.id === tag.id);
                if (tagIndex !== -1) {
                    all_tags.value[tagGroupIndex].tags[tagIndex] = response;
                }
            }
            return true;
        } catch (error) {
            useToastService().apiError(error as ApiError, "Failed to update tag");
            return false;
        }
    }

    /**
     * Delete a tag
     * @param tagId The ID of the tag to delete
     */
    const deleteTag = async (tagId: number) => {
        try {
            await useDeleteApi(false, '/tag', { id: tagId });

            // Update local state
            for (let i = 0; i < all_tags.value.length; i++) {
                const tagIndex = all_tags.value[i].tags.findIndex(tag => tag.id === tagId);
                if (tagIndex !== -1) {
                    // If this tag was the default tag for its group, clear the default_tag_id
                    if (all_tags.value[i].tag_group.default_tag_id === tagId) {
                        all_tags.value[i].tag_group.default_tag_id = undefined;
                    }

                    // Remove the tag from the array
                    all_tags.value[i].tags.splice(tagIndex, 1);
                    break;
                }
            }

            return true;
        } catch (error) {
            useToastService().apiError(error as ApiError, "Failed to delete tag");
            return false;
        }
    }

    /**
     * Delete a tag group and all its tags
     * @param tagGroupId The ID of the tag group to delete
     */
    const deleteTagGroup = async (tagGroupId: number) => {
        try {
            await useDeleteApi(false, '/tag_group', { id: tagGroupId });

            // Update local state
            const index = all_tags.value.findIndex(tg => tg.tag_group.id === tagGroupId);
            if (index !== -1) {
                all_tags.value.splice(index, 1);
            }

            return true;
        } catch (error) {
            useToastService().apiError(error as ApiError, "Failed to delete tag group");
            return false;
        }
    }

    /// CONVERSION FUNCTIONS

    const tagIdToTagName = async (tag_id: number): Promise<string | null> => {
        await tags_loaded_promise;
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
        if (tag_group_id == 0) return 'create_new';
        await tags_loaded_promise;
        for (const tag_group of all_tags.value) {
            if (tag_group.tag_group.id === tag_group_id) {
                return tag_group.tag_group.name;
            }
        }
        return null;
    }
    const tagGroupIdAndTagNameToTagId = async (tag_group_id: number, tag_name: string): Promise<number | null> => {
        await tags_loaded_promise;
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
        await tags_loaded_promise;
        for (const tag_group of all_tags.value) {
            if (tag_group.tag_group.name.toLowerCase() === tag_group_name.toLowerCase()) {
                return tag_group.tag_group.id;
            }
        }
        if (tag_group_name === 'create_new') {
            return 0;
        }
        return null;
    }

    return {
        all_tags,
        tags_loaded_promise,
        // Editing functions
        createTagGroup,
        createTag,
        editTagGroup,
        editTag,
        deleteTag,
        deleteTagGroup,
        // Conversion functions
        tagIdToTagName,
        tagGroupIdToTagGroupName,
        tagGroupIdAndTagNameToTagId,
        tagGroupNameToTagGroupId
    }

})
