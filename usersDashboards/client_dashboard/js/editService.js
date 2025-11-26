import { supabase } from "../../../supabaseClient.js";
import { showLoader } from "../../../js/utils/loader.js";
import { showClientServices } from "./client_services.js";
import { showToast } from "../../../js/utils/toast.js";

export async function showEditService(container, serviceId) {
  showLoader(container);
  try {
    const { data: service, error } = await supabase
      .from("service")
      .select("id, description, price, duration, simultaneous")
      .eq("id", serviceId)
      .single();

    if (error) throw error;
    if (!service) {
      container.innerHTML =
        "<p class='text-danger'>Servicio no encontrado.</p>";
      return;
    }

    container.innerHTML = `
      <div class="d-flex flex-column align-items-start w-100">
        <button id="btn-back" class="btn btn-link p-0 mb-2">
          <i data-lucide="arrow-left"></i>
        </button>
        <h2 class="w-100 text-center">Editar servicio</h2>

        <form class="w-75 mx-auto" id="edit-service-form">
          <div class="mb-3">
            <label class="form-label">Nombre del servicio</label>
            <input class="form-control" id="serviceNameInput"
              value="Aca iria el nombre del servicio">
          </div>
          <div class="mb-3">
            <label class="form-label">Descripción del servicio</label>
            <input class="form-control" id="serviceDescriptionInput"
              value="${service.description}">
          </div>

          <div class="row mb-3">
            <div class="col-md-4">
                <label class="form-label">Precio ($)</label>
                <input type="number" class="form-control"
                  step="0.01" min="0"
                  id="servicePriceInput"
                  value="${service.price}">
            </div>

            <div class="col-md-4">
                <label class="form-label">Cantidad simultánea</label>
                <input type="number" class="form-control"
                  min="1"
                  id="serviceSimultaneousInput"
                  value="${service.simultaneous}">
            </div>

            <div class="col-md-4">
                <label class="form-label">Duración</label>
                <input type="time" class="form-control"
                  id="serviceDurationInput"
                  value="${service.duration}">
            </div>
          </div>
        <div class="d-flex justify-content-between mb-4">
          <button type="submit" class="btn btn-primary mb-3">
            Guardar cambios
          </button>

          <button type="button" id="btn-delete-service" class="btn btn-primary mb-3">
            Eliminar servicio
          </button>
        </div>
        </form>
      </div>
    `;

    window.lucide.createIcons();

    document.getElementById("btn-back").addEventListener("click", () => {
      showClientServices(container);
    });

    document
      .getElementById("edit-service-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
          const updated = {
            description: document
              .getElementById("serviceDescriptionInput")
              .value.trim(),
            price: parseFloat(
              document.getElementById("servicePriceInput").value
            ),
            simultaneous: parseInt(
              document.getElementById("serviceSimultaneousInput").value
            ),
            duration: document.getElementById("serviceDurationInput").value,
          };

          const { error: updateError } = await supabase
            .from("service")
            .update(updated)
            .eq("id", serviceId);

          if (updateError) throw updateError;

          showToast("Servicio actualizado correctamente", "success");
          showClientServices(container);
        } catch (err) {
          showToast("Error al actualizar el servicio: " + err.message, "error");
        }
      });

    document
      .getElementById("btn-delete-service")
      .addEventListener("click", async () => {
        if (!confirm("¿Seguro que querés eliminar este servicio?")) return;

        try {
          const { error: deleteError } = await supabase
            .from("service")
            .delete()
            .eq("id", serviceId);

          if (deleteError) throw deleteError;

          showToast("Servicio eliminado correctamente", "success");
          showClientServices(container);
        } catch (err) {
          showToast("No se pudo eliminar el servicio: " + err.message, "error");
        }
      });
  } catch (error) {
    console.error("Error cargando el servicio:", error);
    container.innerHTML = `<p class='text-danger'>Error al cargar el servicio.</p>`;
  }
}
