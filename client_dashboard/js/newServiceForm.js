import { supabase } from "../../supabaseClient.js";
import { showClientServices } from "./client_services.js";
import { showToast } from "../../js/utils/toast.js";

export async function showNewServiceForm(container) {
  container.innerHTML = `
    <div class="d-flex flex-column align-items-start w-100">
        <button id="btn-back" class="btn btn-link p-0 mb-2">
          <i data-lucide="arrow-left"></i>
        </button>
        <h2 class="w-100 text-center">Nuevo servicio</h2>

        <form class="w-75 mx-auto" id="new-service-form">
            <div class="mb-3">
                <label for="serviceNameInput" class="form-label">Nombre del servicio</label>
                <input class="form-control" id="serviceNameInput">
            </div>
            <div class="mb-3">
                <label for="serviceDescriptionInput" class="form-label">Descripción del servicio</label>
                <input class="form-control" id="serviceDescriptionInput">
            </div>
            <div class="row mb-3">
                <div class="col-md-4">
                    <label class="form-label">Precio ($)</label>
                    <input type="number" class="form-control" step="0.01" min="0" id="servicePriceInput" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Cantidad</label>
                    <input type="number" class="form-control" min="1" id="serviceSimultaneousInput" required>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Duración</label>
                    <input type="time" class="form-control" id="serviceDurationInput" required>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Agregar servicio</button>
        </form>
    </div>`;
  window.lucide.createIcons();

  document.getElementById("btn-back").addEventListener("click", () => {
    showClientServices(container);
  });

  const form = document.getElementById("new-service-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const client_id = localStorage.getItem("client_id");
      if (!client_id) {
        container.innerHTML =
          "<p class='text-danger'>No se pudo identificar el cliente.</p>";
        return;
      }

      const serviceName = document
        .getElementById("serviceNameInput")
        .value.trim();
      const serviceDescription = document
        .getElementById("serviceDescriptionInput")
        .value.trim();
      const serviceDuration = document.getElementById(
        "serviceDurationInput"
      ).value;
      const serviceSimultaneous = parseInt(
        document.getElementById("serviceSimultaneousInput").value
      );
      const servicePrice = parseFloat(
        document.getElementById("servicePriceInput").value
      );

      const { error: newServiceError } = await supabase.from("service").insert([
        {
          description: serviceDescription,
          price: servicePrice,
          duration: serviceDuration,
          simultaneous: serviceSimultaneous,
          client_id,
        },
      ]);

      form.reset();

      if (newServiceError) throw newServiceError;

      showToast("Servicio creado correctamente", "success");
      showClientServices(container);
    } catch (error) {
      console.log("Error al cargar el formulario: ", error);
      showToast("Error al crear el servicio: " + error.message, "error");
    }
  });
}
