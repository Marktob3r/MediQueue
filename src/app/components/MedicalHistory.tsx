import { useState, useEffect } from "react";
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
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../config/supabase";

interface MedicalRecord {
  id: string;
  record_id: string;
  visit_date: string;
  doctor_name: string;
  service: string;
  chief_complaint: string;
  diagnosis: string;
  prescription: any;
  vitals: any;
  notes: string;
  attachments: string[];
  status: string;
}

export default function MedicalHistory() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [selectedVisit, setSelectedVisit] = useState<MedicalRecord | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<string[]>(["all"]);

  useEffect(() => {
    if (user) {
      fetchMedicalRecords();
    }
  }, [user]);

  const fetchMedicalRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .eq("patient_id", user?.id)
        .order("visit_date", { ascending: false });

      if (error) throw error;

      const formattedRecords = (data || []).map((record: any) => ({
        ...record,
        date: new Date(record.visit_date).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        prescription: record.prescription || [],
        vitals: record.vitals || {},
        attachments: record.attachments || [],
      }));

      setRecords(formattedRecords);

      // Extract unique doctors for filter
      const uniqueDoctors = ["all", ...new Set(formattedRecords.map((r: any) => r.doctor_name).filter(Boolean))];
      setDoctors(uniqueDoctors);
    } catch (error) {
      console.error("Error fetching medical records:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter((v) => {
    const matchSearch =
      v.diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      v.service?.toLowerCase().includes(search.toLowerCase()) ||
      v.doctor_name?.toLowerCase().includes(search.toLowerCase());
    const matchDoctor = filterDoctor === "all" || v.doctor_name === filterDoctor;
    return matchSearch && matchDoctor;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Medical History</h1>
        <p className="text-gray-500 text-sm">
          Your electronic medical records — {records.length} visits on file
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
                      <p className="font-bold text-gray-900 text-sm">{visit.diagnosis || "No diagnosis"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{visit.service} · {visit.doctor_name}</p>
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
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Chief Complaint</p>
                        <p className="text-sm text-gray-700">{visit.chief_complaint || "Not recorded"}</p>
                      </div>

                      {visit.vitals && Object.keys(visit.vitals).length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vitals Recorded</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {Object.entries(visit.vitals).map(([key, val]) => (
                              <div key={key} className="bg-gray-50 rounded-2xl p-3 text-center">
                                <p className="text-xs text-gray-400 capitalize">{key.replace(/_/g, ' ')}</p>
                                <p className="text-sm font-bold text-gray-800 mt-0.5">{String(val)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {visit.prescription && visit.prescription.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Pill className="w-4 h-4 text-green-600" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prescription</p>
                          </div>
                          <div className="space-y-2">
                            {visit.prescription.map((rx: any, ri: number) => (
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
                      )}

                      {visit.notes && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className="w-4 h-4 text-green-600" />
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Doctor's Notes</p>
                          </div>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-2xl p-4 leading-relaxed">{visit.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setSelectedVisit(visit)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-2xl text-sm font-semibold hover:bg-green-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Full View
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
                  <p className="text-xs text-gray-500 mt-0.5">Record ID: {selectedVisit.record_id}</p>
                </div>
                <button onClick={() => setSelectedVisit(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-gray-700">Visit Summary</span>
                  </div>
                  <p className="text-sm text-gray-600">{selectedVisit.date} · {selectedVisit.doctor_name}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedVisit.diagnosis}</p>
                </div>
                <p className="text-xs text-gray-400 text-center">
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