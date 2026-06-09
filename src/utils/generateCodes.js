import { supabase } from "../supabase/config";

export async function generateApplicantCodes(stateCode, year) {
  const { data, error } = await supabase.rpc("increment_counters");
  if (error) throw new Error("Failed to generate codes: " + error.message);
  const newRc = data.rc_counter;
  const newForm = data.form_counter;
  const paddedRc = String(newRc).padStart(5, "0");
  const paddedForm = String(newForm).padStart(5, "0");
  const paddedPersonal = String(newRc).padStart(3, "0");
  return {
    personalNumber: `NG/${stateCode}/${year}/${paddedPersonal}`,
    rcNumber: `RC-${paddedRc}`,
    idFormNumber: `FORM-${paddedForm}`,
  };
}
