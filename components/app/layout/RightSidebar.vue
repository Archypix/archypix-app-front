<script setup lang="ts">
const selectedCities = ref();
const cities = ref([
  {name: 'New York', code: 'NY'},
  {name: 'Rome', code: 'RM'},
  {name: 'London', code: 'LDN'},
  {name: 'Istanbul', code: 'IST'},
  {name: 'Paris', code: 'PRS'}
]);
</script>

<template>
  <NuxtLink to="/signin">Go to Signin</NuxtLink>
  <InputGroup>
    <InputGroupAddon>
      <i class="pi pi-search"></i>
    </InputGroupAddon>

    <InputText placeholder="Search"/>

    <Button label="Check" icon="pi pi-check"/>
  </InputGroup>
  <Card>
    <template #title>
      Multi Select : {{ selectedCities }}
    </template>
    <template #content>
      <MultiSelect v-model="selectedCities" :options="cities" filter optionLabel="name" placeholder="Select Cities"
                   :maxSelectedLabels="3"/>
    </template>
  </Card>
</template>

<style scoped lang="stylus">

</style>