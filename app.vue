<script setup lang="ts">
await useUserStore().updateStatus()
// useArrangementsStore().load();
// usePicturesStore().load();
// useTagsStore().load();

useHead({
  titleTemplate: 'Archypix',
  meta: [
    {
      name: 'description',
      content: 'Archypix is an efficient cloud based picture manager that supports automatic grouping of pictures into custom arrangements, while allowing users to share groups together.'
    }
  ]
})

</script>

<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<style lang="stylus">
:root
  // For the scroll inertia
  background-color var(--p-primary-100)
  font-size 12px

.layout-enter-active, .layout-leave-active
  transition filter 0.1s

.layout-enter-from, .layout-leave-to
  //filter blur(10px) saturate(50%);

</style>
