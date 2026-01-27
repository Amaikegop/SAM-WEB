import { supabase } from "../../supabaseClient.js";

function addMinutes(dateString, minutes) {
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

function timeToMinutes(time) {
  // formato "HH:MM:SS"
  const [h, m, s] = time.split(":").map(Number);
  return h * 60 + m + Math.floor(s / 60);
}

function generateSlots(date, openingHour, closingHour, duration) {
  const slots = [];

  const durationMinutes = timeToMinutes(duration);

  const start = new Date(
    `${date}T${String(openingHour).padStart(2, "0")}:00:00`,
  );
  const end = new Date(`${date}T${String(closingHour).padStart(2, "0")}:00:00`);

  let current = new Date(start);

  while (current.getTime() + durationMinutes * 60000 <= end.getTime()) {
    slots.push(new Date(current));
    current = new Date(current.getTime() + durationMinutes * 60000);
  }

  return slots.map((d) => d.toLocaleString("sv-SE").replace(" ", "T"));
}

export async function getAvailableSlots({
  serviceId,
  date,
  clientId,
  openingHour = 9,
  closingHour = 22,
}) {
  const { data: service } = await supabase
    .from("service")
    .select("duration, simultaneous")
    .eq("id", serviceId)
    .single();

  if (!service) {
    return [];
  }

  const slots = generateSlots(date, openingHour, closingHour, service.duration);

  const available = [];

  for (const slot of slots) {
    const overlapping = await countOverlappingAppointments({
      serviceId,
      clientId,
      start: slot,
      duration: service.duration,
    });

    if (overlapping < service.simultaneous) {
      available.push(slot);
    }
  }

  return available;
}

async function countOverlappingAppointments({
  serviceId,
  clientId,
  start,
  duration,
  excludeAppointmentId = null,
}) {
  const durationMinutes = timeToMinutes(duration);
  const newStart = new Date(start);
  const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);

  let query = supabase
    .from("appointment")
    .select("id, start")
    .eq("service_id", serviceId)
    .eq("user_client_id", clientId);

  if (excludeAppointmentId) {
    query = query.neq("id", excludeAppointmentId);
  }

  const { data: appointments } = await query;

  let count = 0;

  for (const appt of appointments || []) {
    const apptStart = new Date(appt.start);
    const apptEnd = new Date(apptStart.getTime() + durationMinutes * 60000);

    if (apptStart < newEnd && apptEnd > newStart) {
      count++;
    }
  }

  return count;
}

export async function createAppointment({
  serviceId,
  userId,
  start,
  clientId,
}) {
  const { data, error } = await supabase.rpc("create_appointment_safe", {
    p_service_id: serviceId,
    p_user_id: userId,
    p_client_id: clientId,
    p_start: start,
  });

  if (error) {
    return { ok: false, reason: "RPC_ERROR", error };
  }

  return data;
}

export async function updateAppointment({
  appointmentId,
  serviceId,
  clientId,
  start,
}) {
  const { data, error } = await supabase.rpc("update_appointment_safe", {
    p_appointment_id: appointmentId,
    p_service_id: serviceId,
    p_client_id: clientId,
    p_start: start,
  });

  if (error) {
    return { ok: false, reason: "RPC_ERROR", error };
  }

  return data;
}

export async function deleteAppointment({ appointmentId, clientId }) {
  const { data, error } = await supabase.rpc("delete_appointment_safe", {
    p_appointment_id: appointmentId,
    p_client_id: clientId,
  });

  if (error) {
    return { ok: false, reason: "RPC_ERROR", error };
  }

  return data;
}

export async function deleteAppointmentsOfDay({ date, userIds, clientId }) {
  const { data, error } = await supabase.rpc("delete_appointments_of_day", {
    p_client_id: clientId,
    p_date: date,
    p_user_ids: userIds,
  });

  if (error) {
    return { ok: false, reason: "RPC_ERROR", error };
  }

  return data;
}
