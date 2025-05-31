<script setup lang="ts">
import type {TagGroupNode} from "~/components/app/left_sidebar/TagsList.vue";

const props = defineProps<{
  node: TagGroupNode
}>()

</script>

<template>
  <div class="w-full flex justify-between items-center">
    <PictureTag
        :tag_group="node.tag_group"
    />
    <div class="flex gap-2">
      <Button icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              v-tooltip.top="'Edit tag group'"
              @click.stop="usePicturesStore().query('config=tag_group:' + props.node.tag_group.id)"/>
    </div>
  </div>
</template>

<style scoped lang="stylus">

</style>
