<script setup lang="ts">
import type {ApiError} from "~/composables/fetchApi";
import {useElementVisibility} from '@vueuse/core'
import {useToastService} from "~/composables/useToastService";


const props = defineProps(['list_picture_data'])

const loading = ref(true)

const target = useTemplateRef<HTMLImageElement | null>('target')
const targetIsVisible = useElementVisibility(target, {
  rootMargin: '0px 0px 0px 0px',
})

watchEffect(() => {
  if (loading.value && targetIsVisible.value) {
    console.log('Fetching picture ' + props.list_picture_data.id + '...')
    useGetApi<Blob>(false, '/picture/' + props.list_picture_data.id + '/medium')
        .then(response => {
          if (response && target && target.value) {
            loading.value = false
            thumbStyle["background-image"] = `url(${URL.createObjectURL(response)})`
          }
        })
        .catch((error: ApiError | null) => {
          useToastService().apiError(error, "Unable to fetch picture " + props.list_picture_data.id);
        });
  }
})

let h = 140;
let w = h * props.list_picture_data.width / props.list_picture_data.height;
const liStyle = reactive({
  'flex-basis': w + 'px',
  'flex-grow': w,
})
const thumbStyle = reactive({
  'aspect-ratio': w + '/' + h,
  'background-image': '',
})
</script>

<template>
  <Toast />
  <li ref="target" :class="{thumb: !loading, loading: loading, 'bg-slate-200': true}" :style="liStyle">
    <div class="thumb rounded-md drop-shadow-sm" :style="thumbStyle" />
  </li>
</template>

<style scoped lang="stylus">

li {
  flex-grow: 1;
  animation: fadeIn .2s;
  background-color: lightgray;
  position: relative;

  //.selected-overlay {
  //  position: absolute;
  //  top: -1px;
  //  left: -1px;
  //  width: calc(100% + 2px);
  //  height: calc(100% + 2px);
  //  border-radius: 3px;
  //  border: 3px solid var(--fg-info);
  //}

  .thumb {
    width: 100%;
    height: 100%;
    border-radius: 2px;

    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }

}
</style>