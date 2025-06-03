<script setup lang="ts">
import type { ArrangementNode } from './ArrangementsList.vue';

const props = defineProps<{
  node: ArrangementNode;
}>();

const emit = defineEmits<{
  (e: 'edit'): void;
}>();
</script>

<template>
  <div class="w-full flex justify-between items-center">
    <div class="flex items-center gap-2">
      <i class="pi pi-th-large" style="color: var(--p-primary-color)"></i>
      <span>{{ node.arrangement.arrangement.name }}</span>
    </div>
    <div class="flex gap-2">
      <Button
        icon="pi pi-pencil"
        class="p-button-text p-button-sm"
        @click.stop="emit('edit')"
        v-tooltip.top="'Edit arrangement'"
      />
    </div>
  </div>
</template>

<style scoped lang="stylus">

</style>
