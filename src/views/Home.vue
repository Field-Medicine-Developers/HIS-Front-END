<template>
  <div class="dashboard">
    <h1>لوحة التحكم</h1>
    
    <!-- Loading Indicator -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>جاري التحميل...</p>
    </div>
    
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon patients">
          <i class="pi pi-users"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">إجمالي المرضى</span>
          <h3 class="stat-value">{{ totalPatients }}</h3>
          <div class="stat-change">
            <i class="pi pi-arrow-up"></i>
            <span>{{ patientGrowth }}% من الشهر الماضي</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon appointments">
          <i class="pi pi-calendar"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">المواعيد اليوم</span>
          <h3 class="stat-value">{{ todayAppointments }}</h3>
          <span class="stat-subtitle">موعد نشط</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon revenue">
          <i class="pi pi-dollar"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">الإيرادات</span>
          <h3 class="stat-value">{{ formatCurrency(totalRevenue) }}</h3>
          <div class="stat-change">
            <i class="pi pi-arrow-up"></i>
            <span>{{ revenueGrowth }}% هذا الشهر</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon staff">
          <i class="pi pi-users"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">الموظفين</span>
          <h3 class="stat-value">{{ totalStaff }}</h3>
          <span class="stat-subtitle">موظف نشط</span>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="main-grid">
      <!-- Appointments Table -->
      <div class="appointments-section">
        <div class="section-header">
          <h2>المواعيد الأخيرة</h2>
          <Button label="عرض الكل" icon="pi pi-external-link" class="p-button-text" @click="viewAllAppointments" />
        </div>

        <div class="table-toolbar">
          <Button icon="pi pi-plus" label="موعد جديد" severity="success" @click="addNewAppointment" />
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="searchQuery" placeholder="بحث..." @input="filterAppointments" />
          </span>
        </div>

        <DataTable 
          :value="filteredAppointments" 
          :paginator="true" 
          :rows="5" 
          class="p-datatable-sm"
          :loading="loading"
        >
          <Column field="patient" header="المريض">
            <template #body="slotProps">
              <div class="patient-cell">
                <Avatar :label="slotProps.data.patient[0]" shape="circle" />
                <span>{{ slotProps.data.patient }}</span>
              </div>
            </template>
          </Column>
          <Column field="doctor" header="الطبيب" />
          <Column field="date" header="التاريخ">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.date) }}
            </template>
          </Column>
          <Column field="status" header="الحالة">
            <template #body="slotProps">
              <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" />
            </template>
          </Column>
          <Column style="width: 4rem">
            <template #body="slotProps">
              <Button 
                icon="pi pi-ellipsis-v" 
                class="p-button-text p-button-rounded" 
                @click="showAppointmentActions(slotProps.data)" 
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <h2>إجراءات سريعة</h2>
        <div class="quick-actions">
          <Button class="action-button" @click="navigateTo('new-patient')">
            <i class="pi pi-user-plus"></i>
            <div class="action-text">
              <span class="action-title">مريض جديد</span>
              <span class="action-desc">تسجيل مريض جديد</span>
            </div>
          </Button>

          <Button class="action-button" @click="navigateTo('new-appointment')">
            <i class="pi pi-calendar-plus"></i>
            <div class="action-text">
              <span class="action-title">موعد جديد</span>
              <span class="action-desc">حجز موعد جديد</span>
            </div>
          </Button>

          <Button class="action-button" @click="navigateTo('reports')">
            <i class="pi pi-chart-bar"></i>
            <div class="action-text">
              <span class="action-title">التقارير</span>
              <span class="action-desc">عرض التقارير</span>
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
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'

const router = useRouter()
const loading = ref(false)
const searchQuery = ref('')

// Mock data - Replace with actual API calls
const totalPatients = ref(1234)
const patientGrowth = ref(12)
const todayAppointments = ref(56)
const totalRevenue = ref(12345)
const revenueGrowth = ref(8)
const totalStaff = ref(24)

const appointments = ref([
  { patient: 'أحمد محمد', doctor: 'د. علي أحمد', date: '2024-04-15', status: 'مجدول' },
  { patient: 'سارة خالد', doctor: 'د. محمد علي', date: '2024-04-15', status: 'مكتمل' },
  { patient: 'محمد أحمد', doctor: 'د. فاطمة محمد', date: '2024-04-16', status: 'قيد الانتظار' },
  { patient: 'فاطمة علي', doctor: 'د. خالد محمد', date: '2024-04-16', status: 'ملغي' },
  { patient: 'خالد محمد', doctor: 'د. سارة أحمد', date: '2024-04-17', status: 'مجدول' }
])

const filteredAppointments = computed(() => {
  if (!searchQuery.value) return appointments.value
  const query = searchQuery.value.toLowerCase()
  return appointments.value.filter(appointment => 
    appointment.patient.toLowerCase().includes(query) ||
    appointment.doctor.toLowerCase().includes(query)
  )
})

const getStatusSeverity = (status) => {
  const severityMap = {
    'مجدول': 'info',
    'مكتمل': 'success',
    'قيد الانتظار': 'warning',
    'ملغي': 'danger'
  }
  return severityMap[status] || 'info'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ar-SA')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR'
  }).format(amount)
}

const viewAllAppointments = () => {
  router.push('/appointments')
}

const addNewAppointment = () => {
  router.push('/appointments/new')
}

const showAppointmentActions = (appointment) => {
  // Implement appointment actions menu
}

const navigateTo = (route) => {
  router.push(`/${route}`)
}

const filterAppointments = () => {
  // Implement filtering logic
}

onMounted(async () => {
  loading.value = true
  try {
    // Fetch dashboard data from API
    // const response = await axios.get('/api/dashboard')
    // Update refs with actual data
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
}

h1, h2 {
  text-align: right;
  color: #2c3e50;
  margin-bottom: 30px;
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
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.patients { background: var(--primary-50); color: var(--primary-500); }
.appointments { background: var(--green-50); color: var(--green-500); }
.revenue { background: var(--yellow-50); color: var(--yellow-500); }
.staff { background: var(--blue-50); color: var(--blue-500); }

.stat-info {
  flex: 1;
}

.stat-label {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.5rem 0;
  color: var(--text-color);
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--green-500);
}

.stat-subtitle {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.appointments-section,
.quick-actions-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.patient-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-ground);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  background: var(--surface-hover);
}

.action-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.action-title {
  font-weight: 600;
  color: var(--text-color);
}

.action-desc {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

/* Loading Styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #2c3e50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #2c3e50;
  font-size: 18px;
  font-weight: 500;
}

/* Responsive Design */
@media screen and (max-width: 991px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 576px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .table-toolbar {
    flex-direction: column;
    gap: 1rem;
  }
}
</style> 