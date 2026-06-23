export function initMailto() {
    const form = document.querySelector('.contact-form');
    
    // Si no hay formulario en esta página, detenemos la ejecución
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        // [CRUCIAL] Evita que el navegador recargue la página o redireccione a Formspree
        event.preventDefault();

        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Deshabilitamos el botón y cambiamos el texto para dar feedback visual de carga
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        // Recolectamos automáticamente todos los campos con atributo "name" del formulario
        const formData = new FormData(form);

        const fecha = new Date();
        const fechaFormateada = fecha.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        formData.append('fecha', fechaFormateada);

        try {
            // Enviamos los datos en segundo plano usando la URL del "action" de tu HTML
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Notificación nativa del navegador
                alert('¡Gracias! Nos aseguraremos de responderte lo antes posible.');
                
                // Limpiamos los campos del formulario
                form.reset(); 
                
                // Reseteamos el diseño de tu selector personalizado
                const trigger = form.querySelector('.custom-select__trigger');
                const valueLabel = form.querySelector('.custom-select__value');
                if (trigger && valueLabel) {
                    trigger.classList.add('is-placeholder');
                    valueLabel.textContent = 'Selecciona un servicio...';
                }
            } else {
                // Si Formspree devuelve un error controlado (ej. formato de email inválido)
                alert('Hubo un problema con los datos ingresados. Por favor, revísalos e intenta de nuevo.');
            }
        } catch (error) {
            // Si hay un error de red (ej. el usuario se quedó sin internet en ese segundo)
            alert('No se pudo establecer conexión con el servidor. Revisa tu conexión a internet.');
        } finally {
            // Sin importar si falló o tuvo éxito, rehabilitamos el botón a su estado original
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}