import {useDeleteApi, usePatchApi, usePostApi, useGetApi} from "~/composables/fetchApi";
import {useToastService} from "~/composables/useToastService";

interface AllTagsResponse {
    tag_groups: TagGroupWithTags[];
}
export interface TagGroupWithTags {
    tag_group: TagGroup;
    tags: Tag[];
}

interface PatchTagGroupRequest {
    edited_tag_group: TagGroup,
    new_tags: Tag[]
    edited_tags: Tag[],
    deleted_tags_ids: number[],
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
    required: boolean;
}

interface TagIdWithPictureIds {
    tag_id: number;
    picture_ids: number[];
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
            all_tags.value = all_tags.value;

            useToastService().success("Successfully created tag group");
            return true;
        } catch (error) {
            useToastService().apiError(error as ApiError, "Failed to create tag group");
            return false
        }
    }

    /**
     * Edit an existing tag group
     * @param edited_tag_group The tag group with updated values
     * @param new_tags New tags to be added (id is not taken into account)
     * @param edited_tags The tags to update with their new values
     * @param deleted_tags_ids The IDs of the tags to be deleted
     */
    const editTagGroup = async (edited_tag_group: TagGroup, new_tags: Tag[], edited_tags: Tag[], deleted_tags_ids: number[]) => {
        try {
            const patchTagGroup: PatchTagGroupRequest = {
                edited_tag_group,
                new_tags,
                edited_tags,
                deleted_tags_ids
            };
            const response = await usePatchApi<PatchTagGroupRequest, TagGroupWithTags>(false, '/tag_group', patchTagGroup);

            // Update local state
            const index = all_tags.value.findIndex(tg => tg.tag_group.id === response.tag_group.id);
            if (index !== -1) {
                all_tags.value[index] = response;
                all_tags.value = all_tags.value;
            }

            useToastService().success("Successfully updated tag group");
            return true;
        } catch (error) {
            useToastService().apiError(error as ApiError, "Failed to update tag group");
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
                all_tags.value = all_tags.value;
            }

            useToastService().success("Successfully deleted tag group");
            return true;
        } catch (error) {
            useToastService().apiError(error as ApiError, "Failed to delete tag group");
            return false;
        }
    }

    /// PICTURE TAG FUNCTIONS

    /**
     * Add a tag to a list of pictures
     * If the tag is not multiple, any picture already having a tag of the same tag group will lose the old tag in favor of the new one.
     * @param tagId The ID of the tag to add
     * @param pictureIds The IDs of the pictures to add the tag to
     */
    const addTagToPictures = async (tagId: number, pictureIds: number[]): Promise<boolean> => {
        try {
            const payload: TagIdWithPictureIds = {
                tag_id: tagId,
                picture_ids: pictureIds
            };
            await usePostApi<TagIdWithPictureIds, void>(false, '/add_tag_to_picture', payload);
            useToastService().success("Successfully added tag to pictures");
            return true;
        } catch (error) {
            useToastService().apiError(error as ApiError, "Failed to add tag to pictures");
            return false;
        }
    }

    /**
     * Remove a tag from a list of pictures
     * If the tag is required, the picture will be tagged with the default tag of the tag group.
     * @param tagId The ID of the tag to remove
     * @param pictureIds The IDs of the pictures to remove the tag from
     */
    const removeTagFromPictures = async (tagId: number, pictureIds: number[]): Promise<boolean> => {
        try {
            const payload: TagIdWithPictureIds = {
                tag_id: tagId,
                picture_ids: pictureIds
            };
            await useDeleteApi<TagIdWithPictureIds, void>(false, '/remove_tag_from_picture', payload);
            useToastService().success("Successfully removed tag from pictures");
            return true;
        } catch (error) {
            useToastService().apiError(error as ApiError, "Failed to remove tag from pictures");
            return false;
        }
    }

    const editPicturesTags = async (picturesIds: number[], add_tag_ids: number[], remove_tag_ids: number[]): Promise<number[] | null> => {
        try {
            const payload = {
                picture_ids: picturesIds,
                add_tag_ids: add_tag_ids,
                remove_tag_ids: remove_tag_ids
            };
            let picture_tag_ids = await usePatchApi<{ picture_ids: number[], add_tag_ids: number[], remove_tag_ids: number[] }, number[]>(false, '/picture_tags', payload);
            useToastService().success("Successfully edited pictures tags");
            return picture_tag_ids;
        } catch (error) {
            useToastService().apiError(error as ApiError, "Failed to edit pictures tags");
            return null;
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
        editTagGroup,
        deleteTagGroup,
        // Picture tag functions
        addTagToPictures,
        removeTagFromPictures,
        editPicturesTags,
        // Conversion functions
        tagIdToTagName,
        tagGroupIdToTagGroupName,
        tagGroupIdAndTagNameToTagId,
        tagGroupNameToTagGroupId,
    }

})
