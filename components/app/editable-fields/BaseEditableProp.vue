<script setup lang="ts">
import {computed, ref} from 'vue';

const props = defineProps({
  value: {
    type: [String, Number, null, undefined],
    default: null
  },
  title: {
    type: String,
  },
});

const emit = defineEmits(['save', 'cancel']);

const isEditing = ref(false);

const displayValue = computed(() => {
  if (props.value === null) return '∅';
  if (props.value === undefined) return 'mixed';
  return props.value;
});

function startEditing() {
  isEditing.value = true;
  nextTick(() => {
    focusFirstChild(div.value);
  });
}

function save() {
  isEditing.value = false;
  emit('save');
}

function cancel() {
  isEditing.value = false;
  emit('cancel');
}

const div = ref();

function focusFirstChild(div: HTMLElement) {
  const focusable = Array.from(
      div.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter(el => !el.hasAttribute('disabled'));
  if (focusable.length > 0) {
    focusable[0].focus();
  }
}

</script>

<template>
  <li class="flex items-center text-gray-700 gap-2 text-sm h-6 hover:bg-gray-100 px-1.5 -mx-1.5 rounded cursor-pointer"
      @click="startEditing">
    <span class="min-w-[120px] text-gray-400">{{ title }}</span>
    <div v-if="!isEditing" class="flex-1 min-w-0 rounded py-0.5 px-2">
      <span :class="{ 'text-gray-400': value === null || value === undefined }">
        {{ displayValue }}
      </span>
    </div>
    <div v-else class="flex-1 flex items-center gap-1" ref="div">
      <slot name="input" v-bind="{ save, cancel }"></slot>
    </div>
  </li>
</template>

