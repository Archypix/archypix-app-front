<script setup lang="ts">

const fetchAllPictures = async (deleted = false) => {
  if (deleted) {
    await usePicturesStore().query("deleted sort=creation");
  } else {
    await usePicturesStore().query("!deleted sort=creation");
  }
};
</script>

<template>
  <Tabs value="0" class="left-sidebar h-full">
    <TabList>
      <Tab value="0" v-tooltip="{ value: 'Arrangements and groups', showDelay: 500 }">
        <i class="pi pi-objects-column"></i>
      </Tab>
      <Tab value="1" v-tooltip="{ value: 'Hierarchies', showDelay: 500 }">
        <i class="pi pi-sitemap"></i>
      </Tab>
      <Tab value="2" v-tooltip="{ value: 'Tag groups and tags', showDelay: 500 }">
        <i class="pi pi-tag"></i>
      </Tab>
      <Tab value="3" v-tooltip="{ value: 'Groups shared to you', showDelay: 500 }">
        <i class="pi pi-share-alt"></i>
      </Tab>
    </TabList>
    <TabPanels class="h-full">
      <TabPanel value="0" class="h-full">
        <div class="flex flex-col h-full">
          <div class="flex gap-2 p-2 border-b">
            <Button
              label="All Pictures"
              icon="pi pi-images"
              @click="fetchAllPictures(false)"
              class="p-button-text p-button-sm"
            />
            <Button
              label="Trash"
              icon="pi pi-trash"
              @click="fetchAllPictures(true)"
              class="p-button-text p-button-sm p-button-danger"
              severity="danger"
            />
          </div>
          <div class="flex-1 overflow-auto">
            <ArrangementsList />
          </div>
        </div>
      </TabPanel>
      <TabPanel value="1">
        <p class="m-0">
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
          ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi
          nesciunt. Consectetur, adipisci velit, sed quia non numquam eius modi.
        </p>
      </TabPanel>
      <TabPanel value="2" class="h-full">
        <TagsList/>
      </TabPanel>
      <TabPanel value="3">
        <p class="m-0">
          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores
          et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa
          qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam
          libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
        </p>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<style scoped lang="stylus">

</style>

<style lang="stylus">
.left-sidebar
  .p-tablist-tab-list
    i
      font-size 1.4em

  --tabs-tabpanel-padding .5em
  --tree-padding 0

  .p-tabpanels
    overflow scroll


</style>
