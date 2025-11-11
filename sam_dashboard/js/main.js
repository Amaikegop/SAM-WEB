import { showHome } from "./home.js";
import { showClients } from "./clients.js";
import { showNewClientForm } from "./newClientForm.js";
import { supabase } from "../../supabaseClient.js";

const contentDiv = document.getElementById("content");

// Navegación
document.getElementById("home").addEventListener("click", () => {
  activateMenu("home");
  showHome(contentDiv);
});
document.getElementById("clients").addEventListener("click", () => {
  activateMenu("clients");
  showClients(contentDiv);
});
document.getElementById("newClient").addEventListener("click", () => {
  activateMenu("newClient");
  showNewClientForm(contentDiv);
});

// Logout funcional
document.getElementById("logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "../login.html";
});

function activateMenu(id) {
  document
    .querySelectorAll(".sidebar a")
    .forEach((a) => a.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Cargar vista inicial
showHome(contentDiv);
window.lucide.createIcons();
