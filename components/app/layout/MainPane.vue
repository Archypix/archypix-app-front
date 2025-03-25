<script setup lang="ts">

let pictures_store = usePicturesStore()


</script>

<template>
  <Toolbar>
    <template #start>
      <Button icon="pi pi-plus" class="mr-2" severity="secondary" text/>
      <Button icon="pi pi-print" class="mr-2" severity="secondary" text/>
      <Button icon="pi pi-upload" severity="secondary" text/>
    </template>

    <template #center>
      <IconField>
        <InputIcon>
          <i class="pi pi-search"/>
        </InputIcon>
        <InputText placeholder="Search"/>
      </IconField>
    </template>

    <template #end>
      <SplitButton label="Save"></SplitButton>
    </template>
  </Toolbar>

  <ConfigPane v-if="pictures_store.is_config" />
  <PicturesList v-else />

</template>

<style scoped lang="stylus">

</style>
