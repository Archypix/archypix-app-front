<script setup lang="ts">
import {
  type MixedPicture,
  type MixedPictureDetails,
  type PictureDetails,
  type PicturesDetailsRequest,
  type Rating,
  toMixedPicture
} from "~/types/pictures";
import {watch} from "vue";
import {formatDateToTimeString} from "~/composables/formatUtils";

// Initialize stores
const tagsStore = useTagsStore();
const picturesStore = usePicturesStore();
const userStore = useUserStore();

const isLoading = ref<boolean>(true);
const pictureLoading = ref<boolean>(true);

const picture_ids = ref<number[]>([]);
const picture = ref<MixedPicture | null>(null);
const editedPicture = ref<MixedPicture | null>(null);


const common_tags_ids = ref<number[]>([]);
const mixed_tags_ids = ref<number[]>([]);

const rating = ref<number | undefined>(4);

// Only for single pictures
const ratings = ref<Rating[]>([]);

// Only for mixed pictures
// id of the friend users having rated the pictures
const ratings_user_ids = ref<number[]>([]);
const average_global_rating = ref<number | undefined>(undefined);

const is_mixed = computed(() => {
  return picture_ids.value.length > 1;
});


const fetchPictureDetails = async (force: boolean = false) => {
  console.log("Fetching picture details");
  if (picturesStore.selected_pictures.length == 1) {
    const picture_id = picturesStore.selected_pictures[0]

    const already_loaded = picture_id == picture_ids.value[0];
    if (!force && already_loaded) return;

    await getApi<PictureDetails>('/picture_details/' + picture_id)
        .then((data: PictureDetails) => {
          picture_ids.value = [data.picture.id];
          picture.value = toMixedPicture(data.picture);
          editedPicture.value = toMixedPicture(structuredClone(data.picture));
          ratings.value = data.ratings;
          common_tags_ids.value = data.tags_ids;
          mixed_tags_ids.value = [];
          if (!already_loaded) {
            isLoading.value = false;
            pictureLoading.value = true;
          }
        })
        .catch((error: ApiError | null) => {
          useToastService().apiError(error, "Unable to fetch picture details");
        })
  } else {
    const new_picture_ids = picturesStore.selected_pictures;
    const already_loaded = new_picture_ids == picture_ids.value;
    if (!force && already_loaded) return;

    await postApi<PicturesDetailsRequest, MixedPictureDetails>('/pictures_details', {picture_ids: new_picture_ids})
        .then((data: MixedPictureDetails) => {
          picture.value = data.pictures;
          editedPicture.value = structuredClone(data.pictures);
          common_tags_ids.value = data.common_tags_ids;
          mixed_tags_ids.value = data.mixed_tags_ids;
          ratings_user_ids.value = data.rating_users;
          rating.value = data.average_user_rating;
          average_global_rating.value = data.average_global_rating;
          if (!already_loaded) {
            isLoading.value = false;
            pictureLoading.value = true;
          }
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

const showTagSelector = ref(false);
const tagSelectorPosition = ref({x: 0, y: 0});

function openTagSelector(event: MouseEvent) {
  showTagSelector.value = true;
  tagSelectorPosition.value = {x: event.clientX, y: event.clientY};
}

// Add date and geo formatters
function formatDate(date: string | null | undefined) {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  return d.toLocaleString();
}

const savePicture = () => {
  if (!editedPicture.value) return;

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
    common_tags_ids.value = picture_tag_ids;
    mixed_tags_ids.value = [];
  }
}

watch(picturesStore, () => fetchPictureDetails(), {immediate: true});
watch(tagsStore, async () => {
  await tagsStore.tags_loaded_promise;
  // When editing tags, a picture can gain a new tag as default or loose a deleted tag, then re-fetch details
  await fetchPictureDetails();
}, {immediate: false});


const original_focal_length = computed(() => {
  return picture.value?.focal_length ? parseFloat(picture.value.focal_length) ?? null : null;
})
const focal_length = computed({
  get: () => editedPicture.value?.focal_length ? parseFloat(editedPicture.value.focal_length) ?? null : null,
  set: (value: number | null) => {
    if (!editedPicture.value) return;
    editedPicture.value.focal_length = value?.toFixed(2) ?? null;
  }
})
const original_f_number = computed(() => {
  return picture.value?.f_number ? parseFloat(picture.value.f_number) || null : null;
})
const f_number = computed({
  get: () => editedPicture.value?.f_number ? parseFloat(editedPicture.value.f_number) || null : null,
  set: (value: number | null) => {
    if (!editedPicture.value) return;
    editedPicture.value.f_number = value?.toFixed(1) ?? null;
  }
})
const original_latitude = computed(() => {
  return picture.value?.latitude ? parseFloat(picture.value.latitude) ?? null : null;
})
const latitude = computed({
  get: () => editedPicture.value?.latitude ? parseFloat(editedPicture.value.latitude) ?? null : null,
  set: (value: number | null) => {
    if (!editedPicture.value) return;
    editedPicture.value.latitude = value?.toFixed(6) || null;
  }
})
const original_longitude = computed(() => {
  return picture.value?.longitude ? parseFloat(picture.value.longitude) ?? null : null;
})
const longitude = computed({
  get: () => editedPicture.value?.longitude ? parseFloat(editedPicture.value.longitude) ?? null : null,
  set: (value: number | null) => {
    if (!editedPicture.value) return;
    editedPicture.value.longitude = value?.toFixed(6) || null;
  }
})
const altitude = computed({
  get: () => editedPicture.value?.altitude ? editedPicture.value.altitude ?? null : null,
  set: (value: number | null) => {
    if (!editedPicture.value) return;
    editedPicture.value.altitude = value != null ? value : null;
  }
})

const pictureWidth = computed(() => {
  if (!editedPicture.value || !editedPicture.value.width || !editedPicture.value.height) return "";
  let h = 250;
  let w = h * editedPicture.value.width / editedPicture.value.height;
  return `max-width: ${w}px`;
});

const resolutionDisplayValue = computed(() => {
  if(picture.value?.width === null || picture.value?.height === null) {
    return null;
  }else if(picture.value?.width === undefined || picture.value?.height === undefined) {
    return undefined;
  }else{
    return picture.value.width + ' × ' + picture.value.height;
  }
})

</script>

<template>
  <div class="flex flex-col items-stretch p-2 mx-auto font-sans" v-if="picture && editedPicture">
    <div class="flex justify-center w-full">
      <div class="mb-2 grow" :style="pictureWidth">
        <Picture :picture="editedPicture" :visible="true" v-model:loading="pictureLoading"/>
      </div>
    </div>
    <div class="flex flex-col gap-2 p-2">
      <div class="flex flex-col gap-0.5">
        <div class="inline-flex items-baseline gap-2 justify-between font-medium text-lg">
          <span>{{ picture.name }}</span>
          <span class="text-gray-500">{{
              picture.total_size_ko < 1000 ? picture.total_size_ko + ' Ko' : (picture.total_size_ko / 1000).toFixed(1) + ' Mo'
            }}</span>
        </div>
        <div v-if="picture.deleted && picture.deleted_date">
          <span class="text-red-600">Deleted on {{ formatDateToTimeString(picture.deleted_date, true) }}</span>
        </div>
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
          <TagSelector
              v-if="editedPicture"
              :commonTags="common_tags_ids"
              :mixedTags="mixed_tags_ids"
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
        <div class="font-medium mb-0.5">Data</div>
        <ul class="attributes-list list-none p-0 m-0">
          <BaseEditableProp
              title="Resolution"
              :value="resolutionDisplayValue"
              :original-value="resolutionDisplayValue"
              :is-mixed="resolutionDisplayValue === undefined"
              :readonly="true"/>
          <BaseEditableProp
              title="Orientation"
              :value="editedPicture.orientation"
              :original-value="picture.orientation"
              :is-mixed="editedPicture.orientation === undefined"
              :readonly="true"/>
        </ul>
      </div>
      <div class="mt-2">
        <div class="font-medium mb-0.5">Editable exif data</div>
        <ul class="attributes-list list-none p-0 m-0">
          <DateEditableProp
              :title="'Creation Date'"
              v-model="editedPicture.creation_date"
              :original-value="picture.creation_date"
              :is-mixed="editedPicture.creation_date === undefined"
              :nullable="false"
          />
          <DateEditableProp
              :title="'Edition Date'"
              v-model="editedPicture.edition_date"
              :original-value="picture.edition_date"
              :is-mixed="editedPicture.edition_date === undefined"
              :nullable="false"
          />
          <LocationEditableProp
              :title="'Location'"
              v-model:latitude="latitude"
              v-model:longitude="longitude"
              v-model:altitude="altitude"
              :original-latitude="original_latitude"
              :original-longitude="original_longitude"
              :original-altitude="picture.altitude"
              :is-mixed="editedPicture.latitude === undefined || editedPicture.longitude === undefined"
              @save="savePicture"
              :show-altitude="false"
          />
          <NumberEditableProp
              title="Altitude"
              v-model="editedPicture.altitude"
              :original-value="picture.altitude"
              :is-mixed="editedPicture.altitude === undefined"
              @save="savePicture"
              :suffix="' m'"
              :min="-1000"
              :max="10000"
          />
          <TextEditableProp
              title="Camera Brand"
              v-model="editedPicture.camera_brand"
              :original-value="picture.camera_brand"
              :is-mixed="editedPicture.camera_brand === undefined"
              @save="savePicture"
              :min-length="1"
              :max-length="32"
          />
          <TextEditableProp
              title="Camera Model"
              v-model="editedPicture.camera_model"
              :original-value="picture.camera_model"
              :is-mixed="editedPicture.camera_model === undefined"
              @save="savePicture"
              :min-length="1"
              :max-length="32"
          />
          <FractionEditableProp
              title="Exposure Time"
              v-model:numerator="editedPicture.exposure_time_num"
              v-model:denominator="editedPicture.exposure_time_den"
              :original-numerator="picture.exposure_time_num"
              :original-denominator="picture.exposure_time_den"
              :is-mixed="editedPicture.exposure_time_num === undefined || editedPicture.exposure_time_den === undefined"
              :min-numerator="1"
              :max-numerator="100000"
              :min-denominator="1"
              :max-denominator="100000"
              @save="savePicture"
          />
          <NumberEditableProp
              title="ISO"
              v-model="editedPicture.iso_speed"
              :original-value="picture.iso_speed"
              :is-mixed="editedPicture.iso_speed === undefined"
              @save="savePicture"
              :min="50"
              :max="25600"
              :step="50"
          />
          <NumberEditableProp
              title="Focal Length"
              v-model="focal_length"
              :original-value="original_focal_length"
              :is-mixed="editedPicture.focal_length === undefined"
              @save="savePicture"
              :suffix="' mm'"
              :min="1"
              :max="10000"
              :step="1"
              :min-fraction-digits="0"
              :max-fraction-digits="2"
          />
          <NumberEditableProp
              title="Aperture"
              v-model="f_number"
              :original-value="original_f_number"
              :is-mixed="editedPicture.f_number === undefined"
              @save="savePicture"
              :min-fraction-digits="1"
              :max-fraction-digits="2"
              :min="1"
              :max="64"
              :step="0.1"
              :prefix="'f/'"
          />
        </ul>
      </div>
    </div>
  </div>
</template>
