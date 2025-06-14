<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { StrategyGrouping, TagGrouping } from '~/types/grouping';
import type {StrategyGroupingRequest, TagGroupingRequest} from '~/types/arrangements';
import { useTagsStore } from '~/stores/tags';

const props = defineProps<{
  grouping: TagGroupingRequest;
}>();

const emit = defineEmits<{
  (e: 'update:grouping', value: TagGroupingRequest): void;
}>();

const tagsStore = useTagsStore();

const tagGrouping = ref<TagGrouping>({
  tag_group_id: 0,
  tag_id_to_group_id: {},
  other_group_id: null,
  group_names_format: 'Group {index}',
});

// Available tag groups
const availableTagGroups = computed(() => {
  return tagsStore.all_tags.map(group => ({
    id: group.tag_group.id,
    name: group.tag_group.name,
  }));
});

// Initialize from props
watch(() => props.grouping, (newVal) => {
  if (newVal && 'GroupByTags' in newVal) {
    //tagGrouping.value = { ...newVal.GroupByTags };
  }
}, { immediate: true });


// Update the request object
const updateRequest = () => {
  const request: StrategyGroupingRequest = {
    GroupByTags: {
      tag_group_id: tagGrouping.value.tag_group_id,
      group_names_format: tagGrouping.value.group_names_format,
    },
  };
  //emit('update:grouping', request);
};

defineExpose({
  updateRequest
});
</script>

<template>
  <div class="grouping-type">
    <div class="field mb-4">
      <label for="tag-group" class="block text-sm font-medium text-gray-700 mb-1">
        Tag Group
      </label>
      <Dropdown
        id="tag-group"
        v-model="tagGrouping.tag_group_id"
        :options="availableTagGroups"
        option-label="name"
        option-value="id"
        placeholder="Select a tag group"
        class="w-full"
      />
    </div>
    <div class="field">
      <label for="group-name-format" class="block text-sm font-medium text-gray-700 mb-1">
        Group Name Format
      </label>
      <InputText
        id="group-name-format"
        v-model="tagGrouping.group_names_format"
        placeholder="e.g., Group {index}, {tag_name}"
        class="w-full"
      />
      <small class="text-gray-500">
        Use {index} for group number and {tag_name} for the tag name
      </small>
    </div>
  </div>
</template>
