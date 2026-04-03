import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Clock,
  Users,
  Bell,
  ChevronRight,
  Plus,
  FileText,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Stethoscope,
} from "lucide-react";

// PLACEHOLDER: All data below should come from actual API calls
// Replace MOCK_* constants with real data fetched from your backend

const MOCK_PATIENT_NAME = "Juan";

// PLACEHOLDER: Fetch from GET /api/patient/active-queue
const MOCK_ACTIVE_QUEUE = {
  token: "A-052",
  service: "General Consultation",
  doctor: "Dr. Maria Santos", // PLACEHOLDER: actual doctor name from staff API
  joinedAt: "9:15 AM",
  currentlyServing: 47,
  totalAhead: 5,
  estimatedWait: 25, // minutes — from AI estimation engine
  progress: 72, // percentage of queue completed
};

// PLACEHOLDER: Fetch from GET /api/patient/visit-history
const MOCK_RECENT_VISITS = [
  {
    id: "V-2025-001",
    date: "March 15, 2025",
    doctor: "Dr. Maria Santos",
    service: "General Consultation",
    diagnosis: "Upper Respiratory Tract Infection",
    status: "completed",
  },
  {
    id: "V-2025-002",
    date: "February 28, 2025",
    doctor: "Dr. Juan Reyes",
    service: "Follow-up Check",
    diagnosis: "Hypertension Monitoring",
    status: "completed",
  },
  {
    id: "V-2025-003",
    date: "January 10, 2025",
    doctor: "Dr. Maria Santos",
    service: "General Consultation",
    diagnosis: "Acute Gastroenteritis",
    status: "completed",
  },
];

// PLACEHOLDER: Fetch from GET /api/notifications for this patient
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "queue",
    title: "Your turn is approaching!",
    message: "Only 5 patients ahead. Please make your way to the clinic.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    type: "reminder",
    title: "Prescription Reminder",
    message: "Remember to take your Amoxicillin 500mg at 12:00 PM.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: 3,
    type: "record",
    title: "Medical Record Updated",
    message: "Your visit record from March 15 has been finalized.",
    time: "2 days ago",
    read: true,
  },
];

const quickActions = [
  {
    icon: Plus,
    label: "Join Today's Queue",
    desc: "Get a queue token now",
    path: "/patient/queue/join",
    color: "bg-gradient-to-br from-green-500 to-emerald-600",
    textColor: "text-white",
  },
  {
    icon: Clock,
    label: "Live Queue Monitor",
    desc: "Watch real-time queue",
    path: "/patient/queue/monitor",
    color: "bg-gradient-to-br from-blue-50 to-indigo-50",
    textColor: "text-blue-700",
    border: "border border-blue-100",
  },
  {
    icon: FileText,
    label: "Medical History",
    desc: "View past visits & records",
    path: "/patient/medical-history",
    color: "bg-gradient-to-br from-amber-50 to-orange-50",
    textColor: "text-amber-700",
    border: "border border-amber-100",
  },
  {
    icon: Calendar,
    label: "Settings",
    desc: "Update your profile",
    path: "/patient/settings",
    color: "bg-gradient-to-br from-purple-50 to-violet-50",
    textColor: "text-purple-700",
    border: "border border-purple-100",
  },
];

const notifIconMap: Record<string, React.ElementType> = {
  queue: Bell,
  reminder: AlertCircle,
  record: CheckCircle,
};

