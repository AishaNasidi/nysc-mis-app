import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../../supabase/config";
import { useAuth } from "../../context/AuthContext";
import { writeAuditLog } from "../../utils/auditLog";
import { getAllStates, getLGAsByState } from "../../utils/nigeriaData";
import { IDCardFront } from "../../components/idcard/IDCardTemplate";
import Layout from "../../components/layout/Layout";
import Spinner from "../../components/ui/Spinner";

const editSchema = z.object({
  surname: z.string().min(1, "Surname is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female"], { errorMap: () => ({ message: "Select gender" }) }),
  bloodGroup: z.enum(["A+","A-","B+","B-","O+","O-","AB+","AB-"], { errorMap: () => ({ message: "Select blood group" }) }),
  maritalStatus: z.enum(["Single","Married","Divorced","Widowed"], { errorMap: () => ({ message: "Select marital status" }) }),
  stateOfOrigin: z.string().min(1, "State of origin is required"),
  lgaOfOrigin: z.string().min(1, "LGA of origin is required"),
  hometown: z.string().min(1, "Hometown is required"),
  residentialAddress: z.string().min(5, "Address is required"),
  stateOfResidence: z.string().min(1, "State of residence is required"),
  lgaOfResidence: z.string().min(1, "LGA of residence is required"),
  phoneNumber: z.string().regex(/^0[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  occupation: z.string().min(1, "Occupation is required"),
  nextOfKinName: z.string().min(1, "Next of kin name is required"),
  nextOfKinAddress: z.string().min(5, "Next of kin address is required"),
  nextOfKinPhone: z.string().regex(/^0[789][01]\d{8}$/, "Enter a valid phone number"),
});

const allStates = getAllStates();

async function uploadFile(bucket, path, file) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw new Error("Upload failed: " + error.message);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

const STEPS = ["Personal Info", "Location", "Contact", "Next of Kin", "Documents"];

const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 transition bg-white text-slate-800 placeholder:text-slate-400";
const labelClass = "block text-sm font-medium text-slate-700 mb-1";
const errClass = "text-red-500 text-xs mt-1";

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex flex-col items-center flex-1 relative">
            {i < STEPS.length - 1 && (
              <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < current ? "bg-green-600" : "bg-slate-200"}`} />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 relative
              ${done ? "bg-green-600 text-white" : active ? "bg-green-800 text-white ring-2 ring-green-300" : "bg-slate-200 text-slate-500"}`}>
              {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs mt-1.5 font-medium text-center leading-tight hidden sm:block
              ${active ? "text-green-800" : done ? "text-green-600" : "text-slate-400"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function UploadZone({ label, accept, maxMB, onFile, previewUrl }) {
  const [dragging, setDragging] = useState(false);
  const handle = (file) => { if (file) onFile(file); };
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors p-4
          ${dragging ? "border-green-500 bg-green-50" : "border-slate-300 hover:border-green-400 hover:bg-slate-50"}`}
      >
        <input type="file" accept={accept} className="sr-only" onChange={(e) => handle(e.target.files[0])} />
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="h-24 object-contain rounded-lg mb-2" />
        ) : (
          <Upload className="w-7 h-7 text-slate-400 mb-2" />
        )}
        <p className="text-xs text-slate-500 text-center">{previewUrl ? "Click to replace" : "Click to upload or drag & drop"}</p>
        <p className="text-xs text-slate-400">Max {maxMB}MB — JPG or PNG</p>
      </label>
    </div>
  );
}

export default function EditApplicant() {
  const { rcNumber } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [original, setOriginal] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [newSig, setNewSig] = useState(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState(null);
  const [newSigPreview, setNewSigPreview] = useState(null);

  const { register, handleSubmit, watch, reset, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema),
    mode: "onTouched",
  });

  const watchedOriginState = watch("stateOfOrigin");
  const watchedResidenceState = watch("stateOfResidence");
  const lgasOfOrigin = getLGAsByState(watchedOriginState);
  const lgasOfResidence = getLGAsByState(watchedResidenceState);

  const previewApplicant = {
    personalNumber: original?.personal_number || "—",
    surname: watch("surname") || original?.surname || "—",
    firstName: watch("firstName") || original?.first_name || "—",
    middleName: watch("middleName") || original?.middle_name || "",
    dateOfBirth: watch("dateOfBirth") || original?.date_of_birth || "—",
    gender: watch("gender") || original?.gender || "—",
    bloodGroup: watch("bloodGroup") || original?.blood_group || "—",
    stateOfOrigin: watchedOriginState || original?.state_of_origin || "—",
    lgaOfOrigin: watch("lgaOfOrigin") || original?.lga_of_origin || "—",
    stateOfResidence: watchedResidenceState || original?.state_of_residence || "—",
    phoneNumber: watch("phoneNumber") || original?.phone_number || "—",
    photoURL: newPhotoPreview || original?.photo_url,
    signatureURL: newSigPreview || original?.signature_url,
  };

  const STEP_FIELDS = [
    ["surname", "firstName", "middleName", "dateOfBirth", "gender", "bloodGroup", "maritalStatus"],
    ["stateOfOrigin", "lgaOfOrigin", "hometown"],
    ["residentialAddress", "stateOfResidence", "lgaOfResidence", "phoneNumber", "occupation"],
    ["nextOfKinName", "nextOfKinAddress", "nextOfKinPhone"],
    [],
  ];

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => s + 1);
  };

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("applicants").select("*").eq("rc_number", rcNumber).maybeSingle();
      if (data) {
        setOriginal(data);
        reset({
          surname: data.surname || "", firstName: data.first_name || "",
          middleName: data.middle_name || "", dateOfBirth: data.date_of_birth || "",
          gender: data.gender || "", bloodGroup: data.blood_group || "",
          maritalStatus: data.marital_status || "", stateOfOrigin: data.state_of_origin || "",
          lgaOfOrigin: data.lga_of_origin || "", hometown: data.hometown || "",
          residentialAddress: data.residential_address || "", stateOfResidence: data.state_of_residence || "",
          lgaOfResidence: data.lga_of_residence || "", phoneNumber: data.phone_number || "",
          occupation: data.occupation || "", nextOfKinName: data.next_of_kin_name || "",
          nextOfKinAddress: data.next_of_kin_address || "", nextOfKinPhone: data.next_of_kin_phone || "",
        });
      }
      setLoading(false);
    };
    fetch();
  }, [rcNumber, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const uid = currentUser.id;
      const updates = {
        surname: data.surname, first_name: data.firstName, middle_name: data.middleName || "",
        date_of_birth: data.dateOfBirth, gender: data.gender, blood_group: data.bloodGroup,
        marital_status: data.maritalStatus, state_of_origin: data.stateOfOrigin,
        lga_of_origin: data.lgaOfOrigin, hometown: data.hometown,
        residential_address: data.residentialAddress, state_of_residence: data.stateOfResidence,
        lga_of_residence: data.lgaOfResidence, phone_number: data.phoneNumber,
        occupation: data.occupation, next_of_kin_name: data.nextOfKinName,
        next_of_kin_address: data.nextOfKinAddress, next_of_kin_phone: data.nextOfKinPhone,
        updated_at: new Date().toISOString(),
      };
      if (newPhoto) updates.photo_url = await uploadFile("applicants", `${uid}/photo_${Date.now()}.jpg`, newPhoto);
      if (newSig) updates.signature_url = await uploadFile("applicants", `${uid}/signature_${Date.now()}.jpg`, newSig);

      const { error } = await supabase.from("applicants").update(updates).eq("rc_number", rcNumber);
      if (error) throw new Error(error.message);
      const changedFields = Object.keys(data).filter((k) => String(data[k]) !== String(original?.[k]));
      await writeAuditLog("UPDATE", original?.personal_number || rcNumber, uid, { changedFields });
      toast.success("Record updated successfully.");
      navigate(`/applicants/${rcNumber}`);
    } catch (err) {
      toast.error("Update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Layout title="Edit Applicant">
      <div className="flex justify-center items-center py-24"><Spinner size="lg" /></div>
    </Layout>
  );

  if (!original) return (
    <Layout title="Edit Applicant">
      <div className="text-center py-24 text-slate-500">Record not found.</div>
    </Layout>
  );

  return (
    <Layout title="Edit Applicant">
      <div className="flex gap-6 items-start animate-fadeIn">
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {/* Read-only codes */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-3 gap-4 text-sm">
              {[["Personal Number", original?.personal_number], ["RC Number", original?.rc_number], ["Form Number", original?.id_form_number]].map(([lbl, val]) => (
                <div key={lbl}>
                  <p className="text-xs text-slate-500">{lbl}</p>
                  <p className="font-semibold font-mono text-slate-800">{val}</p>
                </div>
              ))}
            </div>

            <StepIndicator current={step} />

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Step 0 */}
              {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Surname *</label><input {...register("surname")} className={inputClass} />{errors.surname && <p className={errClass}>{errors.surname.message}</p>}</div>
                  <div><label className={labelClass}>First Name *</label><input {...register("firstName")} className={inputClass} />{errors.firstName && <p className={errClass}>{errors.firstName.message}</p>}</div>
                  <div><label className={labelClass}>Middle Name</label><input {...register("middleName")} className={inputClass} /></div>
                  <div><label className={labelClass}>Date of Birth *</label><input type="date" {...register("dateOfBirth")} className={inputClass} />{errors.dateOfBirth && <p className={errClass}>{errors.dateOfBirth.message}</p>}</div>
                  <div><label className={labelClass}>Gender *</label><select {...register("gender")} className={inputClass}><option value="">Select gender</option><option>Male</option><option>Female</option></select>{errors.gender && <p className={errClass}>{errors.gender.message}</p>}</div>
                  <div><label className={labelClass}>Blood Group *</label><select {...register("bloodGroup")} className={inputClass}><option value="">Select blood group</option>{["A+","A-","B+","B-","O+","O-","AB+","AB-"].map((b) => <option key={b}>{b}</option>)}</select>{errors.bloodGroup && <p className={errClass}>{errors.bloodGroup.message}</p>}</div>
                  <div><label className={labelClass}>Marital Status *</label><select {...register("maritalStatus")} className={inputClass}><option value="">Select</option>{["Single","Married","Divorced","Widowed"].map((s) => <option key={s}>{s}</option>)}</select>{errors.maritalStatus && <p className={errClass}>{errors.maritalStatus.message}</p>}</div>
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelClass}>State of Origin *</label><select {...register("stateOfOrigin")} className={inputClass}><option value="">Select state</option>{allStates.map((s) => <option key={s}>{s}</option>)}</select>{errors.stateOfOrigin && <p className={errClass}>{errors.stateOfOrigin.message}</p>}</div>
                  <div><label className={labelClass}>LGA of Origin *</label><select {...register("lgaOfOrigin")} className={inputClass} disabled={!watchedOriginState}><option value="">Select LGA</option>{lgasOfOrigin.map((l) => <option key={l}>{l}</option>)}</select>{errors.lgaOfOrigin && <p className={errClass}>{errors.lgaOfOrigin.message}</p>}</div>
                  <div className="md:col-span-2"><label className={labelClass}>Hometown *</label><input {...register("hometown")} className={inputClass} />{errors.hometown && <p className={errClass}>{errors.hometown.message}</p>}</div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className={labelClass}>Residential Address *</label><textarea rows={3} {...register("residentialAddress")} className={inputClass} />{errors.residentialAddress && <p className={errClass}>{errors.residentialAddress.message}</p>}</div>
                  <div><label className={labelClass}>State of Residence *</label><select {...register("stateOfResidence")} className={inputClass}><option value="">Select state</option>{allStates.map((s) => <option key={s}>{s}</option>)}</select>{errors.stateOfResidence && <p className={errClass}>{errors.stateOfResidence.message}</p>}</div>
                  <div><label className={labelClass}>LGA of Residence *</label><select {...register("lgaOfResidence")} className={inputClass} disabled={!watchedResidenceState}><option value="">Select LGA</option>{lgasOfResidence.map((l) => <option key={l}>{l}</option>)}</select>{errors.lgaOfResidence && <p className={errClass}>{errors.lgaOfResidence.message}</p>}</div>
                  <div><label className={labelClass}>Phone Number *</label><input {...register("phoneNumber")} className={inputClass} />{errors.phoneNumber && <p className={errClass}>{errors.phoneNumber.message}</p>}</div>
                  <div><label className={labelClass}>Occupation *</label><input {...register("occupation")} className={inputClass} />{errors.occupation && <p className={errClass}>{errors.occupation.message}</p>}</div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Full Name *</label><input {...register("nextOfKinName")} className={inputClass} />{errors.nextOfKinName && <p className={errClass}>{errors.nextOfKinName.message}</p>}</div>
                  <div><label className={labelClass}>Phone Number *</label><input {...register("nextOfKinPhone")} className={inputClass} />{errors.nextOfKinPhone && <p className={errClass}>{errors.nextOfKinPhone.message}</p>}</div>
                  <div className="md:col-span-2"><label className={labelClass}>Address *</label><textarea rows={3} {...register("nextOfKinAddress")} className={inputClass} />{errors.nextOfKinAddress && <p className={errClass}>{errors.nextOfKinAddress.message}</p>}</div>
                </div>
              )}

              {/* Step 4 — Documents */}
              {step === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UploadZone label="New Passport Photo (optional, max 2MB)" accept="image/jpeg,image/png" maxMB={2}
                    previewUrl={newPhotoPreview || original?.photo_url}
                    onFile={(f) => { setNewPhoto(f); setNewPhotoPreview(URL.createObjectURL(f)); }} />
                  <UploadZone label="New Signature (optional, max 1MB)" accept="image/jpeg,image/png" maxMB={1}
                    previewUrl={newSigPreview || original?.signature_url}
                    onFile={(f) => { setNewSig(f); setNewSigPreview(URL.createObjectURL(f)); }} />
                </div>
              )}

              <div className="flex justify-between items-center mt-8 pt-5 border-t border-slate-100">
                <button type="button" onClick={() => setStep((s) => s - 1)} disabled={step === 0}
                  className="border border-slate-200 text-slate-700 px-5 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Back
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => navigate(`/applicants/${rcNumber}`)}
                    className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium transition">
                    Cancel
                  </button>
                  {step < STEPS.length - 1 ? (
                    <button type="button" onClick={handleNext}
                      className="bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition">
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => { if (!saving) handleSubmit(onSubmit)(); }}
                      className="bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60 flex items-center gap-2 transition">
                      {saving && <Spinner size="sm" />}
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Live ID card preview */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">Live ID Preview</p>
            <div style={{ transform: "scale(0.72)", transformOrigin: "top center", marginBottom: "-40px" }}>
              <IDCardFront applicant={previewApplicant} officerState="" />
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">Updates as you type</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
