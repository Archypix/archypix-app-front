<script setup lang="ts">
import {ref} from 'vue';
import type {FilterGroupingRequest} from '~/types/arrangements';
import StrategyFilteringTree from '../StrategyFilteringTree.vue';

const props = defineProps<{
  grouping: FilterGroupingRequest;
  preserveUnicity: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:grouping', value: FilterGroupingRequest): void;
}>();

const newGroupCounter = ref(100);

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

// Move a group up in the list
const moveGroupUp = (group: any) => {
  const index = props.grouping.filters.indexOf(group);
  if (index > 0) {
    const newFilters = [...props.grouping.filters];
    [newFilters[index - 1], newFilters[index]] = [newFilters[index], newFilters[index - 1]];
    props.grouping.filters = newFilters;
    emit('update:grouping', props.grouping);
  }
};

// Move a group down in the list
const moveGroupDown = (group: any) => {
  const index = props.grouping.filters.indexOf(group);
  if (index < props.grouping.filters.length - 1) {
    const newFilters = [...props.grouping.filters];
    [newFilters[index], newFilters[index + 1]] = [newFilters[index + 1], newFilters[index]];
    props.grouping.filters = newFilters;
    emit('update:grouping', props.grouping);
  }
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
          <InputText
              v-model="group.name"
              class="w-full"
              @change="() => emit('update:grouping', grouping)"
          />
          <span class="font-medium">({{group.id}})</span>
          <Tag value="New" v-if="group.id <= 0"></Tag>
        </div>
        <div class="flex items-center gap-1">
          <Button
              icon="pi pi-arrow-up"
              class="p-button-text p-button-sm"
              :disabled="grouping.filters.indexOf(group) === 0"
              @click="moveGroupUp(group)"
              v-tooltip.top="'Raise priority'"
          />
          <Button
              icon="pi pi-arrow-down"
              class="p-button-text p-button-sm"
              :disabled="grouping.filters.indexOf(group) === grouping.filters.length - 1"
              @click="moveGroupDown(group)"
              v-tooltip.top="'Lower priority'"
          />
          <Button
              icon="pi pi-times"
              class="p-button-text p-button-danger p-button-sm"
              @click="deleteFilterGroup(group.id)"
              v-tooltip.top="'Delete group'"
          />
        </div>
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
