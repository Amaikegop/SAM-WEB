import { showToast } from "../../../js/utils/toast.js";
import { validateCurrentStep } from "../register/registerValidations.js";

document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".step");
  const stepsContainer = document.querySelector(".steps-container");
  const stepIndicators = document.querySelectorAll(".progress-container li");
  const prevButton = document.getElementById("btn-prev");
  const nextButton = document.getElementById("btn-register-next");
  const submitButton = document.getElementById("btn-submit");

  document.documentElement.style.setProperty("--steps", stepIndicators.length);

  let currentStep = 0;

  const updateProgress = () => {
    stepsContainer.style.height = steps[currentStep].offsetHeight + "px";

    stepIndicators.forEach((indicator, index) => {
      indicator.classList.toggle("current-step", currentStep === index);
      indicator.classList.toggle("done-step", currentStep > index);
    });

    steps.forEach((step, index) => {
      step.style.transform = `translateX(-${currentStep * 100}%)`;
      step.classList.toggle("current-step", currentStep === index);
    });

    updateButtons();
  };

  const updateButtons = () => {
    prevButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep >= stepIndicators.length - 1;
    submitButton.hidden = !nextButton.hidden;
  };

  prevButton.addEventListener("click", (e) => {
    e.preventDefault();

    if (currentStep > 0) {
      currentStep--;
      updateProgress();
    }
  });

  nextButton.addEventListener("click", (e) => {
    e.preventDefault();
    let isValid = validateCurrentStep(steps[currentStep], currentStep);

    if (!isValid) {
      return;
    } else {
      if (currentStep < stepIndicators.length - 1) {
        currentStep++;
        updateProgress();
      }
    }
  });

  updateProgress();
});
