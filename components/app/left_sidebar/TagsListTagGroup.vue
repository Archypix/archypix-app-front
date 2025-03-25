<script setup lang="ts">
import type {TagGroupNode} from "~/components/app/left_sidebar/TagsList.vue";

const props = defineProps<{
  node: TagGroupNode
}>()
const toast = useToast();
const confirm = useConfirm();

const deleteTagGroup = (event: MouseEvent) => {
  confirm.require({
    target: event.currentTarget as HTMLElement | undefined,
    message: 'Do you want to delete this tag group?',
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
      console.log("Deleting tag group ", props.node.data)
      toast.add({severity: 'info', summary: 'Confirmed', detail: 'Tag group deleted', life: 3000});
    },
    reject: () => {
    }
  });
};


const newTagPopover = ref();
const addTag = (event: MouseEvent) => {
  newTagPopover.value.toggle(event);
}

</script>

<template>
  <div class="w-full flex justify-between items-center">
    <strong class="text-base">{{ node.label }}</strong>
    <div class="flex gap-2">
      <Button icon="pi pi-pencil" label="Edit" class="p-button-success" @click.stop="usePicturesStore().query('config=tag_group:' + props.node.id)"/>
    </div>
  </div>
</template>

<style scoped lang="stylus">

</style>
