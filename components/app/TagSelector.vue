<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {type Tag, type TagGroup, type TagGroupWithTags, useTagsStore} from '~/stores/tags';
import type {TreeExpandedKeys} from "primevue/tree";

const props = defineProps<{
  commonTags: number[];
  mixedTags: number[];
  asCombo?: boolean; // If true, the component will be rendered as a combo box
}>();

const emit = defineEmits<{
  'update': [tagsToAdd: number[], tagsToRemove: number[]];
}>();


const tagsStore = useTagsStore();
type SelectedRecord = Record<number, SelectedRecordEl>;
type SelectedRecordEl = { checked: boolean; partialChecked: boolean };
const selectedTags = ref<SelectedRecord>({});
const treeNodes = ref<TagGroupTreeNode[]>([]);
const loading = ref(true);
const expandedKeys = ref<TreeExpandedKeys>({});
const isOpen = ref(false);

const currentTags = computed<{ tag: Tag; tag_group: TagGroup }[]>(() => {
  return props.commonTags
      .map(tagId => {
        for (const tg of tagsStore.all_tags) {
          const tag = tg.tags.find(t => t.id === tagId);
          if (tag) {
            return {tag, tag_group: tg.tag_group};
          }
        }
      })
      .filter(Boolean)
      .filter((tag) => tag !== undefined)
      .sort((a, b) => a.tag_group.name.localeCompare(b.tag_group.name) || a.tag.name.localeCompare(b.tag.name)) as {
    tag: Tag;
    tag_group: TagGroup
  }[];
});
const currentMixedTags = computed<{ tag: Tag; tag_group: TagGroup }[]>(() => {
  return props.mixedTags
      .map(tagId => {
        for (const tg of tagsStore.all_tags) {
          const tag = tg.tags.find(t => t.id === tagId);
          if (tag) {
            return {tag, tag_group: tg.tag_group};
          }
        }
      })
      .filter(Boolean)
      .filter((tag) => tag !== undefined)
      .sort((a, b) => a.tag_group.name.localeCompare(b.tag_group.name) || a.tag.name.localeCompare(b.tag.name)) as {
    tag: Tag;
    tag_group: TagGroup
  }[];
});

const updateSelectedFromProps = () => {
  selectedTags.value = {};
  for (const tagId of props.commonTags) {
    if (!tagsStore.all_tags.some(tg => tg.tags.some(t => t.id === tagId))) continue;
    selectedTags.value[tagId] = {checked: true, partialChecked: false};
  }
  for (const tagId of props.mixedTags) {
    if (!tagsStore.all_tags.some(tg => tg.tags.some(t => t.id === tagId))) continue;
    selectedTags.value[tagId] = {checked: true, partialChecked: true};
  }
  selectedTags.value = selectedTags.value;
}

// Watch for changes in props.pictureTags
watch(() => props.commonTags, updateSelectedFromProps, {deep: true});

interface TagGroupTreeNode {
  key: string;
  label: string;
  selectable: boolean;
  tag_group: TagGroup;
  children: TagTreeNode[];
}

interface TagTreeNode {
  key: string;
  label: string;
  tag_id: number;
  tag_group_id: number;
  // tag: Tag;
  // tag_group: TagGroup;
  styleClass: string;
}

// type TreeNode = TagGroupTreeNode | TagTreeNode;

