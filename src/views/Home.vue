<template>
  <div class="dashboard">
    
    <div class="page-header">
    <h1>لوحة التحكم</h1>
    </div>

  <!-- 🟦 Main Card Wrapper for Dashboard Cards -->
<div class="dashboard-main-card">
  <div class="dashboard-header">
    <h2>إحصائيات النظام</h2>
  </div>

  <div class="dashboard-cards-grid">
    <div class="dashboard-card">
      <div class="card-icon bg-patients"><i class="pi pi-users"></i></div>
      <div class="card-content">
        <span class="card-title">إجمالي المراجعين</span>
        <span class="card-value">{{ totalPatients }}</span>
        <span class="card-subtitle">المراجعين المسجلين</span>
      </div>
    </div>

    <div class="dashboard-card">
      <div class="card-icon bg-doctors"><i class="pi pi-user"></i></div>
      <div class="card-content">
        <span class="card-title">إجمالي الأطباء</span>
        <span class="card-value">{{ totalDoctors }}</span>
        <span class="card-subtitle">طبيب نشط</span>
      </div>
    </div>

    <div class="dashboard-card">
      <div class="card-icon bg-nurses"><i class="pi pi-heart"></i></div>
      <div class="card-content">
        <span class="card-title">إجمالي الممرضين</span>
        <span class="card-value">{{ totalNurses }}</span>
        <span class="card-subtitle">ممرض نشط</span>
      </div>
    </div>

    <div class="dashboard-card">
      <div class="card-icon bg-sections"><i class="pi pi-building"></i></div>
      <div class="card-content">
        <span class="card-title">إجمالي الأقسام</span>
        <span class="card-value">{{ totalSections }}</span>
        <span class="card-subtitle">قسم نشط</span>
      </div>
    </div>

    <div class="dashboard-card">
      <div class="card-icon bg-committee"><i class="pi pi-sitemap"></i></div>
      <div class="card-content">
        <span class="card-title">إجمالي اللجان</span>
        <span class="card-value">{{ totalCommittee }}</span>
        <span class="card-subtitle">لجنة نشطة</span>
      </div>
    </div>
  </div>
</div>


    <div class="main-grid">
      <!-- 🟦 قسم إحصائيات الأقسام -->
<div class="sections-stats-box">
  <div class="section-header">
    <h2>إحصائيات الأقسام</h2>
  </div>

  <div class="sections-grid">
    <div class="section-card">
      <h4>عدد الأطباء</h4>
      <p class="section-value">{{ totalDoctors }}</p>
      <ProgressBar :value="doctorProgress" />
    </div>

    <div class="section-card">
      <h4>عدد الممرضين</h4>
      <p class="section-value">{{ totalNurses }}</p>
      <ProgressBar :value="nurseProgress" />
    </div>

    <div class="section-card">
      <h4>عدد الصيادلة</h4>
      <p class="section-value">{{ totalPharmacists }}</p>
      <ProgressBar :value="pharmacistProgress" />
    </div>
  </div>
</div>

<div class="quick-actions-box">
  <div class="section-header">
    <h2>إجراءات سريعة</h2>
  </div>

  <div class="quick-actions-grid">
    <button class="quick-action patient" @click="navigateTo('reviewers')">
      <i class="pi pi-user-plus"></i>
      <div class="action-info">
        <span class="action-title">مراجع جديد</span>
        <span class="action-desc">تسجيل مراجع جديد</span>
      </div>
    </button>

    <button class="quick-action doctor" @click="navigateTo('users')">
      <i class="pi pi-calendar-plus"></i>
      <div class="action-info">
        <span class="action-title">موظف جديد</span>
        <span class="action-desc">تسجيل موظف جديد</span>
      </div>
    </button>

    <button class="quick-action report" @click="navigateTo('examination-committee')">
      <i class="pi pi-chart-bar"></i>
      <div class="action-info">
        <span class="action-title">الفحص الأولي</span>
        <span class="action-desc">إضافة فحص جديد</span>
      </div>
    </button>
  </div>
</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)


const totalPatients = ref(0)
const totalDoctors = ref(0)
const totalNurses = ref(0)
const totalPharmacists = ref(0)
const totalSections = ref(0)
const totalCommittee = ref(0)



const doctorProgress = computed(() => Math.min((totalDoctors.value / 100) * 100, 100))
const nurseProgress = computed(() => Math.min((totalNurses.value / 100) * 100, 100))
const pharmacistProgress = computed(() => Math.min((totalPharmacists.value / 50) * 100, 100))


