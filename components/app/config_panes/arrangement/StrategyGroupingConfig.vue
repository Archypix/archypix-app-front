<script setup lang="ts">
import {markRaw, ref, watch} from 'vue';
import {type FilterGrouping, getStrategyGroupingTypeAndValue, type StrategyGrouping, type StrategyGroupingMap,} from '~/types/grouping';
import type {FilterGroupingRequest, StrategyGroupingRequest, StrategyGroupingRequestMap, TagGroupingRequest} from '~/types/arrangements';
import FilterGroupingConfig from './grouping/FilterGroupingConfig.vue';
import TagGroupingConfig from './grouping/TagGroupingConfig.vue';

const props = defineProps<{
  groupings: StrategyGrouping;
  request: StrategyGroupingRequest | null;
  preserve_unicity: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:request', value: StrategyGroupingRequest): void;
}>();

const arrangementsStore = useArrangementsStore();

type GroupingType = {
  [K in keyof StrategyGroupingRequestMap]: {
    label: string;
    component: any; // Vue component type
    createDefault: () => StrategyGroupingRequestMap[K];
    createFromStrategyGrouping: (grouping: StrategyGroupingMap[K]) => Promise<StrategyGroupingRequestMap[K]>;
    data: Ref<StrategyGroupingRequestMap[K]>;
  }
};
const groupingTypes: GroupingType = {
  GroupByFilter: {
    label: 'Group by Filters',
    component: markRaw(FilterGroupingConfig),
    createDefault: (): FilterGroupingRequest => ({
      filters: []
    }),
    createFromStrategyGrouping: async (grouping: FilterGrouping): Promise<FilterGroupingRequest> => {
      console.log("grouping", grouping, grouping.filters);
      const filters = await Promise.all(
          grouping.filters.map(async ([idStr, filter]) => {
            const id = Number(idStr);
            const name = await arrangementsStore.groupIdToGroupName(id) || `Group of id ${id}`;
            return {id, name, filter};
          })
      );
      console.log('filters', filters);
      return {filters};
    },
    data: ref<FilterGroupingRequest>({filters: []})
  },
  GroupByTags: {
    label: 'Group by Tags',
    component: markRaw(TagGroupingConfig),
    createDefault: (): TagGroupingRequest => ({
      tag_group_id: 0,
      group_names_format: 'Group {index}'
    }),
    createFromStrategyGrouping: async (grouping: TagGroupingRequest): Promise<TagGroupingRequest> => {
      return {
        tag_group_id: grouping.tag_group_id,
        group_names_format: grouping.group_names_format || 'Group {index}'
      };
    },
    data: ref<TagGroupingRequest>({tag_group_id: 0, group_names_format: 'Group {index}'})
  }
};

const currentType = ref<keyof StrategyGroupingRequestMap>('GroupByFilter');
const currentGrouping = computed({
  get() {
    return groupingTypes[currentType.value].data.value;
  },
  set(newValue) {
    groupingTypes[currentType.value].data.value = newValue;
    emit('update:request', {
      [currentType.value]: newValue
    } as StrategyGroupingRequest);
  }
})

watch(() => props.groupings, async (grouping) => {
  const [type, value] = getStrategyGroupingTypeAndValue(grouping);
  currentType.value = type;
  // @ts-ignore
  currentGrouping.value = await groupingTypes[type].createFromStrategyGrouping(value);
}, {immediate: true});

</script>

<template>
  <div class="strategy-grouping">
    <div class="field">
      <label for="grouping-type" class="block font-medium mb-1">
        Strategy
      </label>
      <Select
          id="grouping-type"
          v-model="currentType"
          :options="Object.entries(groupingTypes).map(([value, config]) => ({
          label: config.label,
          value
        }))"
          option-label="label"
          option-value="value"
          placeholder="Select a grouping strategy"
          class="w-full"
      />
    </div>
    <div class="mt-4">
      <component
          :is="groupingTypes[currentType].component"
          :preserve-unicity="preserve_unicity"
          v-model:grouping="currentGrouping"
      />
    </div>
  </div>
</template>

<style scoped lang="stylus">
.strategy-grouping
  .field
    margin-bottom 1rem
</style>
