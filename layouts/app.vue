<template>
  <div>
    <Toast />
    <slot/>
    <UploadManager />
  </div>
</template>

<script setup lang="ts">
import {useUserStore} from "~/stores/user";
import Toast from 'primevue/toast';
import UploadManager from '~/components/app/upload/UploadManager.vue';
import {useRouter} from 'vue-router';

const user = useUserStore()
if (!user.isLoggedIn()) {
  useRouter().push('/signin')
}

enum PictureOrientation {
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
type Picture = {
  id: number,
  name: String,
  comment: String,
  owner_id: number,
  author_id: number,
  deleted_date: String | null,
  copied: boolean,
  creation_date: String,
  edition_date: String,
  latitude: number,
  longitude: number,
  altitude: number | null,
  orientation: PictureOrientation,
  width: number,
  height: number,
  camera_brand: String | null,
  camera_model: String | null,
  focal_length: number,
  exposure_time_num: number | null,
  exposure_time_den: number | null,
  iso_speed: number | null,
  f_number: number,
}


</script>

<style scoped>

</style>

<style>
html {
  overflow: hidden;
}
</style>
