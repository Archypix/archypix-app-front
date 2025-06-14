<script setup lang="ts">
import {ref} from 'vue';
import type {FilterGroupingRequest} from '~/types/arrangements';
import StrategyFilteringTree from '../StrategyFilteringTree.vue';

const props = defineProps<{
  grouping: FilterGroupingRequest;
}>();

const emit = defineEmits<{
  (e: 'update:grouping', value: FilterGroupingRequest): void;
}>();

const newGroupCounter = ref(0);

// Add a new filter group
const addFilterGroup = () => {
  props.grouping.filters.push({
    id: -newGroupCounter.value++,
    name: 'New Group',
    filter: {
      Filter: {
        IncludeTags: [],
      }
    }
  });
  emit('update:grouping', props.grouping);
};

// Remove a filter group
const deleteFilterGroup = (groupId: number) => {
  props.grouping.filters = props.grouping.filters.filter(f => f.id !== groupId);
  emit('update:grouping', props.grouping);
};

</script>

<template>
  <div class="grouping-type">
    <h4 class="font-medium mb-2">Groups</h4>
    <div
        v-for="group in grouping.filters"
        :key="group.id"
        class="mt-2 p-3 border rounded-lg"
    >
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center justify-start gap-2">
          <span class="font-medium">{{group.name}} ({{group.id}})</span>
          <Tag value="New" v-if="group.id <= 0"></Tag>
        </div>
        <Button
            icon="pi pi-times"
            class="p-button-text p-button-danger p-button-sm"
            @click="deleteFilterGroup(group.id)"
        />
      </div>
      <StrategyFilteringTree
          v-model:filter="group.filter"
      />
    </div>
    <Button
        icon="pi pi-plus"
        label="Add Filter Group"
        class="p-button-outlined p-button-sm mt-2"
        @click="addFilterGroup"
    />
  </div>
</template>
