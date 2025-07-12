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
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  readonly: {
    type: Boolean,
    default: false
  },
  autoBlur: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['save', 'cancel']);

const isEditing = ref(false);

const displayValue = computed(() => {
  if (props.value === null) return '∅';
  if (props.value === undefined) return 'mixed';
  return props.value;
});

const slotDivRef = ref<HTMLElement | null>(null);
function down() {
  if (props.readonly || isEditing.value) return;
  isEditing.value = true;
}
function up() {
  if (props.readonly || !isEditing.value) return;
  nextTick(() => {
    focusFirstChild(slotDivRef.value);
  });
}

function save() {
  emit('save');
  isEditing.value = false;
}

function cancel() {
  emit('cancel');
  isEditing.value = false;
}

function focusFirstChild(div: HTMLElement) {
  const focusable = Array.from(
      div.querySelectorAll<HTMLElement>('input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter(el => !el.hasAttribute('disabled'));
  if (focusable.length > 0) {
    focusable[focusable.length - 1].focus();
  }
}

const liRef = ref<HTMLElement | null>(null);

onClickOutside(liRef, () => {
  if (isEditing.value && props.autoBlur) {
    save();
  }
});

</script>

<template>
  <li ref="liRef"
      :class="{
        'flex flex-1 items-start text-gray-700 gap-2 text-sm px-1.5 -mx-1.5 rounded': true,
        'hover:bg-gray-100 cursor-pointer': !readonly
      }"
      @mousedown.prevent="down"
      @mouseup.prevent="up"
  >
    <span class="min-w-[100px] text-gray-500 text-sm/6">{{ title }}</span>
    <div v-if="!isEditing" class="flex-1 min-w-0 rounded py-0.5 px-2">
      <span :class="{ 'text-gray-500': value === null || value === undefined }">
        <span class="text-gray-500">{{ prefix }}</span>{{ displayValue }}<span class="text-gray-500">{{ suffix }}</span>
      </span>
    </div>
    <div v-else class="flex-1 flex items-center gap-1 h-6" ref="slotDivRef">
      <slot name="input" v-bind="{ save, cancel }"></slot>
    </div>
  </li>
</template>
