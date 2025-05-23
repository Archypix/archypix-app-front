<script setup lang="ts">
import {ref, computed, defineProps, defineEmits, onMounted, watch} from 'vue';
import {useTagsStore, type TagGroupWithTags} from '~/stores/tags';

const props = defineProps<{
  pictureTags: number[];
}>();

const emit = defineEmits<{
  'update': [tagsToAdd: number[], tagsToRemove: number[]];
}>();

// TODO: watch for changes in the tags store in case the user adds new tags (specifically when the tag list is empty.)

const tagsStore = useTagsStore();
const selectedTags = ref({});
const treeNodes = ref([]);
const loading = ref(true);
const expandedKeys = ref({});
const isOpen = ref(false);


const currentTags = computed<{tag: Tag; tag_group: TagGroup}[]>(() => {
  return props.pictureTags.map(tagId => {
    for (const tg of tagsStore.all_tags) {
      const tag = tg.tags.find(t => t.id === tagId);
      if (tag) {
        return {tag, tag_group: tg.tag_group};
      }
    }
  });
});

const updateSelectedFromProps = () => {
  selectedTags.value = {};
  for (const tagId of props.pictureTags) {
    selectedTags.value[tagId] = true;
  }
  selectedTags.value = {...selectedTags.value};
}

// Initialize selected tags from picture tags
onMounted(updateSelectedFromProps);

// Watch for changes in props.pictureTags
watch(() => props.pictureTags, updateSelectedFromProps, {deep: true});

// Convert tag groups and tags to TreeSelect nodes format
const convertToTreeNodes = (tagGroups: TagGroupWithTags[]) => {
  return tagGroups.map(tg => {
    return {
      key: `group-${tg.tag_group.id}`,
      label: tg.tag_group.name,
      selectable: false,
      tag_group: tg.tag_group,
      children: tg.tags.map(tag => ({
        key: tag.id,
        label: tag.name,
        tag_id: tag.id,
        tag_group_id: tg.tag_group.id,
        tag: tag,
        tag_group: tg.tag_group,
        styleClass: 'tag-node'
      }))
    };
  });
};

watch(tagsStore, async () => {
  await tagsStore.tags_loaded_promise;
  if (loading.value) {
    treeNodes.value = convertToTreeNodes(tagsStore.all_tags);
    loading.value = false;
  }
}, {immediate: true});


const handleNodeSelect = (value) => {
  // If the tag group is not multiple, remove any other selected tag from the same group
  console.log('Selected tags:', value);
};

const handleClose = async () => {
  // Remove the isOpen check to ensure we always calculate and emit when the popup closes
  const selected = Object.keys(selectedTags.value).map(key => Number(key));
  const tagsToAdd = selected.filter(tag => !props.pictureTags.includes(tag));
  const tagsToRemove = props.pictureTags.filter(tag => !selected.includes(tag));

  if (tagsToAdd.length > 0 || tagsToRemove.length > 0) {
    console.log('Emitting tag update:', {add: tagsToAdd, remove: tagsToRemove});
    emit('update', tagsToAdd, tagsToRemove);
  }
  isOpen.value = false;
};

// Track when the popup opens
const handleShow = () => {
  isOpen.value = true;
};

// Handle node click to expand/collapse tag groups
const handleNodeClick = (node: any) => {
  if (!node.tag && node.children) {
    expandedKeys.value = {
      ...expandedKeys.value,
      [node.key]: !expandedKeys.value[node.key] // Add or remove the node from expanded keys
    };
  }
};

</script>

<template>
  <TreeSelect
      v-model="selectedTags"
      :options="treeNodes"
      :loading="loading"
      selectionMode="checkbox"
      filter
      placeholder="Select a tag"
      class="tag-selector-custom-tree-select"
      @change="handleNodeSelect"
      @show="handleShow"
      @hide="handleClose"
      :expandedKeys="expandedKeys"
      :pt="{
      root: { class: 'w-full' },
      panel: { class: 'tag-panel' }
    }"
  >
    <template #value="slotProps">
      <div v-if="currentTags?.length > 0" class="align-items-center gap-2 flex flex-wrap">
        <PictureTag
            v-for="tag in currentTags"
            :key="tag.tag.id"
            :tag="tag.tag"
            :tag_group="tag.tag_group"
        />
      </div>
      <span v-else>{{ slotProps.placeholder }}</span>
    </template>

    <template #option="slotProps">
      <!-- Group node -->
      <div v-if="!slotProps.node.tag" class="tag-group-item" @click="handleNodeClick(slotProps.node)">
        <PictureTag
            :tag_group="slotProps.node.tag_group"
        />
      </div>
      <!-- Tag node -->
      <div v-else class="tag-item">
        <PictureTag
            :tag="slotProps.node.tag"
            :tag_group="slotProps.node.tag_group"
            :tag_only="true"
        />
      </div>
    </template>

  </TreeSelect>
</template>

<style scoped lang="stylus">
.tag-tree-select
  width 100%

.tag-group-item
  padding 2px 0
  cursor pointer

.tag-item
  padding 2px 0
  margin-left 8px

:deep(.tag-panel)
  max-height 300px
  overflow-y auto

:deep(.p-treeselect-trigger)
  display none
</style>
<style lang="stylus">
div.tag-selector-custom-tree-select.p-treeselect
  border none
  outline none
  box-shadow none

  .p-treeselect-label
    padding 0
</style>
