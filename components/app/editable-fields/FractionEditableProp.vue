<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseEditableProp from './BaseEditableProp.vue';
import InputNumber from 'primevue/inputnumber';

const props = defineProps({
  numerator: {
    type: [Number, null, undefined],
    default: null,
  },
  denominator: {
    type: [Number, null, undefined],
    default: null,
  },
  placeholder: {
    type: String,
    default: 'Enter fraction (e.g., 1/100)'
  },
  nullable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  minNumerator: {
    type: Number,
    default: -Infinity
  },
  maxNumerator: {
    type: Number,
    default: Infinity
  },
  minDenominator: {
    type: Number,
    default: 1 // Denominator can't be zero
  },
  maxDenominator: {
    type: Number,
    default: Infinity
  },
  allowDecimal: {
    type: Boolean,
    default: false
  },
  decimalPlaces: {
    type: Number,
    default: 2,
    validator: (value: number) => value >= 0 && value <= 8
  }
});

const emit = defineEmits([
  'update:numerator',
  'update:denominator',
]);

const numerator = ref(props.numerator);
const denominator = ref(props.denominator);

// Watch for external changes to numerator and denominator
watch(() => [props.numerator, props.denominator], ([num, den]) => {
  if (num === null || den === null) {
    numerator.value = null;
    denominator.value = null;
  } else {
    numerator.value = num;
    denominator.value = den;
  }
}, { immediate: true });

const save = () => {
  emit('update:numerator', numerator.value);
  emit('update:denominator', denominator.value);
};

</script>

<template>
  <BaseEditableProp
    v-bind="$props"
    :model-value="formatFraction({ numerator: numerator, denominator: denominator })"
    :format="formatDisplay"
    :validate="() => true"
    @update:model-value="(val) => {
      const parsed = parseFraction(val);
      if (parsed) {
        numerator = parsed.numerator;
        denominator = parsed.denominator;
      }
    }"
    @save="handleSave"
  >
    <template #input="{ inputValue, save, cancel }">
      <div class="flex items-center gap-2 w-full">
        <div class="flex items-center gap-1">
          <InputNumber
            v-model="numerator"
            class="w-20 text-center"
            :min="minNumerator"
            :max="maxNumerator"
            :step="1"
            :minFractionDigits="0"
            :maxFractionDigits="4"
            :placeholder="'Numerator'"
            @keydown.enter="handleSave"
            @keydown.esc="cancel"
          />
          <span class="text-lg">⁄</span>
          <InputNumber
            v-model="denominator"
            class="w-20 text-center"
            :min="minDenominator"
            :max="maxDenominator"
            :step="1"
            :minFractionDigits="0"
            :maxFractionDigits="0"
            :placeholder="'Denom'"
            @keydown.enter="handleSave"
            @keydown.esc="cancel"
          />
        </div>

        <div v-if="allowDecimal" class="text-gray-500 ml-2">
          ≈ {{ fraction.numerator && fraction.denominator ? (fraction.numerator / fraction.denominator).toFixed(decimalPlaces) : '0' }}
        </div>

        <div class="flex gap-1 ml-auto">
          <Button
            icon="pi pi-check"
            size="small"
            text
            severity="success"
            @click="handleSave"
          />
          <Button
            v-if="nullable"
            icon="pi pi-times"
            size="small"
            text
            severity="danger"
            @click="emit('update:modelValue', null); emit('save', null);"
          />
        </div>
      </div>
    </template>
  </BaseEditableProp>
</template>

<style scoped>
/* Custom styling for the fraction display */
:deep(.p-inputtext) {
  text-align: center;
  padding: 0.25rem 0.5rem;
}

:deep(.fraction-slash) {
  font-size: 1.5rem;
  line-height: 1;
  vertical-align: middle;
}
</style>
