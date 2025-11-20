import { showClientCalendar } from "./client_calendar.js";
import { showClientHome } from "./client_home.js";
import { showClientUsers } from "./client_users.js";
import { supabase } from "../../supabaseClient.js";
import { showClientStatistics } from "./client_statistics.js";
import { showClientServices } from "./client_services.js";
import { showNewServiceForm } from "./newServiceForm.js";

const contentDiv = document.getElementById("content");

showClientHome(contentDiv);

//Navegación
document.getElementById("client_home").addEventListener("click", () => {
  activateClientMenu("client_home");
  showClientHome(contentDiv);
});

document.getElementById("client-calendar").addEventListener("click", () => {
  activateClientMenu("client-calendar");
  showClientCalendar(contentDiv);
});

document.getElementById("client-services").addEventListener("click", () => {
  activateClientMenu("client-services");
  showClientServices(contentDiv);
});

document.getElementById("client-users").addEventListener("click", () => {
  activateClientMenu("client-users");
  showClientUsers(contentDiv);
});

document.getElementById("client-statistics").addEventListener("click", () => {
  activateClientMenu("client-statistics");
  showClientStatistics(contentDiv);
});

function activateClientMenu(id) {
  document
    .querySelectorAll(".sidebar a")
    .forEach((a) => a.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// logout
document.getElementById("logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "../login.html";
});
window.lucide.createIcons();
