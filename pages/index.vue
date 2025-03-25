<script setup lang="ts">

definePageMeta({
  layout: 'app'
})

</script>

<template>
  <main class="w-screen h-screen flex flex-col items-stretch">
    <TopBar/>
    <Splitter class="flex-grow border-none rounded-none">
      <SplitterPanel :size="10" :maxSize="50">
        <LeftSidebar/>
      </SplitterPanel>
      <SplitterPanel class="flex flex-col">
        <MainPane/>
      </SplitterPanel>
      <SplitterPanel :size="10" :maxSize="50">
        <RightSidebar/>
      </SplitterPanel>
    </Splitter>
  </main>
</template>

<style scoped lang="stylus">
.p-splitter {
  min-height: 0;
}
</style>
