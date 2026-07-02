// Funcionalidad del Footer
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar año actual
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Botón "Volver arriba"
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Exportar configuración desde footer
    const exportFooterBtn = document.getElementById('exportSettingsFooterBtn');
    if (exportFooterBtn) {
        exportFooterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('exportSettingsBtn').click();
        });
    }
    
    // Mostrar información de versión
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
        // Puedes actualizar esta versión manualmente
        lastUpdateElement.textContent = 'v1.2.0';
    }
    
    // Actualizar contador de vistas (puedes conectar esto a tu sistema de analytics)
    const viewCountElement = document.getElementById('view-count');
    if (viewCountElement) {
        // Simular un contador (reemplazar con datos reales)
        const randomViews = Math.floor(Math.random() * 1000) + 500;
        viewCountElement.textContent = randomViews.toLocaleString();
    }
});