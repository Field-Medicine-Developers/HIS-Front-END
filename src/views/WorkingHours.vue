<template>
   <div class="working-hours">
    
    <div class="page-header">
  <h1>إدارة ساعات العمل</h1>
    </div>

    <!-- Buttons to choose add type -->
    <div class="add-shift-button">
      <button @click="showStaffModal" class="add-btn me-2">
        <i class="pi pi-user-plus"></i> إضافة موظف  
      </button>
      <button @click="showSectionModal" class="add-btn">
        <i class="pi pi-plus"></i> إضافة أقسام
      </button>
    </div>

   <!-- Filters -->
   <div class="filters">
      <div class="filter-group">
        <input
          type="text"
          v-model="filters.shiftName"
          placeholder="البحث باسم الشفت"
          @input="onFilterChange"
        />
      </div>

      <div class="filter-group">
        <input
          type="time"
          v-model="filters.startTime"
          placeholder="وقت البداية"
          @input="onFilterChange"
        />
      </div>

      <div class="filter-group">
        <input
          type="time"
          v-model="filters.endTime"
          placeholder="وقت النهاية"
          @input="onFilterChange"
        />
      </div>

      <div class="filter-group">
        <select v-model="filters.workingDay" @change="onFilterChange">
          <option value="">كل الأيام</option>
          <option v-for="(label, value) in workingDays" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </div>
    </div>


       <!-- Shifts Table -->
       <div class="table-container">
      <table class="shifts-table">
        <thead>
          <tr>
            <th>اسم الشفت</th>
            <th>وقت البداية</th>
            <th>وقت النهاية</th>
            <th>يوم العمل</th>
            <th>اسم الموظف الطبي</th>
            <th>اسم القسم</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr v-for="n in 5" :key="n" class="skeleton-row">
              <td><div class="skeleton-cell"></div></td>
              <td><div class="skeleton-cell"></div></td>
              <td><div class="skeleton-cell"></div></td>
              <td><div class="skeleton-cell"></div></td>
              <td><div class="skeleton-cell"></div></td>
              <td><div class="skeleton-cell"></div></td>
              <td><div class="skeleton-cell"></div></td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="shift in shifts" :key="shift.id">
              <td>{{ shift.shiftName }}</td>
              <td>{{ shift.startTime }}</td>
              <td>{{ shift.endTime }}</td>
              <td>{{ getDayName(shift.workingDay) }}</td>
              <td>{{ shift.medicalStaff?.user?.firstName || '-' }}</td>
              <td>{{ shift.staffSections?.sectionName || '-' }}</td>
              <td>
                <button @click="editShift(shift)" class="edit-btn">
                  <i class="fas fa-edit"></i> تعديل
                </button>
                <button @click="deleteShift(shift)" class="delete-btn">
                  <i class="fas fa-trash"></i> حذف
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button 
        v-for="page in pagination.totalPages" 
        :key="page"
        @click="onPageChange(page)"
        :class="{ active: page === pagination.page }"
      >
        {{ page }}
      </button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingShift ? 'تعديل الشفت' : 'إضافة شفت جديد' }}</h2>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="shift-form">
          <div class="form-group">
            <label for="shiftName">اسم الشفت *</label>
            <input
              type="text"
              id="shiftName"
              v-model="formData.shiftName"
              placeholder="اسم الشفت"
              required
            />
          </div>

          <div class="form-group">
            <label for="startTime">وقت البداية *</label>
            <input
              type="time"
              id="startTime"
              v-model="formData.startTime"
              required
            />
          </div>

          <div class="form-group">
            <label for="endTime">وقت النهاية *</label>
            <input
              type="time"
              id="endTime"
              v-model="formData.endTime"
              required
            />
          </div>

          <div class="form-group">
            <label for="workingDay">يوم العمل *</label>
            <select id="workingDay" v-model="formData.workingDay" required>
              <option v-for="(label, value) in workingDays" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>

           <div v-if="!editingShift && showStaffField" class="form-group">
             <label for="medicalStaffId">موظف الكادر طبي *</label>
             <select id="medicalStaffId" v-model="formData.medicalStaffId" required>
               <option v-for="staff in medicalStaffList" :key="staff.id" :value="staff.id">
                 {{ staff.user.firstName }}
               </option>
             </select>
           </div>
           
           <div v-if="!editingShift && showSectionField" class="form-group">
             <label for="staffSectionsId">الأقسام *</label>
             <select id="staffSectionsId" v-model="formData.staffSectionsId" required>
               <option value="">اختر القسم</option>
               <option v-for="section in sections" :key="section.id" :value="section.id">
                 {{ section.sectionName }}
               </option>
             </select>
           </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button">
              {{ editingShift ? 'تحديث' : 'حفظ' }}
            </button>
            <button type="button" class="cancel-button" @click="closeModal">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  </div>
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h2>تأكيد الحذف</h2>
          <button class="close-button" @click="closeDeleteModal">&times;</button>
        </div>
        
        <div class="delete-modal-content">
          <div class="delete-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <p class="delete-message">هل أنت متأكد من حذف الشفت "{{ shiftToDelete?.shiftName }}"؟</p>
          <p class="delete-warning">هذا الإجراء لا يمكن التراجع عنه</p>
          
          <div class="delete-actions">
            <button @click="confirmDelete" class="confirm-delete-btn">حذف</button>
            <button @click="closeDeleteModal" class="cancel-delete-btn">إلغاء</button>
          </div>
        </div>
      </div>
    </div>

