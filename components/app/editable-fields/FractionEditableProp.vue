<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import BaseEditableProp from './BaseEditableProp.vue';
import InputNumber from 'primevue/inputnumber';
import Button from "primevue/button";

const props = defineProps({
  numerator: {
    type: [Number, null],
    default: null
  },
  denominator: {
    type: [Number, null],
    default: null
  },
  originalNumerator: {
    type: [Number, null],
    default: null
  },
  originalDenominator: {
    type: [Number, null],
    default: null
  },
  defaultNumerator: {
    type: [Number, null],
    default: null
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
    default: 1
  },
  maxNumerator: {
    type: Number,
    default: Infinity
  },
  minDenominator: {
    type: Number,
    default: 1
  },
  maxDenominator: {
    type: Number,
    default: Infinity
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  }
});

const emit = defineEmits<{
  (e: 'update:numerator', value: number | null | undefined): void;
  (e: 'update:denominator', value: number | null | undefined): void;
  (e: 'update:isMixed', value: boolean): void;
  (e: 'save'): void;
}>();


const numerator = ref<number | null | undefined>(props.numerator ?? props.defaultNumerator);
const denominator = ref<number | null | undefined>(props.denominator);
const isEditing = ref(false);

const edited = computed(() => {
  if (props.numerator == null && props.numerator == props.originalNumerator) {
    return false;
  }
  if (props.denominator == null && props.denominator == props.originalDenominator) {
    return false;
  }
  return props.numerator != props.originalNumerator || props.denominator != props.originalDenominator || props.isMixed !== props.originalIsMixed;
})

watch(() => props.numerator, (val) => {
  numerator.value = val ?? props.defaultNumerator;
});
watch(() => props.denominator, (val) => {
  denominator.value = val;
});

const save = () => {
  if (numerator.value !== props.numerator || denominator.value !== props.denominator) {
    if (!props.nullable && (numerator.value == null || denominator.value == null)) {
      reset()
    } else {
      if (denominator.value == null || numerator.value == null) {
        numerator.value = props.defaultNumerator ?? null;
        denominator.value = null;
      }
      emit('update:numerator', numerator.value);
      emit('update:denominator', denominator.value);
      emit('save');
    }
  }
};

const cancel = () => {
  numerator.value = props.numerator;
  denominator.value = props.denominator;
};
const reset = () => {
  if (props.originalIsMixed) {
    numerator.value = props.defaultNumerator ?? undefined;
    denominator.value = undefined;
    emit('update:isMixed', true);
  } else {
    numerator.value = props.originalNumerator;
    denominator.value = props.originalDenominator;
    emit('update:numerator', numerator.value);
    emit('update:denominator', denominator.value);
  }
  emit('save');
  isEditing.value = false;
};
const clear = () => {
  numerator.value = props.defaultNumerator;
  denominator.value = null;
  emit('update:numerator', numerator.value);
  emit('update:denominator', denominator.value);
  emit('save');
  isEditing.value = false;
}

const displayValue = computed(() => {
  if (props.numerator == null) {
    return props.numerator; // Can be undefined
  }
  if (props.denominator == null) {
    return props.denominator; // Can be undefined
  }
  return `${props.numerator} / ${props.denominator}`;
});

</script>

<template>
  <BaseEditableProp
      v-model:is-editing="isEditing"
      :value="displayValue"
      :isMixed="isMixed"
      :edited="edited"
      :prefix="prefix"
      :suffix="suffix"
      :title="title"
      @save="save"
      @cancel="cancel"
  >
    <template #input="{ save, cancel }">
      <InputGroup class="rounded-xs">
        <InputNumber
            v-model="numerator"
            size="small"
            :pt="{
              pcInputText: { root: {class: 'py-0.5 px-2 text-sm w-5'}},
            }"
            :min="minNumerator"
            :max="maxNumerator"
            placeholder="num"
            @keydown.enter="save"
            @keydown.esc="cancel"
        />
        <InputGroupAddon class="px-0 py-0 min-w-5 w-5">
          <p>⁄</p>
        </InputGroupAddon>
        <InputNumber
            v-model="denominator"
            size="small"
            :pt="{
              pcInputText: { root: {class: 'py-0.5 px-2 text-sm'}},
            }"
            :min="minDenominator"
            :max="maxDenominator"
            placeholder="den"
            @keydown.enter="save"
            @keydown.esc="cancel"
        />
        <InputGroupAddon class="flex-0 min-w-8">
          <Button @click="clear" icon="pi pi-times" class="px-0 py-0" severity="secondary"
                  v-if="nullable && (numerator === null || denominator === null) && isMixed"/>
          <Button v-else @click="reset" icon="pi pi-undo" class="px-0 py-0" severity="secondary"/>
        </InputGroupAddon>
      </InputGroup>
    </template>
  </BaseEditableProp>
</template>

<style scoped>

</style>
