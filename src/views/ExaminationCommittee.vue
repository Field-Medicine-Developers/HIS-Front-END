<template>
  <div class="examination-committee">
    
    <div class="page-header">
    <h1>الفحص الاولي الطبي</h1>
    </div>
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
            <h3>رمز الفحص:{{ diagnosis.randomCode || " غير متوفر " }}</h3>
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
            <button @click="showReplyModal(diagnosis)" class="reply-btn">
              <i class="pi pi-reply"></i> رد اللجنة
            </button>
            <button @click="openDiagnosisModal(diagnosis)" class="diagnosis-btn">
              <i class="pi pi-file-edit"></i> تشخيص الطبيب
            </button>
            <button @click="openTransferModal(diagnosis)" class="transfer-btn">
              <i class="pi pi-send"></i> تحويل
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

    <!-- Reply Modal -->
    <div v-if="showReplyModal" class="modal-overlay" @click="closeReplyModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>رد اللجنة</h2>
          <button class="close-button" @click="closeReplyModal">&times;</button>
        </div>
        
        <form @submit.prevent="handleReplySubmit" class="examination-form">
          <div class="form-group">
            <label for="reply">الرد *</label>
            <textarea 
              id="reply" 
              v-model="replyFormData.reply" 
              required
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="replyImage">صورة الرد</label>
            <input 
              type="file" 
              id="replyImage" 
              @change="handleReplyImageChange"
              accept="image/*"
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
            <button type="button" class="cancel-button" @click="closeReplyModal">
              <i class="pi pi-times"></i>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Diagnosis Modal -->
    <div v-if="showDiagnosisModal" class="modal-overlay" @click="closeDiagnosisModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>تشخيص الطبيب</h2>
          <button class="close-button" @click="closeDiagnosisModal">&times;</button>
        </div>
        
        <form @submit.prevent="handleDiagnosisSubmit" class="examination-form">
          <div class="form-group">
            <label for="medicalInputs">المدخلات الطبية</label>
            <div v-for="(input, index) in diagnosisForm.medicalInputs" :key="index" class="input-group">
              <input 
                type="text" 
                v-model="input.value" 
                :placeholder="'المدخل الطبي ' + (index + 1)"
              />
              <button type="button" @click="removeMedicalInput(index)" class="remove-btn">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <button type="button" @click="addMedicalInput" class="add-input-btn">
              <i class="pi pi-plus"></i> إضافة مدخل طبي
            </button>
          </div>

          <div class="form-group">
            <label for="sectionInputs">مدخلات القسم</label>
            <div v-for="(input, index) in diagnosisForm.sectionInputs" :key="index" class="input-group">
              <input 
                type="text" 
                v-model="input.value" 
                :placeholder="'مدخل القسم ' + (index + 1)"
              />
              <button type="button" @click="removeSectionInput(index)" class="remove-btn">
                <i class="pi pi-times"></i>
              </button>
            </div>
            <button type="button" @click="addSectionInput" class="add-input-btn">
              <i class="pi pi-plus"></i> إضافة مدخل قسم
            </button>
          </div>

          <div class="form-group">
            <label for="diagnosisFile">ملف التشخيص</label>
            <input 
              type="file" 
              id="diagnosisFile" 
              @change="handleDiagnosisFileChange"
              accept="image/*,.pdf,.doc,.docx"
            />
          </div>

          <div class="form-group">
            <label for="fileDescription">وصف الملف</label>
            <textarea 
              id="fileDescription" 
              v-model="diagnosisForm.fileDescription"
              rows="3"
            ></textarea>
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
            <button type="button" class="cancel-button" @click="closeDiagnosisModal">
              <i class="pi pi-times"></i>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Transfer Modal -->
    <div v-if="showTransferModal" class="modal-overlay" @click="closeTransferModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>تحويل التشخيص</h2>
          <button class="close-button" @click="closeTransferModal">&times;</button>
        </div>
        
        <form @submit.prevent="handleTransferSubmit" class="examination-form">
          <div class="form-group">
            <label for="toMedicalStaffId">الطبيب المحول إليه *</label>
            <select 
              id="toMedicalStaffId" 
              v-model="transferForm.toMedicalStaffId" 
              required
              @change="onTransferDoctorChange"
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

          <div class="form-group">
            <label for="toStaffSectionsId">القسم المحول إليه *</label>
            <input 
              type="text" 
              id="toStaffSectionsId" 
              v-model="transferForm.toStaffSectionsId"
              readonly
            />
          </div>

          <div class="form-group">
            <label for="transferDescription">وصف التحويل</label>
            <textarea 
              id="transferDescription" 
              v-model="transferForm.description"
              rows="4"
              placeholder="أدخل سبب التحويل..."
            ></textarea>
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
              تحويل
            </button>
            <button type="button" class="cancel-button" @click="closeTransferModal">
              <i class="pi pi-times"></i>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <!-- Details Modal -->