</template>

<script>
export default {
  name: 'WorkingHours',
  data() {
    return {
      formData: {
        shiftName: '',
        startTime: '',
        endTime: '',
        workingDay: 1,
        medicalStaffId: '',
        staffSectionsId: '',
        workingHoursResponse: {
          startTime: '',
          endTime: '',
          workingDay: 1,
          medicalStaffId: '',
          staffSectionsId: ''
        }
      },
      medicalStaffList: [],
      sections: [],
      errorMessage: '',
      successMessage: '',
      shifts: [],
      loading: false,
      totalRecords: 0,
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 0
      },
      filters: {
        shiftName: ''
      },
      editingShift: null,
      showModal: false,
      showDeleteModal: false,
      shiftToDelete: null,
      workingDays: {
        0: 'لا يوجد',
        1: 'الأحد',
        2: 'الإثنين',
        3: 'الثلاثاء',
        4: 'الأربعاء',
        5: 'الخميس',
        6: 'الجمعة',
        7: 'السبت'
      }
    }
  },
  created() {
    this.fetchShifts()
    this.fetchMedicalStaff()
    this.fetchSections();
  },
  methods: {
    async fetchShifts() {
      try {
        this.loading = true
        const params = {
          PageNumber: this.pagination.page,
          PageSize: this.pagination.pageSize,
          ShiftName: this.filters.shiftName || undefined,
          StartTime: this.filters.startTime || undefined,
          EndTime: this.filters.endTime || undefined,
          DaysOfWeek: this.filters.workingDay || undefined
        }

        const response = await this.$axios.get('/WorkingHours/GetAllWorkingHours', { params })
        this.shifts = response.data.items || []
        this.totalRecords = response.data.totalCount || 0
        this.pagination.totalPages = response.data.totalPages || 0
      } catch (error) {
        console.error('Error fetching shifts:', error)
        if (error.code === 'ERR_NETWORK') {
          this.errorMessage = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت'
        } else if (error.response) {
          this.errorMessage = error.response.data?.message || 'حدث خطأ أثناء جلب بيانات الشفتات'
        } else {
          this.errorMessage = 'حدث خطأ غير متوقع'
        }
      } finally {
        this.loading = false
      }
    },
    async fetchMedicalStaff() {
      try {
        const response = await this.$axios.get('/MedicalStaff/GetAllMedicalStaff', {
          params: {
            PageSize: 100
          }
        })
        this.medicalStaffList = response.data.items || []
        console.log(this.medicalStaffList,"asdasdsa") 
      } catch (error) {
        console.error('Error fetching medical staff:', error)
        this.errorMessage = 'حدث خطأ أثناء جلب بيانات الموظفين الطبيين'
      }
    },
    async fetchSections() {
  try {
    const response = await this.$axios.get('/StaffSections/GetAllStaffSections', {
      params: {
        PageSize: 100
      }
    });
    this.sections = response.data.items || [];
  } catch (error) {
    console.error('Error fetching sections:', error);
    this.errorMessage = 'حدث خطأ أثناء جلب الأقسام';
  }
},
    async handleSubmit() {
      try {
        this.errorMessage = ''
        this.successMessage = ''

        // Format the time to match TimeOnly format and ensure 24H format
        const formatTimeTo24H = (time) => {
          const [hours, minutes] = time.split(':')
          return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
        }

        const formattedData = {
          shiftName: this.formData.shiftName,
          startTime: formatTimeTo24H(this.formData.startTime),
          endTime: formatTimeTo24H(this.formData.endTime),
          workingDay: this.formData.workingDay,
          // medicalStaffId: this.formData.medicalStaffId,
          // staffSectionsId: this.formData.staffSectionsId
        }

        // أضف فقط إذا كان الحقل ظاهر ومستخدم
if (this.showStaffField) {
  formattedData.medicalStaffId = this.formData.medicalStaffId;
}

if (this.showSectionField) {
  formattedData.staffSectionsId = this.formData.staffSectionsId;
}

        if (this.editingShift) {
          await this.$axios.put(`/WorkingHours/UpdateWorkingHours/${this.editingShift.id}`, formattedData)
          this.successMessage = 'تم تحديث الشفت بنجاح'
        } else {
          await this.$axios.post('/WorkingHours/AddWorkingHours', formattedData)
          this.successMessage = 'تم إنشاء الشفت بنجاح'
        }

        this.closeModal()
        this.fetchShifts()
      } catch (error) {
        console.error('Error saving shift:', error)
        if (error.response) {
          if (error.response.status === 401) {
            this.errorMessage = 'غير مصرح لك بتنفيذ هذه العملية. يرجى تسجيل الدخول مرة أخرى'
          } else {
            this.errorMessage = error.response.data?.message || 'حدث خطأ أثناء حفظ الشفت'
          }
        } else {
          this.errorMessage = 'حدث خطأ غير متوقع'
        }
      }
    },
    editShift(shift) {
      this.editingShift = shift
      this.formData = { ...shift }
      this.showModal = true
    },
    deleteShift(shift) {
      this.shiftToDelete = shift
      this.showDeleteModal = true
    },
    showStaffModal() {
      this.showModal = true;
      this.showStaffField = true;
      this.showSectionField = false;
   },  

    showSectionModal() {
      this.showModal = true;
      this.showSectionField = true;
      this.showStaffField = false;
   },
    async confirmDelete() {
      if (!this.shiftToDelete) return
      
      try {
        await this.$axios.delete(`/WorkingHours/DeleteWorkingHours/${this.shiftToDelete.id}`)
        this.successMessage = 'تم حذف الشفت بنجاح'
        this.fetchShifts()
        this.closeDeleteModal()
      } catch (error) {
        console.error('Error deleting shift:', error)
        if (error.response) {
          if (error.response.status === 401) {
            this.errorMessage = 'غير مصرح لك بتنفيذ هذه العملية. يرجى تسجيل الدخول مرة أخرى'
          } else {
            this.errorMessage = error.response.data?.message || 'حدث خطأ أثناء حذف الشفت'
          }
        } else {
          this.errorMessage = 'حدث خطأ غير متوقع'
        }
      }
    },
    closeModal() {
      this.editingShift = null
      this.formData = {
        shiftName: '',
        startTime: '',
        endTime: '',
        workingDay: 1,
        medicalStaffId: '',
        staffSectionsId: '',
        workingHoursResponse: {
          startTime: '',
          endTime: '',
          workingDay: 1,
          medicalStaffId: '',
          staffSectionsId: ''
        }
      }
      this.showModal = false
    },
    closeDeleteModal() {
      this.shiftToDelete = null
      this.showDeleteModal = false
    },
    onPageChange(page) {
      this.pagination.page = page
      this.fetchShifts()
    },
    onFilterChange() {
      this.pagination.page = 1
      this.fetchShifts()
    },
    getDayName(dayNumber) {
      return this.workingDays[dayNumber] || ''
    }
  }
}
</script>

