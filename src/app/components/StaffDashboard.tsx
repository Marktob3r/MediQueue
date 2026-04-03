import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Activity,
  UserPlus,
  SkipForward,
  X,
  Bell,
  FileText,
  Stethoscope,
  ArrowUp,
  MoreVertical,
  PlayCircle,
  PauseCircle,
} from "lucide-react";

// PLACEHOLDER: All data below comes from real-time API/WebSocket
// Connect to WebSocket ws:///ws/staff-queue for live updates
// REST fallback: GET /api/staff/queue/live

// PLACEHOLDER: Current queue state from real-time engine
const MOCK_QUEUE_STATS = {
  totalToday: 65,
  served: 47,
  waiting: 12,
  absent: 6, // no-shows
  currentlyServing: "A-048", // PLACEHOLDER: from queue engine
  avgWaitTime: 8.3, // minutes — from AI analytics
  peakHour: "10:00 AM", // PLACEHOLDER: AI-predicted peak from historical data
};

// PLACEHOLDER: Fetch from GET /api/staff/queue/active
// Sorted by queue order, flagged urgent cases first
const MOCK_ACTIVE_QUEUE = [
  {
    token: "A-048",
    name: "Maria Santos",
    age: 45,
    service: "General Consultation",
    chiefComplaint: "Persistent cough and fever",
    waitTime: "Now",
    status: "serving",
    urgent: false,
    joinedAt: "9:15 AM",
  },
  {
    token: "A-049",
    name: "Jose Reyes",
    age: 62,
    service: "Physical Check-up",
    chiefComplaint: "Chest pain and dizziness",
    waitTime: "8 min",
    status: "waiting",
    urgent: true, // PLACEHOLDER: Flag set by AI triage based on severity score ≥ 8
    joinedAt: "9:28 AM",
  },
  {
    token: "A-050",
    name: "Ana Cruz",
    age: 28,
    service: "Pediatrics",
    chiefComplaint: "Child with high fever 39.5°C",
    waitTime: "16 min",
    status: "waiting",
    urgent: false,
    joinedAt: "9:35 AM",
  },
  {
    token: "A-051",
    name: "Roberto Garcia",
    age: 55,
    service: "Vaccination",
    chiefComplaint: "Annual flu shot",
    waitTime: "22 min",
    status: "waiting",
    urgent: false,
    joinedAt: "9:42 AM",
  },
  {
    token: "A-052",
    name: "Juan dela Cruz",
    age: 34,
    service: "General Consultation",
    chiefComplaint: "Headache and body pain for 3 days",
    waitTime: "28 min",
    status: "waiting",
    urgent: false,
    joinedAt: "9:15 AM",
  },
  {
    token: "A-053",
    name: "Lita Torres",
    age: 71,
    service: "Follow-up",
    chiefComplaint: "Hypertension monitoring",
    waitTime: "33 min",
    status: "waiting",
    urgent: false,
    joinedAt: "9:55 AM",
  },
];

type Patient = (typeof MOCK_ACTIVE_QUEUE)[0];

