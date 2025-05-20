<template>
  <div class="medical-staff">

    <div class="page-header">
    <h1>إدارة الكادر الطبي</h1>
    </div>
    
    <!-- Loading Indicator -->
    <!-- <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>جاري التحميل...</p>
    </div>
     -->
    <!-- Add Staff Button -->
    <div class="add-staff-button">
      <button @click="showModal = true" class="add-btn">
        
        <i class="pi pi-user-plus"></i>  إضافة كادر طبي جديد

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
        <select v-model="filters.specialization" @change="onFilterChange">
          <option value="">كل التخصصات</option>
          <option v-for="spec in specializations" :key="spec" :value="spec">
            {{ spec }}
          </option>
        </select>
      </div>
    </div>

    <!-- Staff Table -->
    <div class="table-container">
      <table class="staff-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>رقم الهاتف</th>
            <th>التخصص</th>
            <th>المسمى الوظيفي</th>
            <th>القسم</th>
            <th>العنوان</th>
            <th>ساعات العمل</th>
            <th>المدخلات الخاصة</th>
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
            </tr>
          </template>
          <template v-else>
            <tr v-for="staff in staffList" :key="staff.id">
              <td>
                {{ staff.user.firstName }} {{ staff.user.secondName }}
                {{ staff.user.thirdName }}
              </td>
              <td>{{ staff.user.phoneNumber }}</td>
              <td>{{ staff.specialization }}</td>
              <td>{{ staff.jobTitle }}</td>
              <td>{{ staff.staffSections?.sectionName }}</td>
              <td>{{ staff.address }}</td>
              <td>
                <button @click="showWorkingHours(staff)" class="details-btn">
                  عرض الساعات ({{ staff.workingHours?.length || 0 }})
                </button>
              </td>
              <td>
                <button @click="showPrivateInputs(staff)" class="details-btn">
                  عرض المدخلات ({{
                    staff.privateMedicalStaffInputs?.length || 0
                  }})
                </button>
              </td>
              <td>
                <button @click="editStaff(staff)" class="edit-btn">
                  تعديل
                </button>
                <button @click="deleteStaff(staff.id)" class="delete-btn">
                  حذف
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
          <h2>{{ editingStaff ? "تعديل كادر طبي" : "إضافة كادر طبي جديد" }}</h2>
          <button class="close-button" @click="resetForm">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="staff-form">
          <div class="form-group">
            <label for="image">الصورة الشخصية</label>
            <input
              type="file"
              id="image"
              @change="handleImageChange"
              accept="image/*"
            />
          </div>

          <div class="form-group">
            <label for="firstName">الاسم الأول</label>
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
              required
            />
          </div>

          <div class="form-group">
            <label for="thirdName">الاسم الثالث</label>
            <input
              type="text"
              id="thirdName"
              v-model="formData.thirdName"
              placeholder="الاسم الثالث"
              required
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
            <label for="password">{{
              editingStaff ? "كلمة المرور الجديدة (اختياري)" : "كلمة المرور *"
            }}</label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              :placeholder="
                editingStaff ? 'كلمة المرور الجديدة' : 'كلمة المرور'
              "
              :required="!editingStaff"
            />
          </div>

          <div class="form-group">
            <label for="specialization">التخصص</label>
            <input
              type="text"
              id="specialization"
              v-model="formData.specialization"
              placeholder="التخصص"
              required
            />
          </div>

          <div class="form-group">
            <label for="address">العنوان</label>
            <input
              type="text"
              id="address"
              v-model="formData.address"
              placeholder="العنوان"
            />
          </div>

          <div class="form-group">
            <label for="jobTitle">المسمى الوظيفي</label>
            <input
              type="text"
              id="jobTitle"
              v-model="formData.jobTitle"
              placeholder="المسمى الوظيفي"
              required
            />
          </div>

          <div class="form-group">
            <label for="staffSectionsId">القسم</label>
            <select
              id="staffSectionsId"
              v-model="formData.staffSectionsId"
              required
            >
              <option value="">اختر القسم</option>
              <option
                v-for="section in sections"
                :key="section.id"
                :value="section.id"
              >
                {{ section.sectionName }}
              </option>
            </select>
          </div>

          <!-- Working Hours Section -->
          <div class="form-section">
            <h3>ساعات العمل</h3>
            <div
              v-for="(hour, index) in formData.workingHours"
              :key="index"
              class="working-hour-item"
            >
              <div class="form-group">
                <label :for="'shiftName' + index">اسم الشفت</label>
                <input
                  :id="'shiftName' + index"
                  type="text"
                  v-model="hour.shiftName"
                  placeholder="اسم الشفت"
                  required
                />
              </div>

              <div class="form-group">
                <label :for="'startTime' + index">وقت البداية</label>
                <input
                  :id="'startTime' + index"
                  type="time"
                  v-model="hour.startTime"
                  required
                />
              </div>

              <div class="form-group">
                <label :for="'endTime' + index">وقت النهاية</label>
                <input
                  :id="'endTime' + index"
                  type="time"
                  v-model="hour.endTime"
                  required
                />
              </div>

              <div class="form-group">
                <label :for="'workingDay' + index">اليوم</label>
                <select
                  :id="'workingDay' + index"
                  v-model="hour.workingDay"
                  required
                >
                  <option
                    v-for="(day, value) in workingDays"
                    :key="value"
                    :value="value"
                  >
                    {{ day }}
                  </option>
                </select>
              </div>

              <button
                type="button"
                @click="removeWorkingHour(index)"
                class="remove-btn"
              >
                حذف
              </button>
            </div>
            <button type="button" @click="addWorkingHour" class="add-hour-btn">
              إضافة شفت
            </button>
          </div>

          <!-- Private Inputs Section -->
          <div class="form-section">
            <h3>المدخلات الخاصة</h3>
            <div
              v-for="(input, index) in formData.privateMedicalStaffInputs"
              :key="index"
              class="input-item"
            >
              <div class="form-group">
                <label :for="'inputName' + index">اسم المدخل</label>
                <input
                  :id="'inputName' + index"
                  type="text"
                  v-model="input.inputName"
                  placeholder="اسم المدخل"
                  required
                />
              </div>

              <div class="form-group">
                <label :for="'inputType' + index">نوع المدخل</label>
                <select
                  :id="'inputType' + index"
                  v-model="input.inputType"
                  required
                >
                  <option
                    v-for="(label, type) in inputTypes"
                    :key="type"
                    :value="type"
                  >
                    {{ label }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label :for="'defaultValue' + index">القيمة الافتراضية</label>
                <input
                  :id="'defaultValue' + index"
                  type="text"
                  v-model="input.defaultValue"
                  placeholder="القيمة الافتراضية"
                />
              </div>

              <div class="form-group">
                <label class="checkbox-wrapper">
                  <input type="checkbox" v-model="input.isRequired" />
                  <span class="custom-check"></span>
                  إلزامي
                </label>
              </div>

              <button
                type="button"
                @click="removePrivateInput(index)"
                class="remove-btn"
              >
                حذف
              </button>
            </div>
            <button
              type="button"
              @click="addPrivateInput"
              class="add-input-btn"
            >
              إضافة مدخل
            </button>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-button">
              {{ editingStaff ? "تحديث" : "حفظ" }}
            </button>
            <button type="button" class="cancel-button" @click="resetForm">
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
          <button class="close-button" @click="closeDeleteModal">
            &times;
          </button>
        </div>

        <div class="delete-modal-content">
          <div class="delete-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <p class="delete-message">
            هل أنت متأكد من حذف الكادر الطبي "{{
              staffToDelete?.user.firstName
            }}
            {{ staffToDelete?.user.secondName }}
            {{ staffToDelete?.user.thirdName }}"؟
          </p>
          <p class="delete-warning">هذا الإجراء لا يمكن التراجع عنه</p>

          <div class="delete-actions">
            <button @click="confirmDelete" class="confirm-delete-btn">
              حذف
            </button>
            <button @click="closeDeleteModal" class="cancel-delete-btn">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Working Hours Modal -->
    <div
      v-if="showWorkingHoursModal"
      class="modal-overlay"
      @click="closeWorkingHoursModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>ساعات العمل</h2>
          <button class="close-button" @click="closeWorkingHoursModal">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <table class="details-table">
            <thead>
              <tr>
                <th>اسم الشفت</th>
                <th>وقت البداية</th>
                <th>وقت النهاية</th>
                <th>اليوم</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(hour, index) in selectedStaff?.workingHours"
                :key="index"
              >
                <td>{{ hour.shiftName }}</td>
                <td>{{ hour.startTime }}</td>
                <td>{{ hour.endTime }}</td>
                <td>{{ workingDays[hour.workingDay] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Private Inputs Modal -->
    <div
      v-if="showPrivateInputsModal"
      class="modal-overlay"
      @click="closePrivateInputsModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>المدخلات الخاصة</h2>
          <button class="close-button" @click="closePrivateInputsModal">
            &times;
          </button>
        </div>
        <div class="modal-body">
          <table class="details-table">
            <thead>
              <tr>
                <th>اسم المدخل</th>
                <th>النوع</th>
                <th>القيمة الافتراضية</th>
                <th>الخيارات</th>
                <th>إلزامي</th>
                <th>الحد الأدنى</th>
                <th>الحد الأقصى</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(
                  input, index
                ) in selectedStaff?.privateMedicalStaffInputs"
                :key="index"
              >
                <td>{{ input.inputName }}</td>
                <td>{{ inputTypes[input.inputType] }}</td>
                <td>{{ input.defaultValue }}</td>
                <td>{{ input.options }}</td>
                <td>{{ input.isRequired ? "نعم" : "لا" }}</td>
                <td>{{ input.minValue }}</td>
                <td>{{ input.maxValue }}</td>
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
  name: "MedicalStaff",
  data() {
    return {
      formData: {
        firstName: "",
        secondName: "",
        thirdName: "",
        phoneNumber: "",
        password: "",
        specialization: "",
        address: "",
        jobTitle: "",
        staffSectionsId: "",
        role: 3, // Medical Staff
        workingHours: [],
        privateMedicalStaffInputs: [],
        image: null,
      },
      staffList: [],
      sections: [],
      specializations: [],
      workingDays: {
        1: "الاثنين",
        2: "الثلاثاء",
        3: "الأربعاء",
        4: "الخميس",
        5: "الجمعة",
        6: "السبت",
        7: "الأحد",
      },
      inputTypes: {
        1: "نص",
        2: "رقم",
        3: "تاريخ",
        6: "قائمة منسدلة",
        8: "DNA",
        12: "نص طويل",
      },
      errorMessage: "",
      successMessage: "",
      loading: false,
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 0,
      },
      filters: {
        fullName: "",
        phoneNumber: "",
        specialization: "",
      },
      editingStaff: null,
      showModal: false,
      showDeleteModal: false,
      staffToDelete: null,
      showWorkingHoursModal: false,
      showPrivateInputsModal: false,
      selectedStaff: null,
    };
  },
  created() {
    this.fetchStaff();
    this.fetchSections();
    this.fetchSpecializations();
  },
  methods: {
    async fetchStaff() {
      try {
        this.loading = true;
        const params = {
          PageNumber: this.pagination.page,
          PageSize: this.pagination.pageSize,
          fullName: this.filters.fullName,
          phoneNumber: this.filters.phoneNumber,
          specialization: this.filters.specialization,
        };

        const response = await this.$axios.get(
          "/MedicalStaff/GetAllMedicalStaff",
          { params }
        );
        this.staffList = response.data.items || [];
        this.pagination.totalPages = response.data.totalPages || 0;
      } catch (error) {
        console.error("Error fetching staff:", error);
        this.errorMessage = "حدث خطأ أثناء جلب بيانات الكادر الطبي";
      } finally {
        this.loading = false;
      }
    },
    async fetchSections() {
      try {
        const response = await this.$axios.get(
          "/StaffSections/GetAllStaffSections",
          {
            params: {
              PageNumber: 1,
              PageSize: 100,
            },
          }
        );
        this.sections = response.data.items || [];
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    },
    async fetchSpecializations() {
      try {
        const response = await this.$axios.get("/MedicalStaff/GetMyDiagnosis");
        this.specializations = response.data || [];
      } catch (error) {
        console.error("Error fetching specializations:", error);
      }
    },
    async handleSubmit() {
      try {
        this.errorMessage = "";
        this.successMessage = "";

        const formData = new FormData();

        // Add basic fields
        formData.append("FirstName", this.formData.firstName);
        formData.append("SecondName", this.formData.secondName);
        formData.append("ThirdName", this.formData.thirdName);
        formData.append("PhoneNumber", this.formData.phoneNumber);
        formData.append("Password", this.formData.password);
        formData.append("Specialization", this.formData.specialization);
        formData.append("Address", this.formData.address);
        formData.append("JobTitle", this.formData.jobTitle);
        formData.append("StaffSectionsId", this.formData.staffSectionsId);
        formData.append("Role", this.formData.role);

        // Add image if exists
        if (this.formData.image) {
          formData.append("TheImage", this.formData.image);
        }

        // Add working hours
        if (this.formData.workingHours.length > 0) {
          this.formData.workingHours.forEach((hour, index) => {
            formData.append(
              `WorkingHoursDto[${index}].shiftName`,
              hour.shiftName
            );
            formData.append(
              `WorkingHoursDto[${index}].startTime`,
              hour.startTime
            );
            formData.append(`WorkingHoursDto[${index}].endTime`, hour.endTime);
            formData.append(
              `WorkingHoursDto[${index}].workingDay`,
              hour.workingDay
            );
            formData.append(
              `WorkingHoursDto[${index}].staffSectionsId`,
              this.formData.staffSectionsId
            );
          });
        }

        // Add private inputs
        if (this.formData.privateMedicalStaffInputs.length > 0) {
          this.formData.privateMedicalStaffInputs.forEach((input, index) => {
            formData.append(
              `PrivateMedicalStaffInputs[${index}].inputName`,
              input.inputName
            );
            formData.append(
              `PrivateMedicalStaffInputs[${index}].inputType`,
              input.inputType
            );
            formData.append(
              `PrivateMedicalStaffInputs[${index}].defaultValue`,
              input.defaultValue
            );
            formData.append(
              `PrivateMedicalStaffInputs[${index}].options`,
              input.options
            );
            formData.append(
              `PrivateMedicalStaffInputs[${index}].isRequired`,
              input.isRequired
            );
            formData.append(
              `PrivateMedicalStaffInputs[${index}].minValue`,
              input.minValue
            );
            formData.append(
              `PrivateMedicalStaffInputs[${index}].maxValue`,
              input.maxValue
            );
          });
        }

        if (this.editingStaff) {
          await this.$axios.put(
            `/MedicalStaff/PutMedicalStaff/${this.editingStaff.id}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          this.successMessage = "تم تحديث الكادر الطبي بنجاح";
        } else {
          await this.$axios.post("/MedicalStaff/AddMedicalStaff", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          this.successMessage = "تم إضافة الكادر الطبي بنجاح";
        }

        this.resetForm();
        this.fetchStaff();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "حدث خطأ أثناء حفظ الكادر الطبي";
      }
    },
    handleImageChange(event) {
      this.formData.image = event.target.files[0];
    },
    async deleteStaff(staffId) {
      const staff = this.staffList.find((s) => s.id === staffId);
      if (staff) {
        this.staffToDelete = staff;
        this.showDeleteModal = true;
      }
    },
    async confirmDelete() {
      if (!this.staffToDelete) return;

      try {
        await this.$axios.delete(
          `/MedicalStaff/DeleteMedicalStaff/${this.staffToDelete.id}`
        );
        this.successMessage = "تم حذف الكادر الطبي بنجاح";
        this.fetchStaff();
        this.closeDeleteModal();
      } catch (error) {
        this.errorMessage = "حدث خطأ أثناء حذف الكادر الطبي";
      }
    },
    closeDeleteModal() {
      this.staffToDelete = null;
      this.showDeleteModal = false;
    },
    editStaff(staff) {
      this.editingStaff = staff;
      this.formData = {
        firstName: staff.user.firstName,
        secondName: staff.user.secondName,
        thirdName: staff.user.thirdName,
        phoneNumber: staff.user.phoneNumber,
        password: "", // لا نعرض كلمة المرور
        specialization: staff.specialization,
        address: staff.address,
        jobTitle: staff.jobTitle,
        staffSectionsId: staff.staffSectionsId,
        role: 3,
        workingHours: staff.workingHours || [],
        privateMedicalStaffInputs: staff.privateMedicalStaffInputs || [],
        image: null,
      };
      this.showModal = true;
    },
    resetForm() {
      this.editingStaff = null;
      this.formData = {
        firstName: "",
        secondName: "",
        thirdName: "",
        phoneNumber: "",
        password: "",
        specialization: "",
        address: "",
        jobTitle: "",
        staffSectionsId: "",
        role: 3,
        workingHours: [],
        privateMedicalStaffInputs: [],
        image: null,
      };
      this.showModal = false;
    },
    onPageChange(page) {
      this.pagination.page = page;
      this.fetchStaff();
    },
    onFilterChange() {
      this.pagination.page = 1;
      this.fetchStaff();
    },
    getSectionName(sectionId) {
      const section = this.sections.find((s) => s.id === sectionId);
      return section ? section.sectionName : "";
    },
    addWorkingHour() {
      this.formData.workingHours.push({
        shiftName: "",
        startTime: "",
        endTime: "",
        workingDay: 1,
      });
    },
    removeWorkingHour(index) {
      this.formData.workingHours.splice(index, 1);
    },
    addPrivateInput() {
      this.formData.privateMedicalStaffInputs.push({
        inputName: "",
        inputType: 1,
        defaultValue: "",
        options: "",
        isRequired: false,
        minValue: 0,
        maxValue: 0,
      });
    },
    removePrivateInput(index) {
      this.formData.privateMedicalStaffInputs.splice(index, 1);
    },
    showWorkingHours(staff) {
      this.selectedStaff = staff;
      this.showWorkingHoursModal = true;
    },
    closeWorkingHoursModal() {
      this.selectedStaff = null;
      this.showWorkingHoursModal = false;
    },
    showPrivateInputs(staff) {
      this.selectedStaff = staff;
      this.showPrivateInputsModal = true;
    },
    closePrivateInputsModal() {
      this.selectedStaff = null;
      this.showPrivateInputsModal = false;
    },
  },
};
</script>

<style scoped>
.medical-staff {
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

.staff-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.staff-table th,
.staff-table td {
  padding: 12px;
  text-align: right;
  border-bottom: 1px solid #ddd;
}

.staff-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.staff-table tr:hover {
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
.staff-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-section {
  grid-column: 1 / -1;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.working-hour-item,
.input-item {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 15px;
  position: relative;
}


.add-hour-btn,
.add-input-btn {
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  margin-top: 10px;
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
  background: #ffffff;
  padding: 40px;
  border-radius: 16px;
  box-shadow:
    0 15px 35px rgba(0, 0, 0, 0.1),      /* ظل أساسي */
    0 5px 15px rgba(50, 129, 125, 0.05); /* ظل بلون العلامة */
  width: 95%;
  max-width: 850px;
  max-height: 90vh;
  overflow-y: auto;
  animation: fadeInUp 0.4s ease-in-out;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05); /* إطار ناعم */
  backdrop-filter: blur(4px); /* تأثير زجاجي خفيف (اختياري) */
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

.add-staff-button {
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



.loading-overlay p {
  color: #2c3e50;
  font-size: 18px;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .medical-staff {
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

  .working-hour-item,
  .input-item {
    grid-template-columns: 1fr;
  }
}

.details-btn {
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 2px;
}

.details-btn:hover {
  background-color: #2980b9;
}

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

.modal-body {
  max-height: 70vh;
  overflow-y: auto;
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

.modal-content .staff-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.modal-content .form-group {
  margin-bottom: 15px;
}

.modal-content input,
.modal-content select {
  width: 100%;
  padding: 12px 14px;
  font-size: 15px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: 0.3s;
}

.modal-content input:focus,
.modal-content select:focus {
  border-color: #32817d;
  box-shadow: 0 0 0 3px rgba(50, 129, 125, 0.1);
  outline: none;
}

.working-hour-item {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.input-item {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
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
  left: 150px;
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


/* الكارد العام للمدخل أو الشفت */
.working-hour-item,
.input-item {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #fdfdfd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

/* زر الحذف داخل الكارد */
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
