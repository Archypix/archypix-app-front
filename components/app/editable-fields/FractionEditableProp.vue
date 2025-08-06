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
  isMixed: {
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
  (e: 'update:numerator', value: number | null): void;
  (e: 'update:denominator', value: number | null): void;
  (e: 'save'): void;
}>();


const numerator = ref(props.numerator);
const denominator = ref(props.denominator);

const edited = computed(() => {
  return props.numerator !== numerator.value || props.denominator !== denominator.value;
})

watch(() => props.numerator, (val) => {
  numerator.value = val;
});
watch(() => props.denominator, (val) => {
  denominator.value = val;
});

const save = () => {
  if (numerator.value !== props.numerator || denominator.value !== props.denominator) {
    if (props.numerator === null || props.denominator === null) {
      emit('update:numerator', null);
      emit('update:denominator', null);
    }else {
      emit('update:numerator', numerator.value);
      emit('update:denominator', denominator.value);
    }
    emit('save');
  }
};

const cancel = () => {
  numerator.value = props.numerator;
  denominator.value = props.denominator;
};
const reset = () => {
  numerator.value = props.originalNumerator;
  denominator.value = props.originalDenominator;
  save()
};

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
          <Button @click="reset" icon="pi pi-undo" class="px-0 py-0" severity="secondary"/>
        </InputGroupAddon>
      </InputGroup>
    </template>
  </BaseEditableProp>
</template>

<style scoped>

</style>