const navigateTo = (route) => {
  router.push(`/${route}`)
}

onMounted(async () => {
  loading.value = true
  try {
    const response = await axios.get('http://his-api.tatwer.tech/api/Dashboard/GetDashboard')
    const data = response.data.data
    totalPatients.value = data.totalPatients
    totalDoctors.value = data.totalDoctors
    totalNurses.value = data.totalNurses
    totalPharmacists.value = data.totalPharmacists
    totalSections.value = data.totalSections
    totalCommittee.value = data.totalCommittee
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
:root {
  --card-blue: #1976d2;
  --card-green: #43a047;
  --card-orange: #fb8c00;
  --card-purple: #8e24aa;
  --icon-bg: #fff;
  --text-light: #fff;
  --text-dark: #23272f;
  --card-shadow: 0 4px 24px rgba(30, 41, 59, 0.13);
  --card-shadow-hover: 0 8px 32px rgba(30, 41, 59, 0.18);
  --transition: 0.25s cubic-bezier(.4, 0, .2, 1);
}

.dashboard {
  padding: 2rem;
  margin: 0 auto;
  background: var(--primary-gradient);
  border-radius: 20px;
  box-shadow: var(--card-shadow);
  min-height: calc(100vh - 4rem);
}

h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2rem;
  text-align: right;
  font-family: 'Cairo', sans-serif;
  letter-spacing: -0.3px;
  position: relative;
  padding-bottom: 0.75rem;
}

h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-blue), rgba(2, 132, 199, 0.5));
  border-radius: 2px;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: right;
  font-family: 'Cairo', sans-serif;
  letter-spacing: -0.2px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  background: #fff;
  border-radius: 18px;
  padding: 1.5rem 1.25rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  box-shadow: 0 4px 24px rgba(30, 41, 59, 0.07);
  border: none;
  transition: box-shadow 0.25s cubic-bezier(.4, 0, .2, 1), transform 0.25s cubic-bezier(.4, 0, .2, 1);
  position: relative;
  min-width: 0;
  overflow: visible;
}

.stat-card:hover {
  box-shadow: 0 8px 32px rgba(30, 41, 59, 0.13);
  transform: translateY(-4px) scale(1.025);
}

.stat-icon {
  position: absolute;
  top: 1.1rem;
  left: 1.1rem;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: rgba(25, 118, 210, 0.08);
  color: #1976d2;
  box-shadow: none;
}

.stat-card.doctors .stat-icon {
  background: rgba(67, 160, 71, 0.08);
  color: #43a047;
}

.stat-card.nurses .stat-icon {
  background: rgba(251, 140, 0, 0.08);
  color: #fb8c00;
}

.stat-card.sections .stat-icon {
  background: rgba(142, 36, 170, 0.08);
  color: #8e24aa;
}

.stat-info {
  width: 100%;
  text-align: right;
}

.stat-label {
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: 2.1rem;
  font-weight: 800;
  color: #23272f;
  margin: 0.2rem 0 0.1rem 0;
  letter-spacing: 0.5px;
}

.stat-subtitle {
  font-size: 0.93rem;
  font-weight: 400;
  color: #43a047;
  margin-top: 0.1rem;
}

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.75rem;
}

.sections-stats-section {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: var(--card-shadow);
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: all 0.3s var(--transition-bezier);
}

.sections-stats-section:hover {
  box-shadow: var(--hover-shadow);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.section-card {
  box-shadow: 0 4px 24px rgba(30, 41, 59, 0.07);
  background: var(--bg-secondary);
  border-radius: 14px;
  padding: 1.5rem;
  background: #ffffff;
  text-align: center;
  transition: all 0.3s var(--transition-bezier);
  border: 1px solid rgba(0, 0, 0, 0.02);
  position: relative;
  overflow: hidden;
}

.section-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.section-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--hover-shadow);
}

.section-card:hover::before {
  opacity: 1;
}

.section-card h4 {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.section-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-blue);
  margin: 0.75rem 0;
}

.section-progress {
  margin-top: 1rem;
}

.quick-actions-section {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: var(--card-shadow);
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition: all 0.3s var(--transition-bezier);
}

