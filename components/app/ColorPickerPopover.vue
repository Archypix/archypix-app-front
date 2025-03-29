<script setup lang="ts">
import { PREDEFINED_COLORS } from '~/composables/colors';
import type {InputNumberInputEvent} from "primevue";

const props = defineProps<{
  color: number[];
}>();
const emit = defineEmits(['update:color'])


const hexColor = computed(() => {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(props.color[0])}${toHex(props.color[1])}${toHex(props.color[2])}`;
});
const rgbColor = computed(() => {
  return {r: props.color[0], g: props.color[1], b: props.color[2]};
});

const inputHexColor = ref<string>(hexColor.value);
const inputRgbColor = ref<{r: number, g: number, b: number}>(rgbColor.value);

// Updaters

const update = (color: number[]) => {
  emit('update:color', color);
  inputHexColor.value = hexColor.value
  inputRgbColor.value = rgbColor.value
};
const updateFromRgb = (color: {r: number, g: number, b: number}) => {
  update([color.r, color.g, color.b]);
};
watch(inputRgbColor, updateFromRgb)

const updateFromHex = (hex: string) => {
  if (hex.startsWith("#")) hex = hex.slice(1);
  if (hex.length !== 6) return;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
    update([r, g, b]);
  }
};
watch(inputHexColor, updateFromHex)

const updateFromRgbChannel = (value: number | string | undefined, channel: number) => {
  if (value === undefined) return;
  if (typeof value === 'string') {
    value = parseInt(value);
    if (isNaN(value)) return;
  }
  let color = props.color;
  color[channel] = Math.max(0, Math.min(255, value));
  update(color);
};

// UI and tabs

const viewModes = [
  {
    name: 'Preset',
    value: 1,
  },
  {
    name: 'Picker',
    value: 2,
  },
  {
    name: 'Hex/rgb',
    value: 3,
  }
]
const viewMode = ref(1);

const popover = ref();
const toggle = (event: MouseEvent) => {
  popover.value.toggle(event);
}

</script>

<template>
  <div class="relative">
    <Button
        type="button"
        class="w-8 h-8 p-0"
        :style="{
          backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
          border: '2px solid #e5e7eb'
        }"
        @click="toggle"
    />

    <Popover
        ref="popover"
        :auto-hide="false"
        :position="'bottom'"
        class="color-picker-popover"
    >
      <div class="p-1">

        <div class="mb-4 w-full">
          <SelectButton class="w-full" v-model="viewMode" :allowEmpty="false" :options="viewModes" option-label="name" option-value="value" />
        </div>

        <template v-if="viewMode === 1">
          <div class="grid grid-cols-8 gap-2">
            <button
                v-for="color in PREDEFINED_COLORS"
                :key="color.join(',')"
                class="w-8 h-8 rounded-md border border-gray-300 shadow-xs"
                :style="{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }"
                @click="update(color)"
            />
          </div>
        </template>

        <template v-else-if="viewMode === 2">
          <ColorPicker
              v-model="inputRgbColor"
              format="rgb"

              inline
          />
        </template>

        <template v-else>
          <div class="flex flex-col gap-4">
            <div>
              <label class="text-sm font-medium block mb-1">Hex</label>
              <InputText
                  v-model="inputHexColor"
                  class="w-full"
              />
            </div>
            <div>
              <label class="text-sm font-medium block mb-1">RGB</label>
              <div class="flex gap-2 input-number-container">
                <template v-for="(channel, i) in ['R', 'G', 'B']" :key="i">
                  <div class="flex-1">
                    <label class="text-xs text-gray-500 block mb-1">{{ channel }}</label>
                    <InputNumber
                        :modelValue="color[i]"
                        @input="(e: InputNumberInputEvent) => updateFromRgbChannel(e.value, i)"
                        :min="0"
                        :max="255"
                        :step="1"
                        class="w-auto"
                    />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </template>
      </div>
    </Popover>
  </div>
</template>

<style lang="stylus">
.color-picker-popover
  .input-number-container
    max-width 193px
    > div
      max-width 100%

    span.p-inputnumber input
      width 100%

  .p-selectbutton button
    min-width fit-content
    white-space nowrap
    width 100%


</style>
