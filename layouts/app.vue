<template>
  <div>
    <Toast />
    <slot/>
    <UploadManager />
  </div>
</template>

<script setup lang="ts">
import {useUserStore} from "~/stores/user";
import Toast from 'primevue/toast';
import UploadManager from '~/components/app/upload/UploadManager.vue';
import {useRouter} from 'vue-router';

const user = useUserStore()
if (!user.isLoggedIn()) {
  useRouter().push('/signin')
}
</script>

<style scoped>

</style>

<style>
html {
  overflow: hidden;
}
</style>
