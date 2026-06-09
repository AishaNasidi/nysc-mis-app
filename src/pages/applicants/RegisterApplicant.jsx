import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Upload, UserPlus, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../../supabase/config";
import { useAuth } from "../../context/AuthContext";
import { generateApplicantCodes } from "../../utils/generateCodes";
import { writeAuditLog } from "../../utils/auditLog";
import { getAllStates, getLGAsByState } from "../../utils/nigeriaData";
import { IDCardFront } from "../../components/idcard/IDCardTemplate";
import Layout from "../../components/layout/Layout";
import Spinner from "../../components/ui/Spinner";

const STATE_CODES = {
  "Abia": "AB", "Adamawa": "AD", "Akwa Ibom": "AK", "Anambra": "AN",
  "Bauchi": "BA", "Bayelsa": "BY", "Benue": "BE", "Borno": "BO",
  "Cross River": "CR", "Delta": "DE", "Ebonyi": "EB", "Edo": "ED",
  "Ekiti": "EK", "Enugu": "EN", "FCT Abuja": "FC", "Gombe": "GO",
  "Imo": "IM", "Jigawa": "JI", "Kaduna": "KD", "Kano": "KN",
  "Katsina": "KT", "Kebbi": "KB", "Kogi": "KO", "Kwara": "KW",
  "Lagos": "LA", "Nasarawa": "NA", "Niger": "NI", "Ogun": "OG",
  "Ondo": "ON", "Osun": "OS", "Oyo": "OY", "Plateau": "PL",
  "Rivers": "RI", "Sokoto": "SO", "Taraba": "TA", "Yobe": "YO",
  "Zamfara": "ZA",
};

const registrationSchema = z.object({
  surname: z.string().min(1, "Surname is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female"], { errorMap: () => ({ message: "Select gender" }) }),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"], { errorMap: () => ({ message: "Select blood group" }) }),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"], { errorMap: () => ({ message: "Select marital status" }) }),
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

function UploadZone({ label, accept, maxMB, onFile, previewUrl, error }) {
  const [dragging, setDragging] = useState(false);

  const handle = (file) => {
    if (!file) return;
    onFile(file);
  };

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
        <input type="file" accept={accept} className="sr-only"
          onChange={(e) => handle(e.target.files[0])} />
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="h-24 object-contain rounded-lg mb-2" />
        ) : (
          <Upload className="w-7 h-7 text-slate-400 mb-2" />
        )}
        <p className="text-xs text-slate-500 text-center">
          {previewUrl ? "Click to replace" : "Click to upload or drag & drop"}
        </p>
        <p className="text-xs text-slate-400">Max {maxMB}MB — JPG or PNG</p>
      </label>
      {error && <p className={errClass}>{error}</p>}
    </div>
  );
}

