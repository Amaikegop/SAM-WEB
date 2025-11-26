import { showLoader } from "../../../js/utils/loader.js";
import { supabase } from "../../../supabaseClient.js";

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
        "id, start, user:user_id(id, fullname), service:service_id(id, description)"
      )
      .in("user_id", clientUsersID)
      .gte("start", todayStart)
      .lte("start", todayEnd)
      .order("start", { ascending: true });

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
      a.localeCompare(b)
    );

    let html = `
      <div class="d-flex justify-content-between mb-4">
        <h2>Turnos: ${new Date().toLocaleDateString("es-ES")}</h2>
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
            <td>${ap.service?.description || "—"}</td>
            <td>
              <button class="btn btn-sm btn-primary">Modificar</button>
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
  } catch (error) {
    console.error("Error cargando agenda del día del cliente:", error);
    container.innerHTML = `<p class="text-danger">Error al cargar los turnos del día.</p>`;
  }
}
