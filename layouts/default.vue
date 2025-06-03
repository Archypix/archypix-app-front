<script setup lang="ts">

</script>

<template>
  <div>
    <Header/>
    <div class="main-content">
      <slot/>
    </div>
    <Footer/>
  </div>
</template>

<style scoped lang="stylus">

.main-content
  background-color var(--p-surface-ground)
  flex-grow 1

:deep(main)
  padding-top 48px

</style>
