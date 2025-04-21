<script setup lang="ts">
const tagsStore = useTagsStore();
const isLoading = ref<boolean>(true);
const pictureLoading = ref<boolean>(true);

const picture = {
  id: 16,
  name: 'xyz.jpg',
  width: 400,
  height: 250,
}

const rating = ref(4);

</script>

<template>
  <div class="flex flex-col items-stretch p-2 mx-auto font-sans">
    <div class="w-full">
      <Picture :picture="picture" :visible="true" v-model:loading="pictureLoading"/>
    </div>
    <div class="flex flex-col gap-2.5 p-2">
      <div class="inline-flex items-baseline gap-2 justify-between font-medium text-lg">
        <span>xyz.jpg</span>
        <span class="text-gray-500">4 Mo</span>
      </div>
      <div class="text-gray-500 italic text-base">Arcane desc.</div>
      <div class="flex items-center justify-between gap-3">
        <Rating v-model="rating" />
        <Button icon="pi pi-share-alt" aria-label="Share" />
      </div>
      <div class="mt-2">
        <div class="font-medium mb-0.5">Tags :</div>
        <div class="flex flex-wrap gap-1.5 items-center">
          <PictureTag v-if="tagsStore && tagsStore.all_tags?.length > 0" v-for="tag_group in tagsStore.all_tags" :tag="tag_group.tags[0]" :tag_group="tag_group.tag_group"/>
          <button class="bg-gray-100 rounded-full w-6 h-6 text-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
                  title="Add tag">＋
          </button>
        </div>
      </div>
      <div class="mt-2">
        <div class="font-medium mb-0.5">Exif :</div>
        <ul class="list-none p-0 m-0">
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[70px] text-gray-400">Camera</span> <span>Canon EOS R</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[70px] text-gray-400">Lens</span> <span>24-70mm</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[70px] text-gray-400">ISO</span> <span>100</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[70px] text-gray-400">Aperture</span> <span>f/2.8</span></li>
          <li class="flex gap-2 text-sm text-gray-700 mb-0.5"><span class="min-w-[70px] text-gray-400">Shutter</span> <span>1/250s</span></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
</style>
