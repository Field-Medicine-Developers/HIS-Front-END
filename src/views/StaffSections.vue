<template>
  <div class="sections-management">
    <h1>إدارة أقسام الكادر الطبي</h1>
    
    <!-- Loading Indicator -->
    <div v-if="loading" class="skeleton-loading">
      <div class="skeleton-header">
        <div class="skeleton-title"></div>
        <div class="skeleton-button"></div>
      </div>
      <div class="skeleton-filters">
        <div class="skeleton-filter"></div>
      </div>
      <div class="skeleton-table">
        <div class="skeleton-row" v-for="n in 5" :key="n">
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
        </div>
      </div>
      <div class="skeleton-pagination">
        <div class="skeleton-page" v-for="n in 3" :key="n"></div>
      </div>
    </div>
    
    <!-- Add Section Button -->
    <div class="add-section-button">
      <button @click="showModal = true" class="add-btn"> <i class="pi pi-plus"></i> إضافة قسم جديد </button>
    </div>
    
    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.sectionName" 
          placeholder="البحث باسم القسم"
          @input="onFilterChange"
        />
      </div>
    </div>

    <!-- Sections Table -->
    <div class="table-container">
      <table class="sections-table">
        <thead>
          <tr>
            <th>اسم القسم</th>
            <th>المدخلات الخاصة</th>
            <th>تاريخ الإنشاء</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="section in sections" :key="section.id">
            <td>{{ section.sectionName }}</td>
            <td>
              <button @click="showInputsModal(section)" class="view-inputs-btn">
                عرض المدخلات ({{ section.privateSectionInputs?.length || 0 }})
              </button>
            </td>
            <td>{{ new Date(section.createdAt).toLocaleDateString() }}</td>
            <td>
              <button @click="editSection(section)" class="edit-btn">تعديل</button>
              <button @click="deleteSection(section.id)" class="delete-btn">حذف</button>
            </td>
          </tr>
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

    <!-- Modal Dialog -->
    <div v-if="showModal" class="modal-overlay" @click="resetForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingSection ? 'تعديل قسم' : 'إضافة قسم جديد' }}</h2>
          <button class="close-button" @click="resetForm">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="section-form">
          <div class="form-group">
            <label for="sectionName">اسم القسم *</label>
            <input 
              type="text" 
              id="sectionName" 
              v-model="formData.sectionName" 
              placeholder="اسم القسم"
              required
            />
          </div>

          <!-- Private Inputs Section -->
          <div class="private-inputs-section">
  <h3 class="section-title">المدخلات الخاصة بالقسم</h3>

  <div
    v-for="(input, index) in formData.privateSectionInputs"
    :key="index"
    class="input-group"
  >
    <div class="form-group">
      <label :for="'inputName' + index">اسم المدخل *</label>
      <input
        :id="'inputName' + index"
        type="text"
        v-model="input.inputName"
        placeholder="اسم المدخل"
        required
      />
    </div>

    <div class="form-group">
      <label :for="'inputType' + index">نوع المدخل *</label>
      <select
        :id="'inputType' + index"
        v-model="input.inputType"
        required
      >
        <option v-for="(label, type) in inputTypes" :key="type" :value="inputTypeValues[type]">
          {{ label }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label :for="'defaultValue' + index">القيمة الافتراضية</label>
      <input
        v-if="input.inputType !== 12"
        :id="'defaultValue' + index"
        type="text"
        v-model="input.defaultValue"
        placeholder="القيمة الافتراضية"
      />
      <textarea
        v-else
        :id="'defaultValue' + index"
        v-model="input.defaultValue"
        placeholder="القيمة الافتراضية"
        rows="3"
      ></textarea>
    </div>

    <div class="form-group" v-if="input.inputType === 6">
      <label :for="'options' + index">الخيارات (مفصولة بفاصلة)</label>
      <input
        :id="'options' + index"
        type="text"
        v-model="input.options"
        placeholder="الخيارات"
      />
    </div>

    <div class="form-group">
      <label class="checkbox-wrapper">
        <input type="checkbox" v-model="input.isRequired" />
        <span class="custom-check"></span>
        إلزامي
      </label>
    </div>

    <div class="form-group" v-if="input.inputType === 2">
      <div class="range-inputs">
        <div>
          <label :for="'minValue' + index">القيمة الدنيا</label>
          <input
            :id="'minValue' + index"
            type="number"
            v-model.number="input.minValue"
          />
        </div>
        <div>
          <label :for="'maxValue' + index">القيمة القصوى</label>
          <input
            :id="'maxValue' + index"
            type="number"
            v-model.number="input.maxValue"
          />
        </div>
      </div>
    </div>
  
   <button
        type="button"
        class="remove-btn"
        @click="removeInput(index)"
      >
        حذف المدخل
      </button>
    </div>
  
      <div class="form-actions mt-4">
      <button type="button" class="add-input-btn" @click="addNewInput">إضافة مدخل جديد</button>
      </div>
  </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button">{{ editingSection ? 'تحديث' : 'حفظ' }}</button>
            <button type="button" class="cancel-button" @click="resetForm">إلغاء</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Inputs Modal -->
    <div v-if="showInputsModalFlag" class="modal-overlay" @click="closeInputsModal">
      <div class="modal-content inputs-modal" @click.stop>
        <div class="modal-header">
          <h2>مدخلات قسم {{ selectedSection?.sectionName }}</h2>
          <button class="close-button" @click="closeInputsModal">&times;</button>
        </div>
        
        <div class="inputs-list-modal">
          <div v-for="(input, index) in selectedSection?.privateSectionInputs" :key="index" class="input-item-modal">
            <div class="input-header">
              <span class="input-name">{{ input.inputName }}</span>
              <span class="input-type">({{ getInputTypeLabel(input.inputType) }})</span>
              <span v-if="input.isRequired" class="required-badge">إلزامي</span>
            </div>
            
            <div class="input-details">
              <div v-if="input.defaultValue" class="input-detail">
                <span class="detail-label">القيمة الافتراضية:</span>
                <span class="detail-value">{{ input.defaultValue }}</span>
              </div>
              
              <div v-if="input.inputType === 6 && input.options" class="input-detail">
                <span class="detail-label">الخيارات:</span>
                <div class="options-list">
                  <span v-for="(option, optIndex) in input.options.split(',')" :key="optIndex" class="option-tag">
                    {{ option.trim() }}
                  </span>
                </div>
              </div>
              
              <div v-if="input.inputType === 2" class="input-detail">
                <div v-if="input.minValue !== null" class="range-value">
                  <span class="detail-label">الحد الأدنى:</span>
                  <span class="detail-value">{{ input.minValue }}</span>
                </div>
                <div v-if="input.maxValue !== null" class="range-value">
                  <span class="detail-label">الحد الأقصى:</span>
                  <span class="detail-value">{{ input.maxValue }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="!selectedSection?.privateSectionInputs?.length" class="no-inputs-modal">
            لا توجد مدخلات خاصة لهذا القسم
          </div>
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
          <p class="delete-message">هل أنت متأكد من حذف القسم "{{ sectionToDelete?.sectionName }}"؟</p>
          <p class="delete-warning">هذا الإجراء لا يمكن التراجع عنه</p>
          
          <div class="delete-actions">
            <button @click="confirmDelete" class="confirm-delete-btn">حذف</button>
            <button @click="closeDeleteModal" class="cancel-delete-btn">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StaffSections',
  data() {
    return {
      formData: {
        sectionName: '',
        privateSectionInputs: []
      },
      errorMessage: '',
      successMessage: '',
      sections: [],
      loading: false,
      totalRecords: 0,
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 0
      },
      filters: {
        sectionName: ''
      },
      editingSection: null,
      showModal: false,
      inputTypes: {
        text: 'نص',
        number: 'رقم',
        select: 'قائمة منسدلة',
        date: 'تاريخ',
        textarea: 'نص طويل'
      },
      inputTypeValues: {
        text: 1,
        number: 2,
        select: 6,
        date: 3,
        textarea: 12
      },
      inputTypeLabels: {
        1: 'نص',
        2: 'رقم',
        3: 'تاريخ',
        6: 'قائمة منسدلة',
        12: 'نص طويل'
      },
      showInputsModalFlag: false,
      selectedSection: null,
      showDeleteModal: false,
      sectionToDelete: null
    }
  },
  created() {
    this.fetchSections()
  },
  methods: {
    async fetchSections() {
      try {
        this.loading = true
        const params = {
          PageNumber: this.pagination.page,
          PageSize: this.pagination.pageSize,
          SectionName: this.filters.sectionName || undefined
        }

        const response = await this.$axios.get('/StaffSections/GetAllStaffSections', { 
          params,
          validateStatus: function (status) {
            return status >= 200 && status < 500
          }
        })

        if (response.status === 200) {
          this.sections = response.data.items || []
          this.totalRecords = response.data.totalCount || 0
          this.pagination.totalPages = response.data.totalPages || 0
        } else {
          this.errorMessage = 'حدث خطأ أثناء جلب بيانات الأقسام'
        }
      } catch (error) {
        console.error('Error in fetchSections:', error)
        if (error.code === 'ERR_NETWORK') {
          this.errorMessage = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت'
        } else if (error.response) {
          this.errorMessage = error.response.data?.message || 'حدث خطأ أثناء جلب بيانات الأقسام'
        } else {
          this.errorMessage = 'حدث خطأ غير متوقع'
        }
      } finally {
        this.loading = false
      }
    },
    async handleSubmit() {
      try {
        this.errorMessage = '';
        this.successMessage = '';

        if (!this.formData.sectionName) {
          this.errorMessage = 'اسم القسم مطلوب';
          return;
        }

        if (this.editingSection) {
          await this.$axios.put(`/StaffSections/UbdateStaffSection/${this.editingSection.id}`, this.formData);
          this.successMessage = 'تم تحديث القسم بنجاح';
        } else {
          await this.$axios.post('/StaffSections/AddStaffSection', this.formData);
          this.successMessage = 'تم إنشاء القسم بنجاح';
        }

        this.resetForm();
        this.fetchSections();
      } catch (error) {
        console.error('Error in handleSubmit:', error)
        if (error.response) {
          if (error.response.status === 401) {
            this.errorMessage = 'غير مصرح لك بتنفيذ هذه العملية. يرجى تسجيل الدخول مرة أخرى'
          } else {
            this.errorMessage = error.response.data?.message || 'حدث خطأ أثناء حفظ القسم'
          }
        } else {
          this.errorMessage = 'حدث خطأ غير متوقع'
        }
      }
    },
    async deleteSection(sectionId) {
      const section = this.sections.find(s => s.id === sectionId);
      if (section) {
        this.sectionToDelete = section;
        this.showDeleteModal = true;
      }
    },
    async confirmDelete() {
      if (!this.sectionToDelete) return;
      
      try {
        await this.$axios.delete(`/StaffSections/DeleteStaffSection${this.sectionToDelete.id}`);
        this.successMessage = 'تم حذف القسم بنجاح';
        this.fetchSections();
        this.closeDeleteModal();
      } catch (error) {
        console.error('Error in deleteSection:', error)
        if (error.response) {
          if (error.response.status === 401) {
            this.errorMessage = 'غير مصرح لك بتنفيذ هذه العملية. يرجى تسجيل الدخول مرة أخرى'
          } else {
            this.errorMessage = error.response.data?.message || 'حدث خطأ أثناء حذف القسم'
          }
        } else {
          this.errorMessage = 'حدث خطأ غير متوقع'
        }
      }
    },
    closeDeleteModal() {
      this.sectionToDelete = null;
      this.showDeleteModal = false;
    },
    async editSection(section) {
      try {
        this.loading = true;
        const response = await this.$axios.get(`/StaffSections/GetStaffSectionById${section.id}`);
        console.log('Response from GetStaffSectionById:', response.data);
        if (response.status === 200) {
          this.editingSection = response.data;
          this.formData = {
            sectionName: response.data.data.sectionName,
            privateSectionInputs: response.data.data.privateSectionInputs || []
          };
          this.showModal = true;
        } else {
          this.errorMessage = 'حدث خطأ أثناء جلب بيانات القسم';
        }
      } catch (error) {
        console.error('Error in editSection:', error);
        if (error.response) {
          if (error.response.status === 401) {
            this.errorMessage = 'غير مصرح لك بتنفيذ هذه العملية. يرجى تسجيل الدخول مرة أخرى';
          } else {
            this.errorMessage = error.response.data?.message || 'حدث خطأ أثناء جلب بيانات القسم';
          }
        } else {
          this.errorMessage = 'حدث خطأ غير متوقع';
        }
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.editingSection = null;
      this.formData = {
        sectionName: '',
        privateSectionInputs: []
      };
      this.showModal = false;
    },
    onPageChange(page) {
      this.pagination.page = page;
      this.fetchSections();
    },
    onFilterChange() {
      this.pagination.page = 1;
      this.fetchSections();
    },
    addNewInput() {
      this.formData.privateSectionInputs.push({
        inputName: '',
        inputType: 1, // Default to text
        defaultValue: '',
        options: '',
        isRequired: false,
        minValue: 0,
        maxValue: 0
      });
    },
    removeInput(index) {
      this.formData.privateSectionInputs.splice(index, 1);
    },
    getInputTypeLabel(type) {
      return this.inputTypeLabels[type] || type;
    },
    showInputsModal(section) {
      this.selectedSection = section;
      this.showInputsModalFlag = true;
    },
    closeInputsModal() {
      this.selectedSection = null;
      this.showInputsModalFlag = false;
    }
  }
}
</script>

<style scoped>
.sections-management {
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

.sections-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.sections-table th,
.sections-table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #ddd;
}

.sections-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.sections-table tr:hover {
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
.section-form {
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

/* Private Inputs Section */
.private-inputs-section {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.input-group {
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 4px;
  position: relative;
}

.range-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
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

.edit-btn,
.delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 5px;
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.add-input-btn,
.remove-input-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.add-input-btn {
  background-color: #27ae60;
  color: white;
}

.remove-input-btn {
  background-color: #e74c3c;
  color: white;
  position: absolute;
  top: 10px;
  left: 10px;
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
  max-width: 800px;
  max-height: 90vh;
  animation: fadeInUp 0.4s ease-in-out;
  overflow-y: auto;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
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
  margin-bottom: 20px;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.add-section-button {
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

/* Skeleton Loading Styles */
.skeleton-loading {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.skeleton-title {
  width: 300px;
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-button {
  width: 150px;
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-filters {
  margin-bottom: 20px;
}

.skeleton-filter {
  width: 100%;
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-table {
  margin-bottom: 20px;
}

.skeleton-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.skeleton-cell {
  flex: 1;
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-pagination {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.skeleton-page {
  width: 40px;
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Inputs List Styles */
.inputs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.input-name {
  font-weight: 500;
  color: #2c3e50;
}

.input-type {
  color: #666;
  font-size: 0.9em;
}

.required-badge {
  background-color: #e74c3c;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8em;
}

.no-inputs {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 8px;
}

/* Table Adjustments */
.sections-table td {
  vertical-align: top;
}

.sections-table .inputs-list {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 5px;
}

/* Scrollbar Styling */
.sections-table .inputs-list::-webkit-scrollbar {
  width: 6px;
}

.sections-table .inputs-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.sections-table .inputs-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.sections-table .inputs-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* View Inputs Button */
.view-inputs-btn {
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-inputs-btn:hover {
  background-color: #2980b9;
}

/* Inputs Modal Styles */
.inputs-modal {
  max-width: 600px;
}

.inputs-list-modal {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
}

.input-item-modal {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.input-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.input-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-detail {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.detail-label {
  color: #666;
  font-weight: 500;
  min-width: 120px;
}

.detail-value {
  color: #2c3e50;
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.option-tag {
  background-color: #e8f4f8;
  color: #2c3e50;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.range-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.no-inputs-modal {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

/* Scrollbar Styling for Modal */
.inputs-list-modal::-webkit-scrollbar {
  width: 6px;
}

.inputs-list-modal::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.inputs-list-modal::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.inputs-list-modal::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Textarea Styles */
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
  resize: vertical;
  min-height: 100px;
}

textarea:focus {
  outline: none;
  border-color: #2c3e50;
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



.private-inputs-section {
  border: 1px solid #ddd;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 25px;
  background-color: #fafafa;
}

.input-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  position: relative;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
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

/* Checkbox */
.checkbox-container {
  display: flex;
  justify-content: flex-start;
  gap: 25px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.checkbox-wrapper {
  position: relative;
  padding-left: 28px;
  font-size: 14px;
  color: #2c3e50;
  cursor: pointer;
  user-select: none;
}

.checkbox-wrapper input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkbox-wrapper .custom-check {
  position: absolute;
  left: 250px;
  top: 2px;
  height: 18px;
  width: 18px;
  background-color: #eee;
  border-radius: 4px;
  transition: all 0.3s ease;
  border: 1px solid #bbb;
}

.checkbox-wrapper input:checked ~ .custom-check {
  background-color: #2c3e50;
  border-color: #2c3e50;
}

.checkbox-wrapper .custom-check:after {
  content: "";
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-wrapper input:checked ~ .custom-check:after {
  display: block;
}



.remove-btn {
  justify-self: start;
  align-self: end;
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
  position: absolute;
  bottom: 25px;
  left: 15px;

}

.remove-btn:hover {
  background-color: #c0392b;
}

.add-hour-btn,
.add-input-btn {
  margin-top: 10px;
  background-color: #2c3e50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-hour-btn:hover,
.add-input-btn:hover {
  background-color: #2c3e50e2;
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
  color: #e74c3c; /* أحمر عند التحويم */
}


</style> 