<script setup lang="ts">

import {
  type FilterType, getFilterType,
  getStrategyFilteringChildren,
  isStrategyFilteringFilter,
  type StrategyFiltering
} from "~/types/grouping";
import StrategyFilteringNode from "./filtering/StrategyFilteringNode.vue";

export interface StrategyFilteringNode {
  key: string,
  type: string,
  filter?: FilterType, // If the type is 'Filter'
  children?: StrategyFilteringNode[] // If the type is 'Or', 'And', or 'Not' (if 'Not', it has only a single child).
}

const props = defineProps<{
  filter: StrategyFiltering,
}>();

const emit = defineEmits<{
  (e: 'update:filter', value: StrategyFiltering): void;
}>();

const tree = ref<StrategyFilteringNode>();

const buildTree = () => {

  const toTreeNode = (filtering: StrategyFiltering, parentKey?: string, index: number = 0): StrategyFilteringNode => {
    const key = (parentKey ? `${parentKey}-` : ``) + `${index}`;
    const type = getFilterType(filtering);
    if (isStrategyFilteringFilter(filtering)) {
      const filter: FilterType = filtering.Filter;
      return {key, type, filter};
    } else {
      const subFilters = getStrategyFilteringChildren(filtering);
      const children = subFilters.map((f, i) => toTreeNode(f, key, i));
      return {key, type, children};
    }
  }
  tree.value = toTreeNode(props.filter);
};

const unbuildTree = (node: StrategyFilteringNode): StrategyFiltering => {
  if (node.type === 'Filter') {
    return {Filter: node.filter!};
  } else if (node.type === 'Or') {
    return {Or: node.children!.map(unbuildTree)};
  } else if (node.type === 'And') {
    return {And: node.children!.map(unbuildTree)};
  } else if (node.type === 'Not') {
    return {Not: unbuildTree(node.children![0])};
  }
  return {} as StrategyFiltering;
}

watch(props, () => {
  buildTree();
}, {immediate: true});


const updateRootFilter = (filter: StrategyFilteringNode) => {
  emit('update:filter', unbuildTree(filter));
};



</script>

<template>
  <ul v-if="tree">
    <StrategyFilteringNode
        :filter="tree"
        :is-only-child="false"
        :parent-type="''"
        @update:filter="updateRootFilter"
    />
  </ul>
</template>

<style scoped lang="stylus">

</style>
