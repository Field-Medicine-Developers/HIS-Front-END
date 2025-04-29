<template>
  <div class="login-page">
    <div class="login-container">
      <div class="logo flex align-items-center justify-content-center">
        <img src="../assets/logo.png" alt="Logo" class="logo-image">
        <div class="logo-text mr-3">
          معاونية شؤون<br>
          الطلبة والخريجين<br>
          والمبتعثين
        </div>
      </div>
      
      <h1 class="text-3xl font-bold mb-4">تسجيل الدخول</h1>
      <h2 class="text-2xl font-medium mb-4">نظام قسم التخطيط</h2>
      
      <form @submit.prevent="handleLogin" class="w-full">
        <div class="field mb-4">
          <span class="p-float-label p-input-icon-right">
            <i class="pi pi-user"></i>
            <InputText
              id="username"
              v-model="username"
              class="w-full"
            />
            <label for="username">اسم المستخدم</label>
          </span>
        </div>
        
        <div class="field mb-4">
          <span class="p-float-label">
            <Password
              id="password"
              v-model="password"
              class="w-full"
              :feedback="false"
              :toggleMask="true"
              inputClass="w-full"
            >
              <template #header>
                <i class="pi pi-lock ml-2"></i>
              </template>
            </Password>
            <label for="password">كلمة المرور</label>
          </span>
        </div>
        
        <Button
          type="submit"
          label="تسجيل الدخول"
          class="login-button w-full mb-3"
          :loading="loading"
        />
      </form>
      
      <p class="support-text">للدعم الفني تواصل مع لجنة البرمجة والتطوير</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    const response = await axios.post('http://172.16.13.4:5000/api/Login', {
      phoneNumber: username.value,
      password: password.value
    })

    console.log('Full Response:', response)
    console.log('Response Data:', response.data)
    console.log('Response Data Type:', typeof response.data)
    console.log('Response Data Keys:', Object.keys(response.data))

    if (response.data) {
      // Store user data
      const userData = {
        firstName: response.data.firstName || '',
        secondName: response.data.secondName || '',
        thirdName: response.data.thirdName || '',
        phoneNumber: response.data.phoneNumber || '',
        role: response.data.role || '',
        id: response.data.id || ''
      }
      
      console.log('User Data to Store:', userData)
      
      localStorage.setItem('userData', JSON.stringify(userData))
      localStorage.setItem('token', response.data.data.token || '')
      
      console.log('Stored User Data:', JSON.parse(localStorage.getItem('userData')))
      console.log('Stored Token:', localStorage.getItem('token'))
      
      router.push('/')
    }
  } catch (error) {
    console.error('Login failed:', error)
    console.error('Error Response:', error.response)
  } finally {
    loading.value = false
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Cairo', sans-serif;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.login-page {
  background-color: #00695c;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.login-container {
  background-color: #e0f2f1;
  border-radius: 15px;
  padding: 2rem;
  width: 480px;
  max-width: 90%;
  text-align: center;
  direction: rtl;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.logo-text {
  color: #006657;
  font-size: 14px;
  text-align: right;
  line-height: 1.5;
}

.logo-image {
  width: 80px;
  height: auto;
}

.field {
  margin-bottom: 1.5rem;
}

:deep(.p-float-label) {
  display: block;
  position: relative;
}

:deep(.p-float-label label) {
  position: absolute;
  pointer-events: none;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  transition: all 0.2s ease;
  color: #666;
  padding: 0 0.25rem;
}

:deep(.p-float-label input:focus ~ label),
:deep(.p-float-label input.p-filled ~ label),
:deep(.p-float-label .p-password-input:focus ~ label),
:deep(.p-float-label .p-password-input.p-filled ~ label) {
  top: -0.75rem;
  font-size: 12px;
  background-color: #e0f2f1;
}

:deep(.p-input-icon-right) {
  width: 100%;
}

:deep(.p-input-icon-right > i:last-of-type) {
  right: 0.75rem;
  color: #006657;
}

:deep(.p-inputtext),
:deep(.p-password-input) {
  width: 100%;
  padding: 1rem 2.5rem 1rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
}

:deep(.p-password) {
  width: 100%;
  display: block;
}

:deep(.p-password i.pi-eye),
:deep(.p-password i.pi-eye-slash) {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #006657;
  cursor: pointer;
}

:deep(.login-button) {
  background-color: #006657 !important;
  color: white !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 1rem !important;
  width: 100% !important;
  font-size: 1.25rem !important;
  cursor: pointer !important;
}

:deep(.login-button:hover) {
  background-color: #005a4e !important;
}

:deep(.login-button:focus) {
  box-shadow: none !important;
}

.support-text {
  color: #006657;
  font-size: 0.875rem;
  text-align: center;
}
</style> 