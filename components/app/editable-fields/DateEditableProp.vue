<script setup lang="ts">
import BaseEditableProp from './BaseEditableProp.vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Button from 'primevue/button';
import {formatDateToLocalISO, formatDateToTimeString} from "~/composables/formatUtils";

const props = defineProps({
  modelValue: {
    type: [String, null],
    default: null,
  },
  originalValue: {
    type: [String, null],
    default: null,
  },
  isMixed: {
    type: Boolean,
    default: false
  },
  originalIsMixed: {
    type: Boolean,
    default: false
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
  },
  nullable: {
    type: Boolean,
    default: true
  },
});

const emit = defineEmits(['update:modelValue', 'update:isMixed', 'save']);

const value = ref(props.modelValue ? new Date(props.modelValue) : null);
const isEditing = ref(false);

watch(() => props.modelValue, (val) => {
  value.value = val ? new Date(val) : null;
});

const save = () => {
  let newValue = value.value ? formatDateToLocalISO(value.value) : null;
  if (newValue !== props.modelValue) {
    if (!props.nullable && newValue === null) {
      newValue = props.originalValue;
    }
    emit('update:modelValue', newValue);
    emit('save');
  }
};

const cancel = () => {
  value.value = props.modelValue ? new Date(props.modelValue) : props.modelValue;
};
const reset = () => {
  if (props.originalIsMixed) {
    value.value = undefined;
    emit('update:isMixed', true);
  } else {
    value.value = props.originalValue ? new Date(props.originalValue) : props.originalValue;
    emit('update:modelValue', value.value ? formatDateToLocalISO(value.value) : null);
  }
  emit('save');
  isEditing.value = false;
};
const clear = () => {
  value.value = null;
  emit('update:modelValue', value.value);
  emit('save');
  isEditing.value = false;
}

const displayValue = computed(() => {
  if (props.modelValue == null) return null;
  return formatDateToTimeString(props.modelValue, props.showTime, props.showSeconds);
});

const autoBlur = ref(true);

</script>

<template>
  <BaseEditableProp
      v-model:is-editing="isEditing"
      :value="displayValue"
      :isMixed="isMixed"
      :edited="originalValue !== modelValue || originalIsMixed !== isMixed"
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
          <Button @click="clear" icon="pi pi-times" class="px-0 py-0" severity="secondary"
                  v-if="nullable && value == null && isMixed"/>
          <Button v-else @click="reset" icon="pi pi-undo" class="px-0 py-0" severity="secondary"/>
        </InputGroupAddon>
      </InputGroup>
    </template>
  </BaseEditableProp>
</template>
