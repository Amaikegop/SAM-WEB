export function showLoader(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="height: 60vh;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status" style="width: 4rem; height: 4rem;">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="fw-semibold text-secondary">Cargando datos...</p>
      </div>
    </div>
  `;
}
