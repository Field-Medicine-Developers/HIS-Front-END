<template>
  <div class="medical-committees">
    <div class="page-header">
      <h1>إدارة اللجان الطبية</h1>
      
      <!-- Add Committee Button -->
      <div class="add-committee-button">
        <button @click="showModal = true" class="add-btn ml-1">
          <i class="pi pi-plus"></i> إضافة لجنة طبية جديدة
        </button>
        <button @click="showTypeModal = true" class="add-btn type-btn">
          <i class="pi pi-plus"></i> إضافة نوع لجنة جديد
        </button>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.committeeName" 
          placeholder="البحث باسم اللجنة"
          @input="onFilterChange"
        />
      </div>
      <div class="filter-group">
        <select v-model="filters.committeeType" @change="onFilterChange">
          <option value="">كل الأنواع</option>
          <option v-for="type in committeeTypes" 
            :key="type.id" 
            :value="type.id"
          >
            {{ type.committeeTypeName }}
          </option>
        </select>
      </div>
    </div>

    <!-- Committees Table -->
    <div class="table-container">
      <table class="committees-table">
        <thead>
          <tr>
            <th>اسم اللجنة</th>
            <th>نوع اللجنة</th>
            <th>عدد الأعضاء</th>
            <th>تاريخ الإنشاء</th>
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
            </tr>
          </template>
          <template v-else>
            <tr v-for="committee in committees" :key="committee.id">
              <td>{{ committee.committeeName }}</td>
              <td>{{ getCommitteeTypeName(committee.committeeTypeId) }}</td>
              <td>{{ committee.committeeMembersIds?.length || 0 }}</td>
              <td>{{ new Date(committee.createdAt).toLocaleDateString() }}</td>
              <td class="actions-cell">
                <button @click="showMembers(committee)" class="action-btn view-btn">
                  <i class="pi pi-users"></i>
                </button>
                <button @click="editCommittee(committee)" class="action-btn edit-btn">
                  <i class="pi pi-pencil"></i>
                </button>
                <button @click="confirmDelete(committee)" class="action-btn delete-btn">
                  <i class="pi pi-trash"></i>
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

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="resetForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingCommittee ? 'تعديل لجنة' : 'إضافة لجنة جديدة' }}</h2>
          <button class="close-button" @click="resetForm">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="committee-form">
          <div class="form-group">
            <label for="committeeName">اسم اللجنة *</label>
            <input 
              type="text" 
              id="committeeName" 
              v-model="formData.committeeName" 
              required
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="committeeTypeId">نوع اللجنة *</label>
            <select 
              id="committeeTypeId" 
              v-model="formData.committeeTypeId"
              required
              class="form-control"
            >
              <option v-for="type in committeeTypes" 
                :key="type.id" 
                :value="type.id"
              >
                {{ type.committeeTypeName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>أعضاء اللجنة *</label>
            <select 
              v-model="formData.committeeMembersIds" 
              multiple 
              required
              class="form-control members-select"
              size="5"
            >
              <option v-for="member in medicalStaff" 
                :key="member.id" 
                :value="member.id"
              >
                {{ member.user.firstName }} {{ member.user.secondName }} {{ member.user.thirdName }}
              </option>
            </select>
            <small class="help-text">اضغط Ctrl (أو Command في Mac) لاختيار أكثر من عضو</small>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button" :disabled="loading">
              <i class="pi" :class="loading ? 'pi-spin pi-spinner' : 'pi-save'"></i>
              {{ editingCommittee ? 'تحديث' : 'حفظ' }}
            </button>
            <button type="button" class="cancel-button" @click="resetForm">
              <i class="pi pi-times"></i>
              إلغاء
            </button>
          </div>
        </form>
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
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <p class="delete-message">هل أنت متأكد من حذف اللجنة "{{ committeeToDelete?.committeeName }}"؟</p>
          <p class="delete-warning">هذا الإجراء لا يمكن التراجع عنه</p>
          
          <div class="delete-actions">
            <button @click="deleteCommittee" class="confirm-delete-btn">حذف</button>
            <button @click="closeDeleteModal" class="cancel-delete-btn">إلغاء</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Committee Type Modal -->
    <div v-if="showTypeModal" class="modal-overlay" @click="closeTypeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>إضافة نوع لجنة جديد</h2>
          <button class="close-button" @click="closeTypeModal">&times;</button>
        </div>
        
        <form @submit.prevent="handleTypeSubmit" class="committee-form">
          <div class="form-group">
            <label for="committeeTypeName">اسم نوع اللجنة *</label>
            <input 
              type="text" 
              id="committeeTypeName" 
              v-model="typeFormData.committeeTypeName" 
              required
              class="form-control"
            />
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button" :disabled="loading">
              <i class="pi" :class="loading ? 'pi-spin pi-spinner' : 'pi-save'"></i>
              حفظ
            </button>
            <button type="button" class="cancel-button" @click="closeTypeModal">
              <i class="pi pi-times"></i>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Members Modal -->
    <div v-if="showMembersModal" class="modal-overlay" @click="closeMembersModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>أعضاء اللجنة: {{ selectedCommittee?.committeeName }}</h2>
          <button class="close-button" @click="closeMembersModal">&times;</button>
        </div>
        
        <div class="members-list">
          <div v-if="committeeMembers.length === 0" class="no-members">
            لا يوجد أعضاء في هذه اللجنة
          </div>
          <div v-else class="members-grid">
            <div v-for="member in committeeMembers" :key="member.medicalStaffId" class="member-card">
              <div class="member-info">
                <i class="pi pi-user"></i>
                <span>{{ member.medicalStaff?.user.firstName }} {{ member.medicalStaff?.user.secondName }} {{ member.medicalStaff?.user.thirdName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MedicalCommittees',
  
  data() {
    return {
      committees: [],
      medicalStaff: [],
      committeeTypes: [],
      loading: false,
      showModal: false,
      showTypeModal: false,
      showDeleteModal: false,
      editingCommittee: null,
      committeeToDelete: null,
      errorMessage: '',
      successMessage: '',
      TotalMembers: 0,
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 1
      },
      filters: {
        committeeName: '',
        committeeType: ''
      },
      formData: {
        committeeName: '',
        committeeTypeId: '',
        committeeMembersIds: []
      },
      typeFormData: {
        committeeTypeName: ''
      },
      showMembersModal: false,
      selectedCommittee: null,
      committeeMembers: [],
      loadingMembers: false,
    }
  },

  methods: {
    async fetchCommittees() {
      try {
        this.loading = true
        this.errorMessage = ''
        this.successMessage = ''

        const params = {
          PageNumber: this.pagination.page,
          PageSize: this.pagination.pageSize,
          ...this.filters
        }

        const response = await this.$axios.get("/Committee/GetAllCommittees", { params })
        this.committees = response.data.items
        this.TotalMembers = response.data.totalCount
        this.pagination.totalPages = Math.ceil(response.data.totalCount / this.pagination.pageSize)
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء جلب بيانات اللجان'
      } finally {
        this.loading = false
      }
    },

    async fetchMedicalStaff() {
      try {
        const response = await this.$axios.get("/MedicalStaff/GetAllMedicalStaff")
        this.medicalStaff = response.data.items
        console.log(this.medicalStaff)
      } catch (error) {
        this.errorMessage = 'فشل في جلب بيانات الكادر الطبي'
      }
    },

    async fetchCommitteeTypes() {
      try {
        const response = await this.$axios.get('/CommitteeType/GetAllCommitteeTypes')
        this.committeeTypes = response.data.items
      } catch (error) {
        this.errorMessage = 'فشل في جلب بيانات أنواع اللجان'
      }
    },

    async handleSubmit() {
      try {
        this.errorMessage = ''
        this.successMessage = ''

        if (this.editingCommittee) {
          await this.$axios.put(`/Committee/UpdateCommittee/${this.editingCommittee.id}`, this.formData)
          this.successMessage = 'تم تحديث اللجنة بنجاح'
        } else {
          await this.$axios.post('/Committee/AddCommittee', this.formData)
          this.successMessage = 'تم إضافة اللجنة بنجاح'
        }

        this.resetForm()
        this.fetchCommittees()
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات'
      }
    },

    editCommittee(committee) {
      this.editingCommittee = committee
      this.formData = {
        committeeName: committee.committeeName,
        committeeTypeId: committee.committeeTypeId,
        committeeMembersIds: committee.committeeMembersIds
      }
      this.showModal = true
    },

    confirmDelete(committee) {
      this.committeeToDelete = committee
      this.showDeleteModal = true
    },

    async deleteCommittee() {
      try {
        this.errorMessage = ''
        this.successMessage = ''

        await this.$axios.delete(`/Committee/DeleteCommittee/${this.committeeToDelete.id}`)
        this.successMessage = 'تم حذف اللجنة بنجاح'
        this.showDeleteModal = false
        this.fetchCommittees()
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حذف اللجنة'
      }
    },

    resetForm() {
      this.editingCommittee = null
      this.formData = {
        committeeName: '',
        committeeTypeId: '',
        committeeMembersIds: []
      }
      this.showModal = false
      this.errorMessage = ''
      this.successMessage = ''
    },

    onPageChange(page) {
      this.pagination.page = page
      this.fetchCommittees()
    },

    onFilterChange() {
      this.pagination.page = 1
      this.fetchCommittees()
    },

    closeDeleteModal() {
      this.showDeleteModal = false
      this.committeeToDelete = null
    },

    async handleTypeSubmit() {
      try {
        this.errorMessage = ''
        this.successMessage = ''

        await this.$axios.post('/CommitteeType/AddCommitteeType', this.typeFormData)
        this.successMessage = 'تم إضافة نوع اللجنة بنجاح'
        this.closeTypeModal()
        this.fetchCommittees()
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات'
      }
    },

    closeTypeModal() {
      this.showTypeModal = false
      this.typeFormData = {
        committeeTypeName: ''
      }
      this.errorMessage = ''
      this.successMessage = ''
    },

    getCommitteeTypeName(typeId) {
      const type = this.committeeTypes.find(t => t.id === typeId)
      return type ? type.committeeTypeName : ''
    },

    async showMembers(committee) {
      this.selectedCommittee = committee;
      this.showMembersModal = true;
      this.loadingMembers = false;
      this.committeeMembers = committee.committeeMembers || [];
    },

    closeMembersModal() {
      this.showMembersModal = false;
      this.selectedCommittee = null;
      this.committeeMembers = [];
    },
  },

  mounted() {
    this.fetchCommittees()
    this.fetchMedicalStaff()
    this.fetchCommitteeTypes()
  }
}
</script>

<style scoped>
.medical-committees {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
}

h1,
h2,
h3 {
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

.committees-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.committees-table th,
.committees-table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #ddd;
}

.committees-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.committees-table tr:hover {
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
.committee-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

input,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus,
select:focus {
  outline: none;
  border-color: #2c3e50;
}

/* Buttons */
.form-actions {
  grid-column: 1 / -1;
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

.view-btn,
.edit-btn,
.delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 5px;
}

.view-btn {
  background-color: #3498db;
  color: white;
}

.view-btn:hover {
  background-color: #2980b9;
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
  grid-column: 1 / -1;
}

.success-message {
  color: #27ae60;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 4px;
  grid-column: 1 / -1;
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

.add-committee-button {
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
}

.add-btn:hover {
  background-color: #34495e;
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: #2c3e50;
  font-size: 18px;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .medical-committees {
    padding: 10px;
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

  .modal-content {
    width: 95%;
    padding: 20px;
  }
}

/* Members Display */
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.member-card {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.member-card:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.member-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.member-info i {
  color: #2c3e50;
  font-size: 1.2em;
}

.no-members {
  text-align: center;
  color: #666;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
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
</style> 