import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  LayoutDashboard,
  Clock,
  FileText,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

// PLACEHOLDER: Replace with actual logged-in patient data from auth context
const MOCK_PATIENT = {
  name: "Juan dela Cruz",
  email: "juan@email.com",
  patientId: "P-2025-0042",
  // PLACEHOLDER: token from real queue API
  hasActiveQueue: true,
  queueToken: "A-052",
};

const navItems = [
  { path: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/patient/queue/monitor", icon: Clock, label: "Live Queue" },
  { path: "/patient/queue/join", icon: FileText, label: "Join Queue" },
  { path: "/patient/medical-history", icon: FileText, label: "Medical History" },
  { path: "/patient/settings", icon: Settings, label: "Settings" },
];

export default function PatientLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // PLACEHOLDER: Replace with real notification count from notification API
  const notifCount = 2;

  const handleLogout = () => {
    // PLACEHOLDER: Clear auth tokens/session before navigating
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── SIDEBAR ── */}
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-100 shadow-xl z-40 flex flex-col lg:translate-x-0 lg:static lg:shadow-none"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-green-700 text-lg leading-none">MediQueue</p>
                <p className="text-xs text-gray-400 leading-none mt-0.5">Patient Portal</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Patient Info */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                {/* PLACEHOLDER: Use patient's actual profile photo */}
                {MOCK_PATIENT.name[0]}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{MOCK_PATIENT.name}</p>
                <p className="text-xs text-gray-500 truncate">{MOCK_PATIENT.patientId}</p>
              </div>
            </div>
            {/* Active queue token badge */}
            {MOCK_PATIENT.hasActiveQueue && (
              <div className="mt-3 flex items-center justify-between bg-white rounded-xl px-3 py-2 shadow-sm">
                <div>
                  <p className="text-xs text-gray-400">Active Token</p>
                  <p className="font-black text-green-600 text-lg">{MOCK_PATIENT.queueToken}</p>
                </div>
                {/* PLACEHOLDER: Real-time queue status from API */}
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  In Queue
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
                  active
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-gray-400 group-hover:text-green-600"}`} />
                <span className="text-sm font-semibold">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-2xl text-gray-500 hover:bg-green-50 hover:text-green-600 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block">
            <h2 className="font-bold text-gray-900">
              {navItems.find((n) => n.path === location.pathname)?.label || "Patient Portal"}
            </h2>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* PLACEHOLDER: Connect to real notification system */}
            <button className="relative p-2.5 rounded-2xl bg-gray-50 hover:bg-green-50 text-gray-500 hover:text-green-600 transition-all">
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {MOCK_PATIENT.name[0]}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
