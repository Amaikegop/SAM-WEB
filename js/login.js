import { supabase } from "../../supabaseClient.js";

const form = document.getElementById("login-form");
const errorBox = document.getElementById("login-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    errorBox.textContent = "Credenciales incorrectas.";
    errorBox.classList.remove("d-none");
    return;
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("client_id, role")
      .eq("id", data.user.id)
      .single();

    if (profile.role === "superadmin") {
      window.location.href =
        "usersDashboards/sam_dashboard/admin_dashboard.html";
    } else {
      localStorage.setItem("client_id", profile.client_id);
      window.location.href =
        "usersDashboards/client_dashboard/client_dashboard.html";
    }
  }
});

document
  .getElementById("forgot-password")
  .addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();

    errorBox.classList.add("d-none");
    errorBox.textContent = "";

    if (!email) {
      errorBox.textContent = "Ingresá tu email para recuperar la contraseña.";
      errorBox.classList.remove("d-none");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://127.0.0.1:5500/reset-password.html",
    });

    if (error) {
      errorBox.textContent = "No se pudo enviar el correo de recuperación.";
      errorBox.classList.remove("d-none");
    } else {
      errorBox.textContent =
        "Te enviamos un correo con instrucciones para cambiar la contraseña.";
      errorBox.classList.remove("d-none");
      errorBox.classList.remove("text-danger");
      errorBox.classList.add("text-success");
    }
  });
