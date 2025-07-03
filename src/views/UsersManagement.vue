<template>
  <div class="users-management">
    <!-- Page Header -->
    <div class="page-header">
      <h1>إدارة المستخدمين</h1>
    </div>

    <!-- Add User Button -->
    <div class="add-user-button">
      <button @click="openAddUserModal" class="add-btn">
        <i class="pi pi-user-plus"></i> إضافة مستخدم جديد
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <input
          type="text"
          v-model="filters.fullName"
          placeholder="البحث بالاسم"
          @input="debouncedFilterChange"
        />
      </div>
      <div class="filter-group">
        <input
          type="text"
          v-model="filters.phoneNumber"
          placeholder="البحث برقم الهاتف"
          @input="debouncedFilterChange"
        />
      </div>
      <div class="filter-group">
        <select v-model="filters.role" @change="debouncedFilterChange">
          <option value="">كل الأدوار</option>
          <option v-for="role in roles" :key="role.value" :value="role.value">
            {{ role.label }}
          </option>
        </select>
      </div>
    </div>

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
          <template v-else-if="users.length">
            <tr v-for="user in users" :key="user.id">
              <td>
                {{ user.firstName || "" }} {{ user.secondName || "" }}
                {{ user.thirdName || "" }}
              </td>
              <td>{{ user.phoneNumber || "غير متوفر" }}</td>
              <td>{{ getRoleLabel(user.role) }}</td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <button @click="editUser(user)" class="edit-btn">
                  <i class="pi pi-pencil"></i> تعديل
                </button>
                <button @click="deleteUser(user)" class="delete-btn">
                  <i class="pi pi-trash"></i> حذف
                </button>
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td colspan="5" class="no-data">لا توجد بيانات للمستخدمين</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="pagination.totalPages > 1">
      <button
        :disabled="pagination.page === 1"
        @click="onPageChange(pagination.page - 1)"
        class="pagination-btn"
      >
        <i class="pi pi-angle-left"></i>
      </button>
      <button
        v-for="page in pagination.totalPages"
        :key="page"
        @click="onPageChange(page)"
        :class="{ active: page === pagination.page }"
        class="pagination-btn"
      >
        {{ page }}
      </button>
      <button
        :disabled="pagination.page === pagination.totalPages"
        @click="onPageChange(pagination.page + 1)"
        class="pagination-btn"
      >
        <i class="pi pi-angle-right"></i>
      </button>
    </div>

    <!-- Modal Dialog -->
    <div v-if="showModal" class="modal-overlay" @click="resetForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingUser ? "تعديل مستخدم" : "إضافة مستخدم جديد" }}</h2>
          <button class="close-button" @click="resetForm">×</button>
        </div>

        <form @submit.prevent="handleSubmit" class="user-form">
          <div class="form-group">
            <label for="firstName">الاسم الأول *</label>
            <input
              type="text"
              id="firstName"
              v-model="formData.firstName"
              placeholder="الاسم الأول"
              required
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
              pattern="[0-9]{10,15}"
              title="رقم الهاتف يجب أن يحتوي على 10-15 أرقام"
            />
          </div>

          <div class="form-group">
            <label for="password">{{
              editingUser ? "كلمة المرور الجديدة (اختياري)" : "كلمة المرور *"
            }}</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              :placeholder="editingUser ? 'كلمة المرور الجديدة' : 'كلمة المرور'"
              :required="!editingUser"
            />
          </div>

          <div class="form-group">
            <label for="role">الدور *</label>
            <select id="role" v-model="formData.role" required>
              <option disabled value="">اختر الدور</option>
              <option
                v-for="role in roles"
                :key="role.value"
                :value="role.value"
              >
                {{ role.label }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button" :disabled="loading">
              <i v-if="loading" class="pi pi-spin pi-spinner"></i>
              {{ editingUser ? "تحديث" : "حفظ" }}
            </button>
            <button
              type="button"
              class="cancel-button"
              @click="resetForm"
              :disabled="loading"
            >
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
          <button class="close-button" @click="closeDeleteModal">×</button>
        </div>
        <div class="delete-modal-content">
          <div class="delete-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <p class="delete-message">
            هل أنت متأكد من حذف المستخدم "{{ userToDelete?.firstName || "" }}
            {{ userToDelete?.secondName || "" }}
            {{ userToDelete?.thirdName || "" }}"؟
          </p>
          <p class="delete-warning">هذا الإجراء لا يمكن التراجع عنه</p>
          <div class="delete-actions">
            <button
              @click="confirmDelete"
              class="confirm-delete-btn"
              :disabled="loading"
            >
              <i v-if="loading" class="pi pi-spin pi-spinner"></i> حذف
            </button>
            <button
              @click="closeDeleteModal"
              class="cancel-delete-btn"
              :disabled="loading"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import { debounce } from "lodash";

export default {
  name: "UsersManagement",
  data() {
    return {
      formData: {
        firstName: "",
        secondName: "",
        thirdName: "",
        phoneNumber: "",
        password: "",
        role: "",
      },
      roles: [],
      users: [],
      loading: false,
      totalRecords: 0,
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 0,
      },
      filters: {
        fullName: "",
        phoneNumber: "",
        role: "",
      },
      editingUser: null,
      showModal: false,
      showDeleteModal: false,
      userToDelete: null,
    };
  },
  created() {
    // إعداد toastr
    toastr.options = {
      closeButton: true,
      progressBar: true,
      positionClass: "toast-top-right",
      timeOut: 5000,
      rtl: true,
    };

    // جلب البيانات عند تحميل المكون
    this.fetchUsers();
    this.fetchRoles();

    // إعداد debounce لتقليل عدد الطلبات أثناء البحث
    this.debouncedFilterChange = debounce(this.onFilterChange, 500);
  },
  methods: {
    async fetchUsers() {
      try {
        this.loading = true;
        const params = {
          pageNumber: this.pagination.page,
          pageSize: this.pagination.pageSize,
          fullName: this.filters.fullName?.trim() || null,
          phoneNumber: this.filters.phoneNumber?.trim() || null,
          role: this.filters.role === "" ? null : Number(this.filters.role),
        };

        const response = await this.$axios.get("/Users/GetAllUsers", {
          params,
          validateStatus: (status) => status >= 200 && status < 500,
        });

        if (response.status === 200) {
          this.users =
            response.data.items?.filter((user) => user && user.id) || [];
          this.totalRecords = response.data.totalCount || 0;
          this.pagination.totalPages = response.data.totalPages || 0;
        } else {
          toastr.error("حدث خطأ أثناء جلب بيانات المستخدمين", "خطأ");
        }
      } catch (error) {
        const message =
          error.code === "ERR_NETWORK"
            ? "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت"
            : error.response?.data?.message || "حدث خطأ غير متوقع";
        toastr.error(message, "خطأ");
      } finally {
        this.loading = false;
      }
    },
    async fetchRoles() {
      try {
        const response = await this.$axios.get(
          "http://his-api.tatwer.tech/RoleType"
        );
        this.roles =
          response.data.value?.map((r) => ({
            value: r.key,
            label: r.description?.trim() || "غير محدد",
          })) || [];
      } catch (error) {
        toastr.error("خطأ في جلب الأدوار", "خطأ");
      }
    },
    async handleSubmit() {
      try {
        this.loading = true;

        // التحقق من الحقول المطلوبة
        if (!this.formData.firstName?.trim()) {
          toastr.error("الاسم الأول مطلوب", "خطأ");
          return;
        }
        if (!this.formData.phoneNumber?.trim()) {
          toastr.error("رقم الهاتف مطلوب", "خطأ");
          return;
        }
        if (!this.formData.role) {
          toastr.error("الدور مطلوب", "خطأ");
          return;
        }
        if (!this.editingUser && !this.formData.password?.trim()) {
          toastr.error("كلمة المرور مطلوبة عند إنشاء مستخدم جديد", "خطأ");
          return;
        }

        // إعداد البيانات
        const payload = {
          firstName: this.formData.firstName.trim(),
          secondName: this.formData.secondName?.trim() || null,
          thirdName: this.formData.thirdName?.trim() || null,
          phoneNumber: this.formData.phoneNumber.trim(),
          role: Number(this.formData.role),
          ...(this.formData.password?.trim() && {
            password: this.formData.password.trim(),
          }),
        };

        if (this.editingUser) {
          await this.$axios.put(`/Users/${this.editingUser.id}`, payload);
          toastr.success("تم تحديث المستخدم بنجاح", "نجاح");
        } else {
          await this.$axios.post("/Users/CreateUser", payload);
          toastr.success("تم إنشاء المستخدم بنجاح", "نجاح");
        }

        this.resetForm();
        this.fetchUsers();
      } catch (error) {
        const message =
          error.response?.data?.message || "حدث خطأ أثناء حفظ المستخدم";
        toastr.error(message, "خطأ");
      } finally {
        this.loading = false;
      }
    },
    async deleteUser(user) {
      if (user) {
        this.userToDelete = user;
        this.showDeleteModal = true;
      }
    },
    async confirmDelete() {
      if (!this.userToDelete) return;

      try {
        this.loading = true;
        await this.$axios.delete(`/Users/${this.userToDelete.id}`);
        toastr.success("تم حذف المستخدم بنجاح", "نجاح");
        this.fetchUsers();
        this.closeDeleteModal();
      } catch (error) {
        toastr.error("حدث خطأ أثناء حذف المستخدم", "خطأ");
      } finally {
        this.loading = false;
      }
    },
    openAddUserModal() {
      this.editingUser = null;
      this.formData = {
        firstName: "",
        secondName: "",
        thirdName: "",
        phoneNumber: "",
        password: "",
        role: "",
      };
      this.showModal = true;
    },
    editUser(user) {
      this.editingUser = user;
      this.formData = {
        firstName: user.firstName || "",
        secondName: user.secondName || "",
        thirdName: user.thirdName || "",
        phoneNumber: user.phoneNumber || "",
        password: "",
        role: user.role || "",
      };
      this.showModal = true;
    },
    resetForm() {
      this.editingUser = null;
      this.formData = {
        firstName: "",
        secondName: "",
        thirdName: "",
        phoneNumber: "",
        password: "",
        role: "",
      };
      this.showModal = false;
    },
    closeDeleteModal() {
      this.userToDelete = null;
      this.showDeleteModal = false;
    },
    onPageChange(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.page = page;
        this.fetchUsers();
      }
    },
    onFilterChange() {
      this.pagination.page = 1;
      this.fetchUsers();
    },
    getRoleLabel(roleValue) {
      const role = this.roles.find((r) => r.value === roleValue);
      return role ? role.label : "غير محدد";
    },
    formatDate(dateString) {
      if (!dateString) return "غير متوفر";
      return new Date(dateString).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
};
</script>

<style scoped>
.users-management {
  padding: 20px;
  margin: 0 auto;
  font-family: "Tajawal", sans-serif;
}

.page-header {
  background: linear-gradient(to right, #f5faff, #ffffff);
  padding: 20px 30px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  text-align: right;
  border-right: 6px solid #2c3e50;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
}

/* Filters */
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 15px;
  background-color: #ffffff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.filter-group input:focus,
.filter-group select:focus {
  border-color: #32817d;
  box-shadow: 0 0 8px rgba(50, 129, 125, 0.2);
  outline: none;
}

/* Table */
.table-container {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  margin-bottom: 30px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 15px;
  text-align: right;
  border-bottom: 1px solid #e0e6ed;
}

.users-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.users-table tr:hover {
  background-color: #f5f7fa;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-size: 16px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 30px;
}

.pagination-btn {
  padding: 8px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #32817d;
  color: #ffffff;
  border-color: #32817d;
}

.pagination-btn.active {
  background-color: #2c3e50;
  color: #ffffff;
  border-color: #2c3e50;
}

.pagination-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  width: 95%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: fadeInUp 0.3s ease-in-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
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
  border-bottom: 1px solid #e0e6ed;
  padding-bottom: 10px;
}

.modal-header h2 {
  font-size: 22px;
  color: #2c3e50;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #888;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #e74c3c;
}

/* Form */
.user-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 15px;
  background-color: #ffffff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #32817d;
  box-shadow: 0 0 8px rgba(50, 129, 125, 0.2);
  outline: none;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}
