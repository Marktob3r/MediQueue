import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock,
  Users,
  Bell,
  RefreshCw,
  ChevronRight,
  Activity,
  TrendingUp,
  Volume2,
  Wifi,
  AlertCircle,
} from "lucide-react";

// PLACEHOLDER: All queue data below must come from a real-time source
// Suggested implementation: WebSocket connection to /ws/queue or polling GET /api/queue/live every 10s

// PLACEHOLDER: Replace with authenticated patient's token (from auth context)
const MY_TOKEN = "A-052";

// PLACEHOLDER: Fetch from GET /api/queue/current
const MOCK_QUEUE_STATE = {
  currentNumber: 47,
  totalToday: 65,
  lastUpdated: new Date(),
  // PLACEHOLDER: AI-generated average from historical data
  avgConsultTime: 8, // minutes per patient
};

// PLACEHOLDER: Fetch from GET /api/queue/list (paginated live queue)
const MOCK_QUEUE_LIST = [
  { token: "A-048", name: "M. Santos", service: "General Consultation", status: "serving", waitTime: "Now" },
  { token: "A-049", name: "J. Reyes", service: "Physical Check-up", status: "waiting", waitTime: "~8 min" },
  { token: "A-050", name: "A. Cruz", service: "Pediatrics", status: "waiting", waitTime: "~16 min" },
  { token: "A-051", name: "R. Garcia", service: "Vaccination", status: "waiting", waitTime: "~20 min" },
  { token: "A-052", name: "You", service: "General Consultation", status: "waiting", waitTime: "~25 min", isMe: true },
  { token: "A-053", name: "L. Torres", service: "Eye Consultation", status: "waiting", waitTime: "~33 min" },
  { token: "A-054", name: "M. Flores", service: "Prescription", status: "waiting", waitTime: "~38 min" },
  { token: "A-055", name: "C. Lopez", service: "General Consultation", status: "waiting", waitTime: "~44 min" },
];

