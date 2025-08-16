<script setup lang="ts">
import type {ApiError} from "~/composables/fetchApi";
import {useToastService} from "~/composables/useToastService";

const props = defineProps(['picture', 'visible', 'loading'])

const emit = defineEmits(['update:loading']);

const imageUrl = ref<string | null>(null);

watchEffect(() => {
  if (props.picture?.id && props.loading && props.visible) {
    getApi<Blob>('/picture/' + props.picture.id + '/medium')
        .then(response => {
          if (response && props.visible) {
            emit('update:loading', false);
            imageUrl.value = URL.createObjectURL(response);
            thumbStyle["background-image"] = `url('${imageUrl.value}')`;
          }
        })
        .catch((error: ApiError | null) => {
          useToastService().apiError(error, "Unable to fetch picture " + props.picture.id);
        });
  }
})


const thumbStyle = reactive({
  'aspect-ratio': '1/1',
  'background-image': '',
})

watch(props, () => {
  let h = 140;
  let w = h * props.picture.width / props.picture.height;
  thumbStyle["aspect-ratio"] = w + '/' + h
}, { immediate: true})

onUnmounted(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
});

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
