<template>
  <main>
    <Splitter class="h-screen border-none rounded-none">
      <SplitterPanel :size="10" :maxSize="50">
        <Tabs value="0">
          <TabList>
            <Tab value="0">Header I</Tab>
            <Tab value="1">Header II</Tab>
            <Tab value="2">Header III</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <Button
                  label="Show All Pictures"
                  icon="pi pi-images"
                  @click="fetchAllPictures(false)"
                  class="p-button-primary"
              />
              <Button
                  label="Show Deleted Pictures"
                  icon="pi pi-trash"
                  @click="fetchAllPictures(true)"
                  class="p-button-secondary"
              />
            </TabPanel>
            <TabPanel value="1">
              <p class="m-0">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
                ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi
                nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
              </p>
            </TabPanel>
            <TabPanel value="2">
              <p class="m-0">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores
                et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa
                qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam
                libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
              </p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </SplitterPanel>
      <SplitterPanel>
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

        <template v-for="pid in pictures" :key="pid">
          <Card>
            <template #title>
              Picture {{ pid }}
            </template>
            <template #content>
              <img alt="Logo" src="https://primefaces.org/cdn/primevue/images/nature/nature2.jpg" class="rounded-md drop-shadow-sm"/>
            </template>
          </Card>
        </template>

      </SplitterPanel>
      <SplitterPanel :size="10" :maxSize="50">
        <NuxtLink to="/signin">Go to Signin</NuxtLink>
        <IconField iconPosition="left">
          <InputIcon class="pi pi-search"></InputIcon>
          <InputText placeholder="Search"/>
          <Button label="Check" icon="pi pi-check"/>
        </IconField>
        <Card>
          <template #title>
            Multi Select : {{ selectedCities }}
          </template>
          <template #content>
            <MultiSelect v-model="selectedCities" :options="cities" filter optionLabel="name" placeholder="Select Cities"
                         :maxSelectedLabels="3"/>
          </template>
        </Card>
      </SplitterPanel>
    </Splitter>
  </main>
</template>

<script setup lang="ts">
import type {ApiError} from "~/composables/fetchApi";
import {type AuthStatus, UserStatus} from "~/stores/user";

definePageMeta({
  layout: 'app'
})

const searchQuery = ref('')
const pictures = ref<number[]>([])

const selectedCities = ref();
const cities = ref([
  {name: 'New York', code: 'NY'},
  {name: 'Rome', code: 'RM'},
  {name: 'London', code: 'LDN'},
  {name: 'Istanbul', code: 'IST'},
  {name: 'Paris', code: 'PRS'}
]);

const fetchAllPictures = async (deleted = false) => {
  try {
    await useGetApi(true, '/pictures?deleted=' + deleted)
        // @ts-ignore cause ts wants type void | ..., but it's AuthStatus
        .then((data: number[]) => {
          pictures.value = data || []
        })
        .catch((error: ApiError | null) => {
          if (error && error.error_type === ErrorType.Unauthorized) {

          } else {

          }
        })
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

const searchPictures = async () => {
  // Implement search functionality
  console.log('Searching for:', searchQuery.value)
}
</script>

<style scoped>
.splitter {
  height: 100vh;
  width: 100vw;
  border: none;
  border-radius: 0;
}
</style>
