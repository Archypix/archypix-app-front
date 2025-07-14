<script setup lang="ts">

import {UploadBatchStatus} from "~/composables/useUploadManager";

const props = defineProps<{
  batch: UploadBatch
  offset: number;
}>();
const emit = defineEmits<{
  (e: 'minimize', batchId: string): void;
  (e: 'maximize', batchId: string): void;
  (e: 'upload', batchId: string): void;
  (e: 'remove-file', payload: { batchId: string; file: File }): void;
  (e: 'close', batchId: string): void;
  (e: 'cancel', batchId: string): void;
  (e: 'pause', batchId: string): void;
}>();

const {batch} = toRefs(props);
const hoveredItem = ref<string | null>(null);

const onMinimize = () => emit('minimize', batch.value.id);
const onMaximize = () => emit('maximize', batch.value.id);
const onUpload = () => emit('upload', batch.value.id);
const onClose = () => emit('close', batch.value.id);
const onCancel = () => emit('cancel', batch.value.id);
const onPause = () => emit('pause', batch.value.id);
const onRemoveFile = (file: File) => {
  emit('remove-file', {batchId: batch.value.id, file});
};

const hasPendingFiles = computed(() =>
    batch.value.pictures.some(p => p.status === UploadPictureStatus.PENDING)
);
const doneFilesCount = computed(() =>
    batch.value.pictures.filter(p => p.status === UploadPictureStatus.DONE).length
);

</script>
<template>
  <div>
    <Card v-if="batch.status == UploadBatchStatus.UPLOADING_MINIMIZED"
          class="fixed border"
          :style="{width: '18rem', bottom: '.7rem', right: offset + 'rem', zIndex: 100, cursor: 'pointer'}"
          :pt="{ body: {style: {padding: '.7rem'}} }"
          @click="onMaximize">
      <template #content>
        <div class="flex-1">
          <span>Uploading... ({{ doneFilesCount }}/{{ batch.pictures.length }})</span>
          <ProgressBar :value="batch.progress" class="max-w-100 mt-1"/>
        </div>
      </template>
    </Card>
    <Dialog
        :visible="batch.status !== UploadBatchStatus.UPLOADING_MINIMIZED"
        @update:visible="value => { if (!value) onMinimize() }"
        header="Uploading Files"
        :style="{ width: '50vw' }"
        :breakpoints="{ '960px': '75vw', '641px': '100vw' }"
    >
      <div class="flex-row gap-5">
        <div v-for="(picture, i) in batch.pictures"
             :key="picture.file.name"
             :class="`status-${picture.status}`"
             @mouseenter="hoveredItem = picture.file.name" @mouseleave="hoveredItem = null">
          <hr v-if="i > 0" class="w-full"/>
          <div class="w-full flex justify-between items-center">
            <span class="file-name p-2">{{ picture.file.name }}</span>
            <div class="file-status px-2">
              <i v-if="picture.status === UploadPictureStatus.UPLOADING" class="pi pi-spin pi-spinner"></i>
              <i v-if="picture.status === UploadPictureStatus.DONE" class="pi pi-check text-green-500"></i>
              <i v-if="picture.status === UploadPictureStatus.ERROR" class="pi pi-times-circle text-red-500"></i>
              <i v-if="picture.status === UploadPictureStatus.THUMBNAIL_WARNING" class="pi pi-exclamation-triangle text-orange-500"></i>
              <Button v-if="hoveredItem === picture.file.name && picture.status === 'pending'"
                      icon="pi pi-times"
                      size="small"
                      class="p-button-rounded p-button-danger p-button-text"
                      @click="onRemoveFile(picture.file)"/>
            </div>
          </div>
          <div v-if="picture.status === UploadPictureStatus.ERROR" class="px-2 pb-2">
            <Message severity="error" icon="pi pi-info-circle">
              <span>{{ picture.error ? (picture.error.error_type + ': ' + picture.error.message) : 'An unknown error occurred when trying to reach the server'}}</span>
            </Message>
          </div>
          <div v-if="picture.status === UploadPictureStatus.THUMBNAIL_WARNING" class="px-2 pb-2">
            <Message severity="warn" icon="pi pi-exclamation-triangle">
              <span>{{'Unable to build file thumbnails'}}</span>
            </Message>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center w-full">
          <div class="flex-1">
            <template v-if="batch.status == UploadBatchStatus.UPLOADING">
              <span>Uploading... ({{ doneFilesCount }}/{{ batch.pictures.length }})</span>
              <ProgressBar :value="batch.progress" class="max-w-100 mt-1"/>
            </template>
          </div>
          <div class="flex gap-2">
            <Button v-if="batch.status === UploadBatchStatus.PENDING" label="Upload" icon="pi pi-upload" @click="onUpload" :disabled="!hasPendingFiles"/>
            <Button v-if="batch.status === UploadBatchStatus.ERROR" label="Try again" icon="pi pi-undo" class="p-button-secondary" @click="onUpload"/>
            <Button v-if="batch.status === UploadBatchStatus.CANCELLED" label="Restart" icon="pi pi-upload" class="p-button-secondary" @click="onUpload"/>
            <Button v-if="batch.status === UploadBatchStatus.UPLOADING" label="Cancel" icon="pi pi-times" class="p-button-danger" @click="onCancel"/>
            <Button v-if="batch.status === UploadBatchStatus.ERROR || batch.status == UploadBatchStatus.CANCELLED || batch.status == UploadBatchStatus.DONE" label="Close" icon="pi pi-times" class="p-button-primary" @click="onClose"/>
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>
<style scoped>

</style>
