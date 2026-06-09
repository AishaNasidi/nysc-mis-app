import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { supabase } from "../../supabase/config";
import { useAuth } from "../../context/AuthContext";
import { IDCardFront, IDCardBack } from "../../components/idcard/IDCardTemplate";
import Layout from "../../components/layout/Layout";
import Spinner from "../../components/ui/Spinner";

function rowToApplicant(row) {
  if (!row) return null;
  return {
    personalNumber: row.personal_number,
    rcNumber: row.rc_number,
    idFormNumber: row.id_form_number,
    surname: row.surname,
    firstName: row.first_name,
    middleName: row.middle_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    bloodGroup: row.blood_group,
    stateOfOrigin: row.state_of_origin,
    lgaOfOrigin: row.lga_of_origin,
    stateOfResidence: row.state_of_residence,
    phoneNumber: row.phone_number,
    nextOfKinName: row.next_of_kin_name,
    nextOfKinPhone: row.next_of_kin_phone,
    photoURL: row.photo_url,
    signatureURL: row.signature_url,
  };
}

export default function IDCardPage() {
  const { rcNumber } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const printRef = useRef();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("applicants")
        .select("*")
        .eq("rc_number", rcNumber)
        .maybeSingle();
      setApplicant(rowToApplicant(data));
      setLoading(false);
    };
    fetchData();
  }, [rcNumber]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `NYSC_ID_${applicant?.rcNumber}`,
    pageStyle: `
      @page { size: 85.6mm 108mm; margin: 0; }
      @media print {
        body { margin: 0; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `,
  });

  if (loading) return (
    <Layout title="Generate ID Card">
      <div className="flex justify-center items-center py-24"><Spinner size="lg" /></div>
    </Layout>
  );

  if (!applicant) return (
    <Layout title="Generate ID Card">
      <div className="text-center py-24 text-gray-500">Record not found.</div>
    </Layout>
  );

  const officerState = userProfile?.state_posted || userProfile?.statePosted;

  return (
    <Layout title="Generate ID Card">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">ID Card Preview</h2>
              <p className="text-sm text-gray-500 mt-1">
                {applicant.surname} {applicant.firstName} — {applicant.personalNumber}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handlePrint}
                className="bg-green-800 text-white px-5 py-2 rounded hover:bg-green-700 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Both Sides
              </button>
              <button onClick={() => navigate(`/applicants/${rcNumber}`)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 text-sm">
                Back to Record
              </button>
            </div>
          </div>

          {/* Preview: front then back stacked vertically with gap */}
          <div className="flex flex-col items-center gap-0">
            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Front</p>
              <div style={{ transform: "scale(1.4)", transformOrigin: "top center", marginBottom: "80px" }}>
                <IDCardFront applicant={applicant} officerState={officerState} />
              </div>
            </div>
            <div className="flex flex-col items-center" style={{ marginTop: "16px" }}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Back</p>
              <div style={{ transform: "scale(1.4)", transformOrigin: "top center", marginBottom: "80px" }}>
                <IDCardBack applicant={applicant} />
              </div>
            </div>
          </div>

          {/* Hidden print-only target: front then back stacked vertically */}
          <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
            <div ref={printRef}>
              <IDCardFront applicant={applicant} officerState={officerState} />
              <IDCardBack applicant={applicant} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
