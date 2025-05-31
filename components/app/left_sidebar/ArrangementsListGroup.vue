<script setup lang="ts">
import type { GroupNode } from './ArrangementsList.vue';

const props = defineProps<{
  node: GroupNode;
}>();

const groupClass = computed(() => ({
  'text-red-500': props.node.group.to_be_deleted,
  'opacity-50': props.node.group.to_be_deleted,
}));
</script>

<template>
  <div class="w-full flex items-center gap-2" :class="groupClass">
    <i class="pi pi-folder" style="color: var(--primary-color)"></i>
    <span>{{ node.group.name }}</span>
    <span v-if="node.group.to_be_deleted" class="text-xs text-red-500 ml-2">(to be deleted)</span>
  </div>
</template>

<style scoped lang="stylus">
/* Add any specific styles here */
</style>
