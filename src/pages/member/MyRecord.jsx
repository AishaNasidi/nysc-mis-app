import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import nyscLogo from "../../assets/NYSC-LOGO.png";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase/config";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5">{value || "—"}</p>
    </div>
  );
}

function AccordionSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default function MyRecord() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("applicants")
        .select("*")
        .eq("linked_uid", currentUser.id)
        .single();
      setRecord(data || null);
      setLoading(false);
    };
    fetch();
  }, [currentUser.id]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (!record) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-slate-800 font-semibold mb-2">No Record Found</h3>
        <p className="text-slate-500 text-sm mb-5">No record linked to your account yet. Contact your coordinator.</p>
        <button onClick={handleLogout} className="bg-green-800 text-white px-5 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-green-900 text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={nyscLogo} alt="NYSC Logo" className="w-9 h-9 object-contain" />
            <div>
              <p className="font-bold text-sm leading-tight">NYSC Management Information System</p>
              <p className="text-green-400 text-xs">Corps Member Portal</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-green-200 hover:text-white transition">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {/* Profile hero card */}
        <div className="bg-gradient-to-r from-green-900 to-green-700 text-white rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-center md:items-start">
          {record.photo_url ? (
            <img src={record.photo_url} alt="Photo" className="w-24 h-32 object-cover rounded-xl border-2 border-white/30 shadow-lg flex-shrink-0" />
          ) : (
            <div className="w-24 h-32 bg-white/10 rounded-xl flex items-center justify-center text-3xl font-bold border-2 border-white/20 flex-shrink-0">
              {record.surname?.charAt(0)}
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold">{record.surname} {record.first_name} {record.middle_name}</h2>
            <p className="text-green-300 font-mono text-sm mt-1">{record.personal_number}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-green-400 text-xs uppercase tracking-wide">RC Number</p>
                <p className="font-semibold font-mono">{record.rc_number}</p>
              </div>
              <div>
                <p className="text-green-400 text-xs uppercase tracking-wide">Form Number</p>
                <p className="font-semibold font-mono">{record.id_form_number}</p>
              </div>
            </div>
            <div className="mt-3"><Badge label={record.status} variant={record.status} /></div>
          </div>
        </div>

        {/* Accordion sections */}
        <AccordionSection title="Personal Information" defaultOpen={true}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Surname" value={record.surname} />
            <Field label="First Name" value={record.first_name} />
            <Field label="Middle Name" value={record.middle_name} />
            <Field label="Date of Birth" value={record.date_of_birth} />
            <Field label="Gender" value={record.gender} />
            <Field label="Blood Group" value={record.blood_group} />
            <Field label="Marital Status" value={record.marital_status} />
          </div>
        </AccordionSection>

        <AccordionSection title="Location Information">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="State of Origin" value={record.state_of_origin} />
            <Field label="LGA of Origin" value={record.lga_of_origin} />
            <Field label="Hometown" value={record.hometown} />
            <div className="col-span-2 md:col-span-3"><Field label="Residential Address" value={record.residential_address} /></div>
            <Field label="State of Residence" value={record.state_of_residence} />
            <Field label="LGA of Residence" value={record.lga_of_residence} />
            <Field label="Phone Number" value={record.phone_number} />
            <Field label="Occupation" value={record.occupation} />
          </div>
        </AccordionSection>

        <AccordionSection title="Next of Kin">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Name" value={record.next_of_kin_name} />
            <Field label="Phone" value={record.next_of_kin_phone} />
            <div className="col-span-2 md:col-span-3"><Field label="Address" value={record.next_of_kin_address} /></div>
          </div>
        </AccordionSection>

        {record.signature_url && (
          <AccordionSection title="Signature">
            <img src={record.signature_url} alt="Signature" className="h-16 object-contain border border-slate-200 rounded-lg bg-white p-2" />
          </AccordionSection>
        )}
      </main>
    </div>
  );
}