.add-user-button {
  margin-bottom: 20px;
  text-align: left;
}

.submit-button,
.cancel-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-button {
  background-color: #3498db;
  color: #ffffff;
}

.submit-button:hover:not(:disabled) {
  background-color: #166da7;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.submit-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #e74c3c;
  color: #ffffff;
}

.cancel-button:hover:not(:disabled) {
  background-color: #c0392b;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.cancel-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

/* Delete Modal */
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
  font-size: 14px;
  margin-bottom: 20px;
}

.delete-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.confirm-delete-btn,
.cancel-delete-btn {
  padding: 10px 25px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-delete-btn {
  background-color: #e74c3c;
  color: #ffffff;
}

.confirm-delete-btn:hover:not(:disabled) {
  background-color: #c0392b;
}

.cancel-delete-btn {
  background-color: #95a5a6;
  color: #ffffff;
}

.cancel-delete-btn:hover:not(:disabled) {
  background-color: #7f8c8d;
}

/* Loading Styles */
.loading-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1001;
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
  margin-top: 15px;
}

/* Skeleton Loading */
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

/* Buttons */
.add-btn,
.edit-btn,
.delete-btn {
  padding: 10px 20px;
  margin-left: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.add-btn {
  background-color: #1b365c;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.add-btn:hover {
  background-color: #324053;
}

.edit-btn {
  background-color: #3498db;
  color: #ffffff;
}

.edit-btn:hover {
  background-color: #2980b9;
}

.delete-btn {
  background-color: #e74c3c;
  color: #ffffff;
}

.delete-btn:hover {
  background-color: #c0392b;
}

/* Responsive Design */
@media (max-width: 768px) {
  .users-management {
    padding: 15px;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .user-form {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-button,
  .cancel-button {
    width: 100%;
  }

  .modal-content {
    width: 90%;
    padding: 20px;
  }

  .users-table th,
  .users-table td {
    padding: 10px;
    font-size: 14px;
  }
}
</style>
