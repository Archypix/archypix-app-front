<script setup lang="ts">

let pictures_store = usePicturesStore()

</script>

<template>
  <h1>
    Config !
    <br>
    {{pictures_store.last_query_string_ids}}
    {{pictures_store.last_query_string_names}}
    {{pictures_store.last_query_string}}
  </h1>
</template>

<style scoped lang="stylus">



</style>
