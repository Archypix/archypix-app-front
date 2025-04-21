<script setup lang="ts">

let pictures_store = usePicturesStore()

</script>

<template>
  <ul>
    <PictureListElement :picture="data" v-for="data in pictures_store.pictures" :key="data.id"/>
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