// Convert tag groups and tags to TreeSelect nodes format
const convertToTreeNodes = (tagGroups: TagGroupWithTags[]): TagGroupTreeNode[] => {
  return tagGroups.map(tg => {
    return {
      key: `group-${tg.tag_group.id}`,
      label: tg.tag_group.name,
      selectable: false,
      tag_group: tg.tag_group,
      children: tg.tags.map(tag => ({
        key: tag.id.toString(),
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
  treeNodes.value = convertToTreeNodes(tagsStore.all_tags);
  updateSelectedFromProps();
  loading.value = false;
}, {immediate: true});

const old_selected_with_partial = ref<number[]>(props.commonTags.concat(props.mixedTags));
const handleNodeSelect = async () => {
  // If the tag group is not multiple, remove any other selected tag from the same group
  const new_selected_with_partial = Object.entries(selectedTags.value)
      .filter(([_, value]) => value.checked || value.partialChecked)
      .map(([key, _value]) => Number(key))
      .filter(tagId => !isNaN(tagId));

  const newlySelectedTags = new_selected_with_partial.filter(tagId => !old_selected_with_partial.value.includes(tagId));
  for (const tagId of newlySelectedTags) {
    let group = await tagsStore.getTagGroupFromTagId(tagId)
    if (!group) {
      return;
    }
    // If tag is not multiple, remove all other selected or mixed tags from the same group
    if (!group.tag_group.multiple) {
      group.tags.forEach(otherTag => {
        if (otherTag.id !== tagId && (selectedTags.value[otherTag.id]?.checked || selectedTags.value[otherTag.id]?.partialChecked)) {
          delete selectedTags.value[otherTag.id];
        }
      });
    }
  }

  const newlyUnselectedTags = old_selected_with_partial.value.filter(tagId => !new_selected_with_partial.includes(tagId));
  for (const tagId of newlyUnselectedTags) {
    let group = await tagsStore.getTagGroupFromTagId(tagId)
    if (!group) {
      return;
    }
    // If tag is required, select the default tag from the group
    if (group.tag_group.required) {
      let selected_count = 0; // Counts the partial checks. The user might select 0 tags for some pictures, but the backend will always select the default tag correctly.
      let defaultTagId: number | null = null;
      group.tags.forEach(otherTag => {
        if (selectedTags.value[otherTag.id]?.checked || selectedTags.value[otherTag.id]?.partialChecked) {
          selected_count++;
        }
        if (otherTag.id !== tagId && (defaultTagId === null || otherTag.is_default)) {
          defaultTagId = otherTag.id;
        }
      });
      if (selected_count === 0 && defaultTagId !== null) {
        selectedTags.value[defaultTagId] = {checked: true, partialChecked: false};
      }
    }
  }


  old_selected_with_partial.value = Object.entries(selectedTags.value)
      .filter(([_, value]) => value.checked || value.partialChecked)
      .map(([key, _value]) => Number(key))
      .filter(tagId => !isNaN(tagId));
  selectedTags.value = {...selectedTags.value};
};

const handleClose = async () => {
  // Tags that are checked excluding partial checks
  const selected = Object.entries(selectedTags.value)
      .filter(([_, value]) => value.checked && !value.partialChecked)
      .map(([key, _value]) => Number(key))
      .filter(tagId => !isNaN(tagId));

  // Tags that are checked including partial checks
  const selected_with_partial = Object.entries(selectedTags.value)
      .filter(([_, value]) => value.checked)
      .map(([key, _value]) => Number(key))
      .filter(tagId => !isNaN(tagId));

  const tagsToAdd = selected.filter(tag => !props.commonTags.includes(tag));
  const tagsToRemove = props.commonTags.filter(tag => !selected_with_partial.includes(tag))
      .concat(props.mixedTags.filter(tag => !selected_with_partial.includes(tag)));


  if (tagsToAdd.length > 0 || tagsToRemove.length > 0) {
    emit('update', tagsToAdd, tagsToRemove);
  }

  // Remove the isOpen check to ensure we always calculate and emit when the popup closes
  isOpen.value = false;
};

// Track when the popup opens
const handleShow = () => {
  isOpen.value = true;
};

// Handle node click to expand/collapse tag groups
const handleGroupClick = (node: TagGroupTreeNode) => {
  if (node.children) {
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
      placeholder="Select tags"
      :class="[asCombo ? 'tag-selector-custom-tree-select-combo' : 'tag-selector-custom-tree-select']"
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
        <PictureTag
            v-for="tag in currentMixedTags"
            :key="tag.tag.id"
            :tag="tag.tag"
            :tag_group="tag.tag_group"
            :dimmed="true"
        />
      </div>
      <span v-else>{{ slotProps.placeholder }}</span>
    </template>

    <template #option="slotProps">
      <!-- Group node -->
      <div v-if="!slotProps.node.tag" class="tag-group-item" @click="handleGroupClick(slotProps.node as TagGroupTreeNode)">
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

div.tag-selector-custom-tree-select-combo.p-treeselect
  font-size .95em
  min-height 29px

  .p-treeselect-label-container
    display flex

  .p-treeselect-label
    padding .3em var(--p-select-padding-x)

</style>