const notifColorMap: Record<string, string> = {
  queue: "bg-green-100 text-green-600",
  reminder: "bg-yellow-100 text-yellow-600",
  record: "bg-blue-100 text-blue-600",
};

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [hasActiveQueue] = useState(true); // PLACEHOLDER: from auth/queue context

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Good morning, {MOCK_PATIENT_NAME}! 👋
        </h1>
        {/* PLACEHOLDER: Dynamic greeting based on time of day */}
        <p className="text-gray-500 mt-1">
          Here's your health dashboard for today, {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.
        </p>
      </motion.div>

      {/* Active Queue Card */}
      {hasActiveQueue && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/5 rounded-full translate-y-8" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-200" />
                  <span className="text-sm font-semibold text-green-100">Active Queue Token</span>
                </div>
                {/* PLACEHOLDER: Real-time status from WebSocket connection */}
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Live
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-green-200 text-xs uppercase tracking-widest mb-1">Your Token</p>
                  {/* PLACEHOLDER: Actual token from queue API */}
                  <p className="text-6xl font-black leading-none">{MOCK_ACTIVE_QUEUE.token}</p>
                  <p className="text-green-200 text-sm mt-2">
                    {MOCK_ACTIVE_QUEUE.service} · {MOCK_ACTIVE_QUEUE.doctor}
                  </p>
                </div>
                <div className="text-right space-y-3">
                  <div>
                    <p className="text-green-200 text-xs">Currently Serving</p>
                    {/* PLACEHOLDER: Real-time number from queue engine */}
                    <p className="text-3xl font-black">#{MOCK_ACTIVE_QUEUE.currentlyServing}</p>
                  </div>
                  <div>
                    <p className="text-green-200 text-xs">Ahead of You</p>
                    {/* PLACEHOLDER: Live countdown from queue API */}
                    <p className="text-3xl font-black">{MOCK_ACTIVE_QUEUE.totalAhead}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-sm text-green-200 mb-1.5">
                  <span>Est. Wait: ~{MOCK_ACTIVE_QUEUE.estimatedWait} min</span>
                  <span>Joined at {MOCK_ACTIVE_QUEUE.joinedAt}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${MOCK_ACTIVE_QUEUE.progress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="bg-white h-2.5 rounded-full"
                  />
                </div>
                <p className="text-xs text-green-200 mt-1">{MOCK_ACTIVE_QUEUE.progress}% of today's queue completed</p>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => navigate("/patient/queue/monitor")}
                  className="flex-1 bg-white text-green-700 font-bold py-2.5 rounded-2xl text-sm hover:bg-green-50 transition-colors"
                >
                  Track Live Queue
                </button>
                {/* PLACEHOLDER: Cancel queue API endpoint */}
                <button className="flex-1 bg-white/20 text-white font-semibold py-2.5 rounded-2xl text-sm hover:bg-white/30 transition-colors border border-white/30">
                  Cancel Queue
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(action.path)}
              className={`${action.color} ${action.border || ""} ${action.textColor} rounded-3xl p-5 text-left shadow-sm hover:shadow-md transition-all`}
            >
              <action.icon className="w-7 h-7 mb-3" />
              <p className="font-bold text-sm">{action.label}</p>
              <p className={`text-xs mt-0.5 ${i === 0 ? "text-green-100" : "opacity-70"}`}>{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Visits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-900">Recent Visits</h3>
              </div>
              <button
                onClick={() => navigate("/patient/medical-history")}
                className="text-xs text-green-600 font-semibold hover:text-green-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {/* PLACEHOLDER: Replace with actual patient visit history from EMR API */}
              {MOCK_RECENT_VISITS.map((visit, i) => (
                <motion.div
                  key={visit.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate("/patient/medical-history")}
                >
                  <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{visit.service}</p>
                    <p className="text-xs text-gray-500 truncate">{visit.doctor} · {visit.date}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{visit.diagnosis}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    Done
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-900">Notifications</h3>
              </div>
              {/* PLACEHOLDER: Unread count from notification API */}
              <span className="text-xs font-bold text-white bg-red-500 w-5 h-5 rounded-full flex items-center justify-center">
                {MOCK_NOTIFICATIONS.filter((n) => !n.read).length}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {MOCK_NOTIFICATIONS.map((notif, i) => {
                const Icon = notifIconMap[notif.type];
                const colorClass = notifColorMap[notif.type];
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? "bg-green-50/50" : ""}`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 ${colorClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold ${!notif.read ? "text-gray-900" : "text-gray-600"}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mt-0.5">{notif.message}</p>
                        <p className="text-xs text-gray-300 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Health Tip */}
          {/* PLACEHOLDER: Pull daily health tips from CMS or static content */}
          <div className="mt-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-5 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Health Tip</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {/* PLACEHOLDER: Rotate these tips daily or personalize based on patient medical history */}
              Drink at least 8 glasses of water daily and get 7–8 hours of sleep to support your immune system. 💧
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
