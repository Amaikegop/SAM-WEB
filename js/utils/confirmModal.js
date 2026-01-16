export function confirmModal({
  title = "Confirmación",
  message = "¿Estás seguro?",
  confirmText = "Sí",
  cancelText = "No",
  confirmBtnClass = "btn-primary",
} = {}) {
  const modalEl = document.getElementById("confirmModal");
  if (!modalEl) {
    throw new Error("Falta el #confirmModal en el HTML");
  }

  const titleEl = document.getElementById("confirmModalTitle");
  const bodyEl = document.getElementById("confirmModalBody");
  const okBtn = document.getElementById("confirmModalOk");
  const cancelBtn = document.getElementById("confirmModalCancel");

  titleEl.textContent = title;
  bodyEl.innerHTML = message;
  okBtn.textContent = confirmText;
  cancelBtn.textContent = cancelText;

  okBtn.className = `btn ${confirmBtnClass}`;

  const modal = new bootstrap.Modal(modalEl, {
    backdrop: "static",
    keyboard: false,
  });

  return new Promise((resolve) => {
    const cleanup = () => {
      okBtn.removeEventListener("click", onOk);
      modalEl.removeEventListener("hidden.bs.modal", onHide);
    };

    const onOk = () => {
      cleanup();
      modal.hide();
      resolve(true);
    };

    const onHide = () => {
      cleanup();
      resolve(false);
    };

    okBtn.addEventListener("click", onOk, { once: true });
    modalEl.addEventListener("hidden.bs.modal", onHide);

    modal.show();
  });
}
