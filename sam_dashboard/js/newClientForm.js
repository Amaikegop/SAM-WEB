import { supabase } from "../../supabaseClient.js";

export function showNewClientForm(container) {
  container.innerHTML = `
    <h2 class="mb-4">Agregar nuevo cliente</h2>
    <form id="form-new-client" class="col-md-6">
      <div class="mb-3">
        <label class="form-label">Identificador del negocio</label>
        <input type="text" id="client_id" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Nombre del negocio</label>
        <input type="text" id="client_fullname" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Email del cliente</label>
        <input type="email" id="email" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Contraseña</label>
        <input type="password" id="password" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Subir información del negocio (PDF)</label>
        <input class="form-control" type="file" id="infoFile" accept="application/pdf" required>
      </div>
      <button type="submit" class="btn btn-primary">Agregar cliente</button>
    </form>
  `;

  document
    .getElementById("form-new-client")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const client_id_raw = document.getElementById("client_id").value.trim();
      const fullname = document.getElementById("client_fullname").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const infoFile = document.getElementById("infoFile").files[0];

      if (!infoFile) return alert("Debe subir un archivo PDF.");

      const client_id = parseInt(client_id_raw, 10);
      if (isNaN(client_id) || client_id <= 0) {
        return alert(
          "El identificador del negocio debe ser un número entero positivo."
        );
      }

      try {
        const formData = new FormData();
        formData.append("client_id", client_id);
        formData.append("fullname", fullname);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("file", infoFile);

        const response = await fetch(
          "https://gsoqoqgxrorptveiijga.supabase.co/functions/v1/add_client",
          {
            method: "POST",
            headers: {
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzb3FvcWd4cm9ycHR2ZWlpamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDI2NTgsImV4cCI6MjA3NTkxODY1OH0.0cf6px2c3fcPmH1Pf1h9WHUoFHfTCgmYvHFizXE67LE",
            },
            body: formData,
          }
        );

        const result = await response.json();

        if (!response.ok) throw new Error(result.error || "Error desconocido");

        alert(result.message);
        e.target.reset();
      } catch (err) {
        console.error(err);
        alert("Error al crear el cliente: " + err.message);
      }
    });
}
