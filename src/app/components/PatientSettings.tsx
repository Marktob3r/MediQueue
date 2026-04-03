import { useState } from "react";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  Camera,
  Lock,
  Accessibility,
  LogOut,
  ChevronRight,
} from "lucide-react";

// PLACEHOLDER: Fetch from GET /api/patient/profile (authenticated)
const MOCK_PROFILE = {
  firstName: "Juan",
  lastName: "dela Cruz",
  email: "juan@email.com",
  phone: "+63 917 123 4567",
  address: "123 Rizal St., Quezon City",
  dateOfBirth: "1990-05-15",
  gender: "Male",
  bloodType: "O+",
  emergencyContact: "Maria dela Cruz",
  emergencyPhone: "+63 918 765 4321",
  profilePhoto: null, // PLACEHOLDER: URL to profile photo in Supabase Storage
};

// PLACEHOLDER: Fetch from GET /api/patient/notification-preferences
const MOCK_NOTIF_PREFS = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  notifyAt5: true,
  notifyAt2: true,
  queueUpdates: true,
  prescriptionReminders: true,
  appointmentReminders: true,
};

// PLACEHOLDER: Fetch from GET /api/patient/accessibility-settings
const MOCK_ACCESSIBILITY = {
  largeText: false,
  highContrast: false,
  reducedMotion: false,
};

export default function PatientSettings() {
  const [profile, setProfile] = useState(MOCK_PROFILE);
  const [notifPrefs, setNotifPrefs] = useState(MOCK_NOTIF_PREFS);
  const [accessibility, setAccessibility] = useState(MOCK_ACCESSIBILITY);
  const [activeTab, setActiveTab] = useState<"profile" | "notifications" | "security" | "accessibility">("profile");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "accessibility", label: "Accessibility", icon: Accessibility },
  ] as const;

  // PLACEHOLDER: Replace with actual PATCH /api/patient/profile API call
  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (val: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? "bg-green-500" : "bg-gray-200"}`}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Settings & Personal Details</h1>
        <p className="text-gray-500 text-sm">Manage your profile, preferences, and security settings.</p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Profile Photo */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Profile Photo</h3>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-md">
                  {/* PLACEHOLDER: Display actual profile photo from profile.profilePhoto URL */}
                  {profile.firstName[0]}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-green-500 rounded-full flex items-center justify-center shadow-md hover:bg-green-50 transition-colors">
                  {/* PLACEHOLDER: Trigger file upload to Supabase Storage */}
                  <Camera className="w-3.5 h-3.5 text-green-600" />
                </button>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{profile.firstName} {profile.lastName}</p>
                <p className="text-sm text-gray-500">{profile.email}</p>
                {/* PLACEHOLDER: Patient ID from auth context */}
                <p className="text-xs text-gray-400 mt-0.5">Patient ID: P-2025-0042</p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-5">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* PLACEHOLDER: All fields below should be saved to PATCH /api/patient/profile */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Last Name</label>
                <input
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Blood Type</label>
                <select
                  value={profile.bloodType}
                  onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bt) => (
                    <option key={bt}>{bt}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Home Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-5">Emergency Contact</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contact Name</label>
                <input
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={profile.emergencyPhone}
                    onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <SaveButton saving={saving} success={savedSuccess} onSave={handleSave} />
        </motion.div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {activeTab === "notifications" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-5">Notification Channels</h3>
            {/* PLACEHOLDER: Save to PATCH /api/patient/notification-preferences */}
            {[
              { key: "pushEnabled", label: "Browser Push Notifications", desc: "Get queue alerts directly in your browser" },
              { key: "emailEnabled", label: "Email Notifications", desc: `Send alerts to ${profile.email}` },
              { key: "smsEnabled", label: "SMS Notifications", desc: `Send SMS to ${profile.phone}` },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <Toggle
                  checked={notifPrefs[key as keyof typeof notifPrefs] as boolean}
                  onChange={(v) => setNotifPrefs({ ...notifPrefs, [key]: v })}
                />
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-5">Queue Alert Triggers</h3>
            {[
              { key: "notifyAt5", label: "Alert when 5 patients ahead", desc: "Get advance notice to head to the clinic" },
              { key: "notifyAt2", label: "Alert when 2 patients ahead", desc: "Final reminder — your turn is very soon!" },
              { key: "queueUpdates", label: "Queue status updates", desc: "Receive notifications on queue changes" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <Toggle
                  checked={notifPrefs[key as keyof typeof notifPrefs] as boolean}
                  onChange={(v) => setNotifPrefs({ ...notifPrefs, [key]: v })}
                />
              </div>
            ))}
          </div>

          <SaveButton saving={saving} success={savedSuccess} onSave={handleSave} />
        </motion.div>
      )}

      {/* ── SECURITY TAB ── */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2">Change Password</h3>
            <p className="text-xs text-gray-400 mb-5">
              {/* PLACEHOLDER: Connect to POST /api/auth/change-password */}
              Use a strong password with at least 8 characters including numbers and special characters.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <button onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <button onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all text-sm">
                Update Password
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6">
            <h3 className="font-bold text-red-600 mb-4">Danger Zone</h3>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Delete Account</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {/* PLACEHOLDER: Implement DELETE /api/patient/account with data retention policy */}
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-sm font-semibold hover:bg-red-100 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── ACCESSIBILITY TAB ── */}
      {activeTab === "accessibility" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2">Accessibility Options</h3>
            <p className="text-xs text-gray-400 mb-5">
              {/* PLACEHOLDER: Connect to PATCH /api/patient/accessibility-settings */}
              Customize your experience for better readability and usability.
            </p>
            {[
              { key: "largeText", label: "Large Text Mode", desc: "Increase font size across the entire portal" },
              { key: "highContrast", label: "High Contrast Mode", desc: "Enhance color contrast for better visibility" },
              { key: "reducedMotion", label: "Reduce Motion", desc: "Minimize animations and transitions" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <Toggle
                  checked={accessibility[key as keyof typeof accessibility]}
                  onChange={(v) => setAccessibility({ ...accessibility, [key]: v })}
                />
              </div>
            ))}
          </div>

          <SaveButton saving={saving} success={savedSuccess} onSave={handleSave} />
        </motion.div>
      )}
    </div>
  );
}

function SaveButton({
  saving,
  success,
  onSave,
}: {
  saving: boolean;
  success: boolean;
  onSave: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onSave}
      disabled={saving}
      className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all ${
        success
          ? "bg-emerald-500 text-white"
          : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
      } disabled:opacity-70`}
    >
      {saving ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Saving...
        </>
      ) : success ? (
        <>✓ Saved Successfully</>
      ) : (
        <>
          <Save className="w-4 h-4" /> Save Changes
        </>
      )}
    </motion.button>
  );
}
