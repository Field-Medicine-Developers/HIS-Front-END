<template>
  <div class="reviewers">
    <div class="page-header">
    <h1>إدارة المراجعين</h1>
    </div>
    <!-- Add Reviewer Button -->
    <div class="add-reviewer-button">
      <button @click="showModal = true" class="add-btn">
        <i class="pi pi-user-plus"></i>إضافة مراجع جديد
      </button>
    </div>
    
    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.fullName" 
          placeholder="البحث بالاسم"
          @input="onFilterChange"
        />
      </div>
      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.phoneNumber" 
          placeholder="البحث برقم الهاتف"
          @input="onFilterChange"
        />
      </div>
      <div class="filter-group">
        <input 
          type="text" 
          v-model="filters.bookNumber" 
          placeholder="البحث برقم الكتاب"
          @input="onFilterChange"
        />
      </div>
      <div class="filter-group">
        <select v-model="filters.reviewerType" @change="onFilterChange">
          <option disabled value="">البحث عن الحالة</option>
          <option value="">كل الأنواع</option>
          <option v-for="type in reviewerTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Reviewers Table -->
    <div class="table-container">
      <table class="reviewers-table">
        <thead>
          <tr>
            <th>الاسم الأول</th>
            <th>الاسم الثاني</th>
            <th>الاسم الثالث</th>
            <th>اللقب</th>
            <th>رقم الهاتف</th>
            <th>نوع المراجع</th>
            <th>رقم الكتاب</th>
            <th>تاريخ الكتاب</th>
            <th>الحالة</th>
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
              <td><div class="skeleton-cell"></div></td>
              <td><div class="skeleton-cell"></div></td>
              <td><div class="skeleton-cell"></div></td>
              <td><div class="skeleton-cell"></div></td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="reviewer in reviewers" :key="reviewer.id">
              <td>{{ reviewer.firstName }}</td>
              <td>{{ reviewer.secondName }}</td>
              <td>{{ reviewer.thirdName }}</td>
              <td>{{ reviewer.surName }}</td>
              <td>{{ reviewer.phoneNumber }}</td>
              <td>{{ getReviewerTypeLabel(reviewer.reviewerType) }}</td>
              <td>{{ reviewer.bookNumber }}</td>
              <td>{{ reviewer.bookDate?.split('T')[0] }}</td>
              <td>
                <span >
                  {{ getStatusText(reviewer.reviewerType) }}
                </span>
              </td>
              <td>
               <div style="display: flex; gap: 8px;">
                 <button @click="editReviewer(reviewer)" class="edit-btn">
                   <i class="pi pi-pencil"></i> تعديل
                 </button>
                 <button @click="confirmDelete(reviewer)" class="delete-btn">
                   <i class="pi pi-trash"></i> حذف
                 </button>
                 <button @click="viewHistory(reviewer)" class="history-btn">
                   <i class="pi pi-history"></i> السجل
                 </button>
               </div>
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
          <h2>{{ editingReviewer ? 'تعديل مراجع' : 'إضافة مراجع جديد' }}</h2>
          <button class="close-button" @click="resetForm">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="reviewer-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">الاسم الأول *</label>
              <input 
                type="text" 
                id="firstName" 
                v-model="formData.firstName" 
                required
              />
            </div>
            <div class="form-group">
              <label for="secondName">الاسم الثاني *</label>
              <input 
                type="text" 
                id="secondName" 
                v-model="formData.secondName" 
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="thirdName">الاسم الثالث *</label>
              <input 
                type="text" 
                id="thirdName" 
                v-model="formData.thirdName" 
                required
              />
            </div>
            <div class="form-group">
              <label for="fourthName">الاسم الرابع</label>
              <input 
                type="text" 
                id="fourthName" 
                v-model="formData.fourthName"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="surName">اللقب *</label>
              <input 
                type="text" 
                id="surName" 
                v-model="formData.surName" 
                required
              />
            </div>
            <div class="form-group">
              <label for="motherFullName">اسم الأم الكامل *</label>
              <input 
                type="text" 
                id="motherFullName" 
                v-model="formData.motherFullName" 
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phoneNumber">رقم الهاتف *</label>
              <input 
                type="text" 
                id="phoneNumber" 
                v-model="formData.phoneNumber" 
                required
              />
            </div>
            <div class="form-group">
              <label for="birthDate">تاريخ الميلاد *</label>
              <input 
                type="date" 
                id="birthDate" 
                v-model="formData.birthDate" 
                required
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="gender">الجنس *</label>
              <select 
                id="gender" 
                v-model="formData.gender" 
                required
              >
                <option v-for="gender in genders" :key="gender.value" :value="gender.value">
                  {{ gender.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="reviewerType">نوع المراجع *</label>
              <select 
                id="reviewerType" 
                v-model="formData.reviewerType" 
                required
              >
                <option v-for="type in reviewerTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="bookNumber">رقم الكتاب الوارد</label>
              <input 
                type="text" 
                id="bookNumber" 
                v-model="formData.bookNumber"
              />
            </div>
            <div class="form-group">
              <label for="bookDate">تاريخ الكتاب الوارد</label>
              <input 
                type="date" 
                id="bookDate" 
                v-model="formData.bookDate"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="address">العنوان</label>
            <input 
              type="text" 
              id="address" 
              v-model="formData.address"
            />
          </div>

          <div class="checkbox-container">
             <label class="checkbox-wrapper">
               <input type="checkbox" v-model="formData.exceptionalCase" />
               <span class="custom-check"></span>
               حالة استثنائية
             </label>
           
             <label class="checkbox-wrapper">
               <input type="checkbox" v-model="formData.isPaid" />
               <span class="custom-check"></span>
               مدفوع
             </label>
           </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button">{{ editingReviewer ? 'تحديث' : 'حفظ' }}</button>
            <button type="button" class="cancel-button" @click="resetForm">إلغاء</button>
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
          <p class="delete-message">هل أنت متأكد من حذف المراجع "{{ reviewerToDelete?.fullName }}"؟</p>
          <p class="delete-warning">هذا الإجراء لا يمكن التراجع عنه</p>
          
          <div class="delete-actions">
            <button @click="deleteReviewer" class="confirm-delete-btn">حذف</button>
            <button @click="closeDeleteModal" class="cancel-delete-btn">إلغاء</button>
          </div>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistoryModal" class="modal-overlay" @click="closeHistoryModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>سجل المراجع</h2>
          <button class="close-button" @click="closeHistoryModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <table class="details-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>التشخيص</th>
                <th>الطبيب</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in reviewerHistory" :key="index">
                <td>{{ record.date }}</td>
                <td>{{ record.diagnosis }}</td>
                <td>{{ record.doctor }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Reviewers',
  
  data() {
    return {
      reviewers: [],
      reviewerHistory: [],
      loading: false,
      historyLoading: false,
      showModal: false,
      showDeleteModal: false,
      showHistoryModal: false,
      editingReviewer: null,
      reviewerToDelete: null,
      errorMessage: '',
      successMessage: '',
      totalRecords: 0,
      pagination: {
        page: 1,
        pageSize: 10
      },
      filters: {
        fullName: '',
        phoneNumber: '',
        bookNumber: '',
        reviewerType: null,
        bookDate: null
      },
      formData: {
        firstName: '',
        secondName: '',
        thirdName: '',
        fourthName: '',
        surName: '',
        motherFullName: '',
        phoneNumber: '',
        address: '',
        birthDate: null,
        gender: null,
        bookNumber: '',
        bookDate: null,
        reviewerType: null,
        exceptionalCase: false,
        isPaid: false
      }
    }
  },

  computed: {
    genders() {
      return [
        { label: 'ذكر', value: 1 },
        { label: 'أنثى', value: 2 }
      ]
    },

    reviewerTypes() {
      return [
        { label: 'منتسب', value: 1 },
        { label: 'عائلة منتسب', value: 2 },
        { label: 'جريح', value: 3 },
        { label: 'عائلة جريح', value: 4 },
        { label: 'عوائل شهداء', value: 5 },
        { label: 'مريض', value: 6 },
        { label: 'فئات عامة', value: 7 },
        { label: 'أخرى', value: 8 }
      ]
    }
  },

  methods: {
    getReviewerTypeLabel(type) {
      const typeMap = {
        1: 'منتسب',
        2: 'عائلة منتسب',
        3: 'جريح',
        4: 'عائلة جريح',
        5: 'عوائل شهداء',
        6: 'مريض',
        7: 'فئات عامة',
        8: 'أخرى'
      };
      return typeMap[type] || '';
    },

    getStatusClass(type) {
      const classMap = {
        1: 'status-badge status-blue',
        2: 'status-badge status-green',
        3: 'status-badge status-orange',
        4: 'status-badge status-pink',
        5: 'status-badge status-purple',
        6: 'status-badge status-light-blue',
        7: 'status-badge status-light-green',
        8: 'status-badge status-gray'
      };
      return classMap[type] || 'status-badge';
    },

    async fetchReviewers() {
      try {
        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const params = {
          PageNumber: this.pagination.page,
          PageSize: this.pagination.pageSize,
          ...this.filters
        }

        const response = await this.$axios.get('/Reviewer/GetAllReviewers', { params });
        this.reviewers = response.data.items;
        this.totalRecords = response.data.totalCount;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء جلب بيانات المراجعين';
      } finally {
        this.loading = false;
      }
    },

    async handleSubmit() {
      try {
        this.errorMessage = '';
        this.successMessage = '';

        if (this.editingReviewer) {
          await this.$axios.put(`/Reviewer/UpdateReviewer/${this.editingReviewer.id}`, this.formData);
          this.successMessage = 'تم تحديث بيانات المراجع بنجاح';
        } else {
          await this.$axios.post('/Reviewer/AddReviewer', this.formData);
          this.successMessage = 'تم إضافة المراجع بنجاح';
        }

        this.resetForm();
        this.fetchReviewers();
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ البيانات';
      }
    },

    editReviewer(reviewer) {
      this.editingReviewer = reviewer;
      this.formData = {
       ...reviewer,
       birthDate: reviewer.birthDate ? reviewer.birthDate.split('T')[0] : null,
       bookDate: reviewer.bookDate ? reviewer.bookDate.split('T')[0] : null,
        };      this.showModal = true;
    },

    confirmDelete(reviewer) {
      this.reviewerToDelete = reviewer;
      this.showDeleteModal = true;
    },

    async deleteReviewer() {
      try {
        this.errorMessage = '';
        this.successMessage = '';

        await this.$axios.delete(`/Reviewer/DeleteReviewer/${this.reviewerToDelete.id}`);
        this.successMessage = 'تم حذف المراجع بنجاح';
        this.showDeleteModal = false;
        this.fetchReviewers();
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حذف المراجع';
      }
    },

    async viewHistory(reviewer) {
      try {
        this.historyLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const response = await this.$axios.get('/Reviewer/ReviewerHistory', {
          params: { reviewerId: reviewer.id }
        });
        this.reviewerHistory = response.data.data;
        this.showHistoryModal = true;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء جلب سجل المراجع';
      } finally {
        this.historyLoading = false;
      }
    },

    resetForm() {
      this.formData = {
        firstName: '',
        secondName: '',
        thirdName: '',
        fourthName: '',
        surName: '',
        motherFullName: '',
        phoneNumber: '',
        address: '',
        birthDate: null,
        gender: null,
        bookNumber: '',
        bookDate: null,
        reviewerType: null,
        exceptionalCase: false,
        isPaid: false
      };
      this.editingReviewer = null;
      this.showModal = false;
      this.errorMessage = '';
      this.successMessage = '';
    },

    onPageChange(page) {
      this.pagination.page = page;
      this.fetchReviewers();
    },

    onFilterChange() {
      this.pagination.page = 1;
      this.fetchReviewers();
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.reviewerToDelete = null;
    },

    closeHistoryModal() {
      this.showHistoryModal = false;
      this.reviewerHistory = [];
    },

    getStatusText(type) {
      const statusMap = {
        1: 'منتسب',
        2: 'عائلة منتسب',
        3: 'جريح',
        4: 'عائلة جريح',
        5: 'عوائل شهداء',
        6: 'مريض',
        7: 'فئات عامة',
        8: 'أخرى'
      };
      return statusMap[type] || '';
    }
  },

  mounted() {
    this.fetchReviewers();
  }
}
</script>

<style scoped>
.reviewers {
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
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;
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

.reviewers-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.reviewers-table th,
.reviewers-table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #ddd;
}

.reviewers-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.reviewers-table tr:hover {
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
.reviewer-form {
  display: grid;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
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

input, select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 15px;
  transition: all 0.3s ease;
  background-color: #fdfdfd;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

input:focus, select:focus {
  border-color: #32817d;
  box-shadow: 0 0 0 4px rgba(50, 129, 125, 0.15);
  outline: none;
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
.delete-btn,
.history-btn {
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

.history-btn {
  background-color: #2ecc71;
  color: white;
}

.history-btn:hover {
  background-color: #27ae60;
}

/* Messages */
.error-message,
.success-message {
  padding: 12px;
  border-radius: 6px;
  margin-top: 10px;
  font-size: 14px;
  font-weight: 500;
}

.error-message {
  background-color: #fdecea;
  color: #e74c3c;
  border: 1px solid #f5c6cb;
}

.success-message {
  background-color: #e6f4ea;
  color: #2ecc71;
  border: 1px solid #b2dfdb;
}

/* Modal */
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
  background: #ffffff;
  padding: 40px;
  border-radius: 16px;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.03),
    0 30px 80px rgba(0, 0, 0, 0.2);
  width: 95%;
  max-width: 850px;
  max-height: 90vh;
  overflow-y: auto;
  animation: fadeInUp 0.4s ease-in-out;
  position: relative;
  border: 1px solid #e0e0e0;
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
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

/* Add button */
.add-reviewer-button {
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

.add-btn:hover {
  background-color: #34495e;
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
  left: 0;
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

/* Skeleton */
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

/* Details Table */
.details-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.details-table th,
.details-table td {
  padding: 10px;
  text-align: right;
  border: 1px solid #ddd;
}

.details-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.details-table tr:hover {
  background-color: #f8f9fa;
}

/* Responsive */
@media (max-width: 768px) {
  .reviewers {
    padding: 10px;
  }

  .filters {
    flex-direction: column;
  }

  .form-row {
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

  .edit-btn,
  .delete-btn,
  .history-btn {
    margin: 2px;
  }
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
