import { supabase } from "../config/supabase";

// ==================== QUEUE OPERATIONS ====================

export const queueService = {
  // Create new queue entry for patient
  async createQueueEntry(patientId: string, serviceId: string) {
    const { data, error } = await supabase
      .from("patient_queues")
      .insert({
        patient_id: patientId,
        service_id: serviceId,
        status: "waiting",
        check_in_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all queues
  async getAllQueues() {
    const { data, error } = await supabase
      .from("patient_queues")
      .select(
        `
        *,
        patients(id, user_id),
        services(name, description),
        staff(id, user_id)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get current patient queue
  async getPatientQueue(patientId: string) {
    const { data, error } = await supabase
      .from("patient_queues")
      .select(
        `
        *,
        services(name, description, estimated_duration_minutes),
        staff(id, user_id)
      `
      )
      .eq("patient_id", patientId)
      .in("status", ["waiting", "in_service"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  // Update queue status
  async updateQueueStatus(queueId: string, status: string) {
    const { data, error } = await supabase
      .from("patient_queues")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
        ...(status === "in_service" && {
          service_start_time: new Date().toISOString(),
        }),
        ...(status === "completed" && {
          service_end_time: new Date().toISOString(),
        }),
      })
      .eq("id", queueId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Assign staff to queue
  async assignStaffToQueue(queueId: string, staffId: string) {
    const { data, error } = await supabase
      .from("patient_queues")
      .update({
        assigned_staff_id: staffId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", queueId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get queue stats
  async getQueueStats(serviceId?: string) {
    let query = supabase
      .from("patient_queues")
      .select("status", { count: "exact" });

    if (serviceId) {
      query = query.eq("service_id", serviceId);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      total: count || 0,
      waiting: data?.filter((q) => q.status === "waiting").length || 0,
      inService:
        data?.filter((q) => q.status === "in_service").length || 0,
      completed:
        data?.filter((q) => q.status === "completed").length || 0,
    };
  },
};

// ==================== PATIENT OPERATIONS ====================

export const patientService = {
  // Create patient record
  async createPatient(userId: string, patientData: any) {
    const { data, error } = await supabase
      .from("patients")
      .insert({
        user_id: userId,
        emergency_contact_name: patientData.emergencyContactName,
        emergency_contact_phone: patientData.emergencyContactPhone,
        blood_type: patientData.bloodType,
        allergies: patientData.allergies,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get patient details
  async getPatientByUserId(userId: string) {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  // Update patient details
  async updatePatient(patientId: string, patientData: any) {
    const { data, error } = await supabase
      .from("patients")
      .update({
        emergency_contact_name: patientData.emergencyContactName,
        emergency_contact_phone: patientData.emergencyContactPhone,
        blood_type: patientData.bloodType,
        allergies: patientData.allergies,
        updated_at: new Date().toISOString(),
      })
      .eq("id", patientId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get patient medical history
  async getPatientHistory(patientId: string) {
    const { data, error } = await supabase
      .from("medical_history")
      .select(
        `
        *,
        services(name, description),
        staff(user_id)
      `
      )
      .eq("patient_id", patientId)
      .order("visit_date", { ascending: false });

    if (error) throw error;
    return data;
  },
};

// ==================== MEDICAL HISTORY OPERATIONS ====================

export const medicalHistoryService = {
  // Create medical history entry
  async createHistoryEntry(historyData: any) {
    const { data, error } = await supabase
      .from("medical_history")
      .insert({
        patient_id: historyData.patientId,
        visit_date: historyData.visitDate || new Date().toISOString(),
        service_id: historyData.serviceId,
        staff_id: historyData.staffId,
        diagnosis: historyData.diagnosis,
        treatment: historyData.treatment,
        notes: historyData.notes,
        prescription: historyData.prescription,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get history by patient
  async getHistoryByPatient(patientId: string, limit = 50) {
    const { data, error } = await supabase
      .from("medical_history")
      .select(
        `
        *,
        services(name),
        staff(id, user_id)
      `
      )
      .eq("patient_id", patientId)
      .order("visit_date", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Update history entry
  async updateHistoryEntry(historyId: string, historyData: any) {
    const { data, error } = await supabase
      .from("medical_history")
      .update({
        diagnosis: historyData.diagnosis,
        treatment: historyData.treatment,
        notes: historyData.notes,
        prescription: historyData.prescription,
        updated_at: new Date().toISOString(),
      })
      .eq("id", historyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ==================== STAFF OPERATIONS ====================

export const staffService = {
  // Get all staff
  async getAllStaff() {
    const { data, error } = await supabase
      .from("staff")
      .select(
        `
        *,
        user_profiles(first_name, last_name, phone)
      `
      )
      .eq("is_active", true);

    if (error) throw error;
    return data;
  },

  // Get staff by ID
  async getStaffById(staffId: string) {
    const { data, error } = await supabase
      .from("staff")
      .select(
        `
        *,
        user_profiles(first_name, last_name, phone, email)
      `
      )
      .eq("id", staffId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  // Create staff record
  async createStaff(userId: string, staffData: any) {
    const { data, error } = await supabase
      .from("staff")
      .insert({
        user_id: userId,
        specialization: staffData.specialization,
        department: staffData.department,
        days_available: staffData.daysAvailable,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ==================== SERVICES OPERATIONS ====================

export const servicesService = {
  // Get all services
  async getAllServices() {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Create service
  async createService(serviceData: any) {
    const { data, error } = await supabase
      .from("services")
      .insert({
        name: serviceData.name,
        description: serviceData.description,
        estimated_duration_minutes: serviceData.estimatedDuration,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ==================== USER PROFILE OPERATIONS ====================

export const userProfileService = {
  // Create user profile
  async createUserProfile(userId: string, profileData: any) {
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        user_id: userId,
        email: profileData.email,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        date_of_birth: profileData.dateOfBirth,
        gender: profileData.gender,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        postal_code: profileData.postalCode,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  },

  // Update user profile
  async updateUserProfile(userId: string, profileData: any) {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        postal_code: profileData.postalCode,
        date_of_birth: profileData.dateOfBirth,
        gender: profileData.gender,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// ==================== ANALYTICS OPERATIONS ====================

export const analyticsService = {
  // Get daily stats
  async getDailyStats(date: Date = new Date()) {
    const dateStr = date.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .eq("date", dateStr);

    if (error) throw error;
    return data || null;
  },

  // Get stats by service
  async getStatsByService(serviceId: string, startDate: Date, endDate: Date) {
    const { data, error } = await supabase
      .from("analytics")
      .select("*")
      .eq("service_id", serviceId)
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
  },
};

// ==================== NOTIFICATIONS OPERATIONS ====================

export const notificationService = {
  // Create notification
  async createNotification(
    userId: string,
    notificationData: any
  ) {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        queue_id: notificationData.queueId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user notifications
  async getUserNotifications(userId: string, unreadOnly = false) {
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;
    return data;
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
