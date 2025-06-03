<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTagsStore } from '~/stores/tags';
import { useArrangementsStore } from '~/stores/arrangements';
import TagSelector from '~/components/app/TagSelector.vue';
import type { FilterType } from '~/types/grouping';
import type {PictureOrientation} from "~/types/pictures";

const props = defineProps<{
  filter: FilterType;
}>();

const emit = defineEmits<{
  (e: 'update:filter', value: FilterType): void;
}>();

const tagsStore = useTagsStore();
const arrangementsStore = useArrangementsStore();

// Available filter types
const availableFilterTypes = [
  { label: 'Include Tags', value: 'IncludeTags' },
  { label: 'Include Groups', value: 'IncludeGroups' },
  { label: 'Exif Equals', value: 'ExifEqualTo' }
];

// Available EXIF fields with their types
const availableExifFields = [
  { label: 'Creation Date', value: 'CreationDate', type: 'date' },
  { label: 'Edition Date', value: 'EditionDate', type: 'date' },
  { label: 'Latitude', value: 'Latitude', type: 'text' },
  { label: 'Longitude', value: 'Longitude', type: 'text' },
  { label: 'Altitude', value: 'Altitude', type: 'number' },
  { label: 'Orientation', value: 'Orientation', type: 'text' },
  { label: 'Width', value: 'Width', type: 'number' },
  { label: 'Height', value: 'Height', type: 'number' },
  { label: 'Camera Brand', value: 'CameraBrand', type: 'text' },
  { label: 'Camera Model', value: 'CameraModel', type: 'text' },
  { label: 'Focal Length', value: 'FocalLength', type: 'text' },
  { label: 'Exposure Time', value: 'ExposureTime', type: 'number' },
  { label: 'ISO Speed', value: 'IsoSpeed', type: 'number' },
  { label: 'Aperture (F-Number)', value: 'FNumber', type: 'text' },
];

// State
const selectedFilterType = ref<string>('');
const selectedTags = ref<number[]>([]);
const selectedGroups = ref<number[]>([]);
const selectedExifField = ref<string>('');
const exifValue = ref<any>(null);

// Computed properties for EXIF field types
const isTextExifField = computed(() => {
  const field = availableExifFields.find(f => f.value === selectedExifField.value);
  return field?.type === 'text';
});

const isNumberExifField = computed(() => {
  const field = availableExifFields.find(f => f.value === selectedExifField.value);
  return field?.type === 'number';
});

const isDateExifField = computed(() => {
  const field = availableExifFields.find(f => f.value === selectedExifField.value);
  return field?.type === 'date';
});

// Available groups from arrangements store
const availableGroups = computed(() => {
  const groups: Array<{ id: number; name: string }> = [];
  arrangementsStore.arrangements.forEach(arrangement => {
    arrangement.groups.forEach(group => {
      groups.push({
        id: group.id,
        name: `${arrangement.arrangement.name} > ${group.name}`
      });
    });
  });
  return groups;
});

// Initialize from props
onMounted(() => {
  if ('IncludeTags' in props.filter) {
    selectedFilterType.value = 'IncludeTags';
    selectedTags.value = [...props.filter.IncludeTags];
  } else if ('IncludeGroups' in props.filter) {
    selectedFilterType.value = 'IncludeGroups';
    selectedGroups.value = [...props.filter.IncludeGroups];
  } else if ('ExifEqualTo' in props.filter) {
    selectedFilterType.value = 'ExifEqualTo';
    const exifKey = Object.keys(props.filter.ExifEqualTo)[0] as string;
    selectedExifField.value = exifKey;
    exifValue.value = props.filter.ExifEqualTo[exifKey][0]; // Get first value
  }
});

// Event handlers
const onFilterTypeChange = () => {
  // Reset values when filter type changes
  selectedTags.value = [];
  selectedGroups.value = [];
  selectedExifField.value = '';
  exifValue.value = null;
  updateFilter();
};

const updateTags = (tagsToAdd: number[], tagsToRemove: number[]) => {
  selectedTags.value = selectedTags.value.filter(tag => !tagsToRemove.includes(tag));
  selectedTags.value.push(...tagsToAdd.filter(tag => !selectedTags.value.includes(tag)));
  selectedTags.value = [...new Set(selectedTags.value)]; // Ensure unique tags
  updateFilter();
};

const onGroupsChange = () => {
  updateFilter();
};

const onExifFieldChange = () => {
  exifValue.value = null;
  updateFilter();
};

const onExifValueChange = () => {
  updateFilter();
};

// Update the model value based on current selections
const updateFilter = () => {
  let newValue: FilterType | null = null;

  switch (selectedFilterType.value) {
    case 'IncludeTags':
      newValue = { IncludeTags: [...selectedTags.value] };
      break;
    case 'IncludeGroups':
      newValue = { IncludeGroups: [...selectedGroups.value] };
      break;
    case 'ExifEqualTo':
      if (selectedExifField.value && exifValue.value !== null) {
        newValue = {
          ExifEqualTo: {
            [selectedExifField.value]: [exifValue.value]
          }
        };
      }
      break;
    default:
      return;
  }

  if (newValue) {
    emit('update:filter', newValue);
  }
};

const selectedCity = ref();
const cities = ref([
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' },
  { name: 'Istanbul', code: 'IST' },
  { name: 'Paris', code: 'PRS' }
]);
</script>

<template>
  <div class="filter-container p-1 border w-full rounded-lg flex flex-row gap-2 items-center">
      <Select
        v-model="selectedFilterType"
        :options="availableFilterTypes"
        option-label="label"
        option-value="value"
        @change="onFilterTypeChange"
      />

    <!-- Tags Filter -->
    <div v-if="selectedFilterType === 'IncludeTags'" class="filter-content">
      <TagSelector
        :pictureTags="selectedTags"
        :asCombo="true"
        @update:update="updateTags"
      />
    </div>

    <!-- Groups Filter -->
    <div v-else-if="selectedFilterType === 'IncludeGroups'" class="filter-content">
      <MultiSelect
        v-model="selectedGroups"
        :options="availableGroups"
        option-label="name"
        option-value="id"
        :filter="true"
        display="chip"
        class="w-full"
        @change="onGroupsChange"
      />
    </div>

    <!-- Exif Equality Filter -->
    <div v-else-if="selectedFilterType === 'ExifEqualTo'" class="filter-content">
      <div class="flex flex-row gap-2">
        <div>
          <Select
            v-model="selectedExifField"
            :options="availableExifFields"
            option-label="label"
            option-value="value"
            class="w-full"
            @change="onExifFieldChange"
          />
        </div>
        <div v-if="selectedExifField">
          <InputText
            v-if="isTextExifField"
            v-model="exifValue"
            class="w-full"
            @update:model-value="onExifValueChange"
          />
          <InputNumber
            v-else-if="isNumberExifField"
            v-model="exifValue"
            class="w-full"
            @update:model-value="onExifValueChange"
          />
          <Calendar
            v-else-if="isDateExifField"
            v-model="exifValue"
            date-format="yy-mm-dd"
            show-icon
            show-button-bar
            class="w-full"
            @update:model-value="onExifValueChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
