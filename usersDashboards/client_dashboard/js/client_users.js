import { supabase } from "../../../supabaseClient.js";
import { showLoader } from "../../../js/utils/loader.js";

export async function showClientUsers(container) {
  showLoader(container);
  try {
    const client_id = localStorage.getItem("client_id");
    if (!client_id) {
      container.innerHTML =
        "<p class='text-danger'>No se pudo identificar el cliente.</p>";
      return;
    }

    const { data: users, errorUsers } = await supabase
      .from("user")
      .select("id, name, fullname")
      .eq("client_id", client_id)
      .order("id", { ascending: true });

    if (errorUsers) throw errorUsers;

    if (!users || users.length == 0) {
      container.innerHTML = "<p>No hay usuarios registrados aún.</p>";
      return;
    }

    let userTable = `
      <h2 class="mb-4">Usuarios</h2>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Telefono</th>
            <th>Nombre</th>
            <th>Nombre completo</th>
          </tr>
        </thead>
        <tbody>
    `;

    users.forEach((u) => {
      userTable += `
        <tr>
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.fullname}</td>
        </tr>
      `;
    });

    userTable += `
        </tbody>
      </table>
    `;

    container.innerHTML = userTable;
  } catch (error) {
    console.log("No se pudieron cargar los usuarios del cliente: ", error);
    container.innerHTML = `<p class="text-danger">Error al cargar usuarios: ${error.message}</p>`;
  }
}
