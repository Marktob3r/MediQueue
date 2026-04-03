import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Activity,
  Pill,
  Eye,
  Download,
  Calendar,
  User,
  Stethoscope,
  X,
} from "lucide-react";

// PLACEHOLDER: Fetch from GET /api/patient/medical-history
// Include pagination, search, and filter parameters
const MOCK_VISITS = [
  {
    id: "V-2025-001",
    date: "March 15, 2025",
    doctor: "Dr. Maria Santos",
    service: "General Consultation",
    chiefComplaint: "Persistent cough and fever for 5 days",
    diagnosis: "Upper Respiratory Tract Infection (URTI)",
    // PLACEHOLDER: Actual prescription from EMR system
    prescription: [
      { drug: "Amoxicillin 500mg", sig: "1 cap 3x daily for 7 days" },
      { drug: "Paracetamol 500mg", sig: "1 tab every 6 hours PRN fever" },
      { drug: "Cetirizine 10mg", sig: "1 tab once daily" },
    ],
    vitals: {
      // PLACEHOLDER: Actual vitals recorded by staff during visit
      bp: "120/80 mmHg",
      temp: "38.2°C",
      weight: "65 kg",
      pulse: "88 bpm",
    },
    notes: "Patient advised to rest, drink fluids, and return for follow-up if symptoms persist beyond 7 days.",
    attachments: ["Lab Results - CBC.pdf"], // PLACEHOLDER: links to actual file storage (e.g., Supabase Storage)
    status: "completed",
  },
  {
    id: "V-2025-002",
    date: "February 28, 2025",
    doctor: "Dr. Juan Reyes",
    service: "Follow-up Check",
    chiefComplaint: "Routine hypertension monitoring",
    diagnosis: "Essential Hypertension - Controlled",
    prescription: [
      { drug: "Losartan 50mg", sig: "1 tab once daily" },
      { drug: "Amlodipine 5mg", sig: "1 tab once daily" },
    ],
    vitals: {
      bp: "128/85 mmHg",
      temp: "36.8°C",
      weight: "68 kg",
      pulse: "76 bpm",
    },
    notes: "BP within acceptable range. Continue current medications. Follow-up in 3 months.",
    attachments: [],
    status: "completed",
  },
  {
    id: "V-2025-003",
    date: "January 10, 2025",
    doctor: "Dr. Maria Santos",
    service: "General Consultation",
    chiefComplaint: "Stomach pain, vomiting, and loose stools",
    diagnosis: "Acute Gastroenteritis",
    prescription: [
      { drug: "Loperamide 2mg", sig: "1 cap after each loose stool, max 4 caps/day" },
      { drug: "Oral Rehydration Salts (ORS)", sig: "Dissolve 1 sachet in 250ml water after each stool" },
      { drug: "Metoclopramide 10mg", sig: "1 tab 3x daily before meals for 3 days" },
    ],
    vitals: {
      bp: "115/75 mmHg",
      temp: "37.5°C",
      weight: "64 kg",
      pulse: "92 bpm",
    },
    notes: "Patient mildly dehydrated. Advised clear liquid diet for 24 hours, then BRAT diet. Avoid dairy.",
    attachments: [],
    status: "completed",
  },
  {
    id: "V-2024-015",
    date: "November 5, 2024",
    doctor: "Dr. Juan Reyes",
    service: "Physical Check-up",
    chiefComplaint: "Annual physical examination",
    diagnosis: "No acute findings. Mild hypertension noted.",
    prescription: [
      { drug: "Losartan 25mg", sig: "1 tab once daily - trial period" },
    ],
    vitals: {
      bp: "140/90 mmHg",
      temp: "36.6°C",
      weight: "67 kg",
      pulse: "80 bpm",
    },
    notes: "Annual PE completed. CBC and lipid panel ordered. Results to be reviewed on next visit.",
    attachments: ["Annual PE Results.pdf", "Lipid Panel.pdf"],
    status: "completed",
  },
];

type Visit = (typeof MOCK_VISITS)[0];

