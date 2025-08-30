<script setup lang="ts">

import Button from "primevue/button";
import BaseEditableProp from "~/components/app/editable-fields/BaseEditableProp.vue";

const props = defineProps({
  modelValue: {
    type: [String, null],
    default: null
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

const emit = defineEmits(['update:modelValue', 'update:isMixed', 'save']);

const value = ref('');
const isEditing = ref(false);

watch(() => props.modelValue, (val) => {
  value.value = props.isMixed ? undefined : val;
}, {immediate: true});

const save = () => {
  if (value.value !== props.modelValue) {
    if (value.value === '') value.value = null;

    if (value.value && props.maxLength !== null && value.value.length > props.maxLength) {
      value.value = value.value.substring(0, props.maxLength);
    } else if (value.value && props.minLength > 0 && value.value.length < props.minLength) {
      value.value = null;
    }
    if (!props.nullable && (value.value === null)) value.value = props.originalValue;

    emit('update:modelValue', value.value);
    emit('save');
  }

};

const cancel = () => {
  value.value = props.modelValue;
}
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
}
const clear = () => {
  value.value = null;
  emit('update:modelValue', value.value);
  emit('save');
  isEditing.value = false;
}

</script>

<template>
  <BaseEditableProp
      v-model:is-editing="isEditing"
      :value="value"
      :isMixed="isMixed"
      :edited="originalValue !== modelValue || originalIsMixed !== isMixed"
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
          <Button @click="clear" icon="pi pi-times" class="px-0 py-0" severity="secondary"
                  v-if="nullable && value == null && isMixed"/>
          <Button v-else @click="reset" icon="pi pi-undo" class="px-0 py-0" severity="secondary"/>
        </InputGroupAddon>
      </InputGroup>
    </template>
  </BaseEditableProp>
</template>
