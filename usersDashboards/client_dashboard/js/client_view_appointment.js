import { showLoader } from "../../../js/utils/loader.js";
import { supabase } from "../../../supabaseClient.js";
import { showToast } from "../../../js/utils/toast.js";
import { showClientHome } from "./client_home.js";
import { cancelSingleAppointment } from "./cancel_appointments.js";
import { confirmModal } from "../../../js/utils/confirmModal.js";

export async function viewAppointment(container, appointment_id, onBack) {
  showLoader(container);
  try {
    const { data: appointment, error: apError } = await supabase
      .from("v_appointment_detail")
      .select("appointment_id, start, service_id, service_name, user_fullname")
      .eq("appointment_id", appointment_id)
      .single();

    if (apError) throw apError;

    if (!appointment) {
      container.innerHTML = "<p class='text-danger'>Turno no encontrado.</p>";
      return;
    }

    container.innerHTML = `
      <div class="d-flex flex-column align-items-start w-100">
        <button id="btn-back" class="btn btn-link p-0 mb-2">
          <i data-lucide="arrow-left"></i>
        </button>
        <h2 class="w-100 text-center">Editar turno</h2>

        <form class="w-75 mx-auto" id="edit-appointment-form">
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input class="form-control" id="userNameInput"
              value="${appointment.user_fullname}" readonly>
          </div>
          <div class="mb-3">
            <label class="form-label">Servicio</label>
            <select class="form-select" id="serviceSelect"></select>
            </div>

            <div class="col-md-4 mb-3">
            <label class="form-label">Fecha</label>
            <input type="date" class="form-control"
                id="appointmentDateInput"
                value="${new Date(appointment.start).getFullYear()}-${String(
      new Date(appointment.start).getMonth() + 1
    ).padStart(2, "0")}-${String(
      new Date(appointment.start).getDate()
    ).padStart(2, "0")}">
            </div>

          <div class="col-md-4">
                <label class="form-label">Horario</label>
                <input type="time" class="form-control"
                  id="appointmentStartInput"
                  value="${String(
                    new Date(appointment.start).getHours()
                  ).padStart(2, "0")}:${String(
      new Date(appointment.start).getMinutes()
    ).padStart(2, "0")}">
            </div>
        <div class="d-flex justify-content-between mt-4 mb-4">
          <button type="submit" class="btn btn-primary mb-3">
            Guardar cambios
          </button>

          <button type="button" id="btn-delete-appointment" class="btn btn-primary mb-3">
            Eliminar turno
          </button>
        </div>
        </form>
      </div>
    `;

    window.lucide.createIcons();

    const client_id = localStorage.getItem("client_id");

    const { data: services, error: servicesError } = await supabase
      .from("service")
      .select("id, name")
      .eq("client_id", client_id)
      .order("name", { ascending: true });

    if (servicesError) throw servicesError;

    const serviceSelect = document.getElementById("serviceSelect");
    serviceSelect.innerHTML = services
      .map(
        (s) =>
          `<option value="${s.id}" ${
            s.id === appointment.service_id ? "selected" : ""
          }>${s.name}</option>`
      )
      .join("");

    const goBack =
      typeof onBack === "function" ? onBack : () => showClientHome(container);
    document.getElementById("btn-back").addEventListener("click", () => {
      goBack();
    });

    document
      .getElementById("edit-appointment-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const selectedServiceId = Number(
          document.getElementById("serviceSelect").value
        );

        const dateValue = document.getElementById("appointmentDateInput").value;
        const timeValue = document.getElementById(
          "appointmentStartInput"
        ).value;

        if (!dateValue || !timeValue) {
          showToast("Completá fecha y horario.", "error");
          return;
        }

        const [hh, min] = timeValue.split(":").map(Number);

        const dt = new Date(`${dateValue}T00:00:00`);
        dt.setHours(hh, min, 0, 0);

        const newStart = `${dateValue}T${timeValue}:00`;

        try {
          const updated = {
            start: newStart,
            service_id: selectedServiceId,
          };

          const { error: updateError } = await supabase
            .from("appointment")
            .update(updated)
            .eq("id", appointment_id);

          if (updateError) throw updateError;

          showToast("Turno actualizado correctamente", "success");
          goBack(); // ir al calendar o a home
        } catch (err) {
          showToast("Error al actualizar el turno: " + err.message, "error");
        }
      });

    document
      .getElementById("btn-delete-appointment")
      .addEventListener("click", async () => {
        const dateValue = document.getElementById(
          "appointmentDateInput"
        )?.value;
        const timeValue = document.getElementById(
          "appointmentStartInput"
        )?.value;

        const okModal = await confirmModal({
          title: "Eliminar turno",
          message: `¿Seguro que querés eliminar el turno de <b>${appointment.user_fullname}</b> el <b>${dateValue}</b> a las <b>${timeValue}</b>?<br><small class="text-muted">Esta acción no se puede deshacer.</small>`,
          confirmText: "Sí, eliminar",
          cancelText: "No",
          confirmBtnClass: "btn-primary",
        });

        if (!okModal) return;

        const ok = await cancelSingleAppointment(appointment_id);
        if (ok) goBack();
      });

    // document
    //   .getElementById("btn-delete-appointment")
    //   .addEventListener("click", async () => {
    //     if (!confirm("¿Seguro que querés eliminar este turno?")) return;

    //     try {
    //       const { error: deleteError } = await supabase
    //         .from("appointment")
    //         .delete()
    //         .eq("id", appointment_id);

    //       if (deleteError) throw deleteError;

    //       showToast("Turno eliminado correctamente", "success");
    //       showClientServices(container); // ir a home o a calendar
    //     } catch (err) {
    //       showToast("No se pudo eliminar el turno: " + err.message, "error");
    //     }
    //   });
  } catch (error) {
    console.error("Error cargando el turno:", error);
    container.innerHTML = `<p class='text-danger'>Error al cargar el turno.</p>`;
  }
}
