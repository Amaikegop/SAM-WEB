import { showLoader } from "../../../js/utils/loader.js";
import { supabase } from "../../../supabaseClient.js";
import { showNewServiceForm } from "./newServiceForm.js";

export async function showClientServices(container) {
  showLoader(container);
  try {
    const client_id = localStorage.getItem("client_id");
    if (!client_id) {
      container.innerHTML =
        "<p class='text-danger'>No se pudo identificar el cliente.</p>";
      return;
    }

    const { data: services, error: servicesError } = await supabase
      .from("service")
      .select("id, description, price, duration, simultaneous, name")
      .eq("client_id", client_id);

    if (servicesError) throw servicesError;

    let html = `
      <div class="d-flex justify-content-between">
        <h2 class="text-start mb-4">Servicios</h2>
        <button class="btn btn-primary mb-3" id="btn-new-service">Nuevo servicio</button>
      </div>
      <div class="d-flex gap-2 mb-3">
        <input type="text" id="service-search" class="form-control" placeholder="Buscar servicio por nombre...">
      </div>
      <div id="service-cards" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>
    `;

    // services.forEach((s) => {
    //   html += `
    //     <div class="col">
    //         <div class="card shadow-sm h-100"">
    //             <div class="card-body">
    //                 <h5 class="card-title">${s.description}</h5>
    //                 <p class="card-text">Está debería de ser la descripción larga del servicio, pero para eso a la tabla servicio hay que añadirle un name.</p>
    //                 <p class="card-text"><strong>Precio:</strong> ${s.price}</p>
    //                 <p class="card-text"><strong>Cantidad:</strong> ${s.simultaneous}</p>
    //                 <a href="#" class="btn btn-primary w-100 edit-service-btn" data-id="${s.id}">Modificar servicio</a>
    //             </div>
    //         </div>
    //     </div>
    //     `;
    // });
    // html += `</div>`;

    container.innerHTML = html;
    renderCards(services, container);

    document.getElementById("btn-new-service").addEventListener("click", () => {
      showNewServiceForm(container);
    });

    document.getElementById("service-search").addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();
      const filtered = services.filter((s) =>
        s.description.toLowerCase().includes(term)
      );
      renderCards(filtered, container);
    });

    // document.querySelectorAll(".edit-service-btn").forEach((btn) => {
    //   btn.addEventListener("click", (e) => {
    //     e.preventDefault();
    //     const id = btn.getAttribute("data-id");
    //     import("./editService.js").then((module) => {
    //       module.showEditService(container, id);
    //     });
    //   });
    // });
  } catch (error) {
    console.error("Error al cargar los servicios del cliente:", error);
  }
}

function renderCards(list, container) {
  const cardsContainer = document.getElementById("service-cards");

  let cardsHTML = "";

  list.forEach((s) => {
    cardsHTML += `
      <div class="col">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">${s.name}</h5>
            <p class="card-text">${s.description}</p>
            <p class="card-text"><strong>Precio:</strong> ${s.price}</p>
            <p class="card-text"><strong>Cantidad:</strong> ${s.simultaneous}</p>
            <a href="#" class="btn btn-primary w-100 edit-service-btn" data-id="${s.id}">
              Modificar servicio
            </a>
          </div>
        </div>
      </div>
    `;
  });

  cardsContainer.innerHTML = cardsHTML;

  document.querySelectorAll(".edit-service-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      import("./editService.js").then((module) => {
        module.showEditService(container, btn.dataset.id);
      });
    });
  });
}
