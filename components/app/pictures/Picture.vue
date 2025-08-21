<script setup lang="ts">
import {PictureThumbnail, usePicturesCacheStore} from "~/stores/pictures_cache";

const props = defineProps(['picture', 'visible', 'loading'])

const emit = defineEmits(['update:loading']);

const picturesCacheStore = usePicturesCacheStore();
const currentPictureId = ref<number | null>(null);

watchEffect(() => {
  const id = props.picture?.id
  if (currentPictureId.value !== null) {
    if (currentPictureId.value === id) {
      return;
    } else {
      picturesCacheStore.releasePictureUrl(currentPictureId.value, PictureThumbnail.Medium);
    }
  }
  if (id && props.loading && props.visible) {
    picturesCacheStore.getPictureUrl(id, PictureThumbnail.Medium, () => true || props.visible).then((url) => {
      if (!props.visible) {
        picturesCacheStore.releasePictureUrl(id, PictureThumbnail.Medium);
      }else {
        emit('update:loading', false);
        currentPictureId.value = id;
        thumbStyle["background-image"] = `url('${url}')`;
      }
    })
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

  if (!props.visible && currentPictureId.value !== null) {
    emit('update:loading', true);
    picturesCacheStore.releasePictureUrl(currentPictureId.value, PictureThumbnail.Medium);
    currentPictureId.value = null;
    thumbStyle["background-image"] = ``;
  }
}, {immediate: true})

onUnmounted(() => {
  if (currentPictureId.value !== null) {
    picturesCacheStore.releasePictureUrl(currentPictureId.value, PictureThumbnail.Medium);
  }
});

</script>

<template>
  <Toast/>
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
