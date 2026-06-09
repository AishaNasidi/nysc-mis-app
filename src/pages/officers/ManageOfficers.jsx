import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { supabase, adminSupabase } from "../../supabase/config";
import { getAllStates } from "../../utils/nigeriaData";
import Layout from "../../components/layout/Layout";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";

const officerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rank: z.string().min(1, "Rank is required"),
  statePosted: z.string().min(1, "State posted is required"),
  role: z.enum(["officer", "admin"], { errorMap: () => ({ message: "Select a role" }) }),
});

const allStates = getAllStates();
const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";
const errClass = "text-red-500 text-xs mt-1";

function RoleBadge({ role }) {
  if (role === "admin") return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">Admin</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Officer</span>;
}

export default function ManageOfficers() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(officerSchema) });

  const fetchOfficers = async () => {
    const { data } = await supabase.from("officers").select("*").order("created_at", { ascending: false });
    setOfficers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOfficers(); }, []);

  const onSubmit = async (data) => {
    setCreating(true);
    try {
      const { data: authData, error: signUpError } = await adminSupabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
      });
      if (signUpError) throw new Error(signUpError.message);
      if (!authData.user) throw new Error("Account creation failed.");

      const { error: insertError } = await supabase.from("officers").insert({
        uid: authData.user.id, full_name: data.fullName, email: data.email,
        role: data.role, rank: data.rank, state_posted: data.statePosted,
      });
      if (insertError) throw new Error(insertError.message);

      toast.success(`Officer account created for ${data.fullName}. Share credentials: ${data.email} / ${data.password}`);
      reset();
      setShowForm(false);
      fetchOfficers();
    } catch (err) {
      toast.error("Failed to create officer: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await supabase.from("officers").update({ disabled: true }).eq("uid", deactivateTarget.uid);
      setOfficers((prev) => prev.map((o) => o.uid === deactivateTarget.uid ? { ...o, disabled: true } : o));
      setDeactivateTarget(null);
      toast.success("Officer account deactivated.");
    } catch {
      toast.error("Failed to deactivate officer.");
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <Layout title="Manage Officers">
      <div className="space-y-5 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-700" />
            <h2 className="text-lg font-bold text-slate-900">Officer Accounts</h2>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition">
            <UserPlus className="w-4 h-4" />
            Create Officer Account
          </button>
        </div>

        {/* Officers table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Full Name", "Email", "Role", "Rank", "State Posted", "Account Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {officers.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-slate-400">No officers found.</td></tr>
                  ) : officers.map((o) => (
                    <tr key={o.uid} className={`hover:bg-slate-50 transition-colors ${o.disabled ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3 font-medium text-slate-800">{o.full_name}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{o.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={o.role} /></td>
                      <td className="px-4 py-3 text-slate-600">{o.rank}</td>
                      <td className="px-4 py-3 text-slate-600">{o.state_posted}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.disabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {o.disabled ? "Disabled" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!o.disabled && (
                          <button onClick={() => setDeactivateTarget(o)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline">Deactivate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create officer modal */}
      <Modal isOpen={showForm} title="Create Officer Account" onClose={() => setShowForm(false)}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div><label className={labelClass}>Full Name *</label><input {...register("fullName")} className={inputClass} />{errors.fullName && <p className={errClass}>{errors.fullName.message}</p>}</div>
          <div><label className={labelClass}>Email *</label><input type="email" {...register("email")} className={inputClass} />{errors.email && <p className={errClass}>{errors.email.message}</p>}</div>
          <div><label className={labelClass}>Password * (min 8 chars)</label><input type="password" {...register("password")} className={inputClass} />{errors.password && <p className={errClass}>{errors.password.message}</p>}</div>
          <div><label className={labelClass}>Rank *</label><input {...register("rank")} className={inputClass} placeholder="e.g. Clearance Officer" />{errors.rank && <p className={errClass}>{errors.rank.message}</p>}</div>
          <div>
            <label className={labelClass}>State Posted *</label>
            <select {...register("statePosted")} className={inputClass}><option value="">Select state</option>{allStates.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            {errors.statePosted && <p className={errClass}>{errors.statePosted.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Role *</label>
            <select {...register("role")} className={inputClass}><option value="">Select role</option><option value="officer">Officer</option><option value="admin">Admin</option></select>
            {errors.role && <p className={errClass}>{errors.role.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium">Cancel</button>
            <button type="submit" disabled={creating}
              className="bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center gap-2 text-sm font-medium">
              {creating && <Spinner size="sm" />}
              {creating ? "Creating…" : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deactivateTarget} title="Confirm Deactivation" onClose={() => setDeactivateTarget(null)}>
        <p className="text-slate-600 mb-6 text-sm">Deactivate officer account for <strong className="text-slate-800">{deactivateTarget?.full_name}</strong>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeactivateTarget(null)}
            className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium">Cancel</button>
          <button onClick={handleDeactivate} disabled={deactivating}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 disabled:opacity-60 flex items-center gap-2 text-sm font-medium">
            {deactivating && <Spinner size="sm" />}
            {deactivating ? "Deactivating…" : "Deactivate"}
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
