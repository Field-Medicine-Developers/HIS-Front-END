<template>
  <div class="sidebar">
    <div class="p-4">
      <h2 class="text-xl font-bold text-primary">HIS</h2>
    </div>
    <Menu :model="items" class="border-none" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Menu from 'primevue/menu'

const items = ref([
  {
    label: 'Dashboard',
    icon: 'pi pi-home',
    to: '/'
  },
  {
    label: 'Patients',
    icon: 'pi pi-users',
    to: '/patients'
  },
  {
    label: 'Appointments',
    icon: 'pi pi-calendar',
    to: '/appointments'
  },
  {
    label: 'Medical Records',
    icon: 'pi pi-file',
    to: '/records'
  },
  {
    label: 'Settings',
    icon: 'pi pi-cog',
    to: '/settings'
  },
  {
    label: 'Users',
    icon: 'pi pi-users',
    to: '/users'
  },
  {
    label: 'Staff Sections',
    icon: 'pi pi-hospital',
    to: '/staff-sections'
  },
  {
    label: 'اللجان الطبية',
    icon: 'pi pi-briefcase',
    to: '/medical-committees'
  }
])
</script>

<style scoped>
.sidebar {
  background-color: white;
}

:deep(.p-menu) {
  border: none;
  width: 100%;
}

:deep(.p-menuitem-link) {
  padding: 1rem;
}

:deep(.p-menuitem-link:hover) {
  background-color: #f3f4f6;
}
</style> 