<script setup lang="ts">
import BaseEditableProp from './BaseEditableProp.vue';
import InputNumber from 'primevue/inputnumber';

interface Resolution {
  width: number | null;
  height: number | null;
}

const props = defineProps({
  modelValue: {
    type: [String, Object, null, undefined],
    default: null,
    validator: (value: any) => {
      if (value === null || value === undefined || value === '') return true;
      if (typeof value === 'string') {
        const parts = value.split('x').map(Number);
        return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]);
      }
      return value && (value.width !== undefined || value.height !== undefined);
    }
  },
  placeholder: {
    type: String,
    default: 'Width × Height (e.g., 1920x1080)'
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
    default: 1
  },
  max: {
    type: Number,
    default: 99999
  },
  maintainAspectRatio: {
    type: Boolean,
    default: false
  },
  aspectRatio: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const resolution = ref<Resolution>({
  width: null,
  height: null
});

function parseResolution(value: string | Resolution | null | undefined): Resolution | null {
  if (!value) return null;

  if (typeof value === 'string') {
    const parts = value.split('x').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { width: parts[0], height: parts[1] };
    }
    return null;
  }

  // It's already a resolution object
  return {
    width: value.width !== undefined ? value.width : null,
    height: value.height !== undefined ? value.height : null
  };
}

function formatResolution(resolution: Resolution | null): string {
  if (!resolution || resolution.width === null || resolution.height === null) return '';
  return `${resolution.width} × ${resolution.height}`;
}

function validateResolution(res: Resolution): boolean {
  if (res.width === null || res.height === null) return true;

  if (res.width < props.min || res.width > props.max) return false;
  if (res.height < props.min || res.height > props.max) return false;

  return true;
}

function handleSave() {
  if (!resolution.value || resolution.value.width === null || resolution.value.height === null) {
    emit('update:modelValue', null);
    emit('save', null);
    return;
  }

  if (validateResolution(resolution.value)) {
    const value = `${resolution.value.width}x${resolution.value.height}`;
    emit('update:modelValue', value);
    emit('save', value);
  }
}

// Handle aspect ratio maintenance
function updateAspectRatio(updatedDimension: 'width' | 'height') {
  if (!props.maintainAspectRatio || !resolution.value.width || !resolution.value.height) return;

  const ratio = props.aspectRatio || (resolution.value.width / resolution.value.height);

  if (updatedDimension === 'width' && resolution.value.width !== null) {
    resolution.value.height = Math.round(resolution.value.width / ratio);
  } else if (updatedDimension === 'height' && resolution.value.height !== null) {
    resolution.value.width = Math.round(resolution.value.height * ratio);
  }
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newVal) => {
  if (newVal === null || newVal === undefined || newVal === '') {
    resolution.value = { width: null, height: null };
  } else {
    const parsed = parseResolution(newVal);
    if (parsed) {
      resolution.value = parsed;
    }
  }
}, { immediate: true });
</script>

<template>
  <BaseEditableProp
    v-bind="$props"
    :model-value="modelValue"
    :format="formatResolution"
    :validate="() => true"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @save="handleSave"
  >
    <template #input="{ inputValue, save, cancel }">
      <div class="flex flex-col gap-2 w-full">
        <div class="flex items-center gap-2">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Width</label>
            <InputNumber
              v-model="resolution.width"
              class="w-full"
              :min="min"
              :max="max"
              :step="1"
              :minFractionDigits="0"
              :maxFractionDigits="0"
              placeholder="Width"
              @input="updateAspectRatio('width')"
              @keydown.enter="handleSave"
              @keydown.esc="cancel"
            />
          </div>

          <div class="flex items-center justify-center w-8 h-10">
            <span class="text-gray-500">×</span>
          </div>

          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Height</label>
            <InputNumber
              v-model="resolution.height"
              class="w-full"
              :min="min"
              :max="max"
              :step="1"
              :minFractionDigits="0"
              :maxFractionDigits="0"
              placeholder="Height"
              @input="updateAspectRatio('height')"
              @keydown.enter="handleSave"
              @keydown.esc="cancel"
            />
          </div>
        </div>

        <div class="flex justify-between items-center mt-2">
          <div v-if="resolution.width && resolution.height" class="text-xs text-gray-500">
            Aspect ratio: {{ (resolution.width / resolution.height).toFixed(2) }}:1
          </div>

          <div class="flex gap-1 ml-auto">
            <Button
              icon="pi pi-check"
              size="small"
              text
              severity="success"
              @click="handleSave"
            />
            <Button
              v-if="nullable"
              icon="pi pi-times"
              size="small"
              text
              severity="danger"
              @click="emit('update:modelValue', null); emit('save', null);"
            />
          </div>
        </div>
      </div>
    </template>
  </BaseEditableProp>
</template>

<style scoped>
:deep(.p-inputtext) {
  text-align: center;
}
</style>
