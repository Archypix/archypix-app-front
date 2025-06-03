<script setup lang="ts">

import type {FilterType, StrategyFiltering} from "~/types/grouping";
import StrategyFilteringNode from "~/components/app/config_panes/strategy_filtering/StrategyFilteringNode.vue";

export interface StrategyFilteringNode {
  key: string,
  type: string,
  filter?: FilterType, // If the type is 'Filter'
  children?: StrategyFilteringNode[] // If the type is 'Or', 'And', or 'Not' (if 'Not', it has only a single child).
}

const props = defineProps<{
  filter: StrategyFiltering,
}>();

const tree = ref<StrategyFilteringNode>();

const buildTree = () => {

  const getFilterType = (filter: StrategyFiltering): string => {
    if ('Filter' in filter) {
      return 'Filter';
    }
    if ('Or' in filter) {
      return 'Or';
    }
    if ('And' in filter) {
      return 'And';
    }
    if ('Not' in filter) {
      return 'Not';
    }
    return '';
  }

  const toTreeNode = (filtering: StrategyFiltering, parentKey?: string, index: number = 0): StrategyFilteringNode => {
    const key = (parentKey ? `${parentKey}-` : ``) + `${index}`;
    const type = getFilterType(filtering);
    if (type == 'Filter') {
      const filter: FilterType = filtering[type];
      return {key, type, filter};
    } else if (type == 'Not') {
      const subFilter: StrategyFiltering = filtering[type].value;
      const children = [toTreeNode(subFilter, key, 0)];
      return {key, type, children};
    } else {
      const subFilters: StrategyFiltering[] = filtering[type].value;
      const children = subFilters.map((f, i) => toTreeNode(f, key, i));
      return {key, type, children};
    }
  }

  tree.value = toTreeNode(props.filter);
};

watch(props, () => {
  buildTree();
}, {immediate: true});


</script>

<template>
  <ul>
    <StrategyFilteringNode
        :filter="tree"
    />
  </ul>
</template>

<style scoped lang="stylus">

</style>
