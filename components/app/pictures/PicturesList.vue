<script setup lang="ts">

import type {ListPictureData} from "~/types/pictures";

let pictures_store = usePicturesStore()

const click_picture = (e: MouseEvent, picture: ListPictureData) => {
  if (e.ctrlKey ||e.metaKey) {
    pictures_store.select_toggle(picture.id)
  }else if(e.shiftKey) {
    pictures_store.select_to(picture.id)
  }else {
    pictures_store.select(picture.id)
  }

}

</script>

<template>
  {{pictures_store.selected_picture}}
  {{pictures_store.selected_pictures}}
  <ul>
    <PictureListElement v-for="data in pictures_store.pictures"
                        @click="e => click_picture(e, data)"
                        :picture="data"
                        :selected="pictures_store.selected_pictures.includes(data.id)"
                        :key="data.id"/>
  </ul>
</template>

<style scoped lang="stylus">
ul
  overflow scroll
  list-style none
  padding 3px
  margin 0
  display flex
  flex-wrap wrap
  align-content stretch
  gap 3px

  &::after
    content ''
    flex-grow 1000000000


</style>
