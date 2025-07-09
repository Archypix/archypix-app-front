<script setup lang="ts">

let props = defineProps({
  leftPanelEnabled: {
    type: Boolean,
    default: true
  },
  rightPanelEnabled: {
    type: Boolean,
    default: true
  }
})
let emit = defineEmits(['update:leftPanelEnabled', 'update:rightPanelEnabled'])

let pictures_store = usePicturesStore()

const infoDialogVisible = ref(false);

const query = ref("")

watch(pictures_store, () => {
  query.value = pictures_store.last_query_string
})

const onQuerySubmit = async () => {
  await usePicturesStore().query(query.value, false)
}

</script>

<template>
  <Toolbar class="top-bar">
    <template #start>
      <Button icon="pi pi-bars" class="mr-2" :severity="leftPanelEnabled ? 'primary' : 'secondary'"
              @click="emit('update:leftPanelEnabled', !leftPanelEnabled)"/>
      <Button icon="pi pi-plus" class="mr-2" severity="secondary" text/>
      <Button icon="pi pi-print" class="mr-2" severity="secondary" text/>
      <Button icon="pi pi-upload" severity="secondary" text/>
    </template>

    <template #center>
      <form @submit.prevent="onQuerySubmit">
        <InputGroup>
          <InputGroupAddon>
            <i class="pi pi-equals"/>
          </InputGroupAddon>
          <InputText placeholder="Query"
                     :disabled="pictures_store.loading"
                     v-model="query"/>
          <InputIcon v-if="pictures_store.loading" class="pi pi-spin pi-spinner"/>
          <Button v-else icon="pi pi-question" @click="infoDialogVisible = true" severity="contrast"/>
        </InputGroup>
      </form>
    </template>

    <template #end>
      <SplitButton label="Save"></SplitButton>

      <Button icon="pi pi-info-circle" class="ml-2" :severity="rightPanelEnabled ? 'primary' : 'secondary'"
              @click="emit('update:rightPanelEnabled', !rightPanelEnabled)"/>
    </template>
  </Toolbar>
  <Dialog v-model:visible="infoDialogVisible" modal header="Information" :style="{ width: '25rem' }">
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Request by names:</span>
    <code>{{ pictures_store.last_query_string_names }}</code>
    <span class="text-surface-500 dark:text-surface-400 block mb-8">Request by ids:</span>
    <code>{{ pictures_store.last_query_string_ids }}</code>
  </Dialog>
</template>

<style lang="stylus">

.top-bar.p-toolbar
  border-radius 0
  border-top none
  border-left none
  border-right none

.p-toolbar-center
  flex-grow 2

  form, .p-iconfield, .p-inputtext
    width 100%


</style>
