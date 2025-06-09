<script setup lang="ts">

import type {StrategyFilteringNode} from "~/components/app/config_panes/strategy_filtering/StrategyFilteringTree.vue";
import type {FilterType} from "~/types/grouping";
import {computed, ref} from "vue";

const props = defineProps<{
  filter: StrategyFilteringNode,
  isOnlyChild: boolean,
  parentType: string,
}>();

const isFilter = computed(() => props.filter.type === 'Filter');
const isOrAnd = computed(() => ['Or', 'And'].includes(props.filter.type));
const isNot = computed(() => props.filter.type === 'Not');

const emit = defineEmits<{
  (e: 'update:filter', value: StrategyFilteringNode): void;
  (e: 'update:delete'): void;
  (e: 'wrap-into', type: string): void;
  (e: 'unwrap'): void;
  (e: 'update:unwrap-child-children', children: StrategyFilteringNode[]): void;
}>();

const updateSelf = (filter: FilterType) => {
  props.filter.filter = filter;
  emit('update:filter', props.filter);
};
const wrapInto = (type: string) => {
  console.log('Wrapping into', type, 'for filter', props.filter);
  if (['Or', 'And', ''].includes(props.parentType)) {
    const newFilter: StrategyFilteringNode = {
      key: `${props.filter.key}`,
      type,
      children: [
        {
          ...props.filter,
          key: `${props.filter.key}-0`,
        }
      ]
    };
    emit('update:filter', newFilter);
  } else if (props.parentType === 'Not') {
    emit('wrap-into', type);
  } else {
    console.warn('Cannot wrap into a non-Or/And/Not filter');
  }
};

const deleteChild = (child: StrategyFilteringNode) => {
  if (isOrAnd.value && props.filter.children) {
    const newFilter = {
      ...props.filter,
      children: props.filter.children.filter(c => c.key !== child.key)
    };
    emit('update:filter', newFilter);
  } else {
    emit('update:delete');
  }
};
const updateChild = (child: StrategyFilteringNode) => {
  if (props.filter.children) {
    const newFilter = {
      ...props.filter,
      children: props.filter.children.map(c => c.key === child.key ? child : c)
    };
    emit('update:filter', newFilter);
  }
};
const unwrapChild = (_child: StrategyFilteringNode) => {
  if (props.filter.children && props.filter.children.length === 1) {
    const newFilter = {
      ...props.filter.children[0],
      key: props.filter.key,
    };
    emit('update:filter', newFilter);
  } else {
    console.warn('Cannot unwrap child, it has more than one child or no children');
  }
};
const unwrapChildren = () => {
  if (props.filter.children && props.filter.children.length > 0) {
    emit('update:unwrap-child-children', props.filter.children);
  } else {
    console.warn('Cannot unwrap, no children to unwrap');
  }
}
const unwrapChildChildren = (child: StrategyFilteringNode, children: StrategyFilteringNode[]) => {
  if (isOrAnd.value && props.filter.children) {
    const iOffset = props.filter.children.length;
    const newFilter: StrategyFilteringNode = {
      key: props.filter.key,
      type: props.filter.type,
      children: [...props.filter.children.filter(c => c.key !== child.key), ...children.map((child, i) => ({
        ...child,
        key: `${props.filter.key}-${i + iOffset}`,
      }))]
    };
    emit('update:filter', newFilter);
  } else {
    console.warn('Cannot add children to a non-Or/And filter');
  }
}


const optionsMenu = ref<any>(null);
const optionsMenuModel = computed(() => {
  const menu = [];
  if (!props.filter.children) return [];

  if (['Or', 'And', 'Not'].includes(props.parentType)) {
    menu.push({
      label: 'Delete',
      command: () => emit('update:delete'),
    });
  }
  if (props.filter.children.length > 0 && ['Or', 'And'].includes(props.parentType)) {
    menu.push({
      label: 'Unwrap content',
      command: unwrapChildren,
    });
  }
  if (props.filter.type === 'And') {
    menu.push({
      label: 'Transform to Or',
      command: () => emit('update:filter', {
        ...props.filter,
        type: 'Or',
      }),
    });
  } else if (props.filter.type === 'Or') {
    menu.push({
      label: 'Transform to And',
      command: () => emit('update:filter', {
        ...props.filter,
        type: 'And',
      }),
    });
  }
  return menu;
});