export default function RegisterApplicant() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [sigFile, setSigFile] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [sigError, setSigError] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [sigPreviewUrl, setSigPreviewUrl] = useState(null);

  const { register, handleSubmit, watch, reset, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(registrationSchema),
    mode: "onTouched",
  });

  const watchedOriginState = watch("stateOfOrigin");
  const watchedResidenceState = watch("stateOfResidence");
  const lgasOfOrigin = getLGAsByState(watchedOriginState);
  const lgasOfResidence = getLGAsByState(watchedResidenceState);

  const previewApplicant = {
    personalNumber: "NG/XX/2026/001",
    surname: watch("surname") || "SURNAME",
    firstName: watch("firstName") || "Firstname",
    middleName: watch("middleName") || "",
    dateOfBirth: watch("dateOfBirth") || "—",
    gender: watch("gender") || "—",
    bloodGroup: watch("bloodGroup") || "—",
    stateOfOrigin: watchedOriginState || "—",
    lgaOfOrigin: watch("lgaOfOrigin") || "—",
    stateOfResidence: watchedResidenceState || "—",
    phoneNumber: watch("phoneNumber") || "—",
    photoURL: photoPreviewUrl,
    signatureURL: sigPreviewUrl,
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

  const validateFiles = () => {
    let valid = true;
    if (!photoFile) { setPhotoError("Passport photo is required"); valid = false; }
    else if (photoFile.size > 2 * 1024 * 1024) { setPhotoError("Photo must be under 2MB"); valid = false; }
    else setPhotoError("");
    if (!sigFile) { setSigError("Signature image is required"); valid = false; }
    else if (sigFile.size > 1 * 1024 * 1024) { setSigError("Signature must be under 1MB"); valid = false; }
    else setSigError("");
    return valid;
  };

  const onSubmit = async (data) => {
    if (!validateFiles()) return;
    setLoading(true);
    try {
      const uid = currentUser.id;
      const timestamp = Date.now();
      const photoURL = await uploadFile("applicants", `${uid}/photo_${timestamp}.jpg`, photoFile);
      const signatureURL = await uploadFile("applicants", `${uid}/signature_${timestamp}.jpg`, sigFile);
      const stateCode = STATE_CODES[data.stateOfOrigin] || "XX";
      const year = new Date().getFullYear();
      const codes = await generateApplicantCodes(stateCode, year);

      const { error } = await supabase.from("applicants").insert({
        personal_number: codes.personalNumber, rc_number: codes.rcNumber,
        id_form_number: codes.idFormNumber, surname: data.surname,
        first_name: data.firstName, middle_name: data.middleName || "",
        date_of_birth: data.dateOfBirth, gender: data.gender,
        blood_group: data.bloodGroup, marital_status: data.maritalStatus,
        state_of_origin: data.stateOfOrigin, lga_of_origin: data.lgaOfOrigin,
        hometown: data.hometown, residential_address: data.residentialAddress,
        state_of_residence: data.stateOfResidence, lga_of_residence: data.lgaOfResidence,
        phone_number: data.phoneNumber, occupation: data.occupation,
        next_of_kin_name: data.nextOfKinName, next_of_kin_address: data.nextOfKinAddress,
        next_of_kin_phone: data.nextOfKinPhone, photo_url: photoURL,
        signature_url: signatureURL, status: "active", created_by: uid, linked_uid: null,
      });
      if (error) throw new Error(error.message);
      await writeAuditLog("CREATE", codes.personalNumber, uid, {});
      setSuccessData(codes);
      toast.success("Corps member registered successfully!");
    } catch (err) {
      toast.error("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <Layout title="Register Corps Member">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Registration Successful!</h2>
          <p className="text-slate-500 text-sm mb-6">Corps member record has been created.</p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2 border border-slate-200">
            {[["Personal Number", successData.personalNumber], ["RC Number", successData.rcNumber], ["Form Number", successData.idFormNumber]].map(([lbl, val]) => (
              <div key={lbl} className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">{lbl}</span>
                <span className="font-semibold text-slate-800 font-mono text-sm">{val}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setSuccessData(null); reset(); setStep(0); setPhotoFile(null); setSigFile(null); setPhotoPreviewUrl(null); setSigPreviewUrl(null); }}
              className="flex items-center gap-2 bg-green-800 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 text-sm font-medium">
              <UserPlus className="w-4 h-4" />
              Register Another
            </button>
            <button onClick={() => navigate(`/applicants/${successData.rcNumber}/idcard`)}
              className="flex items-center gap-2 border border-green-800 text-green-800 px-5 py-2.5 rounded-lg hover:bg-green-50 text-sm font-medium">
              <CreditCard className="w-4 h-4" />
              Generate ID Card
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Register Corps Member">
      <div className="flex gap-6 items-start animate-fadeIn">
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <StepIndicator current={step} />

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Step 0 — Personal Info */}
              {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Surname *</label><input {...register("surname")} className={inputClass} placeholder="Last name" />{errors.surname && <p className={errClass}>{errors.surname.message}</p>}</div>
                  <div><label className={labelClass}>First Name *</label><input {...register("firstName")} className={inputClass} placeholder="First name" />{errors.firstName && <p className={errClass}>{errors.firstName.message}</p>}</div>
                  <div><label className={labelClass}>Middle Name</label><input {...register("middleName")} className={inputClass} placeholder="Optional" /></div>
                  <div><label className={labelClass}>Date of Birth *</label><input type="date" {...register("dateOfBirth")} className={inputClass} />{errors.dateOfBirth && <p className={errClass}>{errors.dateOfBirth.message}</p>}</div>
                  <div>
                    <label className={labelClass}>Gender *</label>
                    <select {...register("gender")} className={inputClass}><option value="">Select gender</option><option>Male</option><option>Female</option></select>
                    {errors.gender && <p className={errClass}>{errors.gender.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Blood Group *</label>
                    <select {...register("bloodGroup")} className={inputClass}><option value="">Select blood group</option>{["A+","A-","B+","B-","O+","O-","AB+","AB-"].map((b) => <option key={b}>{b}</option>)}</select>
                    {errors.bloodGroup && <p className={errClass}>{errors.bloodGroup.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Marital Status *</label>
                    <select {...register("maritalStatus")} className={inputClass}><option value="">Select</option>{["Single","Married","Divorced","Widowed"].map((s) => <option key={s}>{s}</option>)}</select>
                    {errors.maritalStatus && <p className={errClass}>{errors.maritalStatus.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 1 — Location */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>State of Origin *</label>
                    <select {...register("stateOfOrigin")} className={inputClass}><option value="">Select state</option>{allStates.map((s) => <option key={s}>{s}</option>)}</select>
                    {errors.stateOfOrigin && <p className={errClass}>{errors.stateOfOrigin.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>LGA of Origin *</label>
                    <select {...register("lgaOfOrigin")} className={inputClass} disabled={!watchedOriginState}><option value="">Select LGA</option>{lgasOfOrigin.map((l) => <option key={l}>{l}</option>)}</select>
                    {errors.lgaOfOrigin && <p className={errClass}>{errors.lgaOfOrigin.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Hometown *</label>
                    <input {...register("hometown")} className={inputClass} placeholder="Hometown" />
                    {errors.hometown && <p className={errClass}>{errors.hometown.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 2 — Contact */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Residential Address *</label>
                    <textarea rows={3} {...register("residentialAddress")} className={inputClass} placeholder="Full residential address" />
                    {errors.residentialAddress && <p className={errClass}>{errors.residentialAddress.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>State of Residence *</label>
                    <select {...register("stateOfResidence")} className={inputClass}><option value="">Select state</option>{allStates.map((s) => <option key={s}>{s}</option>)}</select>
                    {errors.stateOfResidence && <p className={errClass}>{errors.stateOfResidence.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>LGA of Residence *</label>
                    <select {...register("lgaOfResidence")} className={inputClass} disabled={!watchedResidenceState}><option value="">Select LGA</option>{lgasOfResidence.map((l) => <option key={l}>{l}</option>)}</select>
                    {errors.lgaOfResidence && <p className={errClass}>{errors.lgaOfResidence.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <input {...register("phoneNumber")} className={inputClass} placeholder="e.g. 08012345678" />
                    {errors.phoneNumber && <p className={errClass}>{errors.phoneNumber.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Occupation *</label>
                    <input {...register("occupation")} className={inputClass} placeholder="Occupation" />
                    {errors.occupation && <p className={errClass}>{errors.occupation.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 3 — Next of Kin */}
              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Full Name *</label><input {...register("nextOfKinName")} className={inputClass} placeholder="Next of kin full name" />{errors.nextOfKinName && <p className={errClass}>{errors.nextOfKinName.message}</p>}</div>
                  <div><label className={labelClass}>Phone Number *</label><input {...register("nextOfKinPhone")} className={inputClass} placeholder="e.g. 08012345678" />{errors.nextOfKinPhone && <p className={errClass}>{errors.nextOfKinPhone.message}</p>}</div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Address *</label>
                    <textarea rows={3} {...register("nextOfKinAddress")} className={inputClass} placeholder="Next of kin address" />
                    {errors.nextOfKinAddress && <p className={errClass}>{errors.nextOfKinAddress.message}</p>}
                  </div>
                </div>
              )}

              {/* Step 4 — Documents */}
              {step === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UploadZone label="Passport Photo * (max 2MB)" accept="image/jpeg,image/png" maxMB={2}
                    previewUrl={photoPreviewUrl} error={photoError}
                    onFile={(f) => { setPhotoFile(f); setPhotoError(""); setPhotoPreviewUrl(URL.createObjectURL(f)); }} />
                  <UploadZone label="Signature * (max 1MB)" accept="image/jpeg,image/png" maxMB={1}
                    previewUrl={sigPreviewUrl} error={sigError}
                    onFile={(f) => { setSigFile(f); setSigError(""); setSigPreviewUrl(URL.createObjectURL(f)); }} />
                </div>
              )}

              {/* Step navigation */}
              <div className="flex justify-between items-center mt-8 pt-5 border-t border-slate-100">
                <button type="button" onClick={() => setStep((s) => s - 1)} disabled={step === 0}
                  className="border border-slate-200 text-slate-700 px-5 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition">
                  Back
                </button>
                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={handleNext}
                    className="bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition">
                    Next
                  </button>
                ) : (
                  <button type="submit" disabled={loading}
                    className="bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-60 flex items-center gap-2 transition">
                    {loading && <Spinner size="sm" />}
                    {loading ? "Registering…" : "Register Corps Member"}
                  </button>
                )}
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
