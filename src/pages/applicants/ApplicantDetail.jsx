import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Pencil, CreditCard, ArrowLeft } from "lucide-react";
import { supabase } from "../../supabase/config";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm font-medium text-slate-800 mt-0.5">{value || "—"}</p>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">{title}</h3>
      {children}
    </div>
  );
}

function rowToApplicant(row) {
  if (!row) return null;
  return {
    personalNumber: row.personal_number, rcNumber: row.rc_number, idFormNumber: row.id_form_number,
    surname: row.surname, firstName: row.first_name, middleName: row.middle_name,
    dateOfBirth: row.date_of_birth, gender: row.gender, bloodGroup: row.blood_group,
    maritalStatus: row.marital_status, stateOfOrigin: row.state_of_origin, lgaOfOrigin: row.lga_of_origin,
    hometown: row.hometown, residentialAddress: row.residential_address,
    stateOfResidence: row.state_of_residence, lgaOfResidence: row.lga_of_residence,
    phoneNumber: row.phone_number, occupation: row.occupation, nextOfKinName: row.next_of_kin_name,
    nextOfKinAddress: row.next_of_kin_address, nextOfKinPhone: row.next_of_kin_phone,
    photoURL: row.photo_url, signatureURL: row.signature_url, status: row.status,
  };
}

export default function ApplicantDetail() {
  const { rcNumber } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("applicants").select("*").eq("rc_number", rcNumber).maybeSingle();
      setApplicant(rowToApplicant(data));
      setLoading(false);
    };
    fetch();
  }, [rcNumber]);

  if (loading) return (
    <Layout title="Corps Member Detail">
      <div className="flex justify-center items-center py-24"><Spinner size="lg" /></div>
    </Layout>
  );

  if (!applicant) return (
    <Layout title="Corps Member Detail">
      <div className="text-center py-24 text-slate-500">Record not found.</div>
    </Layout>
  );

  const fullName = [applicant.surname, applicant.firstName, applicant.middleName].filter(Boolean).join(" ");

  return (
    <Layout title="Corps Member Detail">
      <div className="max-w-4xl mx-auto space-y-4 animate-fadeIn">
        {/* Hero banner */}
        <div className="bg-gradient-to-r from-green-900 to-green-700 text-white rounded-2xl overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row md:items-start gap-5">
            {/* Photo */}
            <div className="flex-shrink-0">
              {applicant.photoURL ? (
                <img src={applicant.photoURL} alt="Passport" className="w-24 h-32 object-cover rounded-xl border-2 border-white/30 shadow-lg" />
              ) : (
                <div className="w-24 h-32 bg-white/10 rounded-xl flex items-center justify-center text-3xl font-bold border-2 border-white/20">
                  {applicant.surname?.charAt(0)}
                </div>
              )}
            </div>

            {/* Name + codes */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold leading-tight">{fullName}</h2>
                  <p className="text-green-300 font-mono text-sm mt-1">{applicant.personalNumber}</p>
                </div>
                <Badge label={applicant.status} variant={applicant.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-green-400 text-xs uppercase tracking-wide">RC Number</p>
                  <p className="font-semibold font-mono">{applicant.rcNumber}</p>
                </div>
                <div>
                  <p className="text-green-400 text-xs uppercase tracking-wide">Form Number</p>
                  <p className="font-semibold font-mono">{applicant.idFormNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action bar inside hero */}
          <div className="bg-black/10 px-6 py-3 flex items-center gap-3 flex-wrap">
            <Link to={`/applicants/${rcNumber}/edit`}
              className="flex items-center gap-1.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
              <Pencil className="w-3.5 h-3.5" />
              Edit Record
            </Link>
            <Link to={`/applicants/${rcNumber}/idcard`}
              className="flex items-center gap-1.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
              <CreditCard className="w-3.5 h-3.5" />
              Generate ID Card
            </Link>
            <button onClick={() => navigate("/applicants")}
              className="flex items-center gap-1.5 text-sm font-medium text-green-200 hover:text-white ml-auto transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to List
            </button>
          </div>
        </div>

        {/* Two-column detail layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left: documents */}
          <div className="space-y-4">
            <SectionCard title="Documents">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Passport Photo</p>
                  {applicant.photoURL
                    ? <img src={applicant.photoURL} alt="Photo" className="w-full max-w-[120px] aspect-[3/4] object-cover rounded-lg border border-slate-200" />
                    : <div className="w-24 h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs">No photo</div>}
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Signature</p>
                  {applicant.signatureURL
                    ? <img src={applicant.signatureURL} alt="Signature" className="h-14 object-contain rounded border border-slate-200 bg-white p-1" />
                    : <div className="h-14 w-28 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs">No signature</div>}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Right: all fields */}
          <div className="md:col-span-2 space-y-4">
            <SectionCard title="Personal Information">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Surname" value={applicant.surname} />
                <Field label="First Name" value={applicant.firstName} />
                <Field label="Middle Name" value={applicant.middleName} />
                <Field label="Date of Birth" value={applicant.dateOfBirth} />
                <Field label="Gender" value={applicant.gender} />
                <Field label="Blood Group" value={applicant.bloodGroup} />
                <Field label="Marital Status" value={applicant.maritalStatus} />
              </div>
            </SectionCard>

            <SectionCard title="State & LGA Information">
              <div className="grid grid-cols-2 gap-4">
                <Field label="State of Origin" value={applicant.stateOfOrigin} />
                <Field label="LGA of Origin" value={applicant.lgaOfOrigin} />
                <Field label="Hometown" value={applicant.hometown} />
              </div>
            </SectionCard>

            <SectionCard title="Residential Information">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Field label="Residential Address" value={applicant.residentialAddress} /></div>
                <Field label="State of Residence" value={applicant.stateOfResidence} />
                <Field label="LGA of Residence" value={applicant.lgaOfResidence} />
                <Field label="Phone Number" value={applicant.phoneNumber} />
                <Field label="Occupation" value={applicant.occupation} />
              </div>
            </SectionCard>

            <SectionCard title="Next of Kin">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name" value={applicant.nextOfKinName} />
                <Field label="Phone" value={applicant.nextOfKinPhone} />
                <div className="col-span-2"><Field label="Address" value={applicant.nextOfKinAddress} /></div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
