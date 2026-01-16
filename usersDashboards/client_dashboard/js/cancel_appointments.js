import { supabase } from "../../../supabaseClient.js";
import { showToast } from "../../../js/utils/toast.js";

export async function cancelSingleAppointment(appointmentId) {
  const { error } = await supabase
    .from("appointment")
    .delete()
    .eq("id", appointmentId);

  if (error) {
    showToast("No se pudo cancelar el turno", "error");
    return false;
  }

  showToast("Turno cancelado correctamente", "success");
  return true;
}

export async function cancelAppointmentsOfDay(date, clientUserIds) {
  const dayStart = `${date}T00:00:00`;
  const dayEnd = `${date}T23:59:59`;

  const { error } = await supabase
    .from("appointment")
    .delete()
    .in("user_id", clientUserIds)
    .gte("start", dayStart)
    .lte("start", dayEnd);

  if (error) {
    showToast("Error al cancelar todos los turnos", "error");
    return false;
  }

  showToast("Todos los turnos fueron cancelados", "success");
  return true;
}
