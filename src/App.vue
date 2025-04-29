<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
</script>

<template>
  <div class="container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <img src="./assets/logo.png" alt="HIS System" class="logo" />
        <h2>HIS System</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item">
          <i class="pi pi-home"></i>
          <div class="nav-text">
            <span>الرئيسية</span>
            <p class="nav-description">قائمة الشارت والمعلومات العامة</p>
          </div>
        </router-link>
        <router-link to="/users" class="nav-item">
          <i class="pi pi-users"></i>
          <div class="nav-text">
            <span>إدارة المستخدمين</span>
            <p class="nav-description">إدارة حسابات المستخدمين والصلاحيات</p>
          </div>
        </router-link>
        <router-link to="/staff-sections" class="nav-item">
          <i class="pi pi-building"></i>
          <div class="nav-text">
            <span>أقسام الكادر الطبي</span>
            <p class="nav-description">إدارة الأقسام والتخصصات الطبية</p>
          </div>
        </router-link>
        <router-link to="/medical-staff" class="nav-item">
          <i class="pi pi-user"></i>
          <div class="nav-text">
            <span>الكادر الطبي</span>
            <p class="nav-description">إدارة الأطباء والكادر الطبي</p>
          </div>
        </router-link>
        <router-link to="/working-hours" class="nav-item">
          <i class="pi pi-clock"></i>
          <div class="nav-text">
            <span>ساعات العمل</span>
            <p class="nav-description">إدارة جداول العمل والمواعيد</p>
          </div>
        </router-link>
        <router-link to="/reviewers" class="nav-item">
          <i class="pi pi-users"></i>
          <div class="nav-text">
            <span>المراجعين</span>
            <p class="nav-description">إدارة بيانات المراجعين والسجلات الطبية</p>
          </div>
        </router-link>
        <router-link to="/examination-committee" class="nav-item">
          <i class="pi pi-check-square"></i>
          <div class="nav-text">
            <span>الفحص الاولي</span>
            <p class="nav-description">إدارة لجان الفحص والتقييم الطبي</p>
          </div>
        </router-link>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<style>
@import './assets/main.css';
</style>
