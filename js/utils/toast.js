export function showToast(message, type = "success", duration = 3000) {
  const container = document.getElementById("toast-container");
  if (!container) return console.error("Falta el #toast-container en el HTML");

  const toast = document.createElement("div");
  toast.classList.add("toast-box");

  if (type === "success") toast.classList.add("toast-success");
  else if (type === "error") toast.classList.add("toast-error");

  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toast-out 0.25s forwards";
    setTimeout(() => toast.remove(), 3000);
  }, duration);
}
