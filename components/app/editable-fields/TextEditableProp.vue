<script setup lang="ts">

import Button from "primevue/button";
import BaseEditableProp from "~/components/app/editable-fields/BaseEditableProp.vue";

const props = defineProps({
  modelValue: {
    type: [String, null, undefined],
    default: null
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
    default: 'Enter text'
  },
  nullable: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  minLength: {
    type: Number,
    default: 0
  },
  maxLength: {
    type: [Number, null],
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const value = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  value.value = val;
});

const save = () => {
  if (value.value != props.modelValue) {
    if (props.maxLength !== null && value.value.length > props.maxLength) {
      value.value = value.value.substring(0, props.maxLength);
    }else if (props.minLength > 0 && value.value.length < props.minLength) {
      value.value = null;
    }
    emit('update:modelValue', value.value);
    emit('save');
  }
};

const cancel = () => {
  value.value = props.modelValue;
}
const reset = () => {
  value.value = props.originalValue;
  save()
};

</script>

<template>
  <BaseEditableProp
      :value="value"
      :edited="originalValue !== modelValue"
      :title="title"
      @save="save"
      @cancel="cancel"
  >
    <template #input="{ save, cancel }">
      <InputGroup class="rounded-xs">
        <InputText
            v-model="value"
            class="flex-1 py-0.5 px-2 text-sm"
            :placeholder="placeholder"
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
