import { supabase } from "../../../supabaseClient.js";
import { showLoader } from "../../../js/utils/loader.js";

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

    const { data: appointment, errorAppointment } = await supabase
      .from("appointment")
      .select(
        "id, start, user:user_id(id, fullname), service:service_id(id, description)"
      )
      .in("user_id", clientUsersID);

    if (errorAppointment) throw errorAppointment;

    const events = appointment.map((ap) => ({
      id: ap.id,
      title: `${ap.service.description} - ${ap.user.fullname}`,
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
          alert(
            `Turno: ${
              info.event.title
            }\nInicio: ${info.event.start.toLocaleString()}`
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
