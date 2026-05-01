import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Activity,
  Download,
  Calendar,
  Shield,
  UserPlus,
  Trash2,
  Edit2,
  Settings,
  RefreshCw,
  Play,
  Square,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../contexts/AuthContext";

type AdminTab = "analytics" | "accounts" | "queue-controls";

// Color palette for charts
const COLORS = ["#16a34a", "#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [reportPeriod, setReportPeriod] = useState("weekly");
  const [queueStarted, setQueueStarted] = useState(true);
  const [dailyCap, setDailyCap] = useState(80);
  const [loading, setLoading] = useState(true);
  
  // State for dynamic data
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [dailyVolume, setDailyVolume] = useState<any[]>([]);
  const [serviceDistribution, setServiceDistribution] = useState<any[]>([]);
  const [hourlyDistribution, setHourlyDistribution] = useState<any[]>([]);
  const [waitTimeTrend, setWaitTimeTrend] = useState<any[]>([]);
  const [staffAccounts, setStaffAccounts] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [reportPeriod]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchKPIData(),
        fetchDailyVolume(),
        fetchServiceDistribution(),
        fetchHourlyDistribution(),
        fetchWaitTimeTrend(),
        fetchStaffAccounts(),
        fetchSystemLogs(),
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKPIData = async () => {
    // Get queue statistics
    const { data: queueData } = await supabase
      .from("queue_entries")
      .select("*");

    const totalPatients = queueData?.length || 0;
    const waiting = queueData?.filter(q => q.status === "waiting").length || 0;
    const served = queueData?.filter(q => q.status === "completed").length || 0;
    const avgWaitTime = Math.round((totalPatients * 8) / 60) || 0;

    setKpiData([
      {
        label: "Total Patients Today",
        value: totalPatients.toString(),
        change: "+8%",
        up: true,
        icon: Users,
        color: "text-blue-600 bg-blue-50",
      },
      {
        label: "Avg Wait Time",
        value: `${avgWaitTime} min`,
        change: "-45%",
        up: false,
        icon: Clock,
        color: "text-green-600 bg-green-50",
        note: "vs. last week",
      },
      {
        label: "Queue Completion",
        value: totalPatients > 0 ? Math.round((served / totalPatients) * 100) + "%" : "0%",
        change: "+2.1%",
        up: true,
        icon: CheckCircle,
        color: "text-emerald-600 bg-emerald-50",
      },
      {
        label: "Currently Waiting",
        value: waiting.toString(),
        change: waiting > 0 ? `+${waiting}` : "0",
        up: waiting > 0,
        icon: AlertTriangle,
        color: "text-amber-600 bg-amber-50",
      },
    ]);
  };

  const fetchDailyVolume = async () => {
    // Get last 7 days of data
    const { data } = await supabase
      .from("queue_entries")
      .select("created_at, status")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const volumeData = days.map(day => ({
      day,
      patients: 0,
      served: 0,
      avgWait: 0,
    }));

    setDailyVolume(volumeData);
  };

  const fetchServiceDistribution = async () => {
    const { data } = await supabase
      .from("queue_entries")
      .select("service")
      .eq("status", "completed");

    const serviceCount: Record<string, number> = {};
    data?.forEach(item => {
      if (item.service) {
        serviceCount[item.service] = (serviceCount[item.service] || 0) + 1;
      }
    });

    const total = Object.values(serviceCount).reduce((a, b) => a + b, 0);
    const distribution = Object.entries(serviceCount).map(([name, value], index) => ({
      name: name.split(" ").slice(0, 2).join(" "),
      value: Math.round((value / total) * 100),
      color: COLORS[index % COLORS.length],
    }));

    setServiceDistribution(distribution.slice(0, 6));
  };

  const fetchHourlyDistribution = async () => {
    const hours = ["8AM", "9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM"];
    const distribution = hours.map(hour => ({
      hour,
      count: Math.floor(Math.random() * 20) + 5, // Placeholder - replace with actual data
    }));
    setHourlyDistribution(distribution);
  };

  const fetchWaitTimeTrend = async () => {
    const trends = [];
    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        avgWait: Math.floor(Math.random() * 30) + 10,
      });
    }
    setWaitTimeTrend(trends);
  };

  const fetchStaffAccounts = async () => {
    const { data } = await supabase
      .from("patients")
      .select("*")
      .in("role", ["staff", "admin"]);

    if (data) {
      setStaffAccounts(data.map(account => ({
        id: account.id,
        name: `${account.first_name} ${account.last_name}`,
        role: account.role === "admin" ? "Admin" : "Staff",
        department: account.role === "admin" ? "Management" : "Front Desk",
        status: account.is_active ? "active" : "inactive",
        lastLogin: account.last_login ? new Date(account.last_login).toLocaleDateString() : "Never",
        email: account.email,
      })));
    }
  };

  const fetchSystemLogs = async () => {
    // Placeholder logs - replace with actual system logs table
    setSystemLogs([
      { time: "10:32 AM", action: "Walk-in patient registered", type: "info" },
      { time: "9:58 AM", action: "Queue notification sent", type: "success" },
      { time: "8:05 AM", action: "Daily queue started", type: "info" },
    ]);
  };

  const tabs = [
    { id: "analytics" as AdminTab, label: "Analytics & Reports", icon: BarChart3 },
    { id: "accounts" as AdminTab, label: "Account Management", icon: Shield },
    { id: "queue-controls" as AdminTab, label: "Daily Queue Controls", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            System overview and operational management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
          >
            <option value="today">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
          </select>
          <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-4 py-2.5 rounded-2xl shadow-md text-sm">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
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

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiData.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
              >
                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                {card.change && (
                  <div className="flex items-center gap-1 mt-2">
                    {card.up ? (
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-green-500" />
                    )}
                    <span className="text-xs font-semibold text-green-600">{card.change}</span>
                    <span className="text-xs text-gray-400">vs last week</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Service Distribution */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900">Service Distribution</h3>
                <p className="text-xs text-gray-400 mt-0.5">Today's service breakdown</p>
              </div>
            </div>
            {serviceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">No data available</div>
            )}
          </div>
        </motion.div>
      )}

      {/* ACCOUNT MANAGEMENT TAB */}
      {activeTab === "accounts" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{staffAccounts.length} staff accounts</p>
            <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-4 py-2.5 rounded-2xl shadow-md text-sm">
              <UserPlus className="w-4 h-4" />
              Add Staff Account
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Staff</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase">Last Login</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {staffAccounts.map((staff, i) => (
                    <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            staff.role === "Admin" ? "bg-purple-500" : "bg-green-500"
                          }`}>
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{staff.name}</p>
                            <p className="text-xs text-gray-400">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          staff.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                        }`}>
                          {staff.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${staff.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                          <span className={`w-2 h-2 rounded-full ${staff.status === "active" ? "bg-green-500" : "bg-gray-300"}`} />
                          {staff.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">{staff.lastLogin}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* QUEUE CONTROLS TAB */}
      {activeTab === "queue-controls" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className={`rounded-3xl p-6 border ${queueStarted ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-bold text-lg ${queueStarted ? "text-green-800" : "text-red-800"}`}>
                  Queue System: {queueStarted ? "RUNNING" : "STOPPED"}
                </p>
                <p className={`text-sm mt-0.5 ${queueStarted ? "text-green-600" : "text-red-600"}`}>
                  {queueStarted ? "Queue is active and accepting patients" : "Queue is currently stopped"}
                </p>
              </div>
              <div className={`w-4 h-4 rounded-full ${queueStarted ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-5">Queue Operations</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setQueueStarted(true)}
                  disabled={queueStarted}
                  className="w-full flex items-center gap-3 px-5 py-3.5 bg-green-50 text-green-700 border border-green-200 rounded-2xl font-semibold text-sm hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  Start Daily Queue
                </button>
                <button
                  onClick={() => setQueueStarted(false)}
                  disabled={!queueStarted}
                  className="w-full flex items-center gap-3 px-5 py-3.5 bg-red-50 text-red-700 border border-red-200 rounded-2xl font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Square className="w-5 h-5" />
                  Stop Queue
                </button>
                <button className="w-full flex items-center gap-3 px-5 py-3.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl font-semibold text-sm hover:bg-amber-100 transition-colors">
                  <RotateCcw className="w-5 h-5" />
                  Reset Queue
                </button>
                <button className="w-full flex items-center gap-3 px-5 py-3.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl font-semibold text-sm hover:bg-blue-100 transition-colors">
                  <RefreshCw className="w-5 h-5" />
                  Refresh Display
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-5">Queue Configuration</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Daily Patient Cap</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={dailyCap}
                      onChange={(e) => setDailyCap(Number(e.target.value))}
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <span className="text-sm text-gray-500">patients/day</span>
                  </div>
                </div>
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-2xl shadow-md text-sm">
                  Save Settings
                </button>
              </div>
            </div>
          </div>

          {/* System Logs */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">System Activity Log</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
<<<<<<< HEAD
              {[
                { time: "10:32 AM", action: "Priority override applied to A-049 by Staff Ana Reyes", type: "warning" },
                { time: "10:15 AM", action: "Walk-in patient registered: A-063 (Maria Flores)", type: "info" },
                { time: "9:58 AM", action: "Queue notification sent to A-050 (2 patients ahead)", type: "success" },
                { time: "9:45 AM", action: "Patient A-047 marked as completed by Staff Ana Reyes", type: "success" },
                { time: "9:30 AM", action: "A-046 marked as no-show after 15-minute timeout", type: "warning" },
                { time: "8:05 AM", action: "Daily queue started by Admin Carla Cruz", type: "info" },
                { time: "8:00 AM", action: "System initialized · MediFlow v1.0.0 started", type: "info" },
              ].map((log, i) => (
=======
              {systemLogs.map((log, i) => (
>>>>>>> 1b19392 (Update Admin and Staff Dashboard, StaffLayout, StaffLogin)
                <div key={i} className="flex items-start gap-3 text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400 font-mono w-16 flex-shrink-0">{log.time}</span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                    log.type === "success" ? "bg-green-500" : log.type === "warning" ? "bg-amber-500" : "bg-blue-400"
                  }`} />
                  <span className="text-gray-600 text-xs leading-relaxed">{log.action}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}