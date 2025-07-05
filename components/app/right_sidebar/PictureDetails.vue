<script setup lang="ts">
import type {Picture, PictureDetails, Rating} from "~/types/pictures";
import {watch} from "vue";

// Initialize stores
const tagsStore = useTagsStore();
const picturesStore = usePicturesStore();
const userStore = useUserStore();

const isLoading = ref<boolean>(true);
const pictureLoading = ref<boolean>(true);

const picture = ref<Picture | null>(null);
const ratings = ref<Rating[]>([]);
const tags_ids = ref<number[]>([]);

const rating = ref<number | undefined>(4);

const fetchPictureDetails = async (force: boolean = false) => {
  console.log("Fetching picture details");
  if (picturesStore.selected_pictures.length == 1) {
    const picture_id = picturesStore.selected_pictures[0]

    const already_loaded = picture_id == picture.value?.id;
    if (!force && already_loaded) return;

    await useGetApi<PictureDetails>(false, '/picture_details/' + picture_id)
        .then((data: PictureDetails) => {
          if (!already_loaded) {
            isLoading.value = false;
            pictureLoading.value = true;
          }
          picture.value = data.picture;
          ratings.value = data.ratings;
          tags_ids.value = data.tags_ids;
        })
        .catch((error: ApiError | null) => {
          useToastService().apiError(error, "Unable to fetch picture details");
        })
  }
}

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
        return {tag, tag_group: tg.tag_group};
      }
    }
    return null;
  }).filter(Boolean);
});

const showTagSelector = ref(false);
const tagSelectorPosition = ref({x: 0, y: 0});

function openTagSelector(event: MouseEvent) {
  showTagSelector.value = true;
  tagSelectorPosition.value = {x: event.clientX, y: event.clientY};
}

// Add date and geo formatters
function formatDate(date: string | null) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleString();
}

const formatLatLng = (lat: string | null, lng: string | null) => {
  if (!lat || !lng) return '-';
  return `${lat}, ${lng}`;
}

const savePicture = () => {
  if (!picture.value) return;

  // Call your API to save the picture data here
  // Example:
  // await usePutApi(`/pictures/${picture.value.id}`, {
  //   ...picture.value,
  //   // Include any other fields that need to be saved
  // });

  // Optionally show a success message
  // useToast().add({
  //   severity: 'success',
  //   summary: 'Success',
  //   detail: 'Picture saved successfully',
  //   life: 3000
  // });
};

const updatePictureTags = async (tagsToAdd: number[], tagsToRemove: number[]) => {
  if (!picture.value) return;
  const picture_tag_ids = await tagsStore.editPicturesTags(picturesStore.selected_pictures, tagsToAdd, tagsToRemove);
  if (picture_tag_ids !== null) {
    tags_ids.value = picture_tag_ids;
  }
}

