import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Pencil, CreditCard, Ban, Search, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../supabase/config";
import { useAuth } from "../../context/AuthContext";
import { writeAuditLog } from "../../utils/auditLog";
import { getAllStates } from "../../utils/nigeriaData";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import toast from "react-hot-toast";

const allStates = getAllStates();
const PAGE_SIZE = 20;

function toDisplayApplicant(row) {
  return {
    rcNumber: row.rc_number,
    personalNumber: row.personal_number,
    surname: row.surname,
    firstName: row.first_name,
    stateOfOrigin: row.state_of_origin,
    bloodGroup: row.blood_group,
    status: row.status,
  };
}

function IconBtn({ title, onClick, children, className }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export default function ApplicantList() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [filterBlood, setFilterBlood] = useState("All");
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const [page, setPage] = useState(1);

  const fetchApplicants = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("applicants")
      .select("personal_number, rc_number, surname, first_name, state_of_origin, blood_group, status")
      .order("created_at", { ascending: false });
    setApplicants((data || []).map(toDisplayApplicant));
    setLoading(false);
  };

  useEffect(() => { fetchApplicants(); }, []);

  const filtered = applicants.filter((a) => {
    const term = search.toLowerCase();
    const matchSearch = !term || a.surname?.toLowerCase().includes(term) || a.firstName?.toLowerCase().includes(term) || a.personalNumber?.toLowerCase().includes(term) || a.rcNumber?.toLowerCase().includes(term);
    const matchStatus = filterStatus === "All" || a.status === filterStatus.toLowerCase();
    const matchState = filterState === "All" || a.stateOfOrigin === filterState;
    const matchBlood = filterBlood === "All" || a.bloodGroup === filterBlood;
    return matchSearch && matchStatus && matchState && matchBlood;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await supabase.from("applicants").update({ status: "suspended", updated_at: new Date().toISOString() })
        .eq("rc_number", deactivateTarget.rcNumber);
      await writeAuditLog("DEACTIVATE", deactivateTarget.personalNumber, currentUser.id, { newStatus: "suspended" });
      setApplicants((prev) => prev.map((a) => a.rcNumber === deactivateTarget.rcNumber ? { ...a, status: "suspended" } : a));
      setDeactivateTarget(null);
      toast.success("Record suspended successfully.");
    } catch {
      toast.error("Failed to deactivate record.");
    } finally {
      setDeactivating(false);
    }
  };

  const selectClass = "border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white";

  return (
    <Layout title="All Records">
      <div className="space-y-4 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Corps Member Records</h2>
            <p className="text-xs text-slate-500 mt-0.5">{filtered.length} record{filtered.length !== 1 ? "s" : ""} found</p>
          </div>
          <Link to="/applicants/register"
            className="flex items-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">
            <UserPlus className="w-4 h-4" />
            Register New
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search name or number…"
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className={selectClass}>
              <option>All</option><option>Active</option><option>Suspended</option><option>Revoked</option>
            </select>
            <select value={filterState} onChange={(e) => { setFilterState(e.target.value); setPage(1); }} className={selectClass}>
              <option>All</option>
              {allStates.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={filterBlood} onChange={(e) => { setFilterBlood(e.target.value); setPage(1); }} className={selectClass}>
              <option>All</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16"><Spinner size="lg" /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">RC Number</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Personal No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">State of Origin</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Blood Group</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginated.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-12 text-slate-400">No records found.</td></tr>
                    ) : paginated.map((a) => (
                      <tr key={a.rcNumber} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{a.rcNumber}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{a.personalNumber}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{a.surname} {a.firstName}</td>
                        <td className="px-4 py-3 text-slate-600">{a.stateOfOrigin}</td>
                        <td className="px-4 py-3 text-slate-600">{a.bloodGroup}</td>
                        <td className="px-4 py-3"><Badge label={a.status} variant={a.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <IconBtn title="View record" onClick={() => navigate(`/applicants/${a.rcNumber}`)}
                              className="text-blue-600 hover:bg-blue-50">
                              <Eye className="w-4 h-4" />
                            </IconBtn>
                            <IconBtn title="Edit record" onClick={() => navigate(`/applicants/${a.rcNumber}/edit`)}
                              className="text-slate-500 hover:bg-slate-100">
                              <Pencil className="w-4 h-4" />
                            </IconBtn>
                            <IconBtn title="Generate ID card" onClick={() => navigate(`/applicants/${a.rcNumber}/idcard`)}
                              className="text-green-700 hover:bg-green-50">
                              <CreditCard className="w-4 h-4" />
                            </IconBtn>
                            {a.status === "active" && (
                              <IconBtn title="Deactivate" onClick={() => setDeactivateTarget(a)}
                                className="text-red-500 hover:bg-red-50">
                                <Ban className="w-4 h-4" />
                              </IconBtn>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-sm">
                  <p className="text-slate-500">
                    Page {page} of {totalPages} &middot; {filtered.length} records
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal isOpen={!!deactivateTarget} title="Confirm Deactivation" onClose={() => setDeactivateTarget(null)}>
        <p className="text-slate-600 mb-6 text-sm">
          Suspend the record for <strong className="text-slate-800">{deactivateTarget?.surname} {deactivateTarget?.firstName}</strong>?
          This action can be reversed by an admin.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeactivateTarget(null)}
            className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium">Cancel</button>
          <button onClick={handleDeactivate} disabled={deactivating}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 disabled:opacity-60 flex items-center gap-2 text-sm font-medium">
            {deactivating && <Spinner size="sm" />}
            {deactivating ? "Suspending…" : "Suspend Record"}
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
