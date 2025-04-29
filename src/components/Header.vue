<template>
  <header class="header">
    <div class="flex justify-between items-center h-full px-4">
      <div class="flex items-center">
        <Button icon="pi pi-bars" class="p-button-text" @click="toggleSidebar" />
        <h1 class="text-xl font-semibold ml-4">{{ currentRoute }}</h1>
      </div>
      
      <div class="flex items-center gap-4">
        <Button icon="pi pi-bell" class="p-button-text" v-badge="2" />
        <div class="flex items-center gap-2">
          <Avatar icon="pi pi-user" shape="circle" />
          <span class="font-medium">Admin</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'

const route = useRoute()
const currentRoute = computed(() => {
  return route.meta.title || route.name
})

const toggleSidebar = () => {
  // Implement sidebar toggle functionality
}
</script>

<style scoped>
.header {
  background-color: white;
}
</style> 