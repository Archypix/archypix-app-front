<script setup lang="ts">
import {isString} from "~/composables/queryStrings";

const pictures_store = usePicturesStore();

</script>

<template>
  <div class="config-pane">
    <div v-if="pictures_store.config_component?.selector === 'tag_group' && !isString(pictures_store.config_component?.values[0])">
      <TagGroupConfigPane :tag-group-id="pictures_store.config_component?.values[0]" />
    </div>
    <div v-else>
      <h1>Configuration</h1>
      <p>Please select a configuration option from the sidebar.</p>
    </div>
  </div>
</template>

<style scoped lang="stylus">
.config-pane
  padding 1rem
  overflow scroll
</style>