<style scoped>
.working-hours {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
}

h1, h2, h3 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

/* Filters */
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-group {
  flex: 1;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Table */
.table-container {
  margin-bottom: 20px;
  overflow-x: auto;
}

.shifts-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.shifts-table th,
.shifts-table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #ddd;
}

.shifts-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.shifts-table tr:hover {
  background-color: #f8f9fa;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-bottom: 20px;
}

.pagination button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.pagination button.active {
  background-color: #2c3e50;
  color: white;
  border-color: #2c3e50;
}

/* Form */
.shift-form {
  display: grid;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

input, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus, select:focus {
  outline: none;
  border-color: #2c3e50;
}

/* Buttons */
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.submit-button,
.cancel-button {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.submit-button {
  background-color: #2c3e50;
  color: white;
}

.submit-button:hover {
  background-color: #34495e;
}

.cancel-button {
  background-color: #e74c3c;
  color: white;
}

.cancel-button:hover {
  background-color: #c0392b;
}

.edit-btn,
.delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 5px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.edit-btn:hover {
  background-color: #2980b9;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background-color: #c0392b;
}

/* Messages */
.error-message {
  color: #e74c3c;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #fde8e8;
  border-radius: 4px;
}

.success-message {
  color: #27ae60;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 4px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.add-shift-button {
  margin-bottom: 20px;
  text-align: left;
}

.add-btn {
  padding: 10px 20px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.add-btn i {
  margin-left: 5px;
}

/* Skeleton Loading Styles */
.skeleton-row {
  animation: skeleton-loading 1s linear infinite alternate;
}

.skeleton-cell {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  margin: 8px 0;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Delete Modal Styles */
.delete-modal {
  max-width: 400px;
  text-align: center;
}

.delete-modal-content {
  padding: 20px 0;
}

.delete-icon {
  font-size: 48px;
  color: #e74c3c;
  margin-bottom: 20px;
}

.delete-message {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.delete-warning {
  color: #e74c3c;
  margin-bottom: 20px;
}

.delete-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.confirm-delete-btn,
.cancel-delete-btn {
  padding: 10px 25px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.confirm-delete-btn {
  background-color: #e74c3c;
  color: white;
}

.confirm-delete-btn:hover {
  background-color: #c0392b;
}

.cancel-delete-btn {
  background-color: #95a5a6;
  color: white;
}

.cancel-delete-btn:hover {
  background-color: #7f8c8d;
}

/* Responsive Design */
@media (max-width: 768px) {
  .working-hours {
    padding: 10px;
  }
  
  .modal-content {
    width: 95%;
    padding: 20px;
  }

  .filters {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-button,
  .cancel-button {
    width: 100%;
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 75%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow:
    0 15px 30px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.3s ease-in-out;
  border: 1px solid #ccc;
  position: relative;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 22px;
  color: #2c3e50;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 26px;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}

.close-button:hover {
  color: #e74c3c;
}



.input-group {
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 10px;
  background-color: #fafafa;
  margin-bottom: 20px;
}

.input-group:nth-child(even) {
  background-color: #f0f4f8;
}

.form-group {
  margin-bottom: 5px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

input,
select,
textarea,
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #32817d;
  border-radius: 6px;
  font-size: 15px;
  background-color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #32817d;
  box-shadow: 0 0 0 4px rgba(50, 129, 125, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08);
  outline: none;
}



.range-inputs {
  display: flex;
  gap: 15px;
  justify-content: space-between;
}

.range-inputs > div {
  flex: 1;
}


.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #000000;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #e74c3c; 
}

.me-2 {
  margin-left: 10px;
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


</style> 