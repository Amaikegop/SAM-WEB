import { showToast } from "../../../js/utils/toast.js";
import {
  deleteAppointment,
  deleteAppointmentsOfDay,
} from "../../../js/utils/availability.js";

export async function cancelSingleAppointment(appointmentId) {
  const result = await deleteAppointment({
    appointmentId,
    clientId: localStorage.getItem("client_id"),
  });

  if (!result.ok) {
    showToast("No se pudo cancelar el turno", "error");
    return false;
  }

  showToast("Turno cancelado correctamente", "success");
  return true;
}

export async function cancelAppointmentsOfDay(date, clientUserIds) {
  const result = await deleteAppointmentsOfDay({
    date,
    userIds: clientUserIds,
    clientId: localStorage.getItem("client_id"),
  });

  if (!result.ok) {
    showToast("Error al cancelar todos los turnos", "error");
    return false;
  }

  showToast("Todos los turnos fueron cancelados", "success");
  return true;
}
