<script setup lang="ts">
import BaseEditableProp from './BaseEditableProp.vue';
import InputText from 'primevue/inputtext';

const props = defineProps({
  modelValue: {
    type: [String, null, undefined],
    default: null
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
    type: Number,
    default: null
  },
  pattern: {
    type: String,
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
    emit('update:modelValue', value.value);
    emit('save');
  }
};

function validate(value: string) {
  if (value.length < props.minLength) return false;
  if (props.maxLength !== null && value.length > props.maxLength) return false;
  if (props.pattern && !new RegExp(props.pattern).test(value)) return false;
  return true;
}


</script>

<template>
  <BaseEditableProp
    :value="value"
    :title="title"
    @save="save"
    @cancel="value = props.modelValue"
  >
    <template #input="{ save, cancel }">
      <InputGroup class="rounded-xs">
        <InputText
          v-model="value"
          class="flex-1 py-0.5 px-2 text-sm"
          :placeholder="placeholder"
          @keydown.enter="save"
          @keydown.esc="cancel"
          @blur="save"
        />
        <InputGroupAddon class="flex-0">
          <Button @click="save" icon="pi pi-check" class="px-0 py-0" severity="secondary"/>
        </InputGroupAddon>
      </InputGroup>
    </template>
  </BaseEditableProp>
</template>
