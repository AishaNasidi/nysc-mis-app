import { supabase } from "../supabase/config";

export async function writeAuditLog(action, recordId, performedBy, changes = {}) {
  await supabase.from("audit_logs").insert({
    action,
    record_id: recordId,
    performed_by: performedBy,
    changes,
  });
}
