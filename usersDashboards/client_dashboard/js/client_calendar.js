import { supabase } from "../../../supabaseClient.js";
import { showLoader } from "../../../js/utils/loader.js";
import { viewAppointment } from "./client_view_appointment.js";

export async function showClientCalendar(container) {
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
    console.log(clientUsersID);

    const { data: appointment, errorAppointment } = await supabase
      .from("appointment")
      .select(
        "id, start, user:user!appointment_user_id_user_client_id_fkey(id, fullname), user_client_id, service:service_id(id, description, name)"
      )
      .in("user_id", clientUsersID.map(String));

    if (errorAppointment) throw errorAppointment;
    console.log(appointment);

    const events = appointment.map((ap) => ({
      id: ap.id,
      title: `${ap.user.fullname}`,
      //title: `${ap.service.name}`,
      start: ap.start,
    }));

    container.innerHTML = `
            <div class="card p-4 shadow-sm">
                <div id="calendar" class="border rounded p-2"></div>
            </div>
        `;
    setTimeout(() => {
      const calendarEl = document.getElementById("calendar");

      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: "auto",
        locale: "es",
        headerToolbar: {
          left: "prev,next",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        dayMaxEvent: true,
        dayMaxEvents: 2,
        events: events,
        eventClick: function (info) {
          const appointmentId =
            info.event.id || info.event.extendedProps?.appointment_id;
          if (!appointmentId) {
            console.error("El evento no tiene id de appointment:", info.event);
            return;
          }

          viewAppointment(container, appointmentId, () =>
            showClientCalendar(container)
          );
        },
        dateClick(info) {
          calendar.changeView("timeGridDay", info.dateStr);
        },
      });

      calendar.render();
    }, 100);
  } catch (error) {
    console.error("Error al cargar el calendario del cliente:", error);
  }
}
