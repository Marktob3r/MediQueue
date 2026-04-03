import { useState } from "react";
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

// PLACEHOLDER: All chart data below must be fetched from GET /api/admin/analytics
// Replace with real aggregated data from the database

// PLACEHOLDER: GET /api/admin/analytics/daily-volume?days=7
const DAILY_VOLUME = [
  { day: "Mon", patients: 58, served: 55, avgWait: 22 },
  { day: "Tue", patients: 72, served: 70, avgWait: 18 },
  { day: "Wed", patients: 65, served: 63, avgWait: 20 },
  { day: "Thu", patients: 80, served: 75, avgWait: 25 },
  { day: "Fri", patients: 90, served: 85, avgWait: 30 },
  { day: "Sat", patients: 45, served: 44, avgWait: 12 },
  { day: "Today", patients: 65, served: 47, avgWait: 8 },
];

// PLACEHOLDER: GET /api/admin/analytics/hourly-distribution?date=today
const HOURLY_DIST = [
  { hour: "8AM", count: 5 },
  { hour: "9AM", count: 12 },
  { hour: "10AM", count: 18 },
  { hour: "11AM", count: 15 },
  { hour: "12PM", count: 8 },
  { hour: "1PM", count: 10 },
  { hour: "2PM", count: 14 },
  { hour: "3PM", count: 11 },
  { hour: "4PM", count: 7 },
];

// PLACEHOLDER: GET /api/admin/analytics/service-distribution?date=today
const SERVICE_DIST = [
  { name: "General Consultation", value: 35, color: "#16a34a" },
  { name: "Physical Check-up", value: 18, color: "#059669" },
  { name: "Pediatrics", value: 15, color: "#10b981" },
  { name: "Vaccination", value: 20, color: "#34d399" },
  { name: "Eye Consultation", value: 7, color: "#6ee7b7" },
  { name: "Prescription", value: 5, color: "#a7f3d0" },
];

// PLACEHOLDER: GET /api/admin/analytics/wait-time-trend?days=14
const WAIT_TREND = [
  { date: "Mar 20", avgWait: 28 },
  { date: "Mar 21", avgWait: 32 },
  { date: "Mar 22", avgWait: 25 },
  { date: "Mar 23", avgWait: 22 },
  { date: "Mar 24", avgWait: 18 },
  { date: "Mar 25", avgWait: 15 },
  { date: "Mar 26", avgWait: 20 },
  { date: "Mar 27", avgWait: 17 },
  { date: "Mar 28", avgWait: 12 },
  { date: "Mar 29", avgWait: 8 },
];

// PLACEHOLDER: Fetch from GET /api/admin/staff-accounts
const MOCK_STAFF = [
  { id: "S-001", name: "Nurse Ana Reyes", role: "Staff", department: "Front Desk", status: "active", lastLogin: "Today, 7:58 AM" },
  { id: "S-002", name: "Nurse Ben Santos", role: "Staff", department: "Nursing", status: "active", lastLogin: "Today, 8:05 AM" },
  { id: "S-003", name: "Dr. Maria Santos", role: "Doctor", department: "General Medicine", status: "active", lastLogin: "Today, 9:00 AM" },
  { id: "S-004", name: "Dr. Juan Reyes", role: "Doctor", department: "Internal Medicine", status: "inactive", lastLogin: "Yesterday, 5:30 PM" },
  { id: "S-005", name: "Admin Carla Cruz", role: "Admin", department: "Management", status: "active", lastLogin: "Today, 8:30 AM" },
];

