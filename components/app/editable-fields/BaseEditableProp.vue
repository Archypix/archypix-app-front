<script setup lang="ts">
import {computed, ref} from 'vue';

const props = defineProps({
  value: {
    type: [String, Number, null],
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  isMixed: {
    type: Boolean,
    default: false
  },
  edited: {
    type: Boolean,
    default: false,
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

const emit = defineEmits(['save', 'cancel', 'update:isEditing']);


const displayValue = computed(() => {
  if (props.isMixed) return 'mixed';
  if (props.value == null) return '∅';
  return props.value;
});

const slotDivRef = ref<HTMLElement | null>(null);

function down() {
  if (props.readonly || props.isEditing) return;
}

function up(e: MouseEvent) {
  if (props.readonly || props.isEditing) return;
  emit('update:isEditing', true);
  nextTick(() => {
    if (slotDivRef.value)
      focusFirstChild(slotDivRef.value);
  })
}

function save() {
  emit('save');
  emit('update:isEditing', false);
}

function cancel() {
  emit('cancel');
  emit('update:isEditing', false);

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
  if (props.isEditing && props.autoBlur) {
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
      @mousedown="down"
      @mouseup="up"
  >
    <span class="min-w-[100px] text-gray-500 text-sm/6 flex items-center gap-1">
      {{ title }}
      <div v-if="edited" class="point-div"/>
    </span>
    <div class="flex-1 min-w-0 rounded py-0.5 px-2" :style="[isEditing ? 'display: none;' : '']">
      <span :class="{ 'text-gray-500': value == null }">
        <span class="text-gray-500">{{ prefix }}</span>{{ displayValue }}<span class="text-gray-500">{{ suffix }}</span>
      </span>
    </div>
    <div v-if="isEditing" class="flex-1 flex items-center gap-1 h-6" ref="slotDivRef" @ontouchstart.stop>
      <slot name="input"
            v-bind="{ save, cancel }"
      />
    </div>
  </li>
</template>

<style lang="stylus" scoped>
div.point-div {
  width 5px
  height 5px
  background-color: var(--p-blue-500);
  border-radius: 50%;
}
</style>