export default function MedicalHistory() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  const doctors = ["all", ...Array.from(new Set(MOCK_VISITS.map((v) => v.doctor)))];

  const filtered = MOCK_VISITS.filter((v) => {
    const matchSearch =
      v.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      v.service.toLowerCase().includes(search.toLowerCase()) ||
      v.doctor.toLowerCase().includes(search.toLowerCase());
    const matchDoctor = filterDoctor === "all" || v.doctor === filterDoctor;
    return matchSearch && matchDoctor;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Medical History</h1>
        <p className="text-gray-500 text-sm">
          {/* PLACEHOLDER: Actual record count from EMR API */}
          Your electronic medical records — {MOCK_VISITS.length} visits on file
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by diagnosis, service, or doctor..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm appearance-none cursor-pointer"
          >
            {doctors.map((d) => (
              <option key={d} value={d}>
                {d === "all" ? "All Doctors" : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No records found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          filtered.map((visit, i) => (
            <motion.div
              key={visit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Visit Header */}
              <button
                onClick={() => setExpanded(expanded === visit.id ? null : visit.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-green-100">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{visit.diagnosis}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{visit.service} · {visit.doctor}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {visit.date}
                      </div>
                      {visit.attachments.length > 0 && (
                        <span className="text-xs text-blue-600 font-medium mt-1 block">
                          {visit.attachments.length} attachment{visit.attachments.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expanded === visit.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              {/* Expanded Detail */}
              <AnimatePresence>
                {expanded === visit.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 p-5 space-y-5">
                      {/* Chief Complaint */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Chief Complaint</p>
                        <p className="text-sm text-gray-700">{visit.chiefComplaint}</p>
                      </div>

                      {/* Vitals */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vitals Recorded</p>
                        {/* PLACEHOLDER: Actual vitals from nursing station input */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {Object.entries(visit.vitals).map(([key, val]) => (
                            <div key={key} className="bg-gray-50 rounded-2xl p-3 text-center">
                              <p className="text-xs text-gray-400 capitalize">{key === "bp" ? "Blood Pressure" : key === "temp" ? "Temperature" : key === "pulse" ? "Pulse Rate" : "Weight"}</p>
                              <p className="text-sm font-bold text-gray-800 mt-0.5">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prescription */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="w-4 h-4 text-green-600" />
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prescription</p>
                        </div>
                        {/* PLACEHOLDER: From EMR prescription module */}
                        <div className="space-y-2">
                          {visit.prescription.map((rx, ri) => (
                            <div key={ri} className="flex items-start gap-3 bg-green-50 rounded-2xl px-4 py-2.5">
                              <ChevronRight className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{rx.drug}</p>
                                <p className="text-xs text-gray-500">{rx.sig}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Doctor's Notes */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Stethoscope className="w-4 h-4 text-green-600" />
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Doctor's Notes</p>
                        </div>
                        {/* PLACEHOLDER: From doctor's EMR note entry */}
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-2xl p-4 leading-relaxed">
                          {visit.notes}
                        </p>
                      </div>

                      {/* Attachments */}
                      {visit.attachments.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attachments</p>
                          <div className="space-y-2">
                            {visit.attachments.map((att, ai) => (
                              <button
                                key={ai}
                                className="w-full flex items-center gap-3 bg-blue-50 hover:bg-blue-100 rounded-2xl px-4 py-2.5 transition-colors text-left"
                              >
                                {/* PLACEHOLDER: Link to actual file in Supabase Storage or document management system */}
                                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span className="text-sm text-blue-700 font-medium flex-1">{att}</span>
                                <Download className="w-4 h-4 text-blue-400" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setSelectedVisit(visit)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-2xl text-sm font-semibold hover:bg-green-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Full View
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 rounded-2xl text-sm font-semibold hover:bg-gray-100 transition-colors">
                          {/* PLACEHOLDER: Generate PDF from EMR data */}
                          <Download className="w-4 h-4" /> Download PDF
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More */}
      {/* PLACEHOLDER: Implement pagination — GET /api/patient/medical-history?page=N */}
      <div className="mt-6 text-center">
        <button className="text-sm text-green-600 font-semibold hover:text-green-700 border-2 border-green-200 px-6 py-2.5 rounded-2xl hover:bg-green-50 transition-all">
          Load Older Records
        </button>
      </div>

      {/* Full Record Modal */}
      <AnimatePresence>
        {selectedVisit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVisit(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900">Medical Record</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Record ID: {selectedVisit.id}</p>
                </div>
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-gray-700">Visit Summary</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedVisit.date} · {selectedVisit.doctor}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedVisit.diagnosis}</p>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  {/* PLACEHOLDER: Use clinic's actual letterhead for official records */}
                  Full medical records are available at the clinic or via official request.
                  <br />This is a digital summary for reference only.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
