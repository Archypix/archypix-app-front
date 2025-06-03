<script setup lang="ts">
import type { ArrangementResponse } from '~/types/arrangements';
import { useArrangementsStore } from '~/stores/arrangements';
import { usePicturesStore } from '~/stores/pictures';
import ArrangementsListArrangement from "~/components/app/left_sidebar/ArrangementsListArrangement.vue";

export interface ArrangementNode {
  type: 'arrangement';
  key: string;
  arrangement: ArrangementResponse;
  children: GroupNode[];
}

export interface GroupNode {
  type: 'group';
  key: string;
  group: any; // Replace with your actual group type
  arrangement: ArrangementResponse;
}

type Node = ArrangementNode | GroupNode;

const arrangementsStore = useArrangementsStore();
const expandedKeys = ref<{ [key: string]: boolean }>({});
const arrangementsTree = ref<ArrangementNode[]>([]);
const selectedKeys = ref<string[]>([]);
const isLoading = ref<boolean>(true);

const buildArrangementsTree = () => {
  arrangementsTree.value = arrangementsStore.arrangements.map((arrangement) => ({
    type: 'arrangement',
    key: `arrangement=${arrangement.arrangement.id}`,
    arrangement,
    children: arrangement.groups.map((group) => ({
      type: 'group',
      key: `group=${arrangement.arrangement.id}:${group.id}`,
      group,
      arrangement,
    })),
  }));
};

const onNodeToggle = (node: Node) => {
  expandedKeys.value[node.key] = !expandedKeys.value[node.key];
};

const expandAll = () => {
  for (const node of arrangementsTree.value) {
    expandedKeys.value[node.key] = true;
  }
  expandedKeys.value = { ...expandedKeys.value };
};

watch(
  () => arrangementsStore.arrangementsLoadedPromise,
  async () => {
    await arrangementsStore.arrangementsLoadedPromise;
    buildArrangementsTree();
    if (isLoading.value) {
      isLoading.value = false;
      expandAll();
    }
  },
  { immediate: true }
);

watch(selectedKeys, () => {
  const selected = Object.entries(selectedKeys.value)
    .filter(([, value]) => value)
    .map(([key]) => key);

  if (selected.length > 0) {
    const query = selected.filter(Boolean).join(' ');
    if (query) {
      usePicturesStore().query(`${query} sort=creation`);
    }
  }
});

// TODO: watch last_query_components_ids, and select keys accordingly

const addArrangement = () => {
  usePicturesStore().query('config=arrangement:0');
};
</script>

<template>
  <div class="flex flex-col justify-between items-stretch gap-4 h-full">
    <Tree
      :value="arrangementsTree"
      v-model:selectionKeys="selectedKeys"
      :expandedKeys="expandedKeys"
      selectionMode="multiple"
      :metaKeySelection="true"
      class="arrangement-tree w-full"
      @node-toggle="onNodeToggle"
    >
      <template #default="{ node }">
        <ArrangementsListArrangement
          v-if="node.type === 'arrangement'"
          :node="node"
          @edit="() => usePicturesStore().query(`config=arrangement:${node.arrangement.arrangement.id}`)"
        />
        <ArrangementsListGroup v-else :node="node" />
      </template>
    </Tree>

    <Button icon="pi pi-plus" class="p-button-secondary w-full" @click="addArrangement">
      <i class="pi pi-plus"></i>&nbsp;Add arrangement
    </Button>
  </div>
</template>

<style lang="stylus">
.arrangement-tree
  padding .5em
  .p-tree-node-label
    width 100%
</style>
