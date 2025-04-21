<script setup lang="ts">

import type {ListPictureData} from "~/stores/pictures";

let pictures_store = usePicturesStore()

const click_picture = (e: MouseEvent, picture: ListPictureData) => {
  if (!e.ctrlKey && !e.metaKey) {
    if (pictures_store.selected_pictures.length == 1 && pictures_store.selected_pictures.includes(picture.id)) {
      pictures_store.selected_pictures = []
    } else {
      pictures_store.selected_pictures = [picture.id]
    }
    return
  }
  if (pictures_store.selected_pictures.includes(picture.id)) {
    pictures_store.selected_pictures = pictures_store.selected_pictures.filter(id => id != picture.id)
  } else {
    pictures_store.selected_pictures.push(picture.id)
  }
}

</script>

<template>
  <ul>
    <PictureListElement @click="e => click_picture(e, data)"
                        :picture="data"
                        :selected="pictures_store.selected_pictures.includes(data.id)"
                        v-for="data in pictures_store.pictures"
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