// PLACEHOLDER: Fetch from GET /api/analytics/daily for today's stats
const MOCK_STATS = [
  { label: "Served Today", value: "47", icon: Users, color: "text-green-600 bg-green-50" },
  { label: "Remaining", value: "18", icon: Clock, color: "text-blue-600 bg-blue-50" },
  { label: "Avg Wait", value: "8 min", icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
  { label: "Ahead of You", value: "4", icon: Activity, color: "text-purple-600 bg-purple-50" },
];

const statusColorMap: Record<string, string> = {
  serving: "bg-green-100 text-green-700 border-green-200",
  waiting: "bg-gray-100 text-gray-600 border-gray-200",
  done: "bg-blue-100 text-blue-600 border-blue-200",
};

export default function LiveQueueMonitor() {
  const navigate = useNavigate();
  const [currentNum, setCurrentNum] = useState(MOCK_QUEUE_STATE.currentNumber);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  // PLACEHOLDER: isAuthenticated should come from auth context
  const isAuthenticated = true;

  // PLACEHOLDER: Replace with actual WebSocket listener or polling interval
  // For real implementation, connect to WebSocket and update currentNum on 'queue-update' events
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate occasional queue number update
      // PLACEHOLDER: Remove this simulation and replace with real WebSocket events
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // PLACEHOLDER: API call to GET /api/queue/current to refresh data
    await new Promise((r) => setTimeout(r, 1000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  const aheadCount = MOCK_QUEUE_LIST.filter(
    (q) => q.status !== "serving" && !q.isMe && MOCK_QUEUE_LIST.indexOf(q) < MOCK_QUEUE_LIST.findIndex((x) => x.isMe)
  ).length;

  const myPosition = MOCK_QUEUE_LIST.findIndex((q) => q.isMe) + 1;
  const progressPercent = Math.round((currentNum / MOCK_QUEUE_STATE.totalToday) * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Live Queue Monitor</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {/* PLACEHOLDER: Use clinic's actual operating date from API */}
            {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sound toggle for queue announcements */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border transition-all ${soundEnabled ? "bg-green-50 border-green-200 text-green-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}
            title="Toggle queue sound notifications"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-sm font-semibold hover:bg-green-100 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {/* PLACEHOLDER: Change status based on clinic operating hours from settings API */}
          <span className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-100 px-4 py-2 rounded-full">
            <Wifi className="w-4 h-4" />
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Updates Active
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Last updated: {lastRefresh.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </p>
      </div>

      {/* Main Queue Number Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 justify-between">
            {/* Current number */}
            <div className="text-center sm:text-left">
              <p className="text-green-200 text-sm font-semibold uppercase tracking-widest mb-2">
                Currently Serving
              </p>
              {/* PLACEHOLDER: Real-time value from WebSocket 'current-serving' event */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentNum}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-8xl sm:text-9xl font-black leading-none"
                >
                  #{currentNum}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* My token highlight */}
            {isAuthenticated && (
              <div className="bg-white/20 rounded-2xl p-5 text-center border border-white/30 backdrop-blur-sm">
                <p className="text-green-200 text-xs font-semibold uppercase tracking-widest mb-1">
                  Your Token
                </p>
                {/* PLACEHOLDER: From patient's active queue session */}
                <p className="text-5xl font-black">{MY_TOKEN}</p>
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-green-100">
                    <strong className="text-white">{aheadCount}</strong> ahead of you
                  </p>
                  <p className="text-xs text-green-200">Est. ~25 min wait</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-green-200 mb-2">
              <span>Today's Progress</span>
              {/* PLACEHOLDER: Actual counts from GET /api/queue/stats/today */}
              <span>{currentNum} / {MOCK_QUEUE_STATE.totalToday} patients served ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-white h-3 rounded-full shadow-sm"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {MOCK_STATS.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          >
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-900">Queue List</h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {/* PLACEHOLDER: Real count from queue API */}
                Showing {MOCK_QUEUE_LIST.length} of {MOCK_QUEUE_STATE.totalToday - currentNum + 1} remaining
              </span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
              {MOCK_QUEUE_LIST.map((item, i) => (
                <motion.div
                  key={item.token}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                    item.isMe ? "bg-green-50" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Token */}
                  <div
                    className={`w-14 text-center py-2 rounded-xl font-black text-sm border ${
                      item.status === "serving"
                        ? "bg-green-500 text-white border-green-400"
                        : item.isMe
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {item.token}
                  </div>

                  {/* Name & Service */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold text-sm ${item.isMe ? "text-green-700" : "text-gray-800"}`}>
                        {item.isMe ? `${item.name} (You)` : item.name}
                      </p>
                      {item.isMe && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{item.service}</p>
                  </div>

                  {/* Status & Wait */}
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColorMap[item.status]}`}
                    >
                      {item.status === "serving" ? "🟢 Now Serving" : item.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{item.waitTime}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Notification Settings */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900">Notifications</h3>
            </div>
            {[
              {
                label: "Alert when 5 patients ahead",
                // PLACEHOLDER: Save preference to user settings API
                active: true,
              },
              {
                label: "Alert when 2 patients ahead",
                active: true,
              },
              {
                label: "Email notification",
                active: false,
              },
            ].map((pref, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{pref.label}</span>
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${pref.active ? "bg-green-500" : "bg-gray-200"} relative cursor-pointer`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${pref.active ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Clinic Hours */}
          {/* PLACEHOLDER: Fetch from GET /api/clinic/schedule */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900">Clinic Hours</h3>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { day: "Mon – Fri", hours: "8:00 AM – 5:00 PM", open: true },
                { day: "Saturday", hours: "8:00 AM – 12:00 PM", open: true },
                { day: "Sunday", hours: "Closed", open: false },
              ].map((h, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-600">{h.day}</span>
                  <span className={`font-semibold ${h.open ? "text-gray-800" : "text-red-400"}`}>{h.hours}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-green-50 rounded-2xl px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-700">Clinic is Open Now</span>
            </div>
          </div>

          {/* CTA */}
          {!isAuthenticated && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 p-5">
              <AlertCircle className="w-8 h-8 text-green-500 mb-3" />
              <p className="font-bold text-gray-900 mb-1">Want to join this queue?</p>
              <p className="text-xs text-gray-500 mb-4">
                Login to get your personal queue token and receive smart notifications.
              </p>
              <button
                onClick={() => navigate("/patient/login")}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-2xl shadow-md flex items-center justify-center gap-2"
              >
                Login to Join Queue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {isAuthenticated && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/patient/queue/join")}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <Activity className="w-5 h-5" />
              Join Today's Queue
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
