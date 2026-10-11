/**
 * Admin Library - Supabase Integration
 * Handles authentication, sessions, and data operations
 */

let supabase = null;

// Initialize Supabase client
async function initSupabase() {
  if (supabase) return supabase;

  // Try to load from config file
  if (typeof SUPABASE_CONFIG !== 'undefined') {
    const { createClient } = window.supabase;
    supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    return supabase;
  }

  throw new Error('Supabase configuration not found. Please create supabase-config.js');
}

// Check if admin is logged in
async function checkAdminSession() {
  try {
    const sb = await initSupabase();
    const { data } = await sb.auth.getSession();
    return data?.session ? data.session : null;
  } catch (error) {
    console.error('Session check error:', error);
    return null;
  }
}

// Redirect to login if not authenticated
async function requireAdminAuth() {
  const session = await checkAdminSession();
  if (!session) {
    window.location.href = 'admin-login.html';
    return false;
  }
  return session;
}

// Admin sign up (only for initial setup)
async function adminSignUp(email, password) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'admin' }
      }
    });

    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Admin sign in
async function adminSignIn(email, password) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });

    if (error) throw error;
    return { success: true, session: data.session };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Admin sign out
async function adminSignOut() {
  try {
    const sb = await initSupabase();
    await sb.auth.signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Password reset request
async function requestPasswordReset(email) {
  try {
    const sb = await initSupabase();
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/admin-reset-password.html'
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update password
async function updatePassword(newPassword) {
  try {
    const sb = await initSupabase();
    const { error } = await sb.auth.updateUser({ password: newPassword });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get current user
async function getCurrentUser() {
  try {
    const sb = await initSupabase();
    const { data } = await sb.auth.getUser();
    return data?.user || null;
  } catch (error) {
    return null;
  }
}

// ===== APPOINTMENTS =====
async function getAppointments(filters = {}) {
  try {
    const sb = await initSupabase();
    let query = sb.from('appointments').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.therapist_id) {
      query = query.eq('therapist_id', filters.therapist_id);
    }
    if (filters.date) {
      query = query.eq('appointment_date', filters.date);
    }

    const { data, error } = await query.order('appointment_date', { ascending: true });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createAppointment(appointmentData) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.from('appointments').insert([appointmentData]).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateAppointment(appointmentId, updateData) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteAppointment(appointmentId) {
  try {
    const sb = await initSupabase();
    const { error } = await sb.from('appointments').delete().eq('id', appointmentId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== INQUIRIES =====
async function getInquiries(filters = {}) {
  try {
    const sb = await initSupabase();
    let query = sb.from('inquiries').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createInquiry(inquiryData) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.from('inquiries').insert([inquiryData]).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateInquiry(inquiryId, updateData) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb
      .from('inquiries')
      .update(updateData)
      .eq('id', inquiryId)
      .select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteInquiry(inquiryId) {
  try {
    const sb = await initSupabase();
    const { error } = await sb.from('inquiries').delete().eq('id', inquiryId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== THERAPISTS =====
async function getTherapists() {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.from('therapists').select('*').order('name');
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createTherapist(therapistData) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.from('therapists').insert([therapistData]).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateTherapist(therapistId, updateData) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb
      .from('therapists')
      .update(updateData)
      .eq('id', therapistId)
      .select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteTherapist(therapistId) {
  try {
    const sb = await initSupabase();
    const { error } = await sb.from('therapists').delete().eq('id', therapistId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== SERVICES =====
async function getServices() {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.from('services').select('*').order('name');
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createService(serviceData) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.from('services').insert([serviceData]).select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateService(serviceId, updateData) {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb
      .from('services')
      .update(updateData)
      .eq('id', serviceId)
      .select();
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteService(serviceId) {
  try {
    const sb = await initSupabase();
    const { error } = await sb.from('services').delete().eq('id', serviceId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== BUSINESS SETTINGS =====
async function getBusinessSettings() {
  try {
    const sb = await initSupabase();
    const { data, error } = await sb.from('business_settings').select('*').single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, data: null };
  }
}

async function updateBusinessSettings(settingsData) {
  try {
    const sb = await initSupabase();
    const { data: existing } = await sb.from('business_settings').select('id').single();

    if (existing) {
      const { data, error } = await sb
        .from('business_settings')
        .update(settingsData)
        .eq('id', existing.id)
        .select();
      if (error) throw error;
      return { success: true, data: data[0] };
    } else {
      const { data, error } = await sb.from('business_settings').insert([settingsData]).select();
      if (error) throw error;
      return { success: true, data: data[0] };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ===== STATISTICS =====
async function getDashboardStats() {
  try {
    const sb = await initSupabase();

    // Get counts
    const [appointments, inquiries, therapists, services] = await Promise.all([
      sb.from('appointments').select('*', { count: 'exact', head: true }),
      sb.from('inquiries').select('*', { count: 'exact', head: true }),
      sb.from('therapists').select('*', { count: 'exact', head: true }),
      sb.from('services').select('*', { count: 'exact', head: true })
    ]);

    // Get upcoming appointments
    const today = new Date().toISOString().split('T')[0];
    const { data: upcomingApts } = await sb
      .from('appointments')
      .select('*')
      .gte('appointment_date', today)
      .limit(5)
      .order('appointment_date');

    // Get pending inquiries
    const { data: pendingInq } = await sb
      .from('inquiries')
      .select('*')
      .eq('status', 'new')
      .limit(5)
      .order('created_at', { ascending: false });

    return {
      success: true,
      data: {
        totalAppointments: appointments.count || 0,
        totalInquiries: inquiries.count || 0,
        totalTherapists: therapists.count || 0,
        totalServices: services.count || 0,
        upcomingAppointments: upcomingApts || [],
        pendingInquiries: pendingInq || []
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
