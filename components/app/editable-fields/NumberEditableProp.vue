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
  originalIsMixed: {
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

const emit = defineEmits(['update:modelValue', 'update:isMixed', 'save']);

const value = ref(null);
const isEditing = ref(false);

watch(() => props.modelValue, (val) => {
  value.value = props.isMixed ? undefined : val;
}, {immediate: true});

const save = () => {
  if (value.value !== props.modelValue) {
    console.log('Saving value:', value.value);
    emit('update:modelValue', value.value);
    emit('save');
  }
};

const cancel = () => {
  value.value = props.modelValue;
};
const reset = () => {
  if (props.originalIsMixed) {
    value.value = undefined;
    emit('update:isMixed', true);
  } else {
    value.value = props.originalValue;
    emit('update:modelValue', value.value);
  }
  emit('save');
  isEditing.value = false;
};
const clear = () => {
  value.value = null;
  emit('update:modelValue', value.value);
  emit('save');
  isEditing.value = false;
};


</script>

<template>
  <BaseEditableProp
      v-model:is-editing="isEditing"
      :value="value"
      :isMixed="isMixed"
      :edited="originalValue !== modelValue || originalIsMixed !== isMixed"
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
          <Button @click="clear" icon="pi pi-times" class="px-0 py-0" severity="secondary"
                  v-if="nullable && value == null && isMixed"/>
          <Button v-else @click="reset" icon="pi pi-undo" class="px-0 py-0" severity="secondary"/>
        </InputGroupAddon>
      </InputGroup>
    </template>
  </BaseEditableProp>
</template>
