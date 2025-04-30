<template>
  <div class="examination-committee">
    <h1>الفحص الاولي الطبي</h1>
    
    <!-- Add Examination Button -->
    <div class="add-examination-button">
      <button @click="showModal = true" class="add-btn">
        <i class="pi pi-plus"></i>إضافة فحص جديد
      </button>
    </div>
    <!-- Examination Cards Section -->
    <div class="examination-cards">
      <div v-if="loading" class="loading-cards">
        <div v-for="n in 3" :key="n" class="card skeleton-card">
          <div class="skeleton-header"></div>
          <div class="skeleton-content">
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
          </div>
        </div>
      </div>
      <div v-else class="cards-grid">
        <div v-for="diagnosis in diagnoses" :key="diagnosis.id" class="card">
          <div class="card-header">
            <h3>فحص رقم: {{ diagnosis.id }}</h3>
            <span class="date">{{ formatDate(diagnosis.createdAt) }}</span>
          </div>
          <div class="card-content">
            <div class="info-row">
              <span class="label">المراجع:</span>
              <span class="value">{{ getReviewerName(diagnosis.reviewerId) }}</span>
            </div>
            <div class="info-row">
              <span class="label">الطبيب:</span>
              <span class="value">{{ diagnosis.medicalStaff.user.firstName }} {{ diagnosis.medicalStaff.user.secondName }} {{ diagnosis.medicalStaff.user.thirdName }}</span>
            </div>
            <div class="info-row">
              <span class="label">القسم:</span>
              <span class="value">{{ diagnosis.staffSections.sectionName }}</span>
            </div>
            <div class="info-row" v-if="diagnosis.notes">
              <span class="label">ملاحظات:</span>
              <span class="value">{{ diagnosis.notes }}</span>
            </div>
          </div>
          <div class="card-actions">
            <button @click="viewDetails(diagnosis)" class="view-btn">
              <i class="pi pi-eye"></i> عرض التفاصيل
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Examination Form Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>إضافة فحص جديد</h2>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="examination-form">
          <div class="form-row">
            <div class="form-group">
              <label for="reviewerId">اسم المراجع *</label>
              <select 
                id="reviewerId" 
                v-model="formData.reviewerId" 
                required
              >
                <option value="">اختر المراجع</option>
                <option 
                  v-for="reviewer in reviewers" 
                  :key="reviewer.id" 
                  :value="reviewer.id"
                >
                  {{ reviewer.firstName }} {{ reviewer.secondName }} {{ reviewer.thirdName }} {{ reviewer.surName }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="medicalStaffId">اسم الطبيب *</label>
              <select 
                id="medicalStaffId" 
                v-model="formData.medicalStaffId" 
                required
                @change="onDoctorChange"
              >
                <option value="">اختر الطبيب</option>
                <option 
                  v-for="staff in medicalStaff" 
                  :key="staff.id" 
                  :value="staff.id"
                >
                  {{ staff.user.firstName }} {{ staff.user.secondName }} {{ staff.user.thirdName }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="bloodPressure">ضغط الدم</label>
              <input 
                type="text" 
                id="bloodPressure" 
                v-model="formData.bloodPressure"
              />
            </div>
            <div class="form-group">
              <label for="weight">الوزن</label>
              <input 
                type="text" 
                id="weight" 
                v-model="formData.weight"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="oxygenSaturation">تشبع الأكسجين</label>
              <input 
                type="text" 
                id="oxygenSaturation" 
                v-model="formData.oxygenSaturation"
              />
            </div>
            <div class="form-group">
              <label for="temperature">درجة الحرارة</label>
              <input 
                type="text" 
                id="temperature" 
                v-model="formData.temperature"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="pulse">النبض</label>
              <input 
                type="text" 
                id="pulse" 
                v-model="formData.pulse"
              />
            </div>
            <div class="form-group">
              <label for="staffSectionId">القسم</label>
              <input 
                type="text" 
                id="staffSectionId" 
                v-model="formData.staffSectionId"
                readonly
              />
            </div>
          </div>

          <div class="form-group">
            <label for="chronicDiseases">الأمراض المزمنة</label>
            <textarea 
              id="chronicDiseases" 
              v-model="formData.chronicDiseases"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="communicableDiseases">الأمراض المعدية</label>
            <textarea 
              id="communicableDiseases" 
              v-model="formData.communicableDiseases"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="allergies">الحساسية</label>
            <textarea 
              id="allergies" 
              v-model="formData.allergies"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="drugAllergies">حساسية الأدوية</label>
            <textarea 
              id="drugAllergies" 
              v-model="formData.drugAllergies"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="skinDiseases">أمراض الجلد</label>
            <textarea 
              id="skinDiseases" 
              v-model="formData.skinDiseases"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="referredToParty">محول إلى</label>
            <input 
              type="text" 
              id="referredToParty" 
              v-model="formData.referredToParty"
            />
          </div>

          <div class="form-group">
            <label for="notes">ملاحظات</label>
            <textarea 
              id="notes" 
              v-model="formData.notes"
              rows="4"
            ></textarea>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button">حفظ</button>
            <button type="button" class="cancel-button" @click="closeModal">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExaminationCommittee',
  
  data() {
    return {
      showModal: false,
      formData: {
        reviewerId: '',
        bloodPressure: '',
        weight: '',
        oxygenSaturation: '',
        temperature: '',
        pulse: '',
        chronicDiseases: '',
        communicableDiseases: '',
        allergies: '',
        drugAllergies: '',
        skinDiseases: '',
        typeOfReferral: 0,
        referredToParty: '',
        medicalStaffId: '',
        staffSectionId: '',
        notes: ''
      },
      filters: {
        reviewerId: '',
        medicalStaffId: ''
      },
      reviewers: [],
      medicalStaff: [],
      diagnoses: [],
      loading: false,
      errorMessage: '',
      successMessage: ''
    }
  },

  methods: {
    async fetchReviewers() {
      try {
        this.loading = true;
        const response = await this.$axios.get('/Reviewer/GetAllReviewers', {
          params: {
            PageNumber: 1,
            PageSize: 100
          }
        });
        this.reviewers = response.data.items || [];
      } catch (error) {
        this.errorMessage = 'حدث خطأ أثناء جلب بيانات المراجعين';
      } finally {
        this.loading = false;
      }
    },

    async fetchMedicalStaff() {
      try {
        this.loading = true;
        const response = await this.$axios.get('/InitialExamination/GetAllDoctorsInSameTime', {
          params: {
            PageNumber: 1,
            PageSize: 100
          }
        });
        this.medicalStaff = response.data || [];
      } catch (error) {
        this.errorMessage = 'حدث خطأ أثناء جلب بيانات الكادر الطبي';
      } finally {
        this.loading = false;
      }
    },

    onDoctorChange() {
      const selectedDoctor = this.medicalStaff.find(staff => staff.id === this.formData.medicalStaffId);
      if (selectedDoctor) {
        this.formData.staffSectionId = selectedDoctor.staffSectionsId;
      }
    },

    closeModal() {
      this.showModal = false;
      this.resetForm();
    },

    async handleSubmit() {
      try {
        this.errorMessage = '';
        this.successMessage = '';

        await this.$axios.post('/InitialExamination/AddInitialExamination', this.formData);
        this.successMessage = 'تم حفظ بيانات الفحص بنجاح';
        this.closeModal();
        this.fetchDiagnoses();
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات';
      }
    },

    resetForm() {
      this.formData = {
        reviewerId: '',
        bloodPressure: '',
        weight: '',
        oxygenSaturation: '',
        temperature: '',
        pulse: '',
        chronicDiseases: '',
        communicableDiseases: '',
        allergies: '',
        drugAllergies: '',
        skinDiseases: '',
        typeOfReferral: 0,
        referredToParty: '',
        medicalStaffId: '',
        staffSectionId: '',
        notes: ''
      };
      this.errorMessage = '';
      this.successMessage = '';
    },

    onFilterChange() {
      // Implement filter logic here
    },

    async fetchDiagnoses() {
      try {
        this.loading = true;
        const response = await this.$axios.get('/InitialExamination/GetAllInitialExamination');
        this.diagnoses = response.data.items || [];
      } catch (error) {
        this.errorMessage = 'حدث خطأ أثناء جلب بيانات الفحوصات';
      } finally {
        this.loading = false;
      }
    },

    getReviewerName(reviewerId) {
      const reviewer = this.reviewers.find(r => r.id === reviewerId);
      return reviewer ? `${reviewer.firstName} ${reviewer.secondName} ${reviewer.thirdName} ${reviewer.surName}` : 'غير معروف';
    },


    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },

    viewDetails(diagnosis) {
      // Implement view details functionality
      console.log('Viewing details for diagnosis:', diagnosis);
    }
  },

  mounted() {
    this.fetchReviewers();
    this.fetchMedicalStaff();
    this.fetchDiagnoses();
  }
}
</script>