<div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
  <div class="modal-content details-modal" @click.stop>
    <div class="modal-header">
      <h2>تفاصيل الفحص الطبي</h2>
      <button class="close-button" @click="closeDetailsModal">×</button>
    </div>
    <div class="details-content" v-if="selectedDiagnosis">
      <div class="details-section">
        <h3>معلومات المراجع</h3>
        <div class="info-row">
          <span class="label">الاسم:</span>
          <span class="value">{{ getReviewerName(selectedDiagnosis.reviewerId) }}</span>
        </div>
        <div class="info-row">
          <span class="label">رقم الحجز:</span>
          <span class="value">{{ selectedDiagnosis.reviewer.bookNumber }}</span>
        </div>
        <div class="info-row">
          <span class="label">تاريخ الحجز:</span>
          <span class="value">{{ formatDate(selectedDiagnosis.reviewer.bookDate) }}</span>
        </div>
      </div>

      <div class="details-section">
        <h3>معلومات الطبيب</h3>
        <div class="info-row">
          <span class="label">الطبيب:</span>
          <span class="value">{{ selectedDiagnosis.medicalStaff.user.firstName }} {{ selectedDiagnosis.medicalStaff.user.secondName }} {{ selectedDiagnosis.medicalStaff.user.thirdName }}</span>
        </div>
        <div class="info-row">
          <span class="label">التخصص:</span>
          <span class="value">{{ selectedDiagnosis.medicalStaff.specialization }}</span>
        </div>
        <div class="info-row">
          <span class="label">القسم:</span>
          <span class="value">{{ selectedDiagnosis.staffSections.sectionName }}</span>
        </div>
      </div>

      <div class="details-section">
        <h3>المعلومات الطبية</h3>
        <div class="info-row">
          <span class="label">ضغط الدم:</span>
          <span class="value">{{ selectedDiagnosis.bloodPressure || 'غير متوفر' }}</span>
        </div>
        <div class="info-row">
          <span class="label">الوزن:</span>
          <span class="value">{{ selectedDiagnosis.weight || 'غير متوفر' }}</span>
        </div>
        <div class="info-row">
          <span class="label">تشبع الأكسجين:</span>
          <span class="value">{{ selectedDiagnosis.oxygenSaturation || 'غير متوفر' }}</span>
        </div>
        <div class="info-row">
          <span class="label">درجة الحرارة:</span>
          <span class="value">{{ selectedDiagnosis.temperature || 'غير متوفر' }}</span>
        </div>
        <div class="info-row">
          <span class="label">النبض:</span>
          <span class="value">{{ selectedDiagnosis.pulse || 'غير متوفر' }}</span>
        </div>
      </div>

      <div class="details-section">
        <h3>التشخيص والملاحظات</h3>
        <div class="info-row">
          <span class="label">الأمراض المزمنة:</span>
          <span class="value">{{ selectedDiagnosis.chronicDiseases || 'لا يوجد' }}</span>
        </div>
        <div class="info-row">
          <span class="label">الأمراض المعدية:</span>
          <span class="value">{{ selectedDiagnosis.communicableDiseases || 'لا يوجد' }}</span>
        </div>
        <div class="info-row">
          <span class="label">الحساسية:</span>
          <span class="value">{{ selectedDiagnosis.allergies || 'لا يوجد' }}</span>
        </div>
        <div class="info-row">
          <span class="label">حساسية الأدوية:</span>
          <span class="value">{{ selectedDiagnosis.drugAllergies || 'لا يوجد' }}</span>
        </div>
        <div class="info-row">
          <span class="label">أمراض الجلد:</span>
          <span class="value">{{ selectedDiagnosis.skinDiseases || 'لا يوجد' }}</span>
        </div>
        <div class="info-row">
          <span class="label">محول إلى:</span>
          <span class="value">{{ selectedDiagnosis.referredToParty || 'غير محول' }}</span>
        </div>
        <div class="info-row">
          <span class="label">ملاحظات:</span>
          <span class="value">{{ selectedDiagnosis.notes || 'لا توجد ملاحظات' }}</span>
        </div>
      </div>

      <div class="details-section">
        <h3>معلومات إضافية</h3>
        <div class="info-row">
          <span class="label">تاريخ الفحص:</span>
          <span class="value">{{ formatDate(selectedDiagnosis.createdAt) }}</span>
        </div>
        <div class="info-row">
          <span class="label">رقم الفحص:</span>
          <span class="value">{{ selectedDiagnosis.id }}</span>
        </div>
      </div>
    </div>
    <div class="form-actions">
      <button class="close-details-btn" @click="closeDetailsModal">إغلاق</button>
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
      showDetailsModal: false,
      showReplyModal: false,
      showDiagnosisModal: false,
      showTransferModal: false,
      selectedDiagnosis: null,
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
      replyFormData: {
        committeeMembersId: '',
        initialExaminationId: '',
        reply: '',
        replyImage: null
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
      successMessage: '',
      diagnosisForm: {
        initialDiagnosisId: '',
        medicalInputs: [],
        sectionInputs: [],
        file: null,
        fileDescription: ''
      },
      transferForm: {
        initialDiagnosisId: '',
        toMedicalStaffId: '',
        toStaffSectionsId: '',
        description: ''
      },
    }
  },

  methods: {
    viewDetails(diagnosis) {
      this.selectedDiagnosis = diagnosis;
      this.showDetailsModal = true;
    },

    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedDiagnosis = null;
    },

    showReplyModal(diagnosis) {
      this.selectedDiagnosis = diagnosis;
      this.replyFormData = {
        committeeMembersId: '',
        initialExaminationId: diagnosis.id,
        reply: '',
        replyImage: null
      };
      this.showReplyModal = true;
    },

    closeReplyModal() {
      this.showReplyModal = false;
      this.selectedDiagnosis = null;
      this.replyFormData = {
        committeeMembersId: '',
        initialExaminationId: '',
        reply: '',
        replyImage: null
      };
      this.errorMessage = '';
      this.successMessage = '';
    },

    handleReplyImageChange(event) {
      this.replyFormData.replyImage = event.target.files[0];
    },

    async handleReplySubmit() {
      try {
        this.errorMessage = '';
        this.successMessage = '';
        this.loading = true;

        const formData = new FormData();
        formData.append('CommitteeMembersId', this.replyFormData.committeeMembersId);
        formData.append('InitialExaminationId', this.replyFormData.initialExaminationId);
        formData.append('Reply', this.replyFormData.reply);
        if (this.replyFormData.replyImage) {
          formData.append('ReplyImage', this.replyFormData.replyImage);
        }

        await this.$axios.post('/CommitteeReply/AddCommitteeReply', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        this.successMessage = 'تم إضافة رد اللجنة بنجاح';
        this.closeReplyModal();
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ رد اللجنة';
      } finally {
        this.loading = false;
      }
    },

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

    openDiagnosisModal(diagnosis) {
      this.selectedDiagnosis = diagnosis;
      this.diagnosisForm = {
        initialDiagnosisId: diagnosis.id,
        medicalInputs: [],
        sectionInputs: [],
        file: null,
        fileDescription: ''
      };
      this.showDiagnosisModal = true;
    },

    closeDiagnosisModal() {
      this.showDiagnosisModal = false;
      this.selectedDiagnosis = null;
      this.diagnosisForm = {
        initialDiagnosisId: '',
        medicalInputs: [],
        sectionInputs: [],
        file: null,
        fileDescription: ''
      };
      this.errorMessage = '';
      this.successMessage = '';
    },

    addMedicalInput() {
      this.diagnosisForm.medicalInputs.push({
        privateMedicalStaffInputId: '',
        value: ''
      });
    },

    removeMedicalInput(index) {
      this.diagnosisForm.medicalInputs.splice(index, 1);
    },

    addSectionInput() {
      this.diagnosisForm.sectionInputs.push({
        privateSectionInputId: '',
        value: ''
      });
    },

    removeSectionInput(index) {
      this.diagnosisForm.sectionInputs.splice(index, 1);
    },

    handleDiagnosisFileChange(event) {
      this.diagnosisForm.file = event.target.files[0];
    },

    async handleDiagnosisSubmit() {
      try {
        this.errorMessage = '';
        this.successMessage = '';
        this.loading = true;

        const formData = new FormData();
        formData.append('InitialDiagnosisId', this.diagnosisForm.initialDiagnosisId);
        formData.append('MedicalInputs', JSON.stringify(this.diagnosisForm.medicalInputs));
        formData.append('SectionInputs', JSON.stringify(this.diagnosisForm.sectionInputs));
        if (this.diagnosisForm.file) {
          formData.append('File', this.diagnosisForm.file);
        }
        formData.append('FileDes', this.diagnosisForm.fileDescription);

        await this.$axios.post('/MedicalStaff/SubmitDiagnosisInputs', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        this.successMessage = 'تم حفظ التشخيص بنجاح';
        this.closeDiagnosisModal();
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ التشخيص';
      } finally {
        this.loading = false;
      }
    },

    openTransferModal(diagnosis) {
      this.selectedDiagnosis = diagnosis;
      this.transferForm = {
        initialDiagnosisId: diagnosis.id,
        toMedicalStaffId: '',
        toStaffSectionsId: '',
        description: ''
      };
      this.showTransferModal = true;
    },

    closeTransferModal() {
      this.showTransferModal = false;
      this.selectedDiagnosis = null;
      this.transferForm = {
        initialDiagnosisId: '',
        toMedicalStaffId: '',
        toStaffSectionsId: '',
        description: ''
      };
      this.errorMessage = '';
      this.successMessage = '';
    },

    onTransferDoctorChange() {
      const selectedDoctor = this.medicalStaff.find(staff => staff.id === this.transferForm.toMedicalStaffId);
      if (selectedDoctor) {
        this.transferForm.toStaffSectionsId = selectedDoctor.staffSectionsId;
      }
    },

    async handleTransferSubmit() {
      try {
        this.errorMessage = '';
        this.successMessage = '';
        this.loading = true;

        await this.$axios.post('/DiagnosisRouting/TransferDiagnosis', this.transferForm);

        this.successMessage = 'تم تحويل التشخيص بنجاح';
        this.closeTransferModal();
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'حدث خطأ أثناء تحويل التشخيص';
      } finally {
        this.loading = false;
      }
    },
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

/* Add Examination Button */
.add-examination-button {
  margin-bottom: 1.5rem;
  text-align: left;
}

.add-btn {
  padding: 0.8rem 1.5rem;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-btn:hover {
  background-color: #34495e;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 1.5rem;
  background-color: #3498db;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.card-header .date {
  font-size: 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.card-content {
  padding: 1.5rem;
  background-color: #ffffff;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  margin-bottom: 0;
  font-size: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s ease;
  align-items: flex-start;
}

.info-row:hover {
  background-color: #f1f3f5;
  transform: translateX(5px);
}

.label {
  font-weight: 600;
  color: #2c3e50;
  margin-left: 1rem;
  min-width: 120px;
  border-right: 2px solid #e0e0e0;
  padding-right: 1rem;
}

.value {
  color: #34495e;
  flex: 1;
  padding-right: 1rem;
  line-height: 1.5;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.card-actions button {
  flex: 1;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-actions button i {
  font-size: 1rem;
}

.card-actions button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* View Button */
.view-btn {
  background-color: #3498db;
}

.view-btn:hover {
  background-color: #2980b9;
}

/* Reply Button */
.reply-btn {
  background-color: #2ecc71;
}

.reply-btn:hover {
  background-color: #27ae60;
}

/* Diagnosis Button */
.diagnosis-btn {
  background-color: #9b59b6;
}

.diagnosis-btn:hover {
  background-color: #8e44ad;
}

/* Transfer Button */
.transfer-btn {
  background-color: #e67e22;
}

.transfer-btn:hover {
  background-color: #d35400;
}

/* Form Action Buttons */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.submit-button,
.cancel-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-button {
  background-color: #2c3e50;
  color: white;
}

.submit-button:hover {
  background-color: #34495e;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.submit-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.cancel-button {
  background-color: #e74c3c;
  color: white;
}

.cancel-button:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #e74c3c;
}

/* Form Styles */
.examination-form {
  display: grid;
  gap: 20px;
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

input, textarea, select {
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

textarea {
  resize: vertical;
  min-height: 100px;
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

/* Loading Skeleton */
.loading-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 2rem;
}

.skeleton-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 300px;
}

.skeleton-header {
  height: 80px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-content {
  padding: 1.5rem;
}

.skeleton-line {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  margin-bottom: 1rem;
  border-radius: 4px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  }
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .info-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .label {
    border-right: none;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 0.5rem;
    margin-left: 0;
    min-width: 100%;
  }

  .value {
    padding-right: 0;
  }

  .card-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-actions button {
    width: 100%;
  }
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.input-group input {
  flex: 1;
}

.remove-btn {
  padding: 8px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.remove-btn:hover {
  background-color: #c0392b;
}

.add-input-btn {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.add-input-btn:hover {
  background-color: #2980b9;
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