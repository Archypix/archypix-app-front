<script setup lang="ts">

import TagsListTagGroup from "~/components/app/left_sidebar/TagsListTagGroup.vue";

export interface TagGroupNode {
  type: 'group';
  key: string;
  label: string;
  data: TagGroup;
  children: TagNode[];
}

export interface TagNode {
  type: 'tag';
  key: string;
  label: string;
  data: Tag;
  multiple: boolean;
}

type Node = TagGroupNode | TagNode


const tagsStore = useTagsStore();
const expandedKeys = ref<{ [key: string]: boolean }>({});
const tagsTree = ref<TagGroupNode[]>([]);
const showDeleteConfirm = ref(false);
const showEditDialog = ref(false);

const selectedNode = ref<Node | null>(null);
const selectedKeys = ref<string[]>([]);


const confirm = useConfirm();
const toast = useToast();

const buildTagsTree = () => {
  tagsTree.value = tagsStore.all_tags.map((tagGroup) => ({
    type: 'group',
    key: `tag_group=${tagGroup.tag_group.id}`,
    label: tagGroup.tag_group.name,
    data: tagGroup.tag_group,
    children: tagGroup.tags.map((tag) => ({
      type: 'tag',
      key: `tag=${tagGroup.tag_group.id}:${tag.id}`,
      label: tag.name,
      data: tag,
      multiple: tagGroup.tag_group.multiple,
    })),
  }));
};

const onNodeToggle = (node: Node) => {
  expandedKeys.value[node.key] = !expandedKeys.value[node.key];
};


const expandAll = () => {
  for (let node of tagsTree.value) {
    expandedKeys.value[node.key] = true;
  }
  expandedKeys.value = {...expandedKeys.value};
  console.log(expandedKeys)
};

onMounted(() => {
  buildTagsTree();
});
watch(() => tagsStore.all_tags, () => {
  buildTagsTree()
  expandAll()
});
watch(selectedKeys, () => {
  const selected = Object.entries(selectedKeys.value).filter(o => o[1]).map(o => o[0]);
  console.log(selected)
  if (selected.length > 0) {
    usePicturesStore().query(selected[0] + ' sort=creation')
  }
})


const newTagGroupPopover = ref();
const addTagGroup = (event: MouseEvent) => {
  newTagGroupPopover.value.toggle(event);
}


</script>

<template>
  <Popover ref="newTagGroupPopover">
    <div class="flex flex-col gap-4 w-[15rem]">
      <div>
        <span class="font-medium block mb-2">New tag group</span>
        <InputGroup>
          <InputText value="" placeholder="name"></InputText>
        </InputGroup>
      </div>
      <div>
        <Checkbox inputId="tagGroupMultiple" name="multiple" value="Mushroom"/>
        <label for="tagGroupMultiple"> Multiple </label>
        <i class="pi pi-info-circle text-red-700"
           v-tooltip.bottom="'If the tag group is multiple, a picture can have multiple tags of this tag group'"></i>
      </div>
      <div>
        <Checkbox inputId="tagGroupRequired" name="required" value="Mushroom"/>
        <label for="tagGroupRequired"> Required </label>
        <i class="pi pi-info-circle text-red-700"
           v-tooltip.bottom="'If the tag group is required, each picture must have at least one tag of this tag group'"></i>
      </div>
      <Button class="p-button-success w-full">Create tag group</Button>
    </div>
  </Popover>

  <div class="flex flex-col justify-between items-stretch gap-4 h-full">
    <Tree :value="tagsTree" v-model:selectionKeys="selectedKeys" :expandedKeys="expandedKeys" selectionMode="single" class="tag-tree w-full"
          @node-toggle="onNodeToggle">
      <template #default="{ node }">
        <TagsListTagGroup v-if="node.type === 'group'" :node="node as TagGroupNode"/>
        <TagsListTag v-else :node="node as TagNode"/>
      </template>
    </Tree>

    <Button icon="pi pi-plus" class="p-button-secondary w-full" @click="addTagGroup">
      <i class="pi pi-plus"></i>&nbsp;Add tag group
    </Button>

  </div>
</template>

<style lang="stylus">
.tag-tree
  .p-tree-node-label
    width 100%
</style>
