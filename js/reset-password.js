import { supabase } from "../supabaseClient.js";

const form = document.getElementById("reset-form");
const errorBox = document.getElementById("reset-error");

const hashParams = new URLSearchParams(window.location.hash.substring(1));

const access_token = hashParams.get("access_token");
const refresh_token = hashParams.get("refresh_token");

// Si vienen tokens → restauramos sesión
if (access_token && refresh_token) {
  await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  errorBox.classList.add("d-none");
  errorBox.textContent = "";

  const pass1 = document.getElementById("pass1").value.trim();
  const pass2 = document.getElementById("pass2").value.trim();

  if (pass1 !== pass2) {
    errorBox.textContent = "Las contraseñas no coinciden.";
    errorBox.classList.remove("d-none");
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: pass1,
  });

  if (error) {
    errorBox.textContent = "Error: no se pudo cambiar la contraseña.";
    console.log(error);
    errorBox.classList.remove("d-none");
    return;
  }

  // Toast sin que tengas que reescribir
  alert("Contraseña actualizada correctamente. Ahora podés iniciar sesión.");

  window.location.href = "login.html";
});
