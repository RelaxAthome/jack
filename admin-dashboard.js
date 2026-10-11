/**
 * Admin Dashboard JavaScript - All functionality
 */

let currentAppointmentId = null;
let currentInquiryId = null;
let currentServiceId = null;
let currentTherapistId = null;
let currentFilterStatus = 'all';
let currentInquiryFilter = 'all';

// Initialize on page load
window.addEventListener('load', async () => {
  const session = await requireAdminAuth();
  if (!session) return;

  const user = await getCurrentUser();
  if (user) {
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('accountEmail').textContent = user.email;
  }

  // Load initial data
  loadDashboardData();
});

// Show/Hide pages
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Remove active from nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Show selected page
  document.getElementById(pageName).classList.add('active');
  event.target.classList.add('active');

  // Load data based on page
  if (pageName === 'dashboard') {
    loadDashboardData();
  } else if (pageName === 'appointments') {
    loadAppointments();
  } else if (pageName === 'inquiries') {
    loadInquiries();
  } else if (pageName === 'services') {
    loadServices();
  } else if (pageName === 'therapists') {
    loadTherapists();
  } else if (pageName === 'settings') {
    loadBusinessSettings();
  }
}

// Dashboard
async function loadDashboardData() {
  const result = await getDashboardStats();
  if (result.success) {
    const { data } = result;
    document.getElementById('totalAppointments').textContent = data.totalAppointments;
    document.getElementById('totalInquiries').textContent = data.totalInquiries;
    document.getElementById('totalTherapists').textContent = data.totalTherapists;
    document.getElementById('totalServices').textContent = data.totalServices;

    // Load upcoming appointments
    if (data.upcomingAppointments.length > 0) {
      const tbody = document.getElementById('upcomingBody');
      tbody.innerHTML = data.upcomingAppointments.map(apt => `
        <tr>
          <td>${apt.customer_name}</td>
          <td>${apt.service}</td>
          <td>${new Date(apt.appointment_date).toLocaleDateString()} ${apt.appointment_time}</td>
          <td>${apt.therapist_assigned || '-'}</td>
          <td><span class="status-badge status-${apt.status}">${apt.status}</span></td>
        </tr>
      `).join('');
    } else {
      document.getElementById('upcomingBody').innerHTML = '<tr><td colspan="5" class="no-data">No upcoming appointments</td></tr>';
    }

    // Load pending inquiries
    if (data.pendingInquiries.length > 0) {
      const tbody = document.getElementById('pendingBody');
      tbody.innerHTML = data.pendingInquiries.map(inq => `
        <tr>
          <td>${inq.name}</td>
          <td>${inq.email}</td>
          <td>${inq.subject}</td>
          <td>${new Date(inq.created_at).toLocaleDateString()}</td>
          <td><button class="btn btn-primary" onclick="openInquiry('${inq.id}')">View</button></td>
        </tr>
      `).join('');
    } else {
      document.getElementById('pendingBody').innerHTML = '<tr><td colspan="5" class="no-data">No pending inquiries</td></tr>';
    }
  }
}

