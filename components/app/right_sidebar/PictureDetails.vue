<script setup lang="ts">
import type {Picture, PictureDetails} from "~/stores/pictures";

const tagsStore = useTagsStore();
const picturesStore = usePicturesStore();
const userStore = useUserStore();

const isLoading = ref<boolean>(true);
const pictureLoading = ref<boolean>(true);

const picture = ref<Picture | null>(null);
const ratings = ref<Rating[]>([]);
const tags_ids = ref<number[]>([]);

const rating = ref<number | undefined>(4);

const userRating = computed(() => {
  if (!ratings.value || !userStore.id) return null;
  const r = ratings.value.find(r => r.user_id === Number(userStore.id));
  return r ? r.rating : null;
});

watch(userRating, () => {
  rating.value = userRating.value || undefined;
})

const tagsWithGroups = computed(() => {
  if (!tags_ids.value || !tagsStore.all_tags?.length) return [];
  // For each tag_id, find the tag and its group
  return tags_ids.value.map(tag_id => {
    for (const tg of tagsStore.all_tags) {
      const tag = tg.tags.find(t => t.id === tag_id);
      if (tag) {
        return { tag, tag_group: tg.tag_group };
      }
    }
    return null;
  }).filter(Boolean);
});

// Add date and geo formatters
function formatDate(date: string | null) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleString();
}
function formatLatLng(lat: string | null, lng: string | null) {
  if (!lat || !lng) return '-';
  return `${lat}, ${lng}`;
}

watch(picturesStore, async () => {
  if (picturesStore.selected_pictures.length == 1) {
    const picture_id = picturesStore.selected_pictures[0]

    if (picture_id == picture.value?.id) return;

    await useGetApi<PictureDetails>(false, '/picture_details/' + picture_id)
        .then((data: PictureDetails) => {
          isLoading.value = false;
          pictureLoading.value = true;
          picture.value = data.picture;
          ratings.value = data.ratings;
          tags_ids.value = data.tags_ids;
        })
        .catch((error: ApiError | null) => {
          useToastService().apiError(error, "Unable to fetch picture details");
        })
  }
})


</script>

<template>
  <div class="flex flex-col items-stretch p-2 mx-auto font-sans" v-if="picture">
    <div class="w-full">
      <Picture :picture="picture" :visible="true" v-model:loading="pictureLoading"/>
    </div>
    <div class="flex flex-col gap-2 p-2">
      <div class="inline-flex items-baseline gap-2 justify-between font-medium text-lg">
        <span>{{ picture.name }}</span>
        <span class="text-gray-500">{{ picture.size_ko < 1000 ? picture.size_ko + ' Ko' : (picture.size_ko / 1000).toFixed(1) + ' Mo' }}</span>
      </div>
      <div class="text-gray-500 italic text-base">{{ picture.comment }}</div>
      <div class="flex items-center justify-between gap-3">
        <Rating v-model="rating" class="text-yellow-400">
          <template #onicon>
            <i class="pi pi-star-fill text-xl"></i>
          </template>
          <template #officon>
            <i class="pi pi-star text-xl"></i>
          </template>
        </Rating>

        <Button icon="pi pi-share-alt" aria-label="Share" />
      </div>
      <div class="mt-2">
        <div class="font-medium mb-0.5">Tags :</div>
        <div class="flex flex-wrap gap-1.5 items-center text-sm">
          <template v-if="tagsWithGroups.length" v-for="tg in tagsWithGroups" :key="tg?.tag.id">
            <PictureTag v-if="tg" :tag="tg.tag" :tag_group="tg.tag_group"/>
          </template>

          <button class="bg-gray-100 rounded-full w-6 h-6 text-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
                  title="Add tag">＋
          </button>
        </div>
      </div>
      <div class="mt-2">
        <div class="font-medium mb-0.5">Details :</div>
        <ul class="list-none p-0 m-0">
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Owner ID</span> <span>{{ picture.owner_id }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Author ID</span> <span>{{ picture.author_id }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Deleted Date</span> <span>{{ formatDate(picture.deleted_date) }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Copied</span> <span>{{ picture.copied ? 'Yes' : 'No' }}</span></li>
        </ul>
      </div>
      <div class="mt-2">
        <div class="font-medium mb-0.5">Exif :</div>
        <ul class="list-none p-0 m-0">
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Creation Date</span> <span>{{ formatDate(picture.creation_date) }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Edition Date</span> <span>{{ formatDate(picture.edition_date) }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Latitude, Longitude</span> <span>{{ formatLatLng(picture.latitude, picture.longitude) }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Altitude</span> <span>{{ picture.altitude !== null ? picture.altitude : '-' }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Orientation</span> <span>{{ picture.orientation }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Resolution</span> <span>{{ picture.width }} × {{ picture.height }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Camera Brand</span> <span>{{ picture.camera_brand || '-' }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Camera Model</span> <span>{{ picture.camera_model || '-' }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Focal Length</span> <span>{{ picture.focal_length || '-' }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Exposure Time</span> <span>{{ picture.exposure_time_num && picture.exposure_time_den ? `${picture.exposure_time_num}/${picture.exposure_time_den}s` : '-' }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">ISO</span> <span>{{ picture.iso_speed !== null ? picture.iso_speed : '-' }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Aperture</span> <span>{{ picture.f_number || '-' }}</span></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
</style>
