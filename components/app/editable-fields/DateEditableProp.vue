<script setup lang="ts">
import BaseEditableProp from './BaseEditableProp.vue';
import Calendar from 'primevue/calendar';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Button from 'primevue/button';

const props = defineProps({
  modelValue: {
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

function formatDateToLocalISO(date: Date) {
  const pad = (num: number) => num.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

const save = () => {
  const newValue = value.value ? formatDateToLocalISO(value.value) : null;
  if (newValue !== props.modelValue && newValue !== null) {
    emit('update:modelValue', newValue);
    emit('save');
  }
};

const cancel = () => {
  value.value = props.modelValue ? new Date(props.modelValue) : null;
};

const displayValue = computed(() => {
  if (props.modelValue === null) return '∅';
  if (props.modelValue === undefined) return 'mixed';
  const date = new Date(props.modelValue);
  let str = date.toLocaleString('en-US', {day: "numeric", month: 'short', year: 'numeric'});
  if (props.showTime) {
    str += ` ${date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit', second: props.showSeconds ? '2-digit' : undefined})}`;
  }
  return str;
});

const autoBlur = ref(true);

</script>

<template>
  <BaseEditableProp
    :value="displayValue"
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
          <Button @click="cancel" icon="pi pi-undo" class="px-0 py-0" severity="secondary"/>
        </InputGroupAddon>
      </InputGroup>
    </template>
  </BaseEditableProp>
</template>
