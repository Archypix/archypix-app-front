<script setup lang="ts">

import type {StrategyFilteringNode} from "~/components/app/config_panes/strategy_filtering/StrategyFilteringTree.vue";

const props = defineProps<{
  filter: StrategyFilteringNode,
}>();

const isFilter = computed(() => props.filter.type === 'Filter');
const isOrAnd = computed(() => ['Or', 'And'].includes(props.filter.type));
const isNot = computed(() => props.filter.type === 'Not');

</script>

<template>
  <li :class="filter.type">
    <div v-if="isFilter && filter.filter">
      <StrategyFilteringFilter :filter="filter.filter" />
    </div>
    <div v-else class="w-full flex items-stretch gap-1">
      <div class="type-bar w-10 flex items-center justify-center rounded-md">
        <span class="text-sm font-bold">{{ filter.type }}</span>
      </div>
      <div>
        <ul class="flex flex-col gap-2">
          <li v-for="child in filter.children" :key="child.key">
            <StrategyFilteringNode :filter="child" />
          </li>
          <li v-if="isOrAnd" :key="'add-button'">
            <Button icon="pi pi-plus" severity="secondary"/>
          </li>
        </ul>
      </div>
    </div>
  </li>
</template>

<style scoped lang="stylus">

//li.Filter
//  border-radius: 0.25rem;

div.type-bar
  color: white;

li.Or div.type-bar
  background-color: var(--blue-400);

li.And div.type-bar
  background-color: var(--orange-400);

li.Not div.type-bar
  background-color: var(--red-400);

</style>
