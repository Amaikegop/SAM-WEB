import { supabase } from "../../supabaseClient.js";

const form = document.getElementById("login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("client_id, role")
      .eq("id", data.user.id)
      .single();

    if (profile.role === "superadmin") {
      window.location.href = "sam_dashboard/admin_dashboard.html";
    } else {
      localStorage.setItem("client_id", profile.client_id);
      window.location.href = "/client_dashboard.html";
    }
  }
});
