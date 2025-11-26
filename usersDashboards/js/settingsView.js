import { supabase } from "../../supabaseClient.js";
import { showToast } from "../../js/utils/toast.js";

export function showSettings(container) {
  container.innerHTML = `
    <h2 class="mb-4">Configuración de la cuenta</h2>

    <div class="card p-4 mb-4">
      <h5>Cambiar email</h5>
      <input type="email" id="new-email" class="form-control mt-2" placeholder="Nuevo email">
      <button class="btn btn-primary mt-3" id="btn-update-email">Actualizar email</button>
    </div>

    <div class="card p-4">
      <h5>Cambiar contraseña</h5>
      <input type="password" id="new-password" class="form-control mt-2" placeholder="Nueva contraseña">
      <input type="password" id="new-password2" class="form-control mt-2" placeholder="Repetir nueva contraseña">
      <button class="btn btn-primary mt-3" id="btn-update-password">Actualizar contraseña</button>
    </div>
  `;

  document
    .getElementById("btn-update-email")
    .addEventListener("click", async () => {
      const newEmail = document.getElementById("new-email").value.trim();

      if (!newEmail) {
        return showToast("Ingresa un email válido", "error");
      }

      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        return showToast("Error: " + error.message, "error");
      }

      showToast("Se envió un correo de verificación al nuevo email", "success");
    });

  document
    .getElementById("btn-update-password")
    .addEventListener("click", async () => {
      const pw1 = document.getElementById("new-password").value;
      const pw2 = document.getElementById("new-password2").value;

      if (!pw1 || pw1.length < 6) {
        return showToast(
          "La contraseña debe tener al menos 6 caracteres",
          "error"
        );
      }

      if (pw1 !== pw2) {
        return showToast("Las contraseñas no coinciden", "error");
      }

      const { error } = await supabase.auth.updateUser({ password: pw1 });

      if (error) {
        return showToast("Error: " + error.message, "error");
      }

      showToast("Contraseña actualizada correctamente", "success");
    });
}