const statusStyles: Record<string, string> = {
  serving: "bg-green-100 text-green-700",
  waiting: "bg-gray-100 text-gray-600",
  absent: "bg-red-100 text-red-600",
};

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState(MOCK_ACTIVE_QUEUE);
  const [queuePaused, setQueuePaused] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingToken, setCompletingToken] = useState("");

  // PLACEHOLDER: POST /api/staff/queue/call-next — triggers notification to next patient
  const handleCallNext = () => {
    // Simulate moving queue forward
    setQueue((prev) => {
      const updated = [...prev];
      const currentIdx = updated.findIndex((q) => q.status === "serving");
      if (currentIdx !== -1) updated[currentIdx].status = "done" as any;
      const nextIdx = updated.findIndex((q) => q.status === "waiting");
      if (nextIdx !== -1) updated[nextIdx].status = "serving";
      return updated;
    });
  };

  // PLACEHOLDER: PATCH /api/staff/queue/{token}/priority — moves patient to urgent priority
  const handlePriorityOverride = (token: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.token === token ? { ...q, urgent: true } : q))
    );
  };

  // PLACEHOLDER: PATCH /api/staff/queue/{token}/status — mark as absent/no-show
  const handleMarkAbsent = (token: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.token === token ? { ...q, status: "absent" as any } : q))
    );
  };

  // PLACEHOLDER: POST /api/staff/queue/{token}/complete — finalize visit, trigger EMR update
  const handleComplete = (token: string) => {
    setCompletingToken(token);
    setShowCompleteModal(true);
  };

  const stats = [
    { label: "Total Today", value: MOCK_QUEUE_STATS.totalToday, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Served", value: MOCK_QUEUE_STATS.served, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "Waiting", value: MOCK_QUEUE_STATS.waiting, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Absent", value: MOCK_QUEUE_STATS.absent, icon: X, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Staff Dashboard</h1>
          {/* PLACEHOLDER: Show actual shift info from staff schedule API */}
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            {" · "}Morning Shift
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* PLACEHOLDER: Connect to POST /api/staff/queue/toggle-pause */}
          <button
            onClick={() => setQueuePaused(!queuePaused)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
              queuePaused
                ? "bg-green-500 text-white shadow-md hover:bg-green-600"
                : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            {queuePaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
            {queuePaused ? "Resume Queue" : "Pause Queue"}
          </button>
          <button
            onClick={() => navigate("/staff/walkin")}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-4 py-2.5 rounded-2xl shadow-md text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Walk-in
          </button>
        </div>
      </div>

      {/* Queue Paused Alert */}
      <AnimatePresence>
        {queuePaused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center gap-3 mb-5"
          >
            <PauseCircle className="w-5 h-5 text-amber-500" />
            <p className="text-sm font-semibold text-amber-800">Queue is currently PAUSED — no new notifications will be sent to patients.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Current Patient + Queue */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Currently Serving Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-6 text-white shadow-xl sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-200 text-sm font-semibold">Currently Serving</span>
              {/* PLACEHOLDER: Real-time from WebSocket */}
              <span className="flex items-center gap-1.5 text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Live
              </span>
            </div>

            <p className="text-7xl font-black mb-2">
              {/* PLACEHOLDER: Real-time current token from queue engine */}
              {MOCK_QUEUE_STATS.currentlyServing}
            </p>

            {(() => {
              const current = queue.find((q) => q.status === "serving");
              return current ? (
                <div className="bg-white/15 rounded-2xl p-4 mb-4">
                  <p className="font-bold text-lg">{current.name}</p>
                  <p className="text-green-200 text-sm">{current.service}</p>
                  <p className="text-green-100 text-xs mt-1 italic">"{current.chiefComplaint}"</p>
                  <div className="flex gap-3 mt-3 text-xs text-green-200">
                    <span>Age: {current.age}</span>
                    <span>In at {current.joinedAt}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white/10 rounded-2xl p-4 mb-4 text-center text-green-200">
                  <p>No patient currently being served</p>
                </div>
              );
            })()}

            {/* Call Next */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCallNext}
              className="w-full bg-white text-green-700 font-bold py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-green-50 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
              Call Next Patient
            </motion.button>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="bg-white/10 rounded-2xl py-2">
                <p className="text-green-200 text-xs">Avg Wait</p>
                {/* PLACEHOLDER: AI-calculated average from analytics engine */}
                <p className="font-bold">{MOCK_QUEUE_STATS.avgWaitTime} min</p>
              </div>
              <div className="bg-white/10 rounded-2xl py-2">
                <p className="text-green-200 text-xs">In Queue</p>
                {/* PLACEHOLDER: Real count from queue API */}
                <p className="font-bold">{queue.filter((q) => q.status === "waiting").length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Queue List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-900">Active Queue</h3>
              </div>
              <span className="text-xs text-gray-400">
                {queue.filter((q) => q.status === "waiting").length} patients waiting
              </span>
            </div>

            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {/* PLACEHOLDER: Replace with paginated real-time data from GET /api/staff/queue/active */}
              {queue
                .filter((q) => q.status !== "done")
                .sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0))
                .map((patient, i) => (
                  <motion.div
                    key={patient.token}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors ${
                      patient.urgent ? "border-l-4 border-red-400 bg-red-50/30" : ""
                    }`}
                  >
                    {/* Token */}
                    <div
                      className={`w-14 text-center py-2 rounded-xl font-black text-sm flex-shrink-0 ${
                        patient.status === "serving"
                          ? "bg-green-500 text-white"
                          : patient.status === "absent"
                          ? "bg-red-100 text-red-500"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {patient.token}
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{patient.name}</p>
                        {patient.urgent && (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{patient.service} · Age {patient.age}</p>
                      <p className="text-xs text-gray-400 italic truncate mt-0.5">"{patient.chiefComplaint}"</p>
                    </div>

                    {/* Wait / Status */}
                    <div className="flex-shrink-0 text-right">
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[patient.status]}`}>
                        {patient.status === "serving" ? "Serving" : patient.status === "absent" ? "Absent" : patient.waitTime}
                      </span>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setSelectedPatient(selectedPatient?.token === patient.token ? null : patient)}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <AnimatePresence>
                        {selectedPatient?.token === patient.token && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl border border-gray-100 z-10 w-44 py-2 overflow-hidden"
                          >
                            {/* PLACEHOLDER: These trigger API calls to queue management endpoints */}
                            <button
                              onClick={() => { handlePriorityOverride(patient.token); setSelectedPatient(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                              Priority Override
                            </button>
                            <button
                              onClick={() => { setSelectedPatient(null); navigate("/staff/records"); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View Record
                            </button>
                            <button
                              onClick={() => { handleMarkAbsent(patient.token); setSelectedPatient(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Bell className="w-3.5 h-3.5" />
                              Mark Absent
                            </button>
                            {patient.status === "serving" && (
                              <button
                                onClick={() => { handleComplete(patient.token); setSelectedPatient(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-green-600 hover:bg-green-50 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Complete Visit
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Complete Visit Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCompleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Complete Visit?</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Mark token <strong>{completingToken}</strong> as completed.
                  This will update the patient's status in the EMR.
                </p>
              </div>
              {/* PLACEHOLDER: Doctor enters diagnosis, treatment, and prescription before completing */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  Quick Diagnosis / Notes (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter diagnosis, treatment notes, or referral..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {/* PLACEHOLDER: Connect to full EMR entry form at /staff/emr/{patientId} */}
                  Full EMR entry can be done from the Patient Records section.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // PLACEHOLDER: POST /api/staff/queue/{token}/complete with diagnosis notes
                    setShowCompleteModal(false);
                    handleCallNext();
                  }}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-2xl shadow-md text-sm"
                >
                  Complete & Next
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
