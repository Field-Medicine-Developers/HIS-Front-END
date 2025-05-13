<template>
  <div class="dashboard">
    <h1>لوحة التحكم</h1>
    
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon patients">
          <i class="pi pi-users"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">إجمالي المراجعين</span>
          <h3 class="stat-value">{{ totalPatients }}</h3>
          <span class="stat-subtitle">المراجعين المسجيلن</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon doctors">
          <i class="pi pi-user"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">إجمالي الأطباء</span>
          <h3 class="stat-value">{{ totalDoctors }}</h3>
          <span class="stat-subtitle">طبيب نشط</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon nurses">
          <i class="pi pi-heart"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">إجمالي الممرضين</span>
          <h3 class="stat-value">{{ totalNurses }}</h3>
          <span class="stat-subtitle">ممرض نشط</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon sections">
          <i class="pi pi-building"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">إجمالي الأقسام</span>
          <h3 class="stat-value">{{ totalSections }}</h3>
          <span class="stat-subtitle">قسم نشط</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon sections">
          <i class="pi pi-building"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">إجمالي اللجان</span>
          <h3 class="stat-value">{{ totalCommittee }}</h3>
          <span class="stat-subtitle">لجنه نشطة </span>
        </div>
      </div>
    </div>


    <div class="main-grid">
      <div class="sections-stats-section">
        <div class="section-header">
          <h2>إحصائيات الأقسام</h2>
        </div>
        <div class="sections-grid">
          <div class="section-card">
            <h4>عدد الأطباء</h4>
            <p class="section-value">{{ totalDoctors }}</p>
            <div class="section-progress">
              <ProgressBar :value="doctorProgress" />
            </div>
          </div>
          <div class="section-card">
            <h4>عدد الممرضين</h4>
            <p class="section-value">{{ totalNurses }}</p>
            <div class="section-progress">
              <ProgressBar :value="nurseProgress" />
            </div>
          </div>
          <div class="section-card">
            <h4>عدد الصيادلة</h4>
            <p class="section-value">{{ totalPharmacists }}</p>
            <div class="section-progress">
              <ProgressBar :value="pharmacistProgress" />
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions-section">
        <h2>إجراءات سريعة</h2>
        <div class="quick-actions">
          <Button class="action-button patient" @click="navigateTo('reviewers')">
            <div class="stat-icon patients">
              <i class="pi pi-user-plus"></i>
            </div>
            
            <div class="action-text">
              <span class="action-title">مراجع جديد</span>
              <span class="action-desc">تسجيل مراجع جديد</span>
            </div>
          </Button>

          <Button class="action-button appointment" @click="navigateTo('users')">
            <div class="stat-icon doctors"><i class="pi pi-calendar-plus"></i></div>
            
            <div class="action-text">
              <span class="action-title">موظف جديد</span>
              <span class="action-desc"> تسجيل موظف جديد</span>
            </div>
          </Button>

          <Button class="action-button report" @click="navigateTo('examination-committee')">
            <div class="stat-icon nurses"><i class="pi pi-chart-bar"></i></div>
            
            <div class="action-text">
              <span class="action-title">الفحص الأولي</span>
              <span class="action-desc">أظافة فحص جديد</span>
            </div>
          </Button>
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
.dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%);
  border-radius: 16px;
}

h1, h2 {
  text-align: right;
  color: #1a2b49;
  font-family: 'Cairo', sans-serif;
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
}

h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.patients { background: #e3f2fd; color: #1976d2; }
.doctors { background: #e8f5e9; color: #2e7d32; }
.nurses { background: #fff3e0; color: #f57c00; }
.sections { background: #f3e5f5; color: #7b1fa2; }

.stat-info {
  flex: 1;
}

.stat-label {
  color: #627282;
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0.5rem 0;
  color: #1a2b49;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #2e7d32;
}

.stat-subtitle {
  font-size: 0.85rem;
  color: #627282;
}


.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}


.sections-stats-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.section-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}

.section-card h4 {
  font-size: 1rem;
  color: #1a2b49;
  margin-bottom: 0.5rem;
}

.section-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1976d2;
  margin: 0.5rem 0;
}

.section-progress {
  margin-top: 0.5rem;
}


.quick-actions-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
  padding: 1rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Cairo', sans-serif;
}

.action-button.patient { background: #e3f2fd; }
.action-button.appointment { background: #e8f5e9; }
.action-button.report { background: #fff3e0; }

.action-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button i {
  font-size: 1.5rem;
}

.action-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.action-title {
  font-weight: 600;
  color: #1a2b49;
}

.action-desc {
  font-size: 0.85rem;
  color: #627282;
}


.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #e4e9f0;
  border-top: 6px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #1a2b49;
  font-size: 1.2rem;
  font-weight: 500;
  margin-top: 1rem;
}


@media screen and (max-width: 991px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-grid {
    grid-template-columns: 1fr;
  }

  .sections-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .sections-grid {
    grid-template-columns: 1fr;
  }

  .dashboard {
    padding: 1rem;
  }
}
</style>