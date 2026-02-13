import { showToast } from "../../../js/utils/toast.js";

export function validateCurrentStep(stepElement, currentStep) {
  const requiredFields = stepElement.querySelectorAll("[required]");
  let isValid = true;
  let hasEmptyFields = false;

  requiredFields.forEach((element) => {
    if (!element.value.trim()) {
      element.classList.add("is-invalid");
      hasEmptyFields = true;
    } else {
      element.classList.remove("is-invalid");
    }
  });

  if (hasEmptyFields) {
    showToast("Por favor completa todos los campos obligatorios.", "error");
    isValid = false;
  }

  if (currentStep == 3) {
    isValid = isValid && validateEmailPassword(stepElement);
  }

  return isValid;
}

export function validateEmailPassword(stepElement) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = stepElement
    .querySelector("#emailRegisterFormInput")
    .value.trim();
  const password = stepElement.querySelector("#registerPassword").value.trim();
  const repeatPassword = stepElement
    .querySelector("#registerRepitPassword")
    .value.trim();

  if (password.length < 8) {
    showToast("La contraseña debe tener mínimo 8 caracteres", "error");
    return false;
  }
  if (password != repeatPassword) {
    showToast("Las contraseñas deben coincidir", "error");
    return false;
  }
  if (!emailRegex.test(email)) {
    showToast("El email no cumple el formato de email", "error");
    return false;
  }
  return true;
}