const addMenu = ref<any>(null);
function addFilter(type: string) {
  if (props.filter.children) {
    let filter: FilterType | null = null;
    switch (type) {
      case 'IncludeTags':
        filter = {IncludeTags: []};
        break;
      case 'IncludeGroups':
        filter = {IncludeGroups: []};
        break;
      case 'ExifEqualTo':
        filter = {ExifEqualTo: {CreationDate: []}};
        break;
      default:
        console.warn('Unknown filter type:', type);
        break;
    }
    if (filter === null) return;
    const el = {
      key: `${props.filter.key}-${props.filter.children?.length || 0}`,
      type: 'Filter',
      filter,
    };
    props.filter.children.push(el);
    emit('update:filter', props.filter);
  } else {
    console.warn('Cannot add sub group to a non-Or/And filter');
  }
}

function addSubGroup(type: string) {
  if (props.filter.children) {
    const el = {
      key: `${props.filter.key}-${props.filter.children?.length || 0}`,
      type,
      children: [],
    };
    props.filter.children.push(el);
    emit('update:filter', props.filter);
  } else {
    console.warn('Cannot add sub group to a non-Or/And filter');
  }
}

const addMenuModel = [
  {
    label: 'Include Tags',
    command: () => addFilter('IncludeTags'),
  },
  {
    label: 'Include Groups',
    command: () => addFilter('IncludeGroups'),
  },
  {
    label: 'Exif Equal To',
    command: () => addFilter('ExifEqualTo'),
  },
  {
    label: 'Add Or Group',
    command: () => addSubGroup('Or'),
  },
  {
    label: 'Add And Group',
    command: () => addSubGroup('And'),
  },
];

</script>

<template>
  <li :class="filter.type">
    <div v-if="isFilter && filter.filter">
      <StrategyFilteringFilter
          :filter="filter.filter" :is-only-child="isOnlyChild" :parent-type="parentType"
          @update:filter="updateSelf" @update:delete="$emit('update:delete')" @wrap-into="wrapInto" @unwrap="$emit('unwrap')"/>
    </div>
    <div v-else class="w-full flex items-stretch gap-1">
      <div class="type-bar w-10 flex flex-col items-center justify-between content-center">
        <Button v-if='isOrAnd' class="p-button p-button-contrast" icon="pi pi-ellipsis-v" @click="optionsMenu.toggle($event)"/>
        <div v-else></div>
        <Menu v-if='isOrAnd' ref="optionsMenu" :model="optionsMenuModel" :popup="true"/>
        <span class="text-sm font-bold">{{ filter.type }}</span>
        <div></div>
      </div>
      <div class="w-full">
        <ul class="flex flex-col gap-2">
          <li v-for="child in filter.children" :key="child.key">
            <StrategyFilteringNode
                :filter="child" :is-only-child="filter.children?.length === 1" :parent-type="filter.type"
                @update:filter="updateChild" @update:delete="deleteChild(child)" @wrap-into="wrapInto" @unwrap="unwrapChild(child)"
                @update:unwrap-child-children="(children) => unwrapChildChildren(child, children)"/>
          </li>
          <li v-if="isOrAnd" :key="'add-button'">
            <Button icon="pi pi-plus" severity="secondary" @click="addMenu.toggle($event)"/>
            <Menu ref="addMenu" :model="addMenuModel" :popup="true"/>
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
  border-radius: 6px;

li.Or > div > div.type-bar
  background-color: var(--p-blue-400);

li.And > div > div.type-bar
  background-color: var(--p-orange-400);

li.Not > div > div.type-bar
  background-color: var(--p-red-400);

</style>
