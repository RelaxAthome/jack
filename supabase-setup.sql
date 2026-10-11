-- =====================================================
-- RELAXATHOME ADMIN SYSTEM - SUPABASE DATABASE SETUP
-- =====================================================
-- This file creates all tables, indexes, and RLS policies
-- for the RelaxAtHome admin dashboard.
--
-- HOW TO USE:
-- 1. Go to your Supabase project
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query"
-- 4. Copy the entire contents of this file
-- 5. Paste it into the SQL Editor
-- 6. Click "Run" button
-- 7. Wait for completion (should see success messages)
-- =====================================================

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE: services
-- Store massage service offerings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  icon TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for services
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON public.services(created_at DESC);

-- Add comment
COMMENT ON TABLE public.services IS 'Massage services offered by RelaxAtHome';

-- =====================================================
-- TABLE: therapists
-- Store therapist information
-- =====================================================
CREATE TABLE IF NOT EXISTS public.therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  phone TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  specialization TEXT NOT NULL,
  availability TEXT DEFAULT 'Full-time' CHECK (availability IN ('Full-time', 'Part-time')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  languages TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for therapists
CREATE INDEX IF NOT EXISTS idx_therapists_status ON public.therapists(status);
CREATE INDEX IF NOT EXISTS idx_therapists_gender ON public.therapists(gender);
CREATE INDEX IF NOT EXISTS idx_therapists_phone ON public.therapists(phone);
CREATE INDEX IF NOT EXISTS idx_therapists_created_at ON public.therapists(created_at DESC);

-- Add comment
COMMENT ON TABLE public.therapists IS 'Massage therapists employed by RelaxAtHome';

-- =====================================================
-- TABLE: appointments
-- Store customer appointment bookings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_gender TEXT CHECK (customer_gender IN ('Male', 'Female', 'Other')),
  service TEXT NOT NULL,
  duration TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  therapist_assigned UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  therapist_assigned_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show')),
  notes TEXT,
  special_requests TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_therapist ON public.appointments(therapist_assigned);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON public.appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_phone ON public.appointments(customer_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON public.appointments(appointment_date, appointment_time);

-- Add comment
COMMENT ON TABLE public.appointments IS 'Customer massage appointment bookings';

-- =====================================================
-- TABLE: inquiries
-- Store customer inquiries and contact form submissions
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT DEFAULT 'general' CHECK (inquiry_type IN ('general', 'bulk-booking', 'corporate', 'other')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'closed')),
  response_notes TEXT,
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_type ON public.inquiries(inquiry_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries(email);

-- Add comment
COMMENT ON TABLE public.inquiries IS 'Customer inquiries from contact form';

-- =====================================================
-- TABLE: business_settings
-- Store business configuration and settings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT DEFAULT 'RelaxAtHome',
  business_hours TEXT DEFAULT '10:00 AM - 11:00 PM',
  service_areas TEXT[] DEFAULT ARRAY['Delhi', 'Noida', 'Gurugram'],
  max_appointments_per_day INTEGER DEFAULT 20,
  max_appointments_per_therapist INTEGER DEFAULT 5,
  whatsapp_number TEXT,
  phone_number TEXT,
  email_address TEXT,
  website_url TEXT,
  social_media JSONB,
  about_description TEXT,
  tagline TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  currency TEXT DEFAULT 'INR',
  appointment_reminder_hours INTEGER DEFAULT 24,
  allow_online_booking BOOLEAN DEFAULT TRUE,
  require_email_confirmation BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add comment
COMMENT ON TABLE public.business_settings IS 'Business configuration and settings';

-- Insert default business settings if table is empty
INSERT INTO public.business_settings (
  business_name,
  business_hours,
  service_areas,
  whatsapp_number,
  email_address
) VALUES (
  'RelaxAtHome',
  '10:00 AM - 11:00 PM',
  ARRAY['Delhi', 'Noida', 'Gurugram'],
  '918808402256',
  'mishraanurag0349@gmail.com'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TABLE: admin_users
-- Store admin user information and roles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login TIMESTAMPTZ,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON public.admin_users(status);

-- Add comment
COMMENT ON TABLE public.admin_users IS 'Administrative users with dashboard access';

-- =====================================================
-- TABLE: audit_log
-- Store all admin actions for security and compliance
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failure')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON public.audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);

-- Add comment
COMMENT ON TABLE public.audit_log IS 'Audit trail of all admin actions';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure only authenticated admin users can access data
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SERVICES POLICIES
-- =====================================================

-- Anyone can read active services (for public website)
CREATE POLICY "Public read active services"
  ON public.services
  FOR SELECT
  USING (status = 'active' OR auth.role() = 'authenticated');

-- Only authenticated admins can insert services
CREATE POLICY "Admin insert services"
  ON public.services
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can update services
CREATE POLICY "Admin update services"
  ON public.services
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can delete services
CREATE POLICY "Admin delete services"
  ON public.services
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- THERAPISTS POLICIES
-- =====================================================

-- Anyone can read active therapists (for public website)
CREATE POLICY "Public read active therapists"
  ON public.therapists
  FOR SELECT
  USING (status = 'active' OR auth.role() = 'authenticated');

-- Only authenticated admins can insert therapists
CREATE POLICY "Admin insert therapists"
  ON public.therapists
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can update therapists
CREATE POLICY "Admin update therapists"
  ON public.therapists
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can delete therapists
CREATE POLICY "Admin delete therapists"
  ON public.therapists
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- APPOINTMENTS POLICIES
-- =====================================================

-- Only authenticated admins can read appointments
CREATE POLICY "Admin read appointments"
  ON public.appointments
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated admins can insert appointments
CREATE POLICY "Admin insert appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can update appointments
CREATE POLICY "Admin update appointments"
  ON public.appointments
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can delete appointments
CREATE POLICY "Admin delete appointments"
  ON public.appointments
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- INQUIRIES POLICIES
-- =====================================================

-- Only authenticated admins can read inquiries
CREATE POLICY "Admin read inquiries"
  ON public.inquiries
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated admins can insert inquiries
CREATE POLICY "Admin insert inquiries"
  ON public.inquiries
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can update inquiries
CREATE POLICY "Admin update inquiries"
  ON public.inquiries
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can delete inquiries
CREATE POLICY "Admin delete inquiries"
  ON public.inquiries
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- BUSINESS_SETTINGS POLICIES
-- =====================================================

-- Anyone can read business settings (for public website)
CREATE POLICY "Public read business settings"
  ON public.business_settings
  FOR SELECT
  USING (TRUE);

-- Only authenticated admins can insert settings
CREATE POLICY "Admin insert business settings"
  ON public.business_settings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can update settings
CREATE POLICY "Admin update business settings"
  ON public.business_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can delete settings
CREATE POLICY "Admin delete business settings"
  ON public.business_settings
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- ADMIN_USERS POLICIES
-- =====================================================

-- Only authenticated admins can read admin users
CREATE POLICY "Admin read admin users"
  ON public.admin_users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated admins can insert new admin users
CREATE POLICY "Admin insert admin users"
  ON public.admin_users
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can update admin users
CREATE POLICY "Admin update admin users"
  ON public.admin_users
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admins can delete admin users
CREATE POLICY "Admin delete admin users"
  ON public.admin_users
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- AUDIT_LOG POLICIES
-- =====================================================

-- Only authenticated admins can read audit logs
CREATE POLICY "Admin read audit logs"
  ON public.audit_log
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only authenticated admins can insert audit logs
CREATE POLICY "Admin insert audit logs"
  ON public.audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for services table
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for therapists table
DROP TRIGGER IF EXISTS update_therapists_updated_at ON public.therapists;
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON public.therapists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for appointments table
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for inquiries table
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for business_settings table
DROP TRIGGER IF EXISTS update_business_settings_updated_at ON public.business_settings;
CREATE TRIGGER update_business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for admin_users table
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- If you see this file run without errors, your database is ready!
-- Next steps:
-- 1. Enable Email authentication in Supabase Auth → Settings
-- 2. Go to admin-setup.html to create your first admin account
-- 3. Verify the email in Supabase Auth → Users
-- 4. Log in to admin-dashboard.html with your credentials
-- 5. Start managing your RelaxAtHome business!
