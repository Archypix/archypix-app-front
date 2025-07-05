<script setup lang="ts">
import BaseEditableProp from './BaseEditableProp.vue';
import Calendar from 'primevue/calendar';

const props = defineProps({
  modelValue: {
    type: [String, null, undefined],
    default: null,
    validator: (value: any) => {
      if (value === null || value === undefined || value === '') return true;
      return !isNaN(Date.parse(value));
    }
  },
  placeholder: {
    type: String,
    default: 'Select a date'
  },
  nullable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showTime: {
    type: Boolean,
    default: false
  },
  timeOnly: {
    type: Boolean,
    default: false
  },
  showSeconds: {
    type: Boolean,
    default: false
  },
  showMillisec: {
    type: Boolean,
    default: false
  },
  dateFormat: {
    type: String,
    default: 'yy-mm-dd'
  },
  timeFormat: {
    type: String,
    default: 'HH:MM:ss'
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

const value = ref(props.modelValue);

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  if (props.showTime || props.timeOnly) {
    return date.toLocaleString();
  }
  return date.toLocaleDateString();
}

function parseDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString();
}

function validate(value: string): boolean {
  if (value === '') return true;
  const date = new Date(value);
  if (isNaN(date.getTime())) return false;

  if (props.minDate && new Date(value) < new Date(props.minDate)) return false;
  if (props.maxDate && new Date(value) > new Date(props.maxDate)) return false;

  return true;
}
</script>

<template>
  <BaseEditableProp
    :value="value"
    @save="emit('save', value)"
  >
    <template #input="{ save, cancel }">
      <div class="w-full">
        <Calendar
          v-model="value"
          class="w-full"
          :show-time="showTime"
          :time-only="timeOnly"
          :show-seconds="showSeconds"
          :show-millisec="showMillisec"
          :date-format="dateFormat"
          :time-format="timeFormat"
          :min-date="minDate ? new Date(minDate) : null"
          :max-date="maxDate ? new Date(maxDate) : null"
          :placeholder="placeholder"
          :show-icon="true"
          @date-select="save"
          @keydown.enter="save"
          @keydown.esc="cancel"
          @blur="save"
        />
      </div>
    </template>
  </BaseEditableProp>
</template>
