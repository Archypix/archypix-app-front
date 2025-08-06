<script setup lang="ts">
import BaseEditableProp from './BaseEditableProp.vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Button from 'primevue/button';
import {formatDateToLocalISO, formatDateToTimeString} from "~/composables/formatUtils";

const props = defineProps({
  modelValue: {
    type: [String, null, undefined],
    default: null,
  },
  originalValue: {
    type: [String, null, undefined],
    default: null,
  },
  title: {
    type: String,
  },
  placeholder: {
    type: String,
    default: 'Select a date'
  },
  showTime: {
    type: Boolean,
    default: true
  },
  timeOnly: {
    type: Boolean,
    default: false
  },
  showSeconds: {
    type: Boolean,
    default: true
  },
  dateFormat: {
    type: String,
    default: 'yy-mm-dd'
  },
  minDate: {
    type: String,
    default: null
  },
  maxDate: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const value = ref(props.modelValue ? new Date(props.modelValue) : null);

watch(() => props.modelValue, (val) => {
  value.value = val ? new Date(val) : null;
});

const save = () => {
  const newValue = value.value ? formatDateToLocalISO(value.value) : null;
  if (newValue !== props.modelValue && newValue !== null) {
    emit('update:modelValue', newValue);
    emit('save');
  }
};

const cancel = () => {
  value.value = props.modelValue ? new Date(props.modelValue) : props.modelValue;
};
const reset = () => {
  value.value = props.originalValue ? new Date(props.originalValue) : props.originalValue;
  save()
};

const displayValue = computed(() => {
  if (props.modelValue === null) return '∅';
  if (props.modelValue === undefined) return 'mixed';
  return formatDateToTimeString(props.modelValue, props.showTime, props.showSeconds);
});

const autoBlur = ref(true);

</script>

<template>
  <BaseEditableProp
    :value="displayValue"
    :edited="originalValue !== modelValue"
    :title="title"
    :auto-blur="autoBlur"
    @save="save"
    @cancel="cancel"
  >
    <template #input="{ save, cancel}">
      <InputGroup class="rounded-xs">
        <DatePicker
          v-model="value"
          :show-time="showTime"
          :time-only="timeOnly"
          :show-seconds="showSeconds"
          :date-format="dateFormat"
          :min-date="minDate ? new Date(minDate) : null"
          :max-date="maxDate ? new Date(maxDate) : null"
          :placeholder="placeholder"
          @keydown.enter="save"
          @keydown.esc="cancel"
          :pt="{
            pcInputText: { root: {class: 'py-0.5 px-2 text-sm'} },
          }"
          @show="autoBlur = false"
          @hide="autoBlur = true"
        />
        <InputGroupAddon class="flex-0 min-w-8">
          <Button @click="reset" icon="pi pi-undo" class="px-0 py-0" severity="secondary"/>
        </InputGroupAddon>
      </InputGroup>
    </template>
  </BaseEditableProp>
</template>
