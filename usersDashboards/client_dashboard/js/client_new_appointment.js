import { showLoader } from "../../../js/utils/loader.js";
import { supabase } from "../../../supabaseClient.js";
import { showClientHome } from "./client_home.js";
import { showToast } from "../../../js/utils/toast.js";
import {
  getAvailableSlots,
  createAppointment,
} from "../../../js/utils/availability.js";

const appointmentState = {
  user: null,
  selectedSlot: null,
};

async function loadUsers(stepContent) {
  const userSelect = stepContent.querySelector("#userIDSelect");

  const { data: users, error } = await supabase
    .from("user")
    .select("id, fullname")
    .eq("client_id", localStorage.getItem("client_id"))
    .order("fullname");

  if (error) {
    showToast("Error al cargar los usuarios: " + error.message, "error");
    return;
  }

  users.forEach((user) => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.fullname;
    userSelect.appendChild(option);
  });

  if (appointmentState.user) {
    userSelect.value = appointmentState.user.id;
  }
}

async function loadServices(stepContent) {
  const serviceSelect = stepContent.querySelector("#serviceIDSelect");

  const { data: services, error } = await supabase
    .from("service")
    .select("id, name")
    .eq("client_id", localStorage.getItem("client_id"))
    .order("name");

  if (error) {
    showToast("Error al cargar los servicios: " + error.message, "error");
    return;
  }

  services.forEach((service) => {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = service.name;
    serviceSelect.appendChild(option);
  });
}

async function submitAppointment(stepContent) {
  const userId = stepContent.querySelector("#userIDSelect").value;
  const serviceId = stepContent.querySelector("#serviceIDSelect").value;
  const start = appointmentState.selectedSlot;
  const clientId = localStorage.getItem("client_id");

  if (!userId || !serviceId || !start) {
    showToast("Completa todos los campos", "error");
    return;
  }

  const result = await createAppointment({
    serviceId,
    userId,
    start,
    clientId,
  });

  if (!result.ok) {
    if (result.reason === "NO_AVAILABILITY") {
      showToast("Ese horario ya fue tomado", "error");
    } else {
      showToast("No se pudo crear el turno", "error");
    }
    return false;
  }

  showToast("Turno creado correctamente", "success");
  return true;
}

export async function clientNewAppointment(container, date, onBack) {
  showLoader(container);
  try {
    container.innerHTML = `
    <div class="d-flex flex-column align-items-start w-100">
        <button id="btn-back" class="btn btn-link p-0 mb-2">
          <i data-lucide="arrow-left"></i>
        </button>
        <h2 class="w-100 text-center">Nuevo turno</h2>
        <div id="step-content" class="w-100 mt-3"></div>
    </div>
    `;
    renderOptionStep(container);
    lucide.createIcons();
  } catch (err) {
    console.error("Error al crear un nuevo turno:" + err.message, "error");
    container.innerHTML = `<p class='text-danger'>Error al crear el turno.</p>`;
  }
}

function renderOptionStep(container) {
  const stepContent = container.querySelector("#step-content");
  stepContent.innerHTML = `
    <h6>Elige si el turno es para un usuario que ya se ha comunicado por Whatsapp o para un nuevo usuario:</h6>
    
    <div class="d-flex justify-content-center gap-4 my-4">
        <button id="btn-new-user" class="option-btn"><i data-lucide="user-plus"></i><span>Usuario nuevo</span></button>
        <button id="btn-existing-user" class="option-btn"><i data-lucide="user"></i><span>Usuario ya existente</span></button>
    </div>
  `;
  lucide.createIcons();

  stepContent
    .querySelector("#btn-new-user")
    .addEventListener("click", () => renderNewUserForm(container));

  stepContent
    .querySelector("#btn-existing-user")
    .addEventListener("click", () => renderExistingUserForm(container));

  setupBackButton(container, () => showClientHome(container));
}

