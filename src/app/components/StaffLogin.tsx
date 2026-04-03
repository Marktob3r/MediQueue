import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Activity, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, Users } from "lucide-react";

// PLACEHOLDER: Replace with actual clinic branding
const CLINIC_NAME = "Samuel P. Dizon Medical Clinic";

// PLACEHOLDER: Staff/Admin authentication should go through a secure backend
// Connect to POST /api/auth/staff-login with role-based access control (RBAC)
// Roles: "staff" → Staff Dashboard, "admin" → Admin Dashboard

export default function StaffLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [error, setError] = useState("");

  // PLACEHOLDER: Replace with real API call to POST /api/auth/staff-login
  // Response should include: { token, refreshToken, role, user: { name, staffId, department } }
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 1500));

    setLoading(false);

    // PLACEHOLDER: Use the role from JWT response to redirect accordingly
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/staff/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-green-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white font-medium text-sm bg-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Staff & Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">{CLINIC_NAME}</p>
          {/* PLACEHOLDER: Show clinic operating date/shift from system config */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400 font-semibold">Secure Access · Authorized Personnel Only</span>
          </div>
        </div>

        {/* Role Selector */}
        <div className="flex gap-2 mb-5">
          {(["staff", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
                role === r
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              {r === "staff" ? <Users className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              {r === "staff" ? "Clinic Staff" : "Administrator"}
            </button>
          ))}
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl">
          {role === "admin" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 mb-5 flex items-start gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                {/* PLACEHOLDER: Administrator login requires 2FA — connect to /api/auth/2fa-verify */}
                Administrator accounts have full system access. Ensure you're using your
                official admin credentials. 2-Factor Authentication may be required.
              </p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {role === "staff" ? "Staff" : "Admin"} Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  // PLACEHOLDER: Use institutional email format (e.g., staff@spdizon-clinic.ph)
                  placeholder={role === "staff" ? "staff@spdizon-clinic.ph" : "admin@spdizon-clinic.ph"}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-300">Password</label>
                {/* PLACEHOLDER: Staff password reset via IT admin — not self-service */}
                <button type="button" className="text-xs text-green-400 hover:text-green-300 font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-2xl"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                `Sign In as ${role === "staff" ? "Clinic Staff" : "Administrator"}`
              )}
            </motion.button>
          </form>
        </div>

        {/* Patient link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Are you a patient?{" "}
          <button
            onClick={() => navigate("/patient/login")}
            className="text-green-400 font-semibold hover:text-green-300"
          >
            Patient Login →
          </button>
        </p>

        <p className="text-center text-xs text-gray-600 mt-4">
          {/* PLACEHOLDER: Replace with actual system version from deployment config */}
          MediQueue v1.0.0 · Unauthorized access is strictly prohibited
        </p>
      </motion.div>
    </div>
  );
}
