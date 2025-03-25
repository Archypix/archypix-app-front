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
      <Button icon="pi pi-plus" class="p-button-success" @click.stop="addTag"/>
      <Button icon="pi pi-pencil" class="p-button-success" @click.stop="usePicturesStore().query('config=tag_group:' + props.node.id)"/>
      <Button icon="pi pi-trash" class="p-button-danger" @click="deleteTagGroup"/>
      <ConfirmPopup></ConfirmPopup>
    </div>
  </div>

  <Popover ref="newTagPopover">
    <div class="flex flex-col gap-4 w-[15rem]">
      <div>
        <span class="font-medium block mb-2">New tag in the tag group {{props.node.data.name}}</span>
        <InputGroup>
          <InputText value="" placeholder="name"></InputText>
        </InputGroup>
      </div>
      <div>
        <span class="font-medium block mb-2">Tag color</span>
        <ColorPicker  inline />
      </div>
      <div>
        <Checkbox inputId="tagDefault" name="required" value="Mushroom"/>
        <label for="tagDefault"> Default </label>
        <i class="pi pi-info-circle text-red-700"
           v-tooltip.bottom="'Default tags are automatically added to new pictures'"></i>
      </div>
      <div>
        <Checkbox inputId="addToAll" name="required" value="Mushroom"/>
        <label for="addToAll"> Add to all pictures </label>
      </div>
      <Button class="p-button-success w-full">Create tag</Button>
    </div>
  </Popover>
</template>

<style scoped lang="stylus">

</style>
