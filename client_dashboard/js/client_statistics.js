import { showLoader } from "../../js/utils/loader.js";
import { supabase } from "../../supabaseClient.js";

export function showClientStatistics(container) {
  container.innerHTML = "<p>ESTADISTICAS</p>";
}
