<script setup lang="ts">

import type {TagNode} from "~/components/app/left_sidebar/TagsList.vue";

const props = defineProps<{
  node: TagNode
}>()
const toast = useToast();
const confirm = useConfirm();

const deleteTag = (event: MouseEvent, tag: Tag) => {
  confirm.require({
    target: event.currentTarget as HTMLElement | undefined,
    message: 'Do you want to delete this tag?',
    icon: 'pi pi-info-circle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: () => {
      console.log("Deleting tag ", tag)
      toast.add({severity: 'info', summary: 'Confirmed', detail: 'Tag deleted', life: 3000});
    },
    reject: () => {
    }
  });
};

</script>

<template>
  <div class="w-full flex justify-between items-center">
    <Tag
        class="text-base"
        :value="node.label"
        :style="{ backgroundColor: `rgb(${node.data.color.join(',')})` }"
        :rounded="false"
    />
    <div class="flex gap-2">
      <Button icon="pi pi-pencil" class="p-button-success" @click.stop=""/>
      <Button icon="pi pi-trash" class="p-button-danger" @click="(e) => deleteTag(e, node.data)"/>
      <ConfirmPopup></ConfirmPopup>
    </div>
  </div>
</template>

<style scoped lang="stylus">

</style>