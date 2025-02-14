<script setup lang="ts">

let props = defineProps(['list_pictures_data'])

</script>

<template>
  <ul>
    <Picture :list_picture_data="data" v-for="data in list_pictures_data" :key="data.id"/>
  </ul>
</template>

<style scoped lang="stylus">
ul
  overflow scroll
  list-style none
  padding 0
  margin 3px
  display flex
  flex-wrap wrap
  align-content stretch
  gap 3px

  &::after
    content ''
    flex-grow 1000000000


</style>