// Appointments
async function loadAppointments() {
  const result = await getAppointments(currentFilterStatus !== 'all' ? { status: currentFilterStatus } : {});
  if (result.success) {
    const tbody = document.getElementById('appointmentsBody');
    if (result.data.length > 0) {
      tbody.innerHTML = result.data.map(apt => `
        <tr>
          <td>${apt.customer_name}</td>
          <td>${apt.customer_phone}</td>
          <td>${apt.service}</td>
          <td>${new Date(apt.appointment_date).toLocaleDateString()} ${apt.appointment_time}</td>
          <td>${apt.therapist_assigned || '-'}</td>
          <td><span class="status-badge status-${apt.status}">${apt.status}</span></td>
          <td>
            <div class="btn-group">
              <button class="btn btn-secondary" onclick="editAppointment('${apt.id}')">Edit</button>
              <button class="btn btn-danger" onclick="deleteAppointment('${apt.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="7" class="no-data">No appointments found</td></tr>';
    }
  }
}

function filterAppointments(status) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  currentFilterStatus = status;
  loadAppointments();
}

function openAddAppointmentModal() {
  currentAppointmentId = null;
  document.getElementById('appointmentModalTitle').textContent = 'Add Appointment';
  document.getElementById('appointmentForm').reset();
  loadServiceOptions();
  loadTherapistOptions();
  document.getElementById('appointmentModal').classList.add('active');
}

async function editAppointment(id) {
  // Fetch appointment and populate form
  const result = await getAppointments({ id });
  if (result.success && result.data.length > 0) {
    const apt = result.data[0];
    currentAppointmentId = id;
    document.getElementById('appointmentModalTitle').textContent = 'Edit Appointment';
    document.getElementById('apptCustomerName').value = apt.customer_name;
    document.getElementById('apptPhone').value = apt.customer_phone;
    document.getElementById('apptEmail').value = apt.customer_email || '';
    document.getElementById('apptService').value = apt.service;
    document.getElementById('apptDuration').value = apt.duration || '';
    document.getElementById('apptDate').value = apt.appointment_date;
    document.getElementById('apptTime').value = apt.appointment_time;
    document.getElementById('apptTherapist').value = apt.therapist_assigned || '';
    document.getElementById('apptStatus').value = apt.status;
    document.getElementById('apptNotes').value = apt.notes || '';
    loadServiceOptions();
    loadTherapistOptions();
    document.getElementById('appointmentModal').classList.add('active');
  }
}

async function saveAppointment(event) {
  event.preventDefault();
  const appointmentData = {
    customer_name: document.getElementById('apptCustomerName').value,
    customer_phone: document.getElementById('apptPhone').value,
    customer_email: document.getElementById('apptEmail').value,
    service: document.getElementById('apptService').value,
    duration: document.getElementById('apptDuration').value,
    appointment_date: document.getElementById('apptDate').value,
    appointment_time: document.getElementById('apptTime').value,
    therapist_assigned: document.getElementById('apptTherapist').value,
    status: document.getElementById('apptStatus').value,
    notes: document.getElementById('apptNotes').value
  };

  let result;
  if (currentAppointmentId) {
    result = await updateAppointment(currentAppointmentId, appointmentData);
  } else {
    result = await createAppointment(appointmentData);
  }

  if (result.success) {
    showMessage('appointmentsMessage', '✓ Appointment saved successfully', 'success');
    closeModal('appointmentModal');
    loadAppointments();
  } else {
    showMessage('appointmentsMessage', 'Error: ' + result.error, 'error');
  }
}

async function deleteAppointment(id) {
  if (!confirm('Are you sure you want to delete this appointment?')) return;
  const result = await deleteAppointment(id);
  if (result.success) {
    showMessage('appointmentsMessage', '✓ Appointment deleted', 'success');
    loadAppointments();
  } else {
    showMessage('appointmentsMessage', 'Error: ' + result.error, 'error');
  }
}

// Inquiries
async function loadInquiries() {
  const result = await getInquiries(currentInquiryFilter !== 'all' ? { status: currentInquiryFilter } : {});
  if (result.success) {
    const tbody = document.getElementById('inquiriesBody');
    if (result.data.length > 0) {
      tbody.innerHTML = result.data.map(inq => `
        <tr>
          <td>${inq.name}</td>
          <td>${inq.email}</td>
          <td>${inq.phone}</td>
          <td>${inq.subject}</td>
          <td>${new Date(inq.created_at).toLocaleDateString()}</td>
          <td><span class="status-badge status-${inq.status}">${inq.status}</span></td>
          <td>
            <div class="btn-group">
              <button class="btn btn-primary" onclick="openInquiry('${inq.id}')">View</button>
              <button class="btn btn-danger" onclick="deleteInquiry('${inq.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="7" class="no-data">No inquiries found</td></tr>';
    }
  }
}

function filterInquiries(status) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  currentInquiryFilter = status;
  loadInquiries();
}

function openInquiry(id) {
  currentInquiryId = id;
  const result = getInquiries({ id });
  result.then(res => {
    if (res.success && res.data.length > 0) {
      const inq = res.data[0];
      const details = `
        <div style="margin-bottom: 20px;">
          <p><strong>From:</strong> ${inq.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${inq.email}">${inq.email}</a></p>
          <p><strong>Phone:</strong> <a href="tel:${inq.phone}">${inq.phone}</a></p>
          <p><strong>Subject:</strong> ${inq.subject}</p>
          <p><strong>Date:</strong> ${new Date(inq.created_at).toLocaleString()}</p>
          <p><strong>Status:</strong> <span class="status-badge status-${inq.status}">${inq.status}</span></p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background: #f6f5f0; padding: 15px; border-radius: 6px;">${inq.message}</p>
        </div>
      `;
      document.getElementById('inquiryDetails').innerHTML = details;
      document.getElementById('inquiryModal').classList.add('active');
    }
  });
}