<style scoped>
.examination-committee {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

/* Filters */
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Form */
.examination-form {
  display: grid;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-group {
  flex: 1;
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #2c3e50;
}

select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 15px;
}

select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

input[readonly] {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
  min-height: 100px;
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

/* Examination Cards Styles */
.examination-cards {
  margin-bottom: 30px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  border: 1px solid #e0e0e0;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 15px;
  background-color: #3498db;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.card-header .date {
  font-size: 14px;
  opacity: 0.9;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.card-content {
  padding: 15px;
  background-color: #f8f9fa;
}

.info-row {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: #2c3e50;
  margin-left: 10px;
  min-width: 80px;
  border-right: 1px solid #e0e0e0;
  padding-right: 10px;
}

.value {
  color: #34495e;
  flex: 1;
  padding-right: 10px;
}

.card-actions {
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  background-color: white;
}

.view-btn {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.view-btn:hover {
  background-color: #2980b9;
}

.view-btn i {
  font-size: 16px;
}

/* Loading Skeleton */
.loading-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.skeleton-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.skeleton-header {
  height: 50px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-content {
  padding: 15px;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  margin-bottom: 10px;
  border-radius: 4px;
}

.skeleton-line:last-child {
  margin-bottom: 0;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .info-row {
    flex-direction: column;
    gap: 5px;
  }

  .label {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 5px;
    margin-left: 0;
  }

  .value {
    padding-right: 0;
  }
}

/* Add Examination Button */
.add-examination-button {
  margin-bottom: 20px;
  text-align: left;
}

.add-btn {
  padding: 12px 24px;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #34495e;
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
  max-width: 800px;
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

/* Form in Modal */
.examination-form {
  display: grid;
  gap: 20px;
}
</style> 