watch(picturesStore, () => fetchPictureDetails())
watch(tagsStore, async () => {
  await tagsStore.tags_loaded_promise;
  // When editing tags, a picture can gain a new tag as default or loose a deleted tag, then re-fetch details
  await fetchPictureDetails();
}, {immediate: false});


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

        <Button icon="pi pi-share-alt" aria-label="Share"/>
      </div>
      <div class="mt-2">
        <div class="font-medium mb-0.5">Tags :</div>
        <div class="flex flex-wrap gap-1.5 items-center text-sm">
          <!--          <template v-if="tagsWithGroups.length" v-for="tg in tagsWithGroups" :key="tg?.tag.id">-->
          <!--            <PictureTag v-if="tg" :tag="tg.tag" :tag_group="tg.tag_group" :picture_id="picture.id" @update="() => fetchPictureDetails(true)"/>-->
          <!--          </template>-->

          <!--          <button class="bg-gray-100 rounded-full w-6 h-6 text-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"-->
          <!--                  title="Add tag"-->
          <!--                  @click="openTagSelector($event)">＋-->
          <!--          </button>-->

          <TagSelector
              v-if="picture"
              :picture-tags="tags_ids"
              @update="updatePictureTags"
          />
        </div>
      </div>
      <div class="mt-2">
        <div class="font-medium mb-0.5">Details :</div>
        <ul class="list-none p-0 m-0">
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Owner ID</span> <span>{{
              picture.owner_id
            }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Author ID</span> <span>{{
              picture.author_id
            }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Deleted Date</span>
            <span>{{ formatDate(picture.deleted_date) }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Copied</span>
            <span>{{ picture.copied ? 'Yes' : 'No' }}</span></li>
        </ul>
      </div>
      <div class="mt-2">
        <div class="font-medium mb-0.5">Exif :</div>
        <ul class="attributes-list list-none p-0 m-0">
          <li class="flex gap-2 text-sm  mb-0.5"><span class="min-w-[120px] text-gray-400">Creation Date</span>
            <span>{{ formatDate(picture.creation_date) }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Edition Date</span>
            <span>{{ formatDate(picture.edition_date) }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Latitude, Longitude</span>
            <span>{{ formatLatLng(picture.latitude, picture.longitude) }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Altitude</span>
            <span>{{ picture.altitude !== null ? picture.altitude : '-' }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Orientation</span>
            <span>{{ picture.orientation }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Resolution</span> <span>{{ picture.width }} × {{
              picture.height
            }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Camera Brand</span>
            <span>{{ picture.camera_brand || '-' }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Camera Model</span>
            <span>{{ picture.camera_model || '-' }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Focal Length</span>
            <span>{{ picture.focal_length || '-' }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Exposure Time</span> <span>{{
              picture.exposure_time_num && picture.exposure_time_den ? `${picture.exposure_time_num}/${picture.exposure_time_den}s` : '-'
            }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">ISO</span>
            <span>{{ picture.iso_speed !== null ? picture.iso_speed : '-' }}</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[120px] text-gray-400">Aperture</span>
            <span>{{ picture.f_number || '-' }}</span></li>
        </ul>
      </div>
      <div class="mt-2">
        <div class="font-medium mb-0.5">Exif :</div>
        <ul class="attributes-list list-none p-0 m-0">
          <!--          <li>-->
          <!--            <span>Creation Date</span>-->
          <!--            <DateEditableProp-->
          <!--                v-model="picture.creation_date"-->
          <!--                :show-time="true"-->
          <!--                :nullable="false"-->
          <!--                class="flex-1"-->
          <!--            />-->
          <!--          </li>-->
          <!--          <li>-->
          <!--            <span>Edition Date</span>-->
          <!--            <DateEditableProp-->
          <!--                v-model="picture.edition_date"-->
          <!--                :show-time="true"-->
          <!--                class="flex-1"-->
          <!--            />-->
          <!--          </li>-->
          <!--          <li>-->
          <!--            <span>Location</span>-->
          <!--            <LocationEditableProp-->
          <!--                v-model:latitude="latitude"-->
          <!--                v-model:longitude="longitude"-->
          <!--                @save="savePicture"-->
          <!--                :show-altitude="false"-->
          <!--                class="flex-1"-->
          <!--            />-->
          <!--          </li>-->
          <NumberEditableProp
              title="Altitude"
              v-model="picture.altitude"
              @save="savePicture"
              :suffix="' m'"
              :min="-1000"
              :max="10000"
              :decimal="2"
              class="flex-1"
          />
          <!--          <li>-->
          <!--            <span>Orientation</span>-->
          <!--            <NumberEditableProp-->
          <!--                v-model="picture.orientation"-->
          <!--                @save="savePicture"-->
          <!--                :min="1"-->
          <!--                :max="8"-->
          <!--                :step="1"-->
          <!--                :nullable="false"-->
          <!--                class="flex-1"-->
          <!--            />-->
          <!--          </li>-->
          <li><span>Resolution</span> <span>{{ picture.width }} × {{
              picture.height
            }}</span></li>
          <TextEditableProp
              title="Camera Brand"
              v-model="picture.camera_brand"
              @save="savePicture"
              :nullable="false"
              class="flex-1"
          />
          <TextEditableProp
              title="Camera Model"
              v-model="picture.camera_model"
              @save="savePicture"
              class="flex-1"
          />
          <NumberEditableProp
              title="Focal Length"
              v-model="picture.focal_length"
              @save="savePicture"
              :suffix="' mm'"
              :min="1"
              :max="2000"
              :step="1"
              :decimal="1"
              class="flex-1"
          />
          <!--          <li>-->
          <!--            <span>Exposure Time</span>-->
          <!--            <FractionEditableProp-->
          <!--                v-model:numerator="exposure_time_num"-->
          <!--                v-model:denominator="exposure_time_den"-->
          <!--                :allow-decimal="true"-->
          <!--                :decimal-places="6"-->
          <!--                :suffix="'s'"-->
          <!--                class="flex-1"-->
          <!--            />-->
          <!--          </li>-->
          <NumberEditableProp
              title="ISO"
              v-model="picture.iso_speed"
              @save="savePicture"
              :min="50"
              :max="25600"
              :step="50"
              class="flex-1"
          />
          <NumberEditableProp
              title="Aperture"
              v-model="picture.f_number"
              @save="savePicture"
              :min="1"
              :max="64"
              :step="0.1"
              :decimal="1"
              :prefix="'f/'"
              class="flex-1"
          />
        </ul>
      </div>
    </div>
  </div>
</template>
