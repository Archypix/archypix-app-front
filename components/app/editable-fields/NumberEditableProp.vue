<script setup lang="ts">
import BaseEditableProp from './BaseEditableProp.vue';
import InputNumber from 'primevue/inputnumber';

const props = defineProps({
  modelValue: {
    type: [Number, String, null, undefined],
    default: null,
    validator: (value: any) => {
      if (value === null || value === undefined || value === '') return true;
      return !isNaN(Number(value));
    }
  },
  placeholder: {
    type: String,
    default: 'Enter a number'
  },
  nullable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  min: {
    type: Number,
    default: -Infinity
  },
  max: {
    type: Number,
    default: Infinity
  },
  step: {
    type: Number,
    default: 1
  },
  decimal: {
    type: Number,
    default: 0,
    validator: (value: number) => value >= 0 && value <= 20
  },
  suffix: {
    type: String,
    default: ''
  },
  prefix: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const value = ref(props.modelValue);

function validate(value: string): boolean {
  if (value === '') return true;
  const num = Number(value);
  if (isNaN(num)) return false;
  if (num < props.min || num > props.max) return false;

  // Check decimal places
  if (props.decimal === 0 && !Number.isInteger(num)) return false;

  const decimalPart = value.split('.')[1];
  if (decimalPart && decimalPart.length > props.decimal) return false;

  return true;
}

function format(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (isNaN(num)) return String(value);

  let formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: props.decimal
  });

  return `${props.prefix}${formatted}${props.suffix}`;
}

const save = () => {
  if (value.value === '') {
    if (props.nullable) {
      emit('update:modelValue', null);
    }
  } else if (validate(value.value)) {
    emit('update:modelValue', value.value);
  }
};
</script>

<template>
  <BaseEditableProp
    :value="value"
    @save="save"
  >
    <template #input="{ save, cancel }">
      <div class="flex items-center gap-1 w-full">
        <InputNumber
          v-model="value"
          class="flex-1 py-1 px-2 text-sm"
          :min="min"
          :max="max"
          :step="step"
          :minFractionDigits="0"
          :maxFractionDigits="decimal"
          :suffix="suffix"
          :prefix="prefix"
          :placeholder="placeholder"
          @keydown.enter="save"
          @keydown.esc="cancel"
          @blur="save"
        />
      </div>
    </template>
  </BaseEditableProp>
</template>
