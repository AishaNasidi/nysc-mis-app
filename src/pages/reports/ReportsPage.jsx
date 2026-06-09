import { useState } from "react";
import { BarChart2 } from "lucide-react";
import { supabase } from "../../supabase/config";
import { getAllStates, getLGAsByState } from "../../utils/nigeriaData";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

const allStates = getAllStates();
const selectClass = "border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white w-full";

export default function ReportsPage() {
  const [filterState, setFilterState] = useState("");
  const [filterLga, setFilterLga] = useState("");
  const [filterBlood, setFilterBlood] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const lgaOptions = getLGAsByState(filterState);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      let q = supabase.from("applicants").select(
        "personal_number, rc_number, surname, first_name, state_of_origin, lga_of_origin, blood_group, gender, marital_status, status"
      ).order("created_at", { ascending: false });

      if (filterStatus) q = q.eq("status", filterStatus);
      if (filterBlood) q = q.eq("blood_group", filterBlood);
      if (filterGender) q = q.eq("gender", filterGender);
      if (filterState) q = q.eq("state_of_origin", filterState);
      if (filterLga) q = q.eq("lga_of_origin", filterLga);

      const { data } = await q;
      setResults(data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Reports">
      <div className="space-y-5 animate-fadeIn">
        {/* Filter panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-green-700" />
            <h3 className="text-sm font-semibold text-slate-800">Filter Criteria</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">State of Origin</label>
              <select value={filterState} onChange={(e) => { setFilterState(e.target.value); setFilterLga(""); }} className={selectClass}>
                <option value="">All States</option>
                {allStates.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">LGA of Origin</label>
              <select value={filterLga} onChange={(e) => setFilterLga(e.target.value)} className={selectClass} disabled={!filterState}>
                <option value="">All LGAs</option>
                {lgaOptions.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Blood Group</label>
              <select value={filterBlood} onChange={(e) => setFilterBlood(e.target.value)} className={selectClass}>
                <option value="">All</option>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
              <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className={selectClass}>
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <button onClick={handleGenerate} disabled={loading}
            className="flex items-center gap-2 bg-green-800 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm font-medium transition">
            {loading ? <Spinner size="sm" /> : <BarChart2 className="w-4 h-4" />}
            {loading ? "Generating…" : "Generate Report"}
          </button>
        </div>

        {results !== null && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Report Results</h3>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                {results.length} record{results.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["RC No.", "Personal No.", "Surname", "First Name", "State", "LGA", "Blood Group", "Gender", "Marital", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-10 text-slate-400">No records match the selected filters.</td></tr>
                  ) : results.map((a) => (
                    <tr key={a.personal_number} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{a.rc_number}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{a.personal_number}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{a.surname}</td>
                      <td className="px-4 py-3 text-slate-700">{a.first_name}</td>
                      <td className="px-4 py-3 text-slate-600">{a.state_of_origin}</td>
                      <td className="px-4 py-3 text-slate-600">{a.lga_of_origin}</td>
                      <td className="px-4 py-3 text-slate-600">{a.blood_group}</td>
                      <td className="px-4 py-3 text-slate-600">{a.gender}</td>
                      <td className="px-4 py-3 text-slate-600">{a.marital_status}</td>
                      <td className="px-4 py-3"><Badge label={a.status} variant={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
