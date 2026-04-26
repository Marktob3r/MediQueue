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
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../config/supabase";

export default function LiveQueueMonitor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentNum, setCurrentNum] = useState(0);
  const [queueList, setQueueList] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clinicHours, setClinicHours] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueueData();
    fetchClinicHours();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchQueueData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchQueueData = async () => {
    try {
      // Fetch all active queue entries
      const { data: queueData, error } = await supabase
        .from("queue_entries")
        .select("*")
        .eq("status", "waiting")
        .order("position", { ascending: true });

      if (error) throw error;

      // Find current serving number (first in queue)
      const currentServing = queueData && queueData.length > 0 ? queueData[0] : null;
      setCurrentNum(currentServing?.queue_number || 0);

      // Format queue list for display
      const formattedList = (queueData || []).map((item, index) => ({
        token: item.token,
        name: item.patient_name || `Patient ${index + 1}`,
        service: item.service,
        status: index === 0 ? "serving" : "waiting",
        waitTime: index === 0 ? "Now" : `~${index * 8} min`,
        isMe: item.patient_id === user?.id,
        position: index + 1,
      }));

      setQueueList(formattedList);

      // Calculate stats
      const totalInQueue = queueData?.length || 0;
      const myPosition = formattedList.findIndex(item => item.isMe) + 1;
      const aheadCount = myPosition > 0 ? myPosition - 1 : 0;

      setStats([
        { label: "In Queue", value: totalInQueue.toString(), icon: Users, color: "text-green-600 bg-green-50" },
        { label: "Served Today", value: "0", icon: Clock, color: "text-blue-600 bg-blue-50" },
        { label: "Avg Wait", value: `${totalInQueue * 8} min`, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
        { label: "Ahead of You", value: aheadCount.toString(), icon: Activity, color: "text-purple-600 bg-purple-50" },
      ]);

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching queue data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClinicHours = async () => {
    // Set default clinic hours (can be fetched from settings table)
    setClinicHours([
      { day: "Monday - Friday", hours: "8:00 AM - 5:00 PM", open: true },
      { day: "Saturday", hours: "8:00 AM - 12:00 PM", open: true },
      { day: "Sunday", hours: "Closed", open: false },
    ]);
    
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    // Check if clinic is open (simplified logic)
    const isOpenNow = (day >= 1 && day <= 5 && hour >= 8 && hour < 17) || 
                      (day === 6 && hour >= 8 && hour < 12);
    setIsOpen(isOpenNow);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchQueueData();
    setIsRefreshing(false);
  };

  const myQueueEntry = queueList.find(item => item.isMe);
  const myPosition = queueList.findIndex(item => item.isMe) + 1;
  const progressPercent = queueList.length > 0 ? Math.round((currentNum / (currentNum + queueList.length)) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Live Queue Monitor</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-2xl border transition-all ${soundEnabled ? "bg-green-50 border-green-200 text-green-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}
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
          <span className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            <Wifi className="w-4 h-4" />
            <span className={`w-2 h-2 rounded-full animate-pulse ${isOpen ? "bg-green-500" : "bg-red-500"}`} />
            {isOpen ? "Clinic Open Now" : "Clinic Closed"}
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
            <div className="text-center sm:text-left">
              <p className="text-green-200 text-sm font-semibold uppercase tracking-widest mb-2">
                Currently Serving
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentNum}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-8xl sm:text-9xl font-black leading-none"
                >
                  #{currentNum || "---"}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* My token highlight */}
            {user && myQueueEntry && (
              <div className="bg-white/20 rounded-2xl p-5 text-center border border-white/30 backdrop-blur-sm">
                <p className="text-green-200 text-xs font-semibold uppercase tracking-widest mb-1">
                  Your Token
                </p>
                <p className="text-5xl font-black">{myQueueEntry.token}</p>
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-green-100">
                    <strong className="text-white">{myPosition - 1}</strong> ahead of you
                  </p>
                  <p className="text-xs text-green-200">Position #{myPosition}</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-green-200 mb-2">
              <span>Today's Progress</span>
              <span>{progressPercent}% completed</span>
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
        {stats.map((stat, i) => (
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
                {queueList.length} patients in queue
              </span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
              {queueList.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No patients in queue</div>
              ) : (
                queueList.map((item, i) => (
                  <motion.div
                    key={item.token}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                      item.isMe ? "bg-green-50" : "hover:bg-gray-50"
                    }`}
                  >
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

                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        item.status === "serving" ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}>
                        {item.status === "serving" ? "🟢 Now Serving" : `#${item.position}`}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{item.waitTime}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Clinic Hours */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900">Clinic Hours</h3>
            </div>
            <div className="space-y-2 text-sm">
              {clinicHours.map((h, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-600">{h.day}</span>
                  <span className={`font-semibold ${h.open ? "text-gray-800" : "text-red-400"}`}>{h.hours}</span>
                </div>
              ))}
            </div>
            <div className={`mt-4 rounded-2xl px-3 py-2 flex items-center gap-2 ${isOpen ? "bg-green-50" : "bg-red-50"}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isOpen ? "bg-green-500" : "bg-red-500"}`} />
              <span className={`text-xs font-semibold ${isOpen ? "text-green-700" : "text-red-700"}`}>
                {isOpen ? "Clinic is Open Now" : "Clinic is Closed"}
              </span>
            </div>
          </div>

          {/* Join Queue Button */}
          {!myQueueEntry && isOpen && (
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

          {myQueueEntry && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 p-5">
              <AlertCircle className="w-8 h-8 text-green-500 mb-3" />
              <p className="font-bold text-gray-900 mb-1">You're in the queue!</p>
              <p className="text-xs text-gray-500">
                Your token is <strong className="text-green-600">{myQueueEntry.token}</strong>. 
                Position #{myPosition} with {myPosition - 1} people ahead.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}