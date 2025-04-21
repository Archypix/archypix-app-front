<script setup lang="ts">
import type {ApiError} from "~/composables/fetchApi";
import {useToastService} from "~/composables/useToastService";

const props = defineProps(['picture', 'visible', 'loading'])

const emit = defineEmits(['update:loading']);

watchEffect(() => {
  if (props.loading && props.visible) {
    console.log('Fetching picture ' + props.picture.id + '...')
    setTimeout(() => {
      useGetApi<Blob>(false, '/picture/' + props.picture.id + '/medium')
          .then(response => {
            if (response && props.visible) {
              emit('update:loading', false);
              thumbStyle["background-image"] = `url(${URL.createObjectURL(response)})`
            }
          })
          .catch((error: ApiError | null) => {
            useToastService().apiError(error, "Unable to fetch picture " + props.picture.id);
          });
    }, 100)
  }
})

let h = 140;
let w = h * props.picture.width / props.picture.height;
const thumbStyle = reactive({
  'aspect-ratio': w + '/' + h,
  'background-image': '',
})
</script>

<template>
  <Toast />
  <div class="thumb rounded-md drop-shadow-sm" :style="thumbStyle">
    <template v-if="loading">
      <Skeleton width="100%" height="100%" border-radius="2px"></Skeleton>
    </template>
  </div>
</template>

<style scoped lang="stylus">
.thumb {
  width: 100%;
  height: 100%;
  border-radius: 2px;

  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
</style>
