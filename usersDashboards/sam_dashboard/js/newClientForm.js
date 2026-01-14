import { SUPABASE_ANON_KEY } from "../../../supabaseClient.js";
import { showToast } from "../../../js/utils/toast.js";

export function showNewClientForm(container) {
  container.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <h2 class="mb-4">Agregar nuevo cliente</h2>
        <form id="form-new-client" novalidate>
          <div class="mb-3">
            <label class="form-label" for="client_id">Identificador del negocio</label>
            <small id="err-client_id" class="text-danger d-block mb-1" style="display:none;"></small>
            <input type="text" id="client_id" class="form-control" placeholder="123"/>
          </div>
          <div class="mb-3">
            <label class="form-label" for="client_fullname">Nombre del negocio</label>
            <small id="err-client_fullname" class="text-danger d-block mb-1" style="display:none;"></small>
            <input type="text" id="client_fullname" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label" for="email">Email del cliente</label>
            <small id="err-email" class="text-danger d-block mb-1" style="display:none;"></small>
            <input type="email" id="email" class="form-control" placeholder="ejemplo@gmail.com"/>
          </div>
          <div class="mb-3">
            <label class="form-label" for="password">Contraseña</label>
            <small id="err-password" class="text-danger d-block mb-1" style="display:none;"></small>
            <input type="password" id="password" class="form-control"/>
          </div>
          <div class="mb-3">
            <label class="form-label" for="infoFile">Subir información del negocio (PDF)</label>
            <small id="err-infoFile" class="text-danger d-block mb-1" style="display:none;"></small>
            <input class="form-control" type="file" id="infoFile" accept="application/pdf"/>
          </div>
          <button id="btn-submit" type="submit" class="btn btn-primary">
            <span id="btn-text">Agregar cliente</span>
            <span id="btn-spinner" class="spinner-border spinner-border-sm ms-2 d-none" role="status" aria-hidden="true"></span>
          </button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById("form-new-client");
  const btnSubmit = document.getElementById("btn-submit");
  const btnText = document.getElementById("btn-text");
  const btnSpinner = document.getElementById("btn-spinner");

  const fields = {
    client_id: document.getElementById("client_id"),
    client_fullname: document.getElementById("client_fullname"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    infoFile: document.getElementById("infoFile"),
  };

  function setFieldError(fieldId, message) {
    const input = fields[fieldId];
    const errEl = document.getElementById(`err-${fieldId}`);
    if (!input || !errEl) return;

    input.classList.add("is-invalid");
    errEl.textContent = message;
    errEl.style.display = "block";
  }

  function clearFieldError(fieldId) {
    const input = fields[fieldId];
    const errEl = document.getElementById(`err-${fieldId}`);
    if (!input || !errEl) return;

    input.classList.remove("is-invalid");
    errEl.textContent = "";
    errEl.style.display = "none";
  }

  function clearAllErrors() {
    Object.keys(fields).forEach((k) => clearFieldError(k));
  }

  function setLoading(isLoading) {
    btnSubmit.disabled = isLoading;
    if (isLoading) {
      btnText.textContent = "Creando...";
      btnSpinner.classList.remove("d-none");
    } else {
      btnText.textContent = "Agregar cliente";
      btnSpinner.classList.add("d-none");
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  Object.entries(fields).forEach(([key, el]) => {
    const evt = key === "infoFile" ? "change" : "input";
    el.addEventListener(evt, () => clearFieldError(key));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAllErrors();

    const client_id_raw = fields.client_id.value.trim();
    const fullname = fields.client_fullname.value.trim();
    const email = fields.email.value.trim();
    const password = fields.password.value.trim();
    const infoFile = fields.infoFile.files?.[0];

    let hasErrors = false;

    if (!client_id_raw) {
      setFieldError("client_id", "Este campo es obligatorio.");
      hasErrors = true;
    }

    const client_id = parseInt(client_id_raw, 10);
    if (!client_id_raw || isNaN(client_id) || client_id <= 0) {
      setFieldError(
        "client_id",
        "El identificador del negocio debe ser un número entero positivo."
      );
    }

    if (!fullname) {
      setFieldError("client_fullname", "Este campo es obligatorio.");
      hasErrors = true;
    }

    if (!email) {
      setFieldError("email", "Este campo es obligatorio.");
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      setFieldError("email", "Ingresa un email válido.");
      hasErrors = true;
    }

    if (!password) {
      setFieldError("password", "Este campo es obligatorio.");
      hasErrors = true;
    } else if (password.length < 6) {
      setFieldError(
        "password",
        "La contraseña debe tener al menos 6 caracteres."
      );
      hasErrors = true;
    }

    if (!infoFile) {
      setFieldError("infoFile", "Debe subir un archivo PDF.");
      hasErrors = true;
    } else if (infoFile.type !== "application/pdf") {
      setFieldError("infoFile", "El archivo debe ser un PDF.");
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("client_id", String(client_id));
      formData.append("fullname", fullname);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("file", infoFile);

      const response = await fetch(
        "https://sdkehxchuqkizynrfiau.supabase.co/functions/v1/add_client",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
          body: formData,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(result.error || "Error desconocido");

      showToast(result.message || "Cliente creado correctamente.", "success");

      form.reset();
    } catch (err) {
      console.error(err);
      showToast(`Error al crar el cliente ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  });
}
