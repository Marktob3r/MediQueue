-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles Table (for role-based access control)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'staff', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id VARCHAR(50) UNIQUE,
  specialization VARCHAR(100),
  department VARCHAR(100),
  days_available VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id VARCHAR(50) UNIQUE,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  blood_type VARCHAR(10),
  allergies TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services Table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  estimated_duration_minutes INT DEFAULT 15,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queue Status Enum
CREATE TYPE queue_status AS ENUM ('waiting', 'in_service', 'completed', 'cancelled', 'no_show');

-- Patient Queues Table
CREATE TABLE IF NOT EXISTS public.patient_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  assigned_staff_id UUID REFERENCES staff(id),
  queue_number INT,
  status queue_status DEFAULT 'waiting',
  check_in_time TIMESTAMP WITH TIME ZONE,
  service_start_time TIMESTAMP WITH TIME ZONE,
  service_end_time TIMESTAMP WITH TIME ZONE,
  estimated_wait_time_minutes INT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical History Table
CREATE TABLE IF NOT EXISTS public.medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
  service_id UUID REFERENCES services(id),
  staff_id UUID REFERENCES staff(id),
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  prescription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queue Settings/Configuration Table
CREATE TABLE IF NOT EXISTS public.queue_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name VARCHAR(255),
  max_queue_length INT DEFAULT 50,
  estimated_service_time_minutes INT DEFAULT 15,
  operating_hours_start TIME,
  operating_hours_end TIME,
  buffer_time_minutes INT DEFAULT 5,
  enable_notifications BOOLEAN DEFAULT TRUE,
  notification_methods VARCHAR(100) DEFAULT 'sms,email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Table
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_patients_served INT DEFAULT 0,
  total_queue_time_minutes INT DEFAULT 0,
  average_wait_time_minutes INT DEFAULT 0,
  no_show_count INT DEFAULT 0,
  service_id UUID REFERENCES services(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, service_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  queue_id UUID REFERENCES patient_queues(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_staff_user_id ON public.staff(user_id);
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patient_queues_patient_id ON public.patient_queues(patient_id);
CREATE INDEX idx_patient_queues_service_id ON public.patient_queues(service_id);
CREATE INDEX idx_patient_queues_status ON public.patient_queues(status);
CREATE INDEX idx_medical_history_patient_id ON public.medical_history(patient_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_analytics_date ON public.analytics(date);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read/update their own profile
CREATE POLICY "users_can_read_own_profile" ON public.user_profiles
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "users_can_update_own_profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid()::uuid = user_id);

-- User Roles: Users can read their own role, admins can read all
CREATE POLICY "users_can_read_own_role" ON public.user_roles
  FOR SELECT USING (auth.uid()::uuid = user_id OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()::uuid AND ur.role = 'admin'
    ));

-- Staff: Staff and admins can read, staff can update their own
CREATE POLICY "staff_can_read_staff_data" ON public.staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()::uuid AND ur.role IN ('staff', 'admin')
    ));

CREATE POLICY "staff_can_update_own_data" ON public.staff
  FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Patients: Patients can read own, staff/admins read all
CREATE POLICY "patients_can_read_own_data" ON public.patients
  FOR SELECT USING (
    auth.uid()::uuid = user_id OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()::uuid AND ur.role IN ('staff', 'admin')
    ));

CREATE POLICY "patients_can_update_own_data" ON public.patients
  FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Patient Queues: Patients can read own, staff/admins read all
CREATE POLICY "patients_can_read_own_queue" ON public.patient_queues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_id AND p.user_id = auth.uid()::uuid
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()::uuid AND ur.role IN ('staff', 'admin')
    ));

-- Medical History: Patients read own, staff/admins read all
CREATE POLICY "patients_can_read_own_history" ON public.medical_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.id = patient_id AND p.user_id = auth.uid()::uuid
    ) OR
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()::uuid AND ur.role IN ('staff', 'admin')
    ));

-- Notifications: Users can read their own
CREATE POLICY "users_can_read_own_notifications" ON public.notifications
  FOR SELECT USING (auth.uid()::uuid = user_id);

-- Analytics: Staff and admins can read
CREATE POLICY "staff_can_read_analytics" ON public.analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()::uuid AND ur.role IN ('staff', 'admin')
    ));
