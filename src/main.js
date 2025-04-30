import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/md-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import api from './api/axios'
import '@fortawesome/fontawesome-free/css/all.min.css';

// Import PrimeVue Components
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Menu from 'primevue/menu'
import Avatar from 'primevue/avatar'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Register PrimeVue Components
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('Card', Card)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Tag', Tag)
app.component('Menu', Menu)
app.component('Avatar', Avatar)

// Register axios as a global property
app.config.globalProperties.$axios = api

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  ripple: true,
  unstyled: false,
  pt: {
    button: {
      root: {
        class: 'p-button p-component'
      }
    },
    inputtext: {
      root: {
        class: 'p-inputtext p-component'
      }
    },
    password: {
      root: {
        class: 'p-password p-component'
      },
      input: {
        class: 'p-password-input p-inputtext p-component'
      }
    }
  }
})

app.mount('#app')
