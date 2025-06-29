<script setup lang="ts">
import {useArrangementsStore} from "~/stores/arrangements";
import type {StrategyFiltering} from "~/types/grouping";
import type {ArrangementRequest, ArrangementResponse, StrategyGroupingRequest} from "~/types/arrangements";
import StrategyGroupingConfig from "./arrangement/StrategyGroupingConfig.vue";

const props = defineProps({
  arrangementId: {
    type: Number,
    required: true
  }
});
const isNewArrangement = computed(() => props.arrangementId === 0);

const arrangementsStore = useArrangementsStore();

const currentArrangement = ref<ArrangementResponse | null>(null);
const groupingRequest = ref<StrategyGroupingRequest | null>(null);

const error = ref<string | null>(null);
const isLoading = ref(true);
const confirm = useConfirm();

const loadArrangement = async () => {
      isLoading.value = true;
      await arrangementsStore.arrangementsLoadedPromise;

      if (isNewArrangement.value) {
        currentArrangement.value = {
          groups: [],
          to_be_deleted_groups: [],
          arrangement: {
            id: 0,
            user_id: 0,
            name: "New Arrangement",
            strong_match_conversion: false,
            strategy: {
              preserve_unicity: true,
              filter: {
                Or: [
                  {
                    Filter: {
                      IncludeTags: [8, 10],
                    }
                  },
                  {
                    Filter: {
                      IncludeTags: [66, 10],
                    }
                  },
                  {
                    And: [
                      {
                        Filter: {
                          IncludeTags: [10, 21],
                        }
                      },
                      {
                        Not: {
                          Filter: {
                            IncludeTags: [2, 12],
                          }
                        }
                      }
                    ]
                  },
                  {
                    Not: {
                      Filter: {
                        IncludeTags: [2, 12],
                      }
                    },
                  }
                ]
              },
              groupings: {
                GroupByFilter: {
                  other_group_id: null,
                  filters: [
                    {
                      Filter: {
                        IncludeTags: [13],
                      }
                    }
                  ]
                }
              }
            }
          }
        }
        ;
      } else {
        const arrangement = arrangementsStore.arrangements.find(a => a.arrangement.id === props.arrangementId);
        console.log('Editing existing arrangement', arrangement);
        if (arrangement) {
          currentArrangement.value = arrangement;
        }
      }
      isLoading.value = false;
    }
;

watch(props, () => {
  loadArrangement();
}, {immediate: true});

const saveArrangement = async () => {
  if (!currentArrangement.value) return;

  // TODO: check requirements
  // if (!validate()) {
  //   return;
  // }

  if (groupingRequest.value == null) {
    error.value = "Undefined grouping strategy";
    return;
  }
  error.value = null;

  let arrangement: ArrangementRequest = {
    strong_match_conversion: currentArrangement.value.arrangement.strong_match_conversion,
    name: currentArrangement.value.arrangement.name,
    strategy: null,
  }
  if (!isManual.value) {
    arrangement.strategy = {
      preserve_unicity: currentArrangement.value.arrangement.strategy!.preserve_unicity,
      filter: currentArrangement.value.arrangement.strategy!.filter,
      groupings: groupingRequest.value,
    }
  }

  let res: ArrangementResponse | undefined;
  if (isNewArrangement.value) {
    res = await arrangementsStore.createArrangement(arrangement);
  } else {
    res = await arrangementsStore.updateArrangement(props.arrangementId, arrangement);
  }
  if (res) {
    await usePicturesStore().back();
  }
};
const deleteArrangement = async (event: MouseEvent) => {
  // TODO: make sure that there is no dependant arrangement and no hierarchy depending on this arrangement
  if (isNewArrangement.value) {
    await usePicturesStore().back();
    return;
  }

  confirm.require({
    target: event.currentTarget as HTMLElement | undefined,
    message: 'Do you want to delete this arrangement and all its groups?',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: async () => {
      await arrangementsStore.deleteArrangement(props.arrangementId);
      error.value = null;
      await usePicturesStore().back();
    }
  });
};

const isManual = computed(() => {
  return !currentArrangement.value || !currentArrangement.value.arrangement.strategy;
});

const isSMCEnabled = computed(() => {
  return currentArrangement.value?.arrangement.strong_match_conversion ?? false;
});

const preserve_unicity = computed(() => {
  return currentArrangement.value?.arrangement.strategy?.preserve_unicity ?? false;
});

const updateManual = (value: boolean) => {
  if (!currentArrangement.value) return;
  if (value) {
    currentArrangement.value.arrangement.strategy = null;
  } else {
    currentArrangement.value.arrangement.strategy = {
      filter: {
        Filter: {
          IncludeTags: [],
        }
      },
      groupings: {
        GroupByFilter: {
          filters: [],
          other_group_id: null,
        }
      },
      preserve_unicity: true,
    };
  }
};

const updateSMC = (value: boolean) => {
  if (!currentArrangement.value) return;
  currentArrangement.value.arrangement.strong_match_conversion = value;
};
const update_preserve_unicity = (value: boolean) => {
  if (!currentArrangement.value || !currentArrangement.value.arrangement.strategy) return;
  currentArrangement.value.arrangement.strategy.preserve_unicity = value;
};
const updateFilter = (filter: StrategyFiltering) => {
  if (!currentArrangement.value?.arrangement.strategy) return;
  currentArrangement.value.arrangement.strategy.filter = filter;
};

</script>

<template>
  <div class="p-4">
    <div v-if="isLoading" class="flex flex-col gap-3 items-center justify-center h-full my-4">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"/>
      <p>Loading</p>
    </div>

    <Message v-else-if="!currentArrangement" severity="error" :closable="false">
      Arrangement not found
    </Message>

    <div v-else class="flex flex-col gap-6">
      <Card>
        <template #title>
          <div class="flex justify-between items-center">
            <span>{{ isNewArrangement ? 'Create Arrangement' : 'Edit Arrangement' }}</span>
            <Button
                v-if="!isNewArrangement"
                icon="pi pi-trash"
                severity="danger"
                @click="deleteArrangement"
                outlined
            />
          </div>
        </template>

        <template #content>
          <div class="flex flex-col gap-4">
            <div>
              <label for="arrangement-name" class="font-medium block mb-1">Name</label>
              <div class="flex items-center gap-3 ">
                <InputText
                    id="arrangement-name"
                    v-model="currentArrangement.arrangement.name"
                    class="w-full"
                    placeholder="Enter tag group name"
                />
              </div>
            </div>

            <div class="flex items-center">
              <ToggleSwitch :modelValue="isManual" @update:modelValue="updateManual" class="mr-2"/>
              <label>Manual arrangement</label>
            </div>
            <div class="flex items-center">
              <ToggleSwitch :modelValue="isSMCEnabled" @update:modelValue="updateSMC" class="mr-2"/>
              <label>Enable strong match conversion</label>
            </div>
          </div>
        </template>
      </Card>

      <Card v-if="!isManual">
        <template #title>
          Filtering Strategy <br>
          <span class="text-base">All pictures matching the following filters will be grouped in this arrangement following the grouping strategy. Other pictures will not belong to this arrangement.</span>
        </template>
        <template #content>
          <div class="flex flex-col gap-3">
            <StrategyFilteringTree
                :filter="currentArrangement.arrangement.strategy!.filter"
                @update:filter="updateFilter"
            />
          </div>
        </template>
      </Card>

      <Card v-if="!isManual">
        <template #title>
          Grouping Strategy <br>
          <span class="text-base">Define how pictures are grouped in the groups of this arrangement.</span>
        </template>
        <template #content>
          <div class="flex flex-col gap-6">
            <div class="flex items-center">
              <ToggleSwitch
                  :modelValue="preserve_unicity"
                  @update:modelValue="update_preserve_unicity"
                  class="mr-2"
              />
              <label>Allow pictures to be in more than one group at once
                <i class="pi pi-info-circle text-red-700 ml-1"
                   v-tooltip.bottom="'Must be disabled for the arrangement to be used in a hierarchy. If enabled, the filters will be evaluated in the configured order.'"></i>
              </label>
            </div>

            <div>
              <StrategyGroupingConfig
                  :groupings="currentArrangement.arrangement.strategy!.groupings"
                  :preserve_unicity="preserve_unicity"
                  v-model:request="groupingRequest"
              />
            </div>
          </div>
        </template>
      </Card>

      <div class="flex justify-end mt-4 gap-4 items-center">
        <Message severity="error" icon="pi pi-info-circle" v-if="error">
          <span>{{ error }}</span>
        </Message>
        <Button
            label="Save Changes"
            icon="pi pi-check"
            @click="saveArrangement"
            severity="primary"
        />
      </div>
    </div>

    {{ currentArrangement }}

    <ConfirmPopup/>
    <Toast/>
  </div>
</template>

<style scoped lang="stylus">

</style>
