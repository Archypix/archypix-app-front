<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import FileUploadPopup from './FileUploadPopup.vue';
import {UploadBatchStatus, useUploadManager} from '~/composables/useUploadManager';

const {
  batches,
  addUploadBatch,
  minimizeBatch,
  maximizeBatch,
  removeUploadBatch,
  cancelUpload,
  cancelFileUpload,
  startUpload,
} = useUploadManager();


/// Drag’n drop functionality
const dragCounter = ref(0);
const isDragging = computed(() => dragCounter.value > 0);
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault();
  dragCounter.value++;
};
const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  dragCounter.value--;
};
const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  dragCounter.value = 0;
  if (e.dataTransfer?.files) {
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addUploadBatch(files);
    }
  }
};
const handleDragOver = (e: DragEvent) => {
  e.preventDefault(); // Necessary to allow drop
};
onMounted(() => {
  window.addEventListener('dragenter', handleDragEnter);
  window.addEventListener('dragleave', handleDragLeave);
  window.addEventListener('drop', handleDrop);
  window.addEventListener('dragover', handleDragOver);
});
onUnmounted(() => {
  window.removeEventListener('dragenter', handleDragEnter);
  window.removeEventListener('dragleave', handleDragLeave);
  window.removeEventListener('drop', handleDrop);
  window.removeEventListener('dragover', handleDragOver);
});


const getPopupOffset = (index: number) => {
  const minimizedWidth = 18+.7; // 18rem + 0.7rem padding
  let offset = .7;
  for (let i = 0; i < index; i++) {
    if (batches.value[i].status == UploadBatchStatus.UPLOADING_MINIMIZED) {
      offset += minimizedWidth;
    }
  }
  return offset;
};
</script>
<template>
  <div class="upload-manager">
    <div v-if="isDragging" class="drag-overlay text-xl flex flex-col gap-5 justify-center items-center">
      <i class="pi pi-upload text-3xl text-surface-950"></i>
      <h2 class="text-gray-900">Drop files to upload</h2>
    </div>
    <div class="popups-container">
      <FileUploadPopup
          v-for="(batch, index) in batches"
          :key="batch.id"
          :batch="batch"
          :offset="getPopupOffset(index)"
          @close="removeUploadBatch"
          @minimize="minimizeBatch"
          @maximize="maximizeBatch"
          @upload="startUpload"
          @remove-file="({ batchId, file }) => cancelFileUpload(batchId, file)"
          @cancel="cancelUpload"
      />
    </div>
  </div>
</template>
<style scoped>
.drag-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
}
</style>
