import { initHorizontalScroll } from "./scroll.js";
import { initTimeOrbitCover } from "./timeOrbitCover.js";
import { initCloudLoop } from "./animations.js";
import { initParallax } from "./parallax.js";
import { initPdfModals } from "./modal.js";
import { initMailto } from "./mailto.js";

function initCustomSelects() {
  const widgets = document.querySelectorAll("[data-custom-select]");

  widgets.forEach((widget) => {
    const trigger = widget.querySelector(".custom-select__trigger");
    const valueLabel = widget.querySelector(".custom-select__value");
    const hiddenInput = widget.querySelector('input[type="hidden"]');
    const optionButtons = Array.from(
      widget.querySelectorAll(".custom-select__option"),
    );
    const form = widget.closest("form");

    if (!trigger || !valueLabel || !hiddenInput || optionButtons.length === 0) {
      return;
    }

    const placeholderText = valueLabel.textContent;

    const setOpenState = (open) => {
      widget.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    };

    const close = () => setOpenState(false);
    const open = () => setOpenState(true);

    const updateSelection = (button) => {
      hiddenInput.value = button.dataset.value || "";
      valueLabel.textContent = button.textContent.trim();
      trigger.classList.remove("is-placeholder");

      optionButtons.forEach((optionButton) => {
        optionButton.classList.toggle("is-selected", optionButton === button);
        optionButton.setAttribute(
          "aria-selected",
          String(optionButton === button),
        );
      });
    };

    trigger.classList.add("is-placeholder");

    trigger.addEventListener("click", () => {
      const shouldOpen = !widget.classList.contains("is-open");
      setOpenState(shouldOpen);
    });

    optionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        updateSelection(button);
        close();
        trigger.focus();
      });
    });

    document.addEventListener("click", (event) => {
      if (!widget.contains(event.target)) {
        close();
      }
    });

    widget.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        close();
        trigger.focus();
      }
    });

    if (form) {
      form.addEventListener("submit", (event) => {
        if (!hiddenInput.value) {
          event.preventDefault();
          open();
          trigger.focus();
        }
      });
    }

    hiddenInput.addEventListener("invalid", (event) => {
      event.preventDefault();
      open();
      trigger.focus();
    });

    hiddenInput.value = "";
    valueLabel.textContent = placeholderText;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Las variables 'gsap' y 'ScrollTrigger' ya existen globalmente gracias al HTML

  // Inicializamos la lógica de scroll
  initHorizontalScroll();
  initTimeOrbitCover();
  initCloudLoop();
  initParallax();
  initPdfModals();
  initCustomSelects();
  initMailto();

  // =========================================================
  // 1. SOLUCIÓN AL RECARGAR LA PÁGINA (SCROLL RESTORATION)
  // =========================================================

  // Evita que el navegador intente adivinar dónde estaba el scroll
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  window.addEventListener("load", () => {
    // Le damos a GSAP la orden de recalcular todas las medidas finales
    ScrollTrigger.refresh();

    // Si hay un hash en la URL (ej. #contact), saltamos hacia allá de forma precisa
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        // GSAP se asegura de calcular el offset real teniendo en cuenta los 'pins'
        target.scrollIntoView({ behavior: "auto" });
      }
    } else {
      // Si no hay hash, forzamos el inicio de la página por seguridad
      window.scrollTo(0, 0);
    }
  });

  // =========================================================
  // 2. ACTUALIZAR EL HASH DE LA URL SEGÚN EL SCROLL
  // =========================================================

  // Seleccionamos todas las secciones principales que tengan un ID
  const sections = document.querySelectorAll("section[id]");

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      // Se activa cuando la parte superior de la sección llega al centro de la pantalla
      start: "top center",
      // Termina cuando la parte inferior pasa el centro
      end: "bottom center",
      onToggle: (self) => {
        // Si la sección está activa (en pantalla), cambiamos la URL
        if (self.isActive) {
          history.replaceState(null, null, `#${section.id}`);
        }
      },
    });
  });
});
