<template>
  <div>
    <Toast />
    <slot/>
  </div>
</template>

<script setup lang="ts">
import {useUserStore} from "~/stores/user";
import type {ApiError} from "~/composables/fetchApi";
import {useToastService} from "~/composables/useToastService";

const user = useUserStore()
if (!user.isLoggedIn()) {
  useRouter().push('/signin')
}

const allowDrag = (e: DragEvent) => {
  e.preventDefault()
  if(e.dataTransfer){
    e.dataTransfer.dropEffect = 'copy'
  }
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
type PictureUploadResponse = {
  name: String,
  picture: Picture,
  thumbnail_error: ApiError | null,
}

onMounted(() => {
  window.addEventListener("dragenter", allowDrag);
  window.addEventListener("dragover", allowDrag);
  window.addEventListener("drop", e => {
    e.preventDefault()
    console.log(e.dataTransfer?.files);
    if(e.dataTransfer) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        let file = e.dataTransfer.files[i];

        const formData = new FormData()
        formData.append('file', file);

        usePostApi<FormData, PictureUploadResponse>(true, '/picture', formData)
            .then((_response: PictureUploadResponse) => {
              console.log('Picture uploaded')
            })
            .catch((error: ApiError | null) => {
              useToastService().apiError(error, "Unable to upload picture");
            });
      }
    }
  });
})


</script>

<style scoped>

</style>

<style>
html {
  overflow: hidden;
}
</style>