type AdminTab = "analytics" | "accounts" | "queue-controls";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [reportPeriod, setReportPeriod] = useState("weekly");
  const [queueStarted, setQueueStarted] = useState(true);
  // PLACEHOLDER: Daily queue cap from GET /api/admin/settings
  const [dailyCap, setDailyCap] = useState(80);

  const tabs = [
    { id: "analytics" as AdminTab, label: "Analytics & Reports", icon: BarChart3 },
    { id: "accounts" as AdminTab, label: "Account Management", icon: Shield },
    { id: "queue-controls" as AdminTab, label: "Daily Queue Controls", icon: Settings },
  ];

  // PLACEHOLDER: KPI cards — from GET /api/admin/analytics/summary
  const kpiCards = [
    {
      label: "Total Patients Today",
      value: "65",
      change: "+8%",
      up: true,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Avg Wait Time",
      value: "8.3 min",
      change: "-45%",
      up: false, // negative is good for wait time
      icon: Clock,
      color: "text-green-600 bg-green-50",
      note: "vs. 15 min last week",
    },
    {
      label: "Queue Completion",
      value: "94.2%",
      change: "+2.1%",
      up: true,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "No-Show Rate",
      value: "9.2%",
      change: "-1.5%",
      up: false,
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50",
    },
  ];

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
        {/* PLACEHOLDER: Date range picker — connect to analytics API filters */}
        <div className="flex items-center gap-3">
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
          >
            <option value="today">Today</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
          <button className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-4 py-2.5 rounded-2xl shadow-md text-sm">
            {/* PLACEHOLDER: Export to PDF/CSV — GET /api/admin/reports/export?format=pdf&period=weekly */}
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

      {/* ── ANALYTICS TAB ── */}
      {activeTab === "analytics" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((card, i) => (
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
                <div className="flex items-center gap-1 mt-2">
                  {card.up ? (
                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-green-500" />
                  )}
                  <span className="text-xs font-semibold text-green-600">{card.change}</span>
                  <span className="text-xs text-gray-400">vs last week</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Daily Patient Volume — Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900">Daily Patient Volume</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {/* PLACEHOLDER: Aggregate from queue table by day */}
                    Patients registered vs served this week
                  </p>
                </div>
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={DAILY_VOLUME} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Bar dataKey="patients" fill="#bbf7d0" radius={[6, 6, 0, 0]} name="Registered" />
                  <Bar dataKey="served" fill="#16a34a" radius={[6, 6, 0, 0]} name="Served" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Service Distribution — Pie Chart */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900">Service Mix</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Today's service distribution</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={SERVICE_DIST}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {SERVICE_DIST.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {SERVICE_DIST.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-gray-600 truncate max-w-28">{s.name.split(" ")[0]}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Wait Time Trend — Area Chart */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900">Average Wait Time Trend</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {/* PLACEHOLDER: AI-calculated rolling average from analytics engine */}
                    14-day rolling average (minutes)
                  </p>
                </div>
                <TrendingDown className="w-5 h-5 text-green-500" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={WAIT_TREND}>
                  <defs>
                    <linearGradient id="waitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }} />
                  <Area type="monotone" dataKey="avgWait" stroke="#16a34a" fill="url(#waitGrad)" strokeWidth={2} name="Avg Wait (min)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Hourly Distribution */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-gray-900">Hourly Patient Distribution</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {/* PLACEHOLDER: AI prediction highlights peak hours */}
                    Peak hour: 10AM · AI-predicted next peak: 2PM
                  </p>
                </div>
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={HOURLY_DIST}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border border-green-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900">A.I. Analysis Insights</h3>
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">AI</span>
            </div>
            {/* PLACEHOLDER: Generated by AI analysis engine — GET /api/admin/ai-insights */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  title: "Efficiency Improved",
                  text: "Average wait time reduced by 45% since system deployment. Queue flow is significantly more predictable.",
                  icon: TrendingDown,
                  color: "text-green-600",
                },
                {
                  title: "Peak Hour Alert",
                  text: "10:00–11:00 AM is consistently the busiest hour. Consider adding 1 more doctor during this period.",
                  icon: AlertTriangle,
                  color: "text-amber-600",
                },
                {
                  title: "No-Show Pattern",
                  text: "Patients who joined queue > 45 min before their turn have 23% higher no-show rates. Consider adjusting notification timing.",
                  icon: Users,
                  color: "text-blue-600",
                },
              ].map((insight, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                  <insight.icon className={`w-5 h-5 ${insight.color} mb-2`} />
                  <p className="font-semibold text-gray-900 text-sm mb-1">{insight.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── ACCOUNT MANAGEMENT TAB ── */}
      {activeTab === "accounts" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{MOCK_STAFF.length} staff accounts</p>
            {/* PLACEHOLDER: POST /api/admin/staff-accounts to create new staff */}
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
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Staff</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* PLACEHOLDER: Replace with real staff data from GET /api/admin/staff-accounts */}
                  {MOCK_STAFF.map((staff, i) => (
                    <motion.tr
                      key={staff.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            staff.role === "Admin" ? "bg-purple-500" : staff.role === "Doctor" ? "bg-blue-500" : "bg-green-500"
                          }`}>
                            {staff.name.split(" ")[1]?.[0] || staff.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{staff.name}</p>
                            <p className="text-xs text-gray-400">{staff.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          staff.role === "Admin" ? "bg-purple-100 text-purple-700" :
                          staff.role === "Doctor" ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {staff.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{staff.department}</td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${staff.status === "active" ? "text-green-600" : "text-gray-400"}`}>
                          <span className={`w-2 h-2 rounded-full ${staff.status === "active" ? "bg-green-500" : "bg-gray-300"}`} />
                          {staff.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">{staff.lastLogin}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* PLACEHOLDER: PATCH /api/admin/staff-accounts/{id} */}
                          <button className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* PLACEHOLDER: DELETE /api/admin/staff-accounts/{id} */}
                          <button className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── DAILY QUEUE CONTROLS TAB ── */}
      {activeTab === "queue-controls" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Queue Status */}
          <div className={`rounded-3xl p-6 border ${queueStarted ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-bold text-lg ${queueStarted ? "text-green-800" : "text-red-800"}`}>
                  Queue System: {queueStarted ? "RUNNING" : "STOPPED"}
                </p>
                {/* PLACEHOLDER: Actual queue start/stop timestamps from system log */}
                <p className={`text-sm mt-0.5 ${queueStarted ? "text-green-600" : "text-red-600"}`}>
                  {queueStarted ? "Queue started at 8:00 AM today · 47 patients served" : "Queue stopped by Admin at 5:00 PM"}
                </p>
              </div>
              <div className={`w-4 h-4 rounded-full ${queueStarted ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Queue Controls */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-5">Queue Operations</h3>
              <div className="space-y-3">
                {/* PLACEHOLDER: POST /api/admin/queue/start — opens queue for the day */}
                <button
                  onClick={() => setQueueStarted(true)}
                  disabled={queueStarted}
                  className="w-full flex items-center gap-3 px-5 py-3.5 bg-green-50 text-green-700 border border-green-200 rounded-2xl font-semibold text-sm hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  Start Daily Queue
                </button>
                {/* PLACEHOLDER: POST /api/admin/queue/stop — closes queue (no new tokens) */}
                <button
                  onClick={() => setQueueStarted(false)}
                  disabled={!queueStarted}
                  className="w-full flex items-center gap-3 px-5 py-3.5 bg-red-50 text-red-700 border border-red-200 rounded-2xl font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Square className="w-5 h-5" />
                  Stop Queue (End of Day)
                </button>
                {/* PLACEHOLDER: POST /api/admin/queue/reset — dangerous! Clears all queue entries */}
                <button className="w-full flex items-center gap-3 px-5 py-3.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl font-semibold text-sm hover:bg-amber-100 transition-colors">
                  <RotateCcw className="w-5 h-5" />
                  Reset Queue (Clear All)
                </button>
                {/* PLACEHOLDER: POST /api/admin/queue/refresh — refresh token counter */}
                <button className="w-full flex items-center gap-3 px-5 py-3.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl font-semibold text-sm hover:bg-blue-100 transition-colors">
                  <RefreshCw className="w-5 h-5" />
                  Refresh Display Boards
                </button>
              </div>
            </div>

            {/* Queue Settings */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-5">Queue Configuration</h3>
              <div className="space-y-5">
                {/* PLACEHOLDER: PATCH /api/admin/settings/queue — save all settings */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Daily Patient Cap
                  </label>
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

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Queue Open Time
                  </label>
                  {/* PLACEHOLDER: Synced with clinic operating hours settings */}
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Queue Close Time
                  </label>
                  <input
                    type="time"
                    defaultValue="17:00"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Notification Trigger (patients ahead)
                  </label>
                  <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
                    <option>2 patients ahead</option>
                    <option>3 patients ahead</option>
                    <option>5 patients ahead</option>
                  </select>
                </div>

                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-2xl shadow-md text-sm">
                  Save Queue Settings
                </button>
              </div>
            </div>
          </div>

          {/* System Log */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">System Activity Log</h3>
            {/* PLACEHOLDER: Fetch from GET /api/admin/system-log (paginated) */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[
                { time: "10:32 AM", action: "Priority override applied to A-049 by Staff Ana Reyes", type: "warning" },
                { time: "10:15 AM", action: "Walk-in patient registered: A-063 (Maria Flores)", type: "info" },
                { time: "9:58 AM", action: "Queue notification sent to A-050 (2 patients ahead)", type: "success" },
                { time: "9:45 AM", action: "Patient A-047 marked as completed by Staff Ana Reyes", type: "success" },
                { time: "9:30 AM", action: "A-046 marked as no-show after 15-minute timeout", type: "warning" },
                { time: "8:05 AM", action: "Daily queue started by Admin Carla Cruz", type: "info" },
                { time: "8:00 AM", action: "System initialized · MediQueue v1.0.0 started", type: "info" },
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-3 text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400 font-mono w-16 flex-shrink-0 mt-0.5">{log.time}</span>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                    log.type === "success" ? "bg-green-500" :
                    log.type === "warning" ? "bg-amber-500" :
                    "bg-blue-400"
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