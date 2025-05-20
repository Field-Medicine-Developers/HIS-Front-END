<template>
  <div class="users-management">
    <h1>إدارة المستخدمين</h1>
    
    <!-- Loading Indicator -->
    <!-- <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>جاري التحميل...</p>
    </div> -->
    
    <!-- Add User Button -->
    <div class="add-user-button">
      <button @click="showModal = true" class="add-btn"><i class="pi pi-user-plus"></i> إضافة مستخدم جديد</button>
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
        <select v-model="filters.role" @change="onFilterChange">
         <option value="">كل الأدوار</option>
         <option v-for="role in roles" :key="role.value" :value="role.value">
           {{ role.label }}
         </option>
       </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>رقم الهاتف</th>
            <th>الدور</th>
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
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.firstName }} {{ user.secondName }} {{ user.thirdName }}</td>
              <td>{{ user.phoneNumber }}</td>
              <td>{{ getRoleLabel(user.role) }}</td>
              <td>{{ new Date(user.createdAt).toLocaleDateString() }}</td>
              <td>
                <button @click="editUser(user)" class="edit-btn">تعديل</button>
                <button @click="deleteUser(user.id)" class="delete-btn">حذف</button>
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

    <!-- Modal Dialog -->
    <div v-if="showModal" class="modal-overlay" @click="resetForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد' }}</h2>
          <button class="close-button" @click="resetForm">&times;</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="user-form">
          <div class="form-group">
            <label for="firstName">الاسم الأول</label>
            <input 
              type="text" 
              id="firstName" 
              v-model="formData.firstName" 
              placeholder="الاسم الأول"
            />
          </div>

          <div class="form-group">
            <label for="secondName">الاسم الثاني</label>
            <input 
              type="text" 
              id="secondName" 
              v-model="formData.secondName" 
              placeholder="الاسم الثاني"
            />
          </div>

          <div class="form-group">
            <label for="thirdName">الاسم الثالث</label>
            <input 
              type="text" 
              id="thirdName" 
              v-model="formData.thirdName" 
              placeholder="الاسم الثالث"
            />
          </div>

          <div class="form-group">
            <label for="phoneNumber">رقم الهاتف *</label>
            <input 
              type="text" 
              id="phoneNumber" 
              v-model="formData.phoneNumber" 
              placeholder="رقم الهاتف" 
              required
            />
          </div>

          <div class="form-group">
            <label for="password">{{ editingUser ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور *' }}</label>
            <input 
              type="password" 
              id="password" 
              v-model="formData.password" 
              :placeholder="editingUser ? 'كلمة المرور الجديدة' : 'كلمة المرور'"
              :required="!editingUser"
            />
          </div>

          <div class="form-group">
            <label for="role">الدور</label>
            <select id="role" v-model="formData.role">
              <option disabled value="">اختيار الدور</option>
  <option v-for="role in roles" :key="role.value" :value="role.value">
    {{ role.label }}
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
            <button type="submit" class="submit-button">{{ editingUser ? 'تحديث' : 'حفظ' }}</button>
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
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <p class="delete-message">هل أنت متأكد من حذف المستخدم "{{ userToDelete?.firstName }} {{ userToDelete?.secondName }} {{ userToDelete?.thirdName }}"؟</p>
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
  name: 'UsersManagement',
  data() {
    return {
      formData: {
        firstName: '',
        secondName: '',
        thirdName: '',
        phoneNumber: '',
        password: '',
        role: ''
      },
      roles: [
        // { value: 1, label: 'مدير' },
        // { value: 2, label: 'طبيب' },
        // { value: 3, label: 'ممرض' },
        // { value: 4, label: 'مراجع' },
        // { value: 5, label: 'موظف استقبال' }
      ],
      errorMessage: '',
      successMessage: '',
      users: [],
      loading: false,
      totalRecords: 0,
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 0
      },
      filters: {
        fullName: '',
        phoneNumber: '',
        role: null
      },
      editingUser: null,
      showModal: false,
      showDeleteModal: false,
      userToDelete: null
    }
  },
  created() {
    this.fetchUsers()
    this.fetchRoles();
  },
  methods: {
    async fetchUsers() {
      console.log('Starting to fetch users...')
      try {
        this.loading = true
        const params = {
          pageNumber: this.pagination.page,
          pageSize: this.pagination.pageSize,
          fullName: this.filters.fullName,
          phoneNumber: this.filters.phoneNumber,
          role: this.filters.role === '' ? null : this.filters.role
        }

        console.log('Request params:', params)
        console.log('Request URL:', '/Users/GetAllUsers')

        const response = await this.$axios.get('/Users/GetAllUsers', { 
          params,
          validateStatus: function (status) {
            return status >= 200 && status < 500 // Accept all status codes less than 500
          }
        })

        console.log('Response received:', response)

        if (response.status === 200) {
          this.users = response.data.items || []
          this.totalRecords = response.data.totalCount || 0
          this.pagination.totalPages = response.data.totalPages || 0
          console.log('Users data:', this.users)
        } else {
          console.error('Unexpected response status:', response.status)
          this.errorMessage = 'حدث خطأ أثناء جلب بيانات المستخدمين'
        }
      } catch (error) {
        console.error('Error in fetchUsers:', error)
        if (error.code === 'ERR_NETWORK') {
          this.errorMessage = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت'
        } else if (error.response) {
          this.errorMessage = error.response.data?.message || 'حدث خطأ أثناء جلب بيانات المستخدمين'
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

        if (!this.formData.phoneNumber || !this.formData.password) {
          this.errorMessage = 'رقم الهاتف وكلمة المرور مطلوبان';
          return;
        }

        if (this.editingUser) {
          await this.$axios.put(`/Users/${this.editingUser.id}`, this.formData);
          this.successMessage = 'تم تحديث المستخدم بنجاح';
        } else {
          await this.$axios.post('/Users/CreateUser', this.formData);
          this.successMessage = 'تم إنشاء المستخدم بنجاح';
        }

        this.resetForm();
        this.fetchUsers();
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ المستخدم';
      }
    },
    async deleteUser(userId) {
      const user = this.users.find(u => u.id === userId);
      if (user) {
        this.userToDelete = user;
        this.showDeleteModal = true;
      }
    },
    async confirmDelete() {
      if (!this.userToDelete) return;
      
      try {
        await this.$axios.delete(`/Users/${this.userToDelete.id}`);
        this.successMessage = 'تم حذف المستخدم بنجاح';
        this.fetchUsers();
        this.closeDeleteModal();
      } catch (error) {
        this.errorMessage = 'حدث خطأ أثناء حذف المستخدم';
      }
    },
    async fetchRoles() {
    try {
       const response = await this.$axios.get('http://his-api.tatwer.tech/RoleType');
       this.roles = response.data.value.map(r => ({
         value: r.key,
         label: r.description.trim()
       }));
      } catch (error) {
      console.error('خطأ في جلب الأدوار:', error);
     }
   },
    closeDeleteModal() {
      this.userToDelete = null;
      this.showDeleteModal = false;
    },
    editUser(user) {
      this.editingUser = user;
      this.formData = {
        firstName: user.firstName || '',
        secondName: user.secondName || '',
        thirdName: user.thirdName || '',
        phoneNumber: user.phoneNumber || '',
        password: '', // لا نعرض كلمة المرور
        role: user.role
      };
      this.showModal = true;
    },
    resetForm() {
      this.editingUser = null;
      this.formData = {
        firstName: '',
        secondName: '',
        thirdName: '',
        phoneNumber: '',
        password: '',
        role: 1
      };
      this.showModal = false;
    },
    onPageChange(page) {
      this.pagination.page = page;
      this.fetchUsers();
    },
    onFilterChange() {
      this.pagination.page = 1;
      this.fetchUsers();
    },
    getRoleLabel(roleValue) {
      const role = this.roles.find(r => r.value === roleValue);
      return role ? role.label : 'غير محدد';
    }
  }
}
</script>


<style scoped>
.users-management {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
}

h1, h2 {
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

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #ddd;
}

.users-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.users-table tr:hover {
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
.form-container {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-form {
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
  max-width: 600px;
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

.add-user-button {
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

/* Responsive Design */
@media (max-width: 768px) {
  .users-management {
    padding: 10px;
  }
  
  .form-container {
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

  .modal-content {
    width: 95%;
    padding: 20px;
  }
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


input,
select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 15px;
  background-color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

input:focus,
select:focus {
  border-color: #32817d;
  box-shadow: 0 0 0 4px rgba(50, 129, 125, 0.15), 0 2px 6px rgba(0, 0, 0, 0.08);
  outline: none;
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
  width: 95%;
  max-width: 850px;
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

/*  المودال */
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

/* الحقول */
.private-inputs-section {
  margin-bottom: 25px;
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
  margin-bottom: 15px;
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

</style> 