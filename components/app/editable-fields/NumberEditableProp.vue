<script setup lang="ts">

import Button from "primevue/button";
import BaseEditableProp from "~/components/app/editable-fields/BaseEditableProp.vue";

const props = defineProps({
  modelValue: {
    type: [Number, null],
    default: null,
  },
  originalValue: {
    type: [Number, null],
    default: null,
  },
  isMixed: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
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
  },
  max: {
    type: Number,
  },
  step: {
    type: Number,
    default: 1
  },
  minFractionDigits: {
    type: Number,
    default: 0,
  },
  maxFractionDigits: {
    type: Number,
    default: 0,
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

const emit = defineEmits(['update:modelValue', 'save']);

const value = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  value.value = val;
});

const save = () => {
  if (value.value !== props.modelValue) {
    emit('update:modelValue', value.value);
    emit('save');
  }
};

const cancel = () => {
  value.value = props.modelValue;
};
const reset = () => {
  value.value = props.originalValue;
  save()
};

</script>

<template>
  <BaseEditableProp
      :value="value"
      :isMixed="isMixed"
      :edited="originalValue !== modelValue"
      :title="title"
      :prefix="prefix"
      :suffix="suffix"
      @save="save"
      @cancel="cancel"
  >
    <template #input="{ save, cancel }">
      <InputGroup class="rounded-xs">
        <InputNumber
            size="small"
            v-model="value"
            class="flex-1"
            :min="min"
            :max="max"
            :step="step"
            :minFractionDigits="minFractionDigits"
            :maxFractionDigits="maxFractionDigits"
            :suffix="suffix"
            :prefix="prefix"
            :placeholder="placeholder"
            :pt="{
              pcInputText: { root: {class: 'py-0.5 px-2 text-sm'}},
            }"
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
