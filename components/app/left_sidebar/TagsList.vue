<script setup lang="ts">

export interface TagGroupNode {
  type: 'group';
  key: string;
  tag_group: TagGroup;
  children: TagNode[];
}

export interface TagNode {
  type: 'tag';
  key: string;
  tag: Tag;
  tag_group: TagGroup;
}

type Node = TagGroupNode | TagNode


const tagsStore = useTagsStore();
const expandedKeys = ref<{ [key: string]: boolean }>({});
const tagsTree = ref<TagGroupNode[]>([]);

const selectedKeys = ref<string[]>([]);

const isLoading = ref<boolean>(true);


const buildTagsTree = () => {
  tagsTree.value = tagsStore.all_tags.map((tagGroup) => ({
    type: 'group',
    key: `tag_group=${tagGroup.tag_group.id}`,
    tag_group: tagGroup.tag_group,
    children: tagGroup.tags.map((tag) => ({
      type: 'tag',
      key: `tag=${tagGroup.tag_group.id}:${tag.id}`,
      tag: tag,
      tag_group: tagGroup.tag_group,
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

watch(tagsStore, async () => {
  await tagsStore.tags_loaded_promise;
  buildTagsTree()
  if(isLoading.value){
    isLoading.value = false;
    expandAll()
  }
}, { immediate: true });

watch(selectedKeys, () => {
  const selected = Object.entries(selectedKeys.value).filter(o => o[1]).map(o => o[0]);
  console.log(selected)
  if (selected.length > 0) {
    usePicturesStore().query(selected.join(' ') + ' sort=creation')
  }
})

const addTagGroup = (_e: MouseEvent) => {
  usePicturesStore().query('config=tag_group:0')
}


</script>

<template>
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
  padding .5em
  .p-tree-node-label
    width 100%
</style>
