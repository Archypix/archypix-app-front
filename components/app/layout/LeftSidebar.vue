<script setup lang="ts">
import {usePicturesStore} from "~/stores/pictures";

const fetchAllPictures = async (deleted = false) => {
  if (deleted){
    await usePicturesStore().query("deleted sort=creation", 1);
  }else{
    await usePicturesStore().query("!deleted sort=creation", 1);
  }
}
</script>

<template>
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
</template>

<style scoped lang="stylus">

</style>