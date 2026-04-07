# Supabase Integration Setup Guide

## ✅ Completed Implementations

### 1. **Supabase Client Configuration** (`src/config/supabase.ts`)
- Configured with your project URL and anon public key
- Ready to make API calls to Supabase

### 2. **Authentication Context** (`src/contexts/AuthContext.tsx`)
- **useAuth() Hook**: Access authentication state anywhere in the app
- **Features**:
  - User sign-up with email/password
  - User sign-in with email/password
  - User sign-out
  - Role detection (patient, staff, admin)
  - Real-time auth state management
  - Automatic role fetching from database

### 3. **Protected Routes** (`src/components/ProtectedRoute.tsx`)
- Wraps components to enforce authentication
- Role-based access control
- Loading states during auth checks
- Redirects unauthenticated users to login

### 4. **Database Services** (`src/services/database.ts`)
Complete service layer with utilities for:
- **Queue Management**: Create, read, update queue status, assign staff
- **Patient Management**: Create and manage patient records
- **Medical History**: Record and retrieve patient medical history
- **Staff Management**: Manage staff profiles and availability
- **Services**: Manage clinic services
- **User Profiles**: Handle user profile data
- **Analytics**: Track queue statistics
- **Notifications**: Send and manage notifications

### 5. **Updated Components**
- **PatientLogin.tsx**: Now uses Supabase auth with validation
- **StaffLogin.tsx**: Now uses Supabase auth with role-based redirect
- **App.tsx**: Wrapped with AuthProvider for app-wide auth context

---

## 🚀 Next Steps: Database Setup

### Step 1: Create Database Tables

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project: **efuevizodafndgiosxbr**
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy and paste the entire contents of `src/database/schema.sql`
6. Click **Run** to execute

This will create:
- `user_profiles` - User profile information
- `user_roles` - Role assignments (patient, staff, admin)
- `staff` - Staff-specific data
- `patients` - Patient-specific data
- `services` - Clinic services
- `patient_queues` - Queue management
- `medical_history` - Medical records
- `notifications` - Notification system
- `analytics` - Statistics and analytics
- `queue_settings` - System configuration

All tables have Row Level Security (RLS) enabled for data privacy.

### Step 2: Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email/Password** provider (should be enabled by default)
3. Go to **Authentication** → **Policies**
4. Verify Row Level Security policies are in place

### Step 3: Create Test Users

In **SQL Editor**, run:

```sql
-- Create a test patient user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'patient@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}'
);

-- Create user profile
INSERT INTO public.user_profiles (user_id, email, first_name, last_name, phone, created_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'patient@example.com', 'Juan', 'Patient', '09123456789', NOW());

-- Create patient record
INSERT INTO public.patients (user_id, emergency_contact_name, emergency_contact_phone, created_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'Maria Patient', '09987654321', NOW());

-- Assign patient role
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'patient', NOW());

-- Create a test staff user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'staff@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}'
);

-- Create staff profile
INSERT INTO public.user_profiles (user_id, email, first_name, last_name, phone, created_at)
VALUES ('22222222-2222-2222-2222-222222222222', 'staff@example.com', 'Dr. Juan', 'Doctor', '09111111111', NOW());

-- Create staff record
INSERT INTO public.staff (user_id, specialization, department, is_active, created_at)
VALUES ('22222222-2222-2222-2222-222222222222', 'General Medicine', 'Clinical', true, NOW());

-- Assign staff role
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES ('22222222-2222-2222-2222-222222222222', 'staff', NOW());
```

Now you can test login with:
- **Patient**: patient@example.com / password123
- **Staff**: staff@example.com / password123

---

## 📖 Usage Examples

### Using the Auth Hook

```typescript
import { useAuth } from "@/contexts/AuthContext";

export function MyComponent() {
  const { user, isAuthenticated, userRole, signIn, signOut } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <p>Role: {userRole}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Creating a Protected Route

```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminDashboard } from "@/components/AdminDashboard";

// Only accessible to authenticated users with admin role
<ProtectedRoute requiredRoles={["admin"]}>
  <AdminDashboard />
</ProtectedRoute>
```

### Using Database Services

```typescript
import { queueService, patientService } from "@/services/database";

// Join a queue
const queueEntry = await queueService.createQueueEntry(patientId, serviceId);

// Get patient's medical history
const history = await patientService.getPatientHistory(patientId);

// Update queue status
await queueService.updateQueueStatus(queueId, "in_service");
```

---

## 🔒 Security Features

### Row Level Security (RLS)
- Patients can only see their own data
- Staff can see patient data assigned to them
- Admins have full access

### Password Security
- Supabase handles password hashing and security
- Minimum 6 characters recommended

### Session Management
- JWT-based authentication
- Automatic session refresh
- Secure token storage in browser

---

## 📋 Updating Routes with Protected Access

Want to add role-based route protection? Update `src/app/routes.tsx`:

```typescript
import { ProtectedRoute } from "./components/ProtectedRoute";

{
  path: "/patient",
  element: (
    <ProtectedRoute requiredRoles={["patient"]}>
      <PatientLayout />
    </ProtectedRoute>
  ),
  // ... rest of route config
}

{
  path: "/admin",
  element: (
    <ProtectedRoute requiredRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  ),
}
```

---

## 🐛 Troubleshooting

**Login not working?**
- Check email/password are correct
- Verify the auth.users table has the user record
- Check RLS policies are not blocking access

**Role not loading?**
- Ensure user_roles table entry exists
- Check the user_id matches auth.users.id

**Database queries failing?**
- Verify RLS policies allow the operation
- Check your user role matches required permissions
- Review browser console for specific error messages

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Authentication Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database)

---

## ✨ Next Features to Implement

- [ ] Email verification on signup
- [ ] Password reset functionality
- [ ] Google OAuth integration
- [ ] SMS notifications
- [ ] Real-time queue updates with WebSockets
- [ ] File uploads for medical documents
- [ ] Email/SMS notifications

---

**Your Supabase integration is ready! 🎉**
