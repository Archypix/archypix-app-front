<script setup lang="ts">

definePageMeta({
  layout: 'app'
})

</script>

<template>
  <main>
    <TopBar/>

    <Splitter class="h-screen border-none rounded-none">
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

<style scoped>
.splitter {
  height: 100vh;
  width: 100vw;
  border: none;
  border-radius: 0;
}
</style>
