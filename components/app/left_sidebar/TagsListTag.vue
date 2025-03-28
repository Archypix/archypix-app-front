<script setup lang="ts">

import type {TagNode} from "~/components/app/left_sidebar/TagsList.vue";

const props = defineProps<{
  node: TagNode
}>()

</script>

<template>
  <div class="w-full flex justify-between items-center">
    <PictureTag
      :tag="props.node.tag"
      :tag_group="props.node.tag_group"
      :tag_only="true"
    />
  </div>
</template>

<style scoped lang="stylus">

</style>