async function markInquiryAsResponded() {
  const result = await updateInquiry(currentInquiryId, { status: 'responded' });
  if (result.success) {
    showMessage('inquiriesMessage', '✓ Marked as responded', 'success');
    closeModal('inquiryModal');
    loadInquiries();
  } else {
    showMessage('inquiriesMessage', 'Error: ' + result.error, 'error');
  }
}

async function deleteCurrentInquiry() {
  if (!confirm('Are you sure you want to delete this inquiry?')) return;
  const result = await deleteInquiry(currentInquiryId);
  if (result.success) {
    showMessage('inquiriesMessage', '✓ Inquiry deleted', 'success');
    closeModal('inquiryModal');
    loadInquiries();
  } else {
    showMessage('inquiriesMessage', 'Error: ' + result.error, 'error');
  }
}

async function deleteInquiry(id) {
  if (!confirm('Are you sure you want to delete this inquiry?')) return;
  const result = await deleteInquiry(id);
  if (result.success) {
    showMessage('inquiriesMessage', '✓ Inquiry deleted', 'success');
    loadInquiries();
  } else {
    showMessage('inquiriesMessage', 'Error: ' + result.error, 'error');
  }
}

// Services
async function loadServices() {
  const result = await getServices();
  if (result.success) {
    const tbody = document.getElementById('servicesBody');
    if (result.data.length > 0) {
      tbody.innerHTML = result.data.map(svc => `
        <tr>
          <td>${svc.name}</td>
          <td>${svc.description}</td>
          <td>${svc.duration || '-'}</td>
          <td>₹${svc.price || 0}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-secondary" onclick="editService('${svc.id}')">Edit</button>
              <button class="btn btn-danger" onclick="deleteService('${svc.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="no-data">No services found</td></tr>';
    }
  }
}

function openAddServiceModal() {
  currentServiceId = null;
  document.getElementById('serviceModalTitle').textContent = 'Add Service';
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceModal').classList.add('active');
}

async function editService(id) {
  const result = await getServices();
  if (result.success) {
    const svc = result.data.find(s => s.id === id);
    if (svc) {
      currentServiceId = id;
      document.getElementById('serviceModalTitle').textContent = 'Edit Service';
      document.getElementById('serviceName').value = svc.name;
      document.getElementById('serviceDescription').value = svc.description;
      document.getElementById('serviceDuration').value = svc.duration || '';
      document.getElementById('servicePrice').value = svc.price || 0;
      document.getElementById('serviceModal').classList.add('active');
    }
  }
}

async function saveService(event) {
  event.preventDefault();
  const serviceData = {
    name: document.getElementById('serviceName').value,
    description: document.getElementById('serviceDescription').value,
    duration: document.getElementById('serviceDuration').value,
    price: parseFloat(document.getElementById('servicePrice').value)
  };

  let result;
  if (currentServiceId) {
    result = await updateService(currentServiceId, serviceData);
  } else {
    result = await createService(serviceData);
  }

  if (result.success) {
    showMessage('servicesMessage', '✓ Service saved successfully', 'success');
    closeModal('serviceModal');
    loadServices();
  } else {
    showMessage('servicesMessage', 'Error: ' + result.error, 'error');
  }
}

async function deleteService(id) {
  if (!confirm('Are you sure you want to delete this service?')) return;
  const result = await deleteService(id);
  if (result.success) {
    showMessage('servicesMessage', '✓ Service deleted', 'success');
    loadServices();
  } else {
    showMessage('servicesMessage', 'Error: ' + result.error, 'error');
  }
}

// Therapists
async function loadTherapists() {
  const result = await getTherapists();
  if (result.success) {
    const tbody = document.getElementById('therapistsBody');
    if (result.data.length > 0) {
      tbody.innerHTML = result.data.map(th => `
        <tr>
          <td>${th.name}</td>
          <td>${th.gender}</td>
          <td>${th.specialization}</td>
          <td>${th.phone}</td>
          <td><span class="status-badge status-${th.status}">${th.status}</span></td>
          <td>
            <div class="btn-group">
              <button class="btn btn-secondary" onclick="editTherapist('${th.id}')">Edit</button>
              <button class="btn btn-danger" onclick="deleteTherapist('${th.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="6" class="no-data">No therapists found</td></tr>';
    }
  }
}

function openAddTherapistModal() {
  currentTherapistId = null;
  document.getElementById('therapistModalTitle').textContent = 'Add Therapist';
  document.getElementById('therapistForm').reset();
  document.getElementById('therapistModal').classList.add('active');
}

async function editTherapist(id) {
  const result = await getTherapists();
  if (result.success) {
    const th = result.data.find(t => t.id === id);
    if (th) {
      currentTherapistId = id;
      document.getElementById('therapistModalTitle').textContent = 'Edit Therapist';
      document.getElementById('therapistName').value = th.name;
      document.getElementById('therapistGender').value = th.gender;
      document.getElementById('therapistPhone').value = th.phone;
      document.getElementById('therapistSpecialization').value = th.specialization;
      document.getElementById('therapistStatus').value = th.status;
      document.getElementById('therapistModal').classList.add('active');
    }
  }
}

async function saveTherapist(event) {
  event.preventDefault();
  const therapistData = {
    name: document.getElementById('therapistName').value,
    gender: document.getElementById('therapistGender').value,
    phone: document.getElementById('therapistPhone').value,
    specialization: document.getElementById('therapistSpecialization').value,
    status: document.getElementById('therapistStatus').value
  };

  let result;
  if (currentTherapistId) {
    result = await updateTherapist(currentTherapistId, therapistData);
  } else {
    result = await createTherapist(therapistData);
  }

  if (result.success) {
    showMessage('therapistsMessage', '✓ Therapist saved successfully', 'success');
    closeModal('therapistModal');
    loadTherapists();
  } else {
    showMessage('therapistsMessage', 'Error: ' + result.error, 'error');
  }
}

async function deleteTherapist(id) {
  if (!confirm('Are you sure you want to delete this therapist?')) return;
  const result = await deleteTherapist(id);
  if (result.success) {
    showMessage('therapistsMessage', '✓ Therapist deleted', 'success');
    loadTherapists();
  } else {
    showMessage('therapistsMessage', 'Error: ' + result.error, 'error');
  }
}

// Business Settings
async function loadBusinessSettings() {
  const result = await getBusinessSettings();
  if (result.success && result.data) {
    document.getElementById('businessName').value = result.data.business_name || 'RelaxAtHome';
    document.getElementById('businessHours').value = result.data.business_hours || '10:00 AM - 11:00 PM';
    document.getElementById('serviceAreas').value = (result.data.service_areas || []).join(', ');
    document.getElementById('maxAppointments').value = result.data.max_appointments_per_day || 20;
  }
}

async function updateBusinessSettings(event) {
  event.preventDefault();
  const settingsData = {
    business_name: document.getElementById('businessName').value,
    business_hours: document.getElementById('businessHours').value,
    service_areas: document.getElementById('serviceAreas').value.split(',').map(a => a.trim()),
    max_appointments_per_day: parseInt(document.getElementById('maxAppointments').value)
  };

  const result = await updateBusinessSettings(settingsData);
  if (result.success) {
    showMessage('settingsMessage', '✓ Settings saved successfully', 'success');
  } else {
    showMessage('settingsMessage', 'Error: ' + result.error, 'error');
  }
}

// Account
async function openChangePasswordModal() {
  document.getElementById('changePasswordModal').classList.add('active');
}

async function changePassword(event) {
  event.preventDefault();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmNewPassword').value;

  if (newPassword !== confirmPassword) {
    showMessage('accountMessage', 'Passwords do not match', 'error');
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    showMessage('accountMessage', 'Password must be at least 8 characters with uppercase, lowercase, and number', 'error');
    return;
  }

  const result = await updatePassword(newPassword);
  if (result.success) {
    showMessage('accountMessage', '✓ Password changed successfully', 'success');
    closeModal('changePasswordModal');
  } else {
    showMessage('accountMessage', 'Error: ' + result.error, 'error');
  }
}

// Helper functions
async function loadServiceOptions() {
  const result = await getServices();
  if (result.success) {
    const select = document.getElementById('apptService');
    select.innerHTML = '<option value="">Select a service</option>' +
      result.data.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
  }
}

async function loadTherapistOptions() {
  const result = await getTherapists();
  if (result.success) {
    const select = document.getElementById('apptTherapist');
    select.innerHTML = '<option value="">Not assigned</option>' +
      result.data.map(t => `<option value="${t.name}">${t.name} (${t.gender})</option>`).join('');
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function showMessage(elementId, text, type) {
  const el = document.getElementById(elementId);
  el.innerHTML = text;
  el.className = `message show ${type}`;
  setTimeout(() => {
    el.classList.remove('show');
  }, 5000);
}

async function logout() {
  if (!confirm('Are you sure you want to logout?')) return;
  const result = await adminSignOut();
  if (result.success) {
    location.href = 'admin-login.html';
  }
}
