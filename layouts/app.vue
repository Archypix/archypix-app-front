<template>
  <div>
    <slot/>
  </div>
</template>

<script setup lang="ts">
import {useUserStore} from "~/stores/user";

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
