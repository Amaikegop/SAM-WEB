import { showLoader } from "../../../js/utils/loader.js";
import { supabase } from "../../../supabaseClient.js";
import { cancelAppointmentsOfDay } from "./cancel_appointments.js";
import { viewAppointment } from "./client_view_appointment.js";
import { confirmModal } from "../../../js/utils/confirmModal.js";
import { clientNewAppointment } from "./client_new_appointment.js";

export async function showClientHome(container) {
  showLoader(container);

  try {
    const client_id = localStorage.getItem("client_id");
    if (!client_id) {
      container.innerHTML =
        "<p class='text-danger'>No se pudo identificar el cliente.</p>";
      return;
    }

    const { data: client_users, error: errorClientUsers } = await supabase
      .from("user")
      .select("id, fullname")
      .eq("client_id", client_id);

    if (errorClientUsers) throw errorClientUsers;
    if (client_users.length == 0) {
      container.innerHTML = "<p> No hay usuarios registrados </p>";
      return;
    }

    const clientUsersID = client_users.map((u) => u.id);

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const todayStart = `${yyyy}-${mm}-${dd}T00:00:00`;
    const todayEnd = `${yyyy}-${mm}-${dd}T23:59:59`;

    const { data: appointment, errorAppointment } = await supabase
      .from("appointment")
      .select(
        "id, start, user:user!appointment_user_id_user_client_id_fkey(id, fullname), user_client_id, service:service_id(id, description, name)",
      )
      .in("user_id", clientUsersID.map(String))
      .gte("start", todayStart)
      .lte("start", todayEnd)
      .order("start", { ascending: true });

    if (errorAppointment) {
      console.error("Supabase errorAppointment:", errorAppointment);
      throw errorAppointment;
    }

    if (errorAppointment) throw errorAppointment;

    const schedule = {};
    for (let h = 8; h <= 23; h++) {
      const time = `${String(h).padStart(2, "0")}:00`;
      schedule[time] = null;
    }

    appointment.forEach((ap) => {
      const dt = new Date(ap.start);
      const hh = String(dt.getHours()).padStart(2, "0");
      const mm = String(dt.getMinutes()).padStart(2, "0");
      const time = `${hh}:${mm}`;

      if (!(time in schedule)) schedule[time] = null;

      schedule[time] = ap;
    });

    const sortedTimes = Object.keys(schedule).sort((a, b) =>
      a.localeCompare(b),
    );

    let html = `
      <div class="d-flex justify-content-between mb-4">
        <h2>Turnos: ${new Date().toLocaleDateString("es-ES")}</h2>
        <div class="d-flex justify-content-end mx-4">
          <button id="btn-cancel-day-appointments" class="btn btn-sm btn-primary mb-3 me-2">Cancelar todos los turnos del día</button>
          <button id="btn-add-appointment" class="btn btn-sm btn-primary mb-3">Nuevo turno</button>
        </div>
      </div>

        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th style="width: 100px;">Horario</th>
              <th>Cliente</th>
              <th>Servicio</th>
              <th class="text-center" style="width: 120px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (const time of sortedTimes) {
      const ap = schedule[time];

      if (!ap) {
        html += `
          <tr>
            <td>${time}</td>
            <td colspan="3" class="text-muted">— Libre —</td>
          </tr>
        `;
      } else {
        html += `
          <tr style="background: #82C0CC">
            <td><b>${time}</b></td>
            <td>${ap.user?.fullname || "—"}</td>
            <td>${ap.service?.name || "—"}</td>
            <td>
              <button class="btn btn-sm btn-primary btn-show-appointment" data-id="${
                ap.id
              }">Ver</button>
            </td>
          </tr>
        `;
      }
    }

    html += `
        </tbody>
      </table>
    `;

    container.innerHTML = html;

    document.querySelectorAll(".btn-show-appointment").forEach((btn) => {
      btn.addEventListener("click", () => {
        const appointmentId = btn.dataset.id;
        viewAppointment(container, appointmentId, () =>
          showClientHome(container),
        );
      });
    });

    document
      .getElementById("btn-cancel-day-appointments")
      .addEventListener("click", async () => {
        const dateValue = new Date().toLocaleDateString("es-ES");
        const okModal = await confirmModal({
          title: "Eliminar turno",
          message: `¿Seguro que querés eliminar todos los turnos del <b>${dateValue}</b>?<br><small class="text-muted">Esta acción no se puede deshacer.</small>`,
          confirmText: "Sí, eliminar",
          cancelText: "No",
          confirmBtnClass: "btn-primary",
        });

        if (!okModal) return;

        const ok = await cancelAppointmentsOfDay(
          `${yyyy}-${mm}-${dd}`,
          clientUsersID,
        );
        if (ok) showClientHome(container);
      });

    document
      .getElementById("btn-add-appointment")
      .addEventListener("click", async () => {
        clientNewAppointment(container, "date", "onBack");
      });
  } catch (error) {
    console.error("Error cargando agenda del día del cliente:", error);
    container.innerHTML = `<p class="text-danger">Error al cargar los turnos del día.</p>`;
  }
}