.quick-actions-section:hover {
  box-shadow: var(--hover-shadow);
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.3s var(--transition-bezier);
  font-family: 'Cairo', sans-serif;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-button:hover::before {
  opacity: 1;
}

.action-button.patient {
  background: linear-gradient(135deg, rgba(224, 242, 254, 0.8) 0%, rgba(186, 230, 253, 0.8) 100%);
  color: var(--primary-blue);
}

.action-button.appointment {
  background: linear-gradient(135deg, rgba(220, 252, 231, 0.8) 0%, rgba(187, 247, 208, 0.8) 100%);
  color: var(--primary-green);
}

.action-button.report {
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.8) 0%, rgba(253, 230, 138, 0.8) 100%);
  color: var(--primary-orange);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--hover-shadow);
}

.action-button i {
  font-size: 1.5rem;
  transition: transform 0.3s var(--transition-bezier);
}

.action-button:hover i {
  transform: scale(1.1);
}

.action-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.action-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
}

.action-desc {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1001;
  backdrop-filter: blur(6px);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  margin-top: 1rem;
}

@media screen and (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 991px) {
  .dashboard {
    padding: 1.5rem;
  }

  .main-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .sections-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .dashboard {
    padding: 1.25rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}

@media screen and (max-width: 576px) {
  .dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .sections-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .action-button {
    padding: 1rem;
  }

  .section-card {
    padding: 1.25rem;
  }
}

/* Page header styles */
.page-header {
  background: linear-gradient(to right, #f5faff, #ffffff);  padding: 25px 30px;
  border-radius: 8px;
  margin-bottom: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  text-align: left;
  border-left: 6px solid #2c3e50;
  display: flex;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.5px;
}


.dashboard-main-card {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  padding: 25px 30px;
  margin-bottom: 30px;
}

.dashboard-header {
  margin-bottom: 20px;
  text-align: right;
}

.dashboard-header h2 {
  font-size: 22px;
  color: #2c3e50;
  font-weight: 700;
  position: relative;
  padding-bottom: 0.5rem;
  text-align: right;
  margin: 0;
}

.dashboard-header h2::after {
  content: "";
  position: absolute;
  bottom: 0;
  right: 0;
  width: 150px; 
  height: 2px;  
  background-color: #e0e0e0;
  border-radius: 2px;
}
.dashboard-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.dashboard-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
  border-top: 4px solid #e0e0e0;
}

.dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  flex-shrink: 0;
}

/* Background Colors */
.bg-patients {
  background-color: #4caf50;
}

.bg-doctors {
  background-color: #2196f3;
}

.bg-nurses {
  background-color: #9c27b0;
}

.bg-sections {
  background-color: #ff9800;
}

.bg-committee {
  background-color: #607d8b;
}

.card-content {
  text-align: right;
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #555;
  font-weight: 600;
  display: block;
  margin-bottom: 5px;
}

.card-value {
  font-size: 24px;
  font-weight: 800;
  color: #222;
  display: block;
}

.card-subtitle {
  font-size: 13px;
  color: #888;
  margin-top: 3px;
  display: block;
}

/* card-2 */
.sections-stats-box {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  transition: all 0.3s ease-in-out;
}

.sections-stats-box:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
}

.section-header h2 {
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  color: #2c3e50;
  font-weight: 700;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
  text-align: right;
}

/* Grid of cards */
.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.section-card {
  background-color: #eef0f3;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.section-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.section-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 1rem;
}

/* Progress bar override if needed */
.section-card .p-progressbar {
  height: 10px;
  border-radius: 5px;
  background: #e0e0e0;
}

.section-card .p-progressbar .p-progressbar-value {
  background: linear-gradient(to right, #42a5f5, #1976d2);
  border-radius: 5px;
}

/* card-3 */
.quick-actions-box {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  transition: all 0.3s ease-in-out;
}

.quick-actions-box:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
}

.quick-actions-box .section-header h2 {
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  color: #2c3e50;
  font-weight: 700;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
  text-align: right;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  border: none;
  background-color: #eef0f3;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease-in-out;
  cursor: pointer;
  text-align: right;
  direction: rtl;
}

.quick-action:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.quick-action i {
  font-size: 1.75rem;
  padding: 10px;
  border-radius: 50%;
  color: white;
  flex-shrink: 0;
}

/* Specific Colors */
.quick-action.patient i {
  background-color: #42a5f5;
}

.quick-action.doctor i {
  background-color: #66bb6a;
}

.quick-action.report i {
  background-color: #ffa726;
}

.action-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.action-desc {
  font-size: 0.875rem;
  color: #6b7280;
}
</style>