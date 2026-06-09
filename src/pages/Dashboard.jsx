import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from "recharts";
import { Users, UserCheck, UserMinus, UserX, UserPlus, FileText, BarChart2 } from "lucide-react";
import { supabase } from "../supabase/config";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/layout/Layout";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";

const COLORS = ["#166534", "#16a34a", "#22c55e", "#4ade80", "#86efac", "#15803d", "#14532d", "#4ade80"];

function StatCard({ label, value, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 animate-fadeIn">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value ?? "—"}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({ total: null, active: null, suspended: null, revoked: null });
  const [recent, setRecent] = useState([]);
  const [chartData, setChartData] = useState({ states: [], bloodGroups: [] });
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [total, active, suspended, revoked] = await Promise.all([
        supabase.from("applicants").select("*", { count: "exact", head: true }),
        supabase.from("applicants").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("applicants").select("*", { count: "exact", head: true }).eq("status", "suspended"),
        supabase.from("applicants").select("*", { count: "exact", head: true }).eq("status", "revoked"),
      ]);
      setStats({ total: total.count ?? 0, active: active.count ?? 0, suspended: suspended.count ?? 0, revoked: revoked.count ?? 0 });
      setLoadingStats(false);
    };

    const fetchCharts = async () => {
      const { data } = await supabase.from("applicants").select("state_of_origin, blood_group");
      const all = data || [];
      const stateMap = {}, bloodMap = {};
      all.forEach((a) => {
        if (a.state_of_origin) stateMap[a.state_of_origin] = (stateMap[a.state_of_origin] || 0) + 1;
        if (a.blood_group) bloodMap[a.blood_group] = (bloodMap[a.blood_group] || 0) + 1;
      });
      const states = Object.entries(stateMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));
      const bloodGroups = Object.entries(bloodMap).map(([name, value]) => ({ name, value }));
      setChartData({ states, bloodGroups });
      setLoadingCharts(false);
    };

    const fetchRecent = async () => {
      const { data } = await supabase.from("applicants")
        .select("personal_number, rc_number, surname, first_name, state_of_origin, status")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecent(data || []);
    };

    fetchStats();
    fetchCharts();
    fetchRecent();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const firstName = userProfile?.full_name?.split(" ")[0] ?? userProfile?.fullName?.split(" ")[0] ?? "Officer";

  return (
    <Layout title="Dashboard">
      <div className="space-y-6 animate-fadeIn">
        {/* Page header */}
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{greeting}, {firstName}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{today}</p>
          </div>
        </div>

        {/* Stat cards */}
        {loadingStats ? (
          <div className="flex justify-center py-8"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Corps Members" value={stats.total} icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600" />
            <StatCard label="Active Members" value={stats.active} icon={UserCheck} iconBg="bg-green-50" iconColor="text-green-700" />
            <StatCard label="Suspended" value={stats.suspended} icon={UserMinus} iconBg="bg-yellow-50" iconColor="text-yellow-600" />
            <StatCard label="Revoked" value={stats.revoked} icon={UserX} iconBg="bg-red-50" iconColor="text-red-600" />
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link to="/applicants/register"
              className="flex items-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">
              <UserPlus className="w-4 h-4" />
              Register Corps Member
            </Link>
            <Link to="/applicants"
              className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg hover:bg-green-50 text-sm font-medium transition-colors">
              <Users className="w-4 h-4" />
              View All Records
            </Link>
            <Link to="/reports"
              className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium transition-colors">
              <BarChart2 className="w-4 h-4" />
              Generate Report
            </Link>
          </div>
        </div>

        {/* Charts */}
        {loadingCharts ? (
          <div className="flex justify-center py-8"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Corps Members by State of Origin</h3>
                <p className="text-xs text-slate-500">Top 10 states</p>
              </div>
              {chartData.states.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData.states} margin={{ top: 5, right: 10, bottom: 30, left: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#166534" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Blood Group Distribution</h3>
                <p className="text-xs text-slate-500">All registered members</p>
              </div>
              {chartData.bloodGroups.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-8">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={chartData.bloodGroups} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {chartData.bloodGroups.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend /><Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* Recent registrations */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Recent Registrations</h3>
              <p className="text-xs text-slate-500">Last 5 corps members added</p>
            </div>
            <Link to="/applicants" className="text-xs text-green-700 hover:text-green-900 font-medium flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Personal No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">State of Origin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recent.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-sm">No registrations yet.</td></tr>
                ) : recent.map((a) => (
                  <tr key={a.personal_number} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{a.personal_number}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{a.surname} {a.first_name}</td>
                    <td className="px-4 py-3 text-slate-600">{a.state_of_origin}</td>
                    <td className="px-4 py-3"><Badge label={a.status} variant={a.status} /></td>
                    <td className="px-4 py-3">
                      <Link to={`/applicants/${a.rc_number}`} className="text-green-700 hover:text-green-900 text-xs font-medium">View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
