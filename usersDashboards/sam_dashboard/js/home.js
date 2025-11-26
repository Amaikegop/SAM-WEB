import { supabase } from "../../../supabaseClient.js";
import { showLoader } from "../../../js/utils/loader.js";

export async function showHome(container) {
  showLoader(container);

  try {
    const { data: clients, error: errorClients } = await supabase
      .from("client")
      .select("id, fullname, created_at, active");
    console.log("CLIENTES:", clients);

    if (errorClients) throw errorClients;

    const { count: totalUsers, error: errorUsers } = await supabase
      .from("user")
      .select("*", { count: "exact", head: true });
    console.log("USUARIOS:", totalUsers);

    if (errorUsers) throw errorUsers;

    const { count: totalSchedules, error: errorSchedules } = await supabase
      .from("appointment")
      .select("*", { count: "exact", head: true });
    console.log("TURNOS:", totalSchedules);

    container.innerHTML = `
        <h2 class="mb-4">Panel de Administración</h2>
        <div class="row">
          <div class="col-md-3 mb-3">
            <div class="card shadow-sm p-3">
              <h5>Clientes activos</h5>
              <p class="fs-4 fw-bold" id="active-clients">${
                clients.filter((c) => c.active).length
              }</p>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card shadow-sm p-3">
              <h5>Usuarios totales</h5>
              <p class="fs-4 fw-bold" id="total-users">${totalUsers}</p>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card shadow-sm p-3">
              <h5>Turnos generados</h5>
              <p class="fs-4 fw-bold" id="total-appointments">${totalSchedules}</p>
            </div>
          </div>
        </div>
        <hr>
        <h4>Últimos clientes creados</h4>
        <table class="table table-striped mt-3">
          <thead>
            <tr><th>Nombre</th><th>Fecha de alta</th></tr>
          </thead>
          <tbody id="last-clients">
            <tr><td colspan="3">Cargando...</td></tr>
          </tbody>
        </table>
      `;

    const lastFiveClients = clients
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    console.log("ULTIMOS CLIENTES:", lastFiveClients);

    const tbody = document.getElementById("last-clients");
    tbody.innerHTML = lastFiveClients
      .map(
        (c) => `
        <tr>
          <td>${c.fullname}</td>
          <td>${new Date(c.created_at).toLocaleDateString()}</td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error al cargar datos del dashboard:", error);
    document.getElementById(
      "last-clients"
    ).innerHTML = `<tr><td colspan="3">Error al cargar datos</td></tr>`;
  }
}

// async function loadHomeData() {
//   try {
//     const { data: clients, error: errorClients } = await supabase
//       .from("client")
//       .select("id, fullname, created_at, active");
//     console.log("CLIENTES:", clients);

//     if (errorClients) throw errorClients;

//     const activeClients = clients.filter((c) => c.active).length;
//     document.getElementById("active-clients").textContent = activeClients || 0;

//     const { count: totalUsers, error: errorUsers } = await supabase
//       .from("user")
//       .select("*", { count: "exact", head: true });
//     console.log("USUARIOS:", totalUsers);

//     if (errorUsers) throw errorUsers;
//     document.getElementById("total-users").textContent = totalUsers || 0;

//     const { count: totalSchedules, error: errorSchedules } = await supabase
//       .from("appointment")
//       .select("*", { count: "exact", head: true });
//     console.log("TURNOS:", totalSchedules);

//     document.getElementById("total-appointments").textContent =
//       totalSchedules || 0;

//     const lastFiveClients = clients
//       .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//       .slice(0, 5);
//     console.log("ULTIMOS CLIENTES:", lastFiveClients);

//     const tbody = document.getElementById("last-clients");
//     tbody.innerHTML = lastFiveClients
//       .map(
//         (c) => `
//         <tr>
//           <td>${c.fullname}</td>
//           <td>${new Date(c.created_at).toLocaleDateString()}</td>
//         </tr>
//       `
//       )
//       .join("");
//   } catch (error) {
//     console.error("Error al cargar datos del dashboard:", error);
//     document.getElementById(
//       "last-clients"
//     ).innerHTML = `<tr><td colspan="3">Error al cargar datos</td></tr>`;
//   }
// }
