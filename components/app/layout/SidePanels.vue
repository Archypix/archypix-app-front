<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from 'vue';

const props = defineProps<{
  leftPanelVisible: boolean;
  rightPanelVisible: boolean;
  leftPanelWidth: number;
  rightPanelWidth: number;
  leftPanelDrawerWidth: number;
  rightPanelDrawerWidth: number;
  leftPanelMinWidth: number;
  leftPanelMaxWidth: number;
  rightPanelMinWidth: number;
  rightPanelMaxWidth: number;
}>();

const emit = defineEmits<{
  // Used only when closing the panels in drawer view (small screens)
  (e: 'update:leftPanelVisible', visible: boolean): void;
  (e: 'update:rightPanelVisible', visible: boolean): void;
  // Used when resizing the panels
  (e: 'update:leftPanelWidth', width: number): void;
  (e: 'update:rightPanelWidth', width: number): void;
}>();

const leftWidth = ref(props.leftPanelWidth);
const rightWidth = ref(props.rightPanelWidth);
const isResizing = ref<'left' | 'right' | null>(null);
const startX = ref(0);
const startLeftWidth = ref(0);
const startRightWidth = ref(0);
const root = ref<HTMLElement | null>(null);
const rootWidth = useElementSize(root).width;

const mobileView = ref<boolean | null>(null);
watch(rootWidth, (width) => {
  if (!width) return;
  if (width < props.leftPanelMaxWidth + props.rightPanelMaxWidth) {
    if (mobileView.value === null || mobileView.value === false) {
      mobileView.value = true;
      emit("update:leftPanelVisible", false);
      emit("update:rightPanelVisible", false);
    }
  } else if (mobileView.value === null || mobileView.value === true) {
    mobileView.value = false;
    emit("update:leftPanelVisible", true);
    emit("update:rightPanelVisible", true);
  }
});

const leftPanelVisibleMut = computed({
  get: () => props.leftPanelVisible,
  set: (value) => emit('update:leftPanelVisible', value)
})
const rightPanelVisibleMut = computed({
  get: () => props.rightPanelVisible,
  set: (value) => emit('update:rightPanelVisible', value)
});
const leftDrawerWidth = computed(() => {
  if (!rootWidth.value) return 0;
  return Math.min(rootWidth.value, props.leftPanelDrawerWidth);
});
const rightDrawerWidth = computed(() => {
  if (!rootWidth.value) return 0;
  return Math.min(rootWidth.value, props.rightPanelDrawerWidth);
});

// Update local refs when props change
watch(
    () => props.leftPanelWidth,
    (newVal) => {
      leftWidth.value = Math.max(
          props.leftPanelMinWidth,
          Math.min(newVal, props.leftPanelMaxWidth)
      );
    },
    {immediate: true}
);

watch(
    () => props.rightPanelWidth,
    (newVal) => {
      rightWidth.value = Math.max(
          props.rightPanelMinWidth,
          Math.min(newVal, props.rightPanelMaxWidth)
      );
    },
    {immediate: true}
);

watch(leftWidth, (newVal) => {
  emit('update:leftPanelWidth', newVal);
});

watch(rightWidth, (newVal) => {
  emit('update:rightPanelWidth', newVal);
});

// Resize handlers
const startResize = (side: 'left' | 'right', e: PointerEvent) => {
  isResizing.value = side;
  startX.value = e.clientX;
  startLeftWidth.value = leftWidth.value;
  startRightWidth.value = rightWidth.value;

  // Set cursor and prevent text selection
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  document.body.style.touchAction = 'none';

  // Capture pointer to get events even when outside the window
  (e.target as HTMLElement).setPointerCapture(e.pointerId);
  e.preventDefault();
};

const onPointerMove = (e: PointerEvent) => {
  if (!isResizing.value) return;

  const dx = e.clientX - startX.value;

  if (isResizing.value === 'left') {
    const newWidth = startLeftWidth.value + dx;
    leftWidth.value = Math.max(
        props.leftPanelMinWidth,
        Math.min(newWidth, props.leftPanelMaxWidth)
    );
  } else if (isResizing.value === 'right') {
    const newWidth = startRightWidth.value - dx;
    rightWidth.value = Math.max(
        props.rightPanelMinWidth,
        Math.min(newWidth, props.rightPanelMaxWidth)
    );
  }
};

const stopResize = () => {
  if (!isResizing.value) return;

  isResizing.value = null;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  document.body.style.touchAction = '';
};

onMounted(() => {
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', stopResize);
  window.addEventListener('pointercancel', stopResize);
});

onUnmounted(() => {
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', stopResize);
  window.removeEventListener('pointercancel', stopResize);
});

// Close side drawers when query params change
watch(() => useRoute().query, () => {
  if (mobileView.value) {
    leftPanelVisibleMut.value = false;
    rightPanelVisibleMut.value = false;
  }
}, { immediate: true });

</script>

<template>
  <div class="flex w-full h-full overflow-hidden select-none" ref="root">
    <template v-if="leftPanelVisible && mobileView !== null">
      <Drawer v-if="mobileView" v-model:visible="leftPanelVisibleMut" position="left"
              :pt="{
                root: { class: 'p-0', style: {width: leftDrawerWidth + 'px'} },
                content: { class: 'p-0' },
                header: { class: 'p-1' },
              }">
        <slot name="left"></slot>
      </Drawer>
      <div
          v-else
          class="h-full border-r border-surface-200 bg-surface-0 relative"
          :style="{ flexBasis: `${leftWidth}px` }"
      >
        <slot name="left"></slot>
        <div
            :class="[
            'absolute top-0 -right-[1px] w-[3px] h-full',
            'cursor-col-resize hover:bg-primary-400 transition-colors z-100',
            { 'bg-primary-500': isResizing === 'left' }
          ]"
            @pointerdown="(e) => startResize('left', e)"
        ></div>
      </div>
    </template>

    <!-- Main Panel -->
    <div class="h-full overflow-auto flex-1 min-w-0 bg-surface-0 relative">
      <slot name="main"></slot>
    </div>

    <!-- Right Panel -->
    <template v-if="rightPanelVisible && mobileView !== null">
      <Drawer v-if="mobileView" v-model:visible="rightPanelVisibleMut" position="right"
              :pt="{
                root: { class: 'p-0', style: {width: rightDrawerWidth + 'px'} },
                content: { class: 'p-0' },
                header: { class: 'p-1' },
              }">
        <slot name="right"></slot>
      </Drawer>
      <div
          v-else
          class="h-full border-l border-surface-200 bg-surface-0 relative"
          :style="{ flexBasis: `${rightWidth}px` }"
      >
        <div
            :class="[
            'absolute top-0 -left-[1px] w-[3px] h-full',
            'cursor-col-resize hover:bg-primary-400 transition-colors z-10',
            { 'bg-primary-500': isResizing === 'right' }
          ]"
            @pointerdown="(e) => startResize('right', e)"
        ></div>
        <slot name="right"></slot>
      </div>
    </template>
  </div>
</template>
