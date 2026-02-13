import { showToast } from "../../../js/utils/toast.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("service-container");
  let serviceCounter = 0;

  const addServiceBtn = document.querySelector(".btn-add-service");
  addServiceBtn.addEventListener("click", () => {
    createService();
  });

  function createService() {
    const newService = createServiceBlock();
    container.appendChild(newService);
    new bootstrap.Collapse(newService.querySelector(".accordion-collapse"), {
      toggle: true,
    });
  }

  function createFormGroup(
    labelText,
    labelName = "",
    inputName = "",
    inputType = "text",
    placeholder = "",
    required = false,
    isTextArea = false,
    small = false,
    smallContent = "",
  ) {
    let field;
    const formGroup = document.createElement("div");
    formGroup.classList.add("form-group", "mb-3");

    const label = document.createElement("label");
    label.classList.add("form-label", "fw-semibold");
    label.textContent = labelText;
    label.name = labelName;

    if (isTextArea) {
      field = document.createElement("textarea");
      field.classList.add("form-control");
      field.placeholder = placeholder;
      field.rows = "4";
      field.required = required;
      field.name = inputName;
    } else {
      field = document.createElement("input");
      field.type = inputType;
      field.classList.add("form-control");
      field.placeholder = placeholder;
      field.required = required;
      field.name = inputName;
    }

    if (required) {
      const mandatoryChar = document.createElement("span");
      mandatoryChar.textContent = "*";
      mandatoryChar.classList.add("text-danger");
      label.appendChild(mandatoryChar);
    }

    formGroup.appendChild(label);
    formGroup.appendChild(field);

    if (small) {
      const smallElement = document.createElement("small");
      smallElement.classList.add("form-text", "text-muted");
      smallElement.textContent = smallContent;
      formGroup.appendChild(smallElement);
    }

    return formGroup;
  }

  function createColumn() {
    const eachColumnDiv = document.createElement("div");
    eachColumnDiv.classList.add("form-group", "col-md-4");

    return eachColumnDiv;
  }

  function createServiceBlock() {
    serviceCounter++;
    const collapseId = `serviceCollapse${serviceCounter}`;
    const headerId = `serviceHeader${serviceCounter}`;

    const block = document.createElement("div");
    block.classList.add("service-block", "accordion-item");

    const itemHeader = document.createElement("h2");
    itemHeader.classList.add("accordion-header");
    itemHeader.id = headerId;

    const accordionBtn = document.createElement("button");
    accordionBtn.classList.add("accordion-button");
    accordionBtn.type = "button";
    accordionBtn.setAttribute("data-bs-toggle", "collapse");
    accordionBtn.setAttribute("data-bs-target", `#${collapseId}`);
    accordionBtn.setAttribute("aria-expanded", "false");
    accordionBtn.setAttribute("aria-controls", collapseId);
    accordionBtn.textContent = `Servicio ${serviceCounter}`;

    itemHeader.appendChild(accordionBtn);
    block.appendChild(itemHeader);

    const accordionDiv = document.createElement("div");
    accordionDiv.id = collapseId;
    accordionDiv.classList.add("accordion-collapse", "collapse");
    accordionDiv.setAttribute("aria-labelledby", headerId);
    accordionDiv.setAttribute("data-bs-parent", "#service-container");

    const accordionBody = document.createElement("div");
    accordionBody.classList.add("accordion-body");

    const nameGroup = createFormGroup(
      "Nombre del servicio ",
      "serviceName",
      "serviceNameInput",
      "text",
      "Ej. Cancha de fútbol 8",
      true,
    );

    const descriptionGroup = createFormGroup(
      "Descripción del servicio ",
      "serviceDescription",
      "serviceDescriptionInput",
      "text",
      "Describe las cualidades de tu servicio",
      true,
      true,
    );

    const priceGroup = createFormGroup(
      "Precio ($): ",
      "servicePrice",
      "servicePriceInput",
      "number",
      "50000",
      true,
      false,
    );

    const simultaneousGroup = createFormGroup(
      "Cantidad: ",
      "serviceSimultaneous",
      "serviceSimultaneousInput",
      "text",
      "2 canchas",
      true,
      false,
    );

    const durationGroup = createFormGroup(
      "Duración: ",
      "serviceDuration",
      "serviceDurationInput",
      "text",
      "1 hora",
      true,
      false,
    );

    const scheduleRange = createFormGroup(
      "Horarios del servicio: ",
      "scheduleRange",
      "scheduleRangeInput",
      "text",
      "Lunes de 10 a 13 y de 16 a 18",
      true,
      true,
      true,
      "Informa los horarios en que esta disponible el servicio de Lunes a Viernes, los días que no informes horarios serán tomados como que el servicio no esta disponible ese día.",
    );

    const columnDiv = document.createElement("div");
    columnDiv.classList.add("row", "mb-3");

    const column1 = createColumn();
    column1.appendChild(priceGroup);
    const column2 = createColumn();
    column2.appendChild(simultaneousGroup);
    const column3 = createColumn();
    column3.appendChild(durationGroup);

    columnDiv.appendChild(column1);
    columnDiv.appendChild(column2);
    columnDiv.appendChild(column3);
    columnDiv.appendChild(scheduleRange);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Eliminar";
    deleteBtn.classList.add("btn-delete");

    deleteBtn.addEventListener("click", () => {
      const services = document.querySelectorAll(".service-block");
      if (services.length > 1) {
        block.remove();
        const updatedServices = document.querySelectorAll(".service-block");
        let index = 1;
        for (const service of updatedServices) {
          const currentService = service.querySelector(".accordion-button");
          currentService.textContent = "Servicio " + index;
          index++;
        }
      } else
        showToast(
          "Debes tener un servicio como mínimo para poder hacer la solicitud.",
          "error",
        );
    });

    accordionBody.appendChild(nameGroup);
    accordionBody.appendChild(descriptionGroup);
    accordionBody.appendChild(columnDiv);
    accordionBody.appendChild(deleteBtn);
    accordionDiv.appendChild(accordionBody);

    block.appendChild(accordionDiv);

    return block;
  }

  createService();
});
