<script setup lang="ts">
import { useStorage } from '@vueuse/core'

let leftPanelEnabled = useStorage('px_left_panel_enabled', true);
let rightPanelEnabled = useStorage('px_right_panel_enabled', true);

let picturesStore = usePicturesStore();

let leftPanelVisible = computed({
  get: () => leftPanelEnabled.value,
  set: value => leftPanelEnabled.value = value,
});
let rightPanelVisible = computed({
  get: () => rightPanelEnabled.value && picturesStore.selected_pictures.length > 0,
  set: value => rightPanelEnabled.value = value,
});


definePageMeta({
  layout: 'app'
})

</script>

<template>
  <main class="w-screen h-screen flex flex-col items-stretch">
    <TopBar
        v-model:left-panel-enabled="leftPanelEnabled"
        v-model:right-panel-enabled="rightPanelEnabled"
    />

    <SidePanels
        v-model:left-panel-visible="leftPanelVisible"
        v-model:right-panel-visible="rightPanelVisible"
        :left-panel-width="250"
        :left-panel-min-width="200"
        :left-panel-drawer-width="260"
        :right-panel-drawer-width="350"
        :left-panel-max-width="400"
        :right-panel-width="300"
        :right-panel-min-width="200"
        :right-panel-max-width="400"
    >
      <template #left>
        <LeftSidebar/>
      </template>
      <template #main>
        <MainPane/>
      </template>
      <template #right>
        <RightSidebar/>
      </template>
    </SidePanels>

  </main>
</template>

<style scoped lang="stylus">
.p-splitter {
  min-height: 0;
}
</style>
