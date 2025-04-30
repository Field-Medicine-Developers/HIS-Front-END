<template>
  <div class="login-page">
    <div class="logo-area flex flex-column align-items-center justify-content-center">
      <img src="../assets/logo.png" alt="Logo" class="logo-image mb-2" />
      <div class="logo-text">
        معاونية شؤون
        الطلبة والخريجين
        والمبتعثين
      </div>
    </div>
    <div class="login-container">
      <h1 class="title text-3xl font-bold mb-4">نظام المعلومات الصحية - HIS</h1>
      <h2 class="subtitle text-xl font-semibold mb-5">تسجيل الدخول</h2>

      <form @submit.prevent="handleLogin" class="w-full">
        <div class="field mb-5">
          <span class="input-span">
            <input
              type="text"
              id="username"
              v-model="username"
              class="styled-input w-full"
              autocomplete="off"
              required
            />
            <label for="username" class="input-label">
              <i class="pi pi-user"></i> اسم المستخدم
            </label>
          </span>
        </div>

        <div class="field mb-5">
          <span class="input-span">
            <input
              type="password"
              id="password"
              v-model="password"
              class="styled-input w-full"
              required
            />
            <label for="password" class="input-label">كلمة المرور</label>
            <i class="pi pi-lock input-icon left"></i>
          </span>
        </div>

        <Button
          type="submit"
          label="تسجيل الدخول"
          class="login-button w-full mb-4"
          :loading="loading"
        />
      </form>

      <p class="support-text">
        <i class="pi pi-info-circle mr-2"></i> للدعم الفني تواصل مع لجنة البرمجة
        والتطوير
      </p>
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
    const response = await axios.post('http://his-api.tatwer.tech/api/Login', {
      phoneNumber: username.value,
      password: password.value,
    })

    console.log('Full Response:', response)
    console.log('Response Data:', response.data)
    console.log('Response Data Type:', typeof response.data)
    console.log('Response Data Keys:', Object.keys(response.data))

    if (response.data) {
      const userData = {
        firstName: response.data.data.firstName || '',
        secondName: response.data.data.secondName || '',
        thirdName: response.data.data.thirdName || '',
        phoneNumber: response.data.data.phoneNumber || '',
        role: response.data.data.role || '',
        id: response.data.data.id || '',
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

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.login-page {
  background-color: #f0f8f7;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2rem; 
}

.logo-area {
  margin-bottom: 3rem;
}

.login-container {
  background-color: #fff; 
  border-radius: 12px;
  padding: 3rem;
  width: 500px;
  max-width: 95%;
  text-align: center;
  direction: rtl;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
}

.logo-text {
  color: #00695c;
  font-size: 1.1rem;
  line-height: 1.6;
  font-weight: 500;
}

.logo-image {
  width: 122px;
  height: auto;
}

.title {
  color: #00695c;
  margin-bottom: 0.75rem !important;
}

.subtitle {
  color: #43a047; 
  margin-bottom: 2rem !important;
  font-weight: 400;
}

.field {
  margin-bottom: 2rem;
  position: relative;
}

.input-span {
  display: block;
  position: relative;
}

.styled-input {
  width: 100%;
  padding: 1rem;
  padding-right: 2.5rem; 
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05); 
  direction: rtl; 
}

.styled-input:focus {
  outline: none;
  border-color: #43a047; 
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05), 0 0 5px rgba(67, 160, 71, 0.2); 
}

.input-label {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: #757575; 
  transition: all 0.2s ease;
  pointer-events: none;
  padding: 0 0.3rem;
  background-color: #fff; 
}

.styled-input:focus + .input-label,
.styled-input:not(:placeholder-shown) + .input-label {
  top: -0.6rem;
  font-size: 0.8rem;
  color: #00695c; 
}

.input-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #00695c; 
}

.input-icon.left {
  left: 1rem;
}

.input-icon.right {
  right: 1rem;
}

.login-button {
  background-color: #43a047 !important;
  color: white !important;
  border: none !important;
  border-radius: 6px !important;
  padding: 1rem 1.5rem !important;
  width: 100% !important;
  font-size: 1.1rem !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease;
}

.login-button:hover {
  background-color: #388e3c !important;
}

.login-button:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(67, 160, 71, 0.5); 
}

.support-text {
  color: #757575;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.support-text i {
  font-size: 0.8rem;
}
</style>