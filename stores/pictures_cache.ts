import {defineStore} from "pinia";
import type {ApiError} from "~/composables/fetchApi";
import {useToastService} from "~/composables/useToastService";

// Maximum number of loaded pictures at the same time for each size.
// The limit only applies to pictures with a reference count of 0.
const cache_limit = {
    0: 0, // Original
    1: 500, // Small
    2: 100, // Medium
    3: 10, // Large
}

export enum PictureThumbnail {
    Original = 0,
    Small = 1,
    Medium = 2,
    Large = 3,
}

export interface Sizes {
    [key: number]: [number, string]
}

export const usePicturesCacheStore = defineStore('pictures_cache', () => {

    // Mapping: picture_id -> size -> [reference count, url]
    const loaded_pictures_urls: Map<number, Sizes> = new Map();

    const reactive_loaded_pictures_urls = ref<Map<number, Sizes>>(new Map());

    // Mapping: size -> count of picture urls loaded for that size
    const cache_size_count: Record<PictureThumbnail, number> = {0: 0, 1: 0, 2: 0, 3: 0};

    const revokeUrl = (picture_id: number, size: PictureThumbnail) => {
        if (loaded_pictures_urls.has(picture_id)) {
            const sizes = loaded_pictures_urls.get(picture_id);
            if (sizes?.[size]) {
                URL.revokeObjectURL(sizes[size][1]);
                delete sizes[size];
                cache_size_count[size]--;
                if (Object.keys(sizes).length === 0) {
                    loaded_pictures_urls.delete(picture_id);
                }
            }
        }
    }
    const garbageCollectUrls = (size: PictureThumbnail) => {
        let target_delete_count = cache_size_count[size] - cache_limit[size];
        let to_delete: number[] = [];

        for (const [picture_id, sizes] of loaded_pictures_urls.entries()) {
            if (sizes[size]?.[0] === 0) { // Only consider urls with a reference count of 0
                to_delete.push(Number(picture_id));
            }
            if (to_delete.length >= target_delete_count) {
                break;
            }
        }
        to_delete.forEach(picture_id => {
            revokeUrl(picture_id, size);
        })
    }
    const getPictureUrl = async (picture_id: number, size: PictureThumbnail, still_wanted: () => boolean = () => true) => {
        return new Promise(async (resolve: (data: string) => void, reject: () => void) => {
            const sizes = loaded_pictures_urls.get(picture_id);
            if (sizes !== undefined && sizes[size]?.[0] >= 0) {
                sizes[size][0]++;
                resolve(sizes[size][1]);
                return;
            }
            getApi<Blob>('/picture/' + picture_id + '/' + size)
                .then(response => {
                    if (response && still_wanted()) {
                        const sizes = loaded_pictures_urls.get(picture_id);
                        if (sizes !== undefined && sizes[size]?.[0] > 0) {
                            sizes[size][0]++;
                            resolve(sizes[size][1]);
                        } else {
                            const url = URL.createObjectURL(response);
                            if (sizes !== undefined) {
                                sizes[size] = [1, url];
                            } else {
                                loaded_pictures_urls.set(picture_id, {
                                    [size]: [1, url]
                                });
                            }
                            cache_size_count[size]++;
                            if (cache_size_count[size] > cache_limit[size] + 10) {
                                garbageCollectUrls(size);
                            }
                            reactive_loaded_pictures_urls.value = new Map(loaded_pictures_urls);
                            resolve(url);
                        }
                    } else {
                        reject();
                    }
                })
                .catch((error: ApiError | null) => {
                    useToastService().apiError(error, "Unable to fetch picture " + picture_id + " with size " + size);
                    reject();
                });
        });
    }
    const releasePictureUrl = (picture_id: number, size: PictureThumbnail) => {
        let sizes = loaded_pictures_urls.get(picture_id);
        if (sizes !== undefined && sizes[size]?.[0] >= 0) {
            if (sizes[size][0] >= 1) {
                sizes[size][0]--;
            }
            // It is always the garbage collector that revokes the URL, to always remove the oldest URL.
            // Except if the limit is <= 1, in which case the garbage collector is useless.
            if (sizes[size][0] == 0 && cache_size_count[size] <= 1) {
                revokeUrl(picture_id, size);
            }
        }
        reactive_loaded_pictures_urls.value = new Map(loaded_pictures_urls);
    }

    return {
        getPictureUrl,
        releasePictureUrl,
        reactive_loaded_pictures_urls
    }
});
