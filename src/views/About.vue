<template>
  <div class="about-page">
    <Card>
      <template #title>About Hospital Information System</template>
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="mb-4">
              <h3 class="text-xl font-bold mb-2">System Overview</h3>
              <p class="text-gray-700">
                Our Hospital Information System (HIS) is a comprehensive solution designed to streamline hospital operations,
                improve patient care, and enhance overall efficiency. The system integrates various aspects of hospital
                management including patient records, appointments, billing, and staff management.
              </p>
            </div>

            <div class="mb-4">
              <h3 class="text-xl font-bold mb-2">Key Features</h3>
              <ul class="list-disc pl-4 text-gray-700">
                <li>Electronic Health Records (EHR)</li>
                <li>Appointment Scheduling</li>
                <li>Patient Management</li>
                <li>Billing and Invoicing</li>
                <li>Staff Management</li>
                <li>Reporting and Analytics</li>
              </ul>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="mb-4">
              <h3 class="text-xl font-bold mb-2">Contact Information</h3>
              <div class="flex flex-column gap-2 text-gray-700">
                <div class="flex align-items-center">
                  <i class="pi pi-map-marker mr-2"></i>
                  <span>123 Hospital Street, Medical City</span>
                </div>
                <div class="flex align-items-center">
                  <i class="pi pi-phone mr-2"></i>
                  <span>+1 234 567 8900</span>
                </div>
                <div class="flex align-items-center">
                  <i class="pi pi-envelope mr-2"></i>
                  <span>info@hospital.com</span>
                </div>
              </div>
            </div>

            <div class="mb-4">
              <h3 class="text-xl font-bold mb-2">Support Hours</h3>
              <div class="text-gray-700">
                <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 2:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <h3 class="text-xl font-bold mb-2">System Version</h3>
          <div class="flex align-items-center gap-2">
            <Tag value="v1.0.0" severity="info" />
            <span class="text-gray-500">Last updated: April 2024</span>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from 'primevue/card'
import Tag from 'primevue/tag'
</script>

<style scoped>
.about-page {
  padding: 1rem;
}

.grid {
  display: grid;
  gap: 1rem;
}

.col-12 {
  grid-column: span 12;
}

@media (min-width: 768px) {
  .md\:col-6 {
    grid-column: span 6;
  }
}
</style> 