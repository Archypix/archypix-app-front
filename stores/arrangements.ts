import {defineStore} from 'pinia';
import type {ArrangementRequest, ArrangementResponse} from '~/types/arrangements';
import {useToastService} from '~/composables/useToastService';
import {useDeleteApi, useGetApi, usePatchApi, usePostApi} from '~/composables/fetchApi';

export const useArrangementsStore = defineStore('arrangements', () => {
    const arrangements = ref<ArrangementResponse[]>([]);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    // Promise that resolves when arrangements are loaded
    let arrangementsLoadedPromise: Promise<void>;
    let resolveArrangementsLoaded: () => void;
    arrangementsLoadedPromise = new Promise((resolve) => {
        resolveArrangementsLoaded = resolve;
    });

    /**
     * List all user's arrangements
     * GET /arrangement
     */
    const fetchArrangements = async (): Promise<void> => {

        loading.value = true;
        error.value = null;

        try {
            const data = await useGetApi<ArrangementResponse[]>(false, '/arrangement');
            if (data) {
                arrangements.value = data;
                resolveArrangementsLoaded();
            }
        } catch (err) {
            useToastService().apiError(err as ApiError, 'Failed to fetch arrangements');
            throw err;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Create a new arrangement
     * POST /arrangement
     * @param arrangement The arrangement data to create
     */
    const createArrangement = async (arrangement: ArrangementRequest): Promise<ArrangementResponse | undefined> => {
        loading.value = true;
        error.value = null;

        try {
            const response = await usePostApi<ArrangementRequest, ArrangementResponse>(
                false,
                '/arrangement',
                arrangement
            );

            if (response) {
                arrangements.value.push(response);
                useToastService().success('Arrangement created successfully');
                return response;
            }
        } catch (err) {
            useToastService().apiError(err as ApiError, 'Failed to create arrangement');
            throw err;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Edit an arrangement
     * PATCH /arrangement/:arrangement_id
     * @param arrangementId The ID of the arrangement to update
     * @param updates The fields to update
     */
    const updateArrangement = async (
        arrangementId: number,
        updates: Partial<ArrangementRequest>
    ): Promise<ArrangementResponse | undefined> => {
        loading.value = true;
        error.value = null;

        try {
            const response = await usePatchApi<Partial<ArrangementRequest>, ArrangementResponse>(
                false,
                `/arrangement/${arrangementId}`,
                updates
            );

            if (response) {
                // Update the arrangement in the list
                const index = arrangements.value.findIndex(a => a.arrangement.id === arrangementId);
                if (index !== -1) {
                    arrangements.value[index] = response;
                }

                useToastService().success('Arrangement updated successfully');
                return response;
            }
        } catch (err) {
            useToastService().apiError(err as ApiError, 'Failed to update arrangement');
            throw err;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Delete an arrangement
     * DELETE /arrangement/:arrangement_id
     * @param arrangementId The ID of the arrangement to delete
     */
    const deleteArrangement = async (arrangementId: number): Promise<boolean> => {
        loading.value = true;
        error.value = null;

        try {
            await useDeleteApi<void, void>(false, `/arrangement/${arrangementId}`, undefined);

            // Remove the arrangement from the list
            arrangements.value = arrangements.value.filter(a => a.arrangement.id !== arrangementId);

            useToastService().success('Arrangement deleted successfully');
            return true;
        } catch (err) {
            useToastService().apiError(err as ApiError, 'Failed to delete arrangement');
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Initialize fetching arrangements when store is created
    onMounted(async () => {
        await fetchArrangements();
    });

    // CONVERSION FUNCTIONS
    
    /**
     * Get arrangement name by ID
     * @param arrangementId The ID of the arrangement
     * @returns The name of the arrangement or null if not found
     */
    const arrangementIdToName = async (arrangementId: number): Promise<string | null> => {
        await arrangementsLoadedPromise;
        const arrangement = arrangements.value.find(a => a.arrangement.id === arrangementId);
        return arrangement?.arrangement.name || null;
    };

    /**
     * Get arrangement ID by name
     * @param name The name of the arrangement
     * @returns The ID of the arrangement or null if not found
     */
    const arrangementNameToId = async (name: string): Promise<number | null> => {
        await arrangementsLoadedPromise;
        const arrangement = arrangements.value.find(
            a => a.arrangement.name.toLowerCase() === name.toLowerCase()
        );
        return arrangement?.arrangement.id ?? null;
    };

    /**
     * Get group name by group ID
     * @param groupId The ID of the group
     * @returns The name of the group or null if not found
     */
    const groupIdToGroupName = async (groupId: number): Promise<string | null> => {
        await arrangementsLoadedPromise;
        for (const arrangement of arrangements.value) {
            const group = [...arrangement.groups, ...arrangement.to_be_deleted_groups].find(
                g => g.id === groupId
            );
            if (group) return group.name;
        }
        return null;
    };

    /**
     * Get group ID by group name within an arrangement
     * @param arrangementId The ID of the arrangement
     * @param groupName The name of the group
     * @returns The ID of the group or null if not found
     */
    const groupNameToGroupId = async (arrangementId: number, groupName: string): Promise<number | null> => {
        await arrangementsLoadedPromise;
        const arrangement = arrangements.value.find(a => a.arrangement.id === arrangementId);
        if (!arrangement) return null;
        
        const allGroups = [...arrangement.groups, ...arrangement.to_be_deleted_groups];
        const group = allGroups.find(
            g => g.name.toLowerCase() === groupName.toLowerCase()
        );
        return group?.id ?? null;
    };

    /**
     * Get group by ID across all arrangements
     * @param groupId The ID of the group to find
     * @returns The group object or null if not found
     */
    const getGroupById = async (groupId: number) => {
        await arrangementsLoadedPromise;
        for (const arrangement of arrangements.value) {
            const allGroups = [...arrangement.groups, ...arrangement.to_be_deleted_groups];
            const group = allGroups.find(g => g.id === groupId);
            if (group) {
                return {
                    group,
                    arrangement: arrangement.arrangement
                };
            }
        }
        return null;
    };

    return {
        // State
        arrangements,
        loading,
        error,
        arrangementsLoadedPromise,

        // Actions
        fetchArrangements,
        createArrangement,
        updateArrangement,
        deleteArrangement,
        
        // Conversion functions
        arrangementIdToName,
        arrangementNameToId,
        groupIdToGroupName,
        groupNameToGroupId,
        getGroupById,

        // Reset store
        $reset: () => {
            arrangements.value = [];
            loading.value = false;
            error.value = null;
        }
    };
});