function renderNewUserForm(container) {
  const stepContent = container.querySelector("#step-content");
  stepContent.innerHTML = `
  <h6>Completa con los datos del usuario:</h6>
  <form id="appointment-newUserForm" class="w-75 mx-auto">
    <div class="mb-3">
      <label class="form-label">Telefono</label>
      <input class="form-control" id="userIDInput" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Nombre</label>
      <input class="form-control" id="userNameInput" required>
    </div>
    <div class="mb-3">
      <label class="form-label">Apellido</label>
      <input class="form-control" id="userLastNameInput" required>
    </div>
    <button id="btn-next-step" type="submit" class="btn btn-primary">
      Siguiente
    </button>
  </form>
  `;
  setupBackButton(container, () => renderOptionStep(container));

  stepContent
    .querySelector("#appointment-newUserForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const phone = stepContent.querySelector("#userIDInput").value.trim();
      const name = stepContent.querySelector("#userNameInput").value.trim();
      const lastname = stepContent
        .querySelector("#userLastNameInput")
        .value.trim();

      if (!phone || !name || !lastname) {
        showToast("Completá todos los campos", "error");
        return;
      }

      const userData = {
        id: phone,
        client_id: localStorage.getItem("client_id"),
        name: name,
        fullname: `${name} ${lastname}`,
      };

      const { data, error } = await supabase
        .from("user")
        .insert(userData)
        .select()
        .single();

      if (error) {
        showToast("Error al crear el usuario:" + error.message, "error");
        return;
      }

      appointmentState.user = data;

      renderExistingUserForm(container);
    });
}

async function renderExistingUserForm(container) {
  const stepContent = container.querySelector("#step-content");
  stepContent.innerHTML = `
  <h6>Completa con los datos del turno:</h6>
  <form id="appointment-existingUserForm" class="w-75 mx-auto">
    <div class="mb-3">
      <label class="form-label">Usuario:</label>
      <select class="form-select" id="userIDSelect" required>
        <option value="">Seleccione usuario</option>
      </select>
    </div>
    <div class="col-md-4 mb-3">
            <label class="form-label">Fecha:</label>
            <input type="date" class="form-control"
                id="appointmentDateInput"
                required>
    </div>
    <div id="available-slots" class="d-flex flex-wrap gap-2 mt-3"></div>
    <div class="mb-3">
      <label class="form-label">Servicio:</label>
      <select class="form-select" id="serviceIDSelect" required>
        <option value="">Seleccione servicio</option>
      </select>
    </div>
    <button type="submit" class="btn btn-primary">
        Confirmar
    </button>
  </form>
  `;

  setupBackButton(container, () => renderOptionStep(container));

  const serviceSelect = stepContent.querySelector("#serviceIDSelect");
  const dateInput = stepContent.querySelector("#appointmentDateInput");

  serviceSelect.addEventListener("change", () =>
    loadAvailableSlotsUI(stepContent),
  );

  dateInput.addEventListener("change", () => loadAvailableSlotsUI(stepContent));

  await loadUsers(stepContent);
  await loadServices(stepContent);

  stepContent
    .querySelector("#appointment-existingUserForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const ok = await submitAppointment(stepContent);
      if (!ok) return;
      showClientHome(container);
    });
}

async function loadAvailableSlotsUI(stepContent) {
  const serviceId = stepContent.querySelector("#serviceIDSelect").value;
  const date = stepContent.querySelector("#appointmentDateInput").value;
  const slotsContainer = stepContent.querySelector("#available-slots");

  appointmentState.selectedSlot = null;
  slotsContainer.innerHTML = "";

  if (!serviceId || !date) {
    return;
  }

  slotsContainer.innerHTML =
    "<span class='text-muted'>Cargando horarios...</span>";

  // console.log("Disponibilidad params:", {
  //   serviceId,
  //   date,
  //   clientId: localStorage.getItem("client_id"),
  // });

  const slots = await getAvailableSlots({
    serviceId,
    date,
    clientId: localStorage.getItem("client_id"),
  });

  slotsContainer.innerHTML = "";

  if (!slots.length) {
    slotsContainer.innerHTML =
      "<span class='text-muted'>No hay horarios disponibles</span>";
    return;
  }

  slots.forEach((slot) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-outline-primary btn-sm";
    btn.textContent = formatTime(slot);

    btn.onclick = () => {
      appointmentState.selectedSlot = slot;

      slotsContainer
        .querySelectorAll("button")
        .forEach((b) => b.classList.remove("btn-primary"));

      btn.classList.remove("btn-outline-primary");
      btn.classList.add("btn-primary");
    };

    slotsContainer.appendChild(btn);
  });
}

function setupBackButton(container, onBackAction) {
  const btnBack = container.querySelector("#btn-back");
  btnBack.onclick = onBackAction;
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
