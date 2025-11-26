import { supabase } from "../../../supabaseClient.js";
import { showLoader } from "../../../js/utils/loader.js";
import { showNewClientForm } from "./newClientForm.js";

export async function showClients(container) {
  showLoader(container);

  try {
    const { data: clients, error: errorClients } = await supabase
      .from("client")
      .select("id, fullname, created_at, active, email, user(id)");
    console.log("CLIENTES:", clients);

    if (errorClients) throw errorClients;

    container.innerHTML = `
        <h2 class="mb-4">Clientes registrados</h2>
        <button class="btn btn-primary mb-3" id="btn-new-client">Agregar cliente</button>
        <table class="table table-bordered">
          <thead>
            <tr><th>Nombre</th><th>Email</th><th>Estado</th><th>Usuarios</th></tr>
          </thead>
          <tbody id="clients-table">
            <tr><td colspan="4">Cargando...</td></tr>
          </tbody>
        </table>
      `;
    const tbody = document.getElementById("clients-table");
    tbody.innerHTML = clients
      .map((c) => {
        const userCount = c.user ? c.user.length : 0;
        return `
        <tr>
          <td>${c.fullname}</td>
          <td>${c.email}</td>
          <td>${c.active ? "Activo" : "Inactivo"}</td>
          <td>${userCount}</td>
        </tr>
      `;
      })
      .join("");

    document.getElementById("btn-new-client").addEventListener("click", () => {
      showNewClientForm(container);
    });
  } catch (error) {
    console.error("Error al cargar los clientes:", error);
    document.getElementById(
      "clients-table"
    ).innerHTML = `<tr><td colspan="3">Error al cargar datos</td></tr>`;
  }
}

async function loadClients() {
  try {
    const { data: clients, error: errorClients } = await supabase
      .from("client")
      .select("id, fullname, created_at, active, email, user(id)");
    console.log("CLIENTES:", clients);

    if (errorClients) throw errorClients;

    const tbody = document.getElementById("clients-table");
    tbody.innerHTML = clients
      .map((c) => {
        const userCount = c.user ? c.user.length : 0;
        return `
        <tr>
          <td>${c.fullname}</td>
          <td>${c.email}</td>
          <td>${c.active ? "Activo" : "Inactivo"}</td>
          <td>${userCount}</td>
        </tr>
      `;
      })
      .join("");
  } catch (error) {
    console.error("Error al cargar los clientes:", error);
    document.getElementById(
      "clients-table"
    ).innerHTML = `<tr><td colspan="3">Error al cargar datos</td></tr>`;
  }
}
