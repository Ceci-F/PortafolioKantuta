export function initPdfModals() {
    const buttons = document.querySelectorAll('.open-pdf-btn');
    const modal = document.getElementById('pdf-modal');
    const closeBtn = document.getElementById('close-modal');
    const pdfContainer = document.getElementById('pdf-container');

    if (!modal) return;

    // Abrir Modal
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            const pdfUrl = btn.getAttribute('data-pdf');
            
            if (pdfUrl) {
                // Bloquear el scroll de la página principal
                document.body.classList.add('modal-open');

                // Inyectamos el Loader y el Iframe al mismo tiempo
                pdfContainer.innerHTML = `
                    <div id="modal-loader" class="pdf-loading-spinner">
                        <div class="spinner"></div>
                        <p>Cargando documento...</p>
                    </div>
                    <iframe 
                        src="${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH" 
                        id="pdf-viewer">
                    </iframe>
                `;
                
                modal.classList.add('active');

                // Escuchar cuándo termina de cargar el PDF real
                const iframe = document.getElementById('pdf-viewer');
                const loader = document.getElementById('modal-loader');

                iframe.addEventListener('load', () => {
                    // Ocultamos el spinner de forma fluida
                    if (loader) loader.style.opacity = '0';
                    // Mostramos el PDF con un fade-in suave
                    iframe.classList.add('loaded');
                    
                    // Eliminamos el loader del DOM tras la animación
                    setTimeout(() => { if (loader) loader.remove(); }, 300);
                });
            }
        });
    });

    // Cerrar Modal
    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('active');
        
        // Reactivar el scroll de la página principal inmediatamente
        document.body.classList.remove('modal-open');

        setTimeout(() => {
            pdfContainer.innerHTML = '';
        }, 300); 
    }
}