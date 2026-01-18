// PlantManager.js - Versión corregida para usar constants/resources.js
class PlantManager {
    constructor() {
        this.allPlants = [];
        this.selectedPlants = [];
        this.excludedPlants = [];
        this.maxSelectedPlants = 8;
        
        
        // Verificar si las constantes están disponibles
        this.PATHS = window.APP_CONSTANTS?.PATHS || {};
        this.PLANTS = window.APP_CONSTANTS?.PLANTS || [];
        
        this.init();
    }

    init() {
        this.loadPlantList();
        this.setupEventListeners();
        this.updatePlantDisplays();
    }

    loadPlantList() {
        // PRIMERO: Intentar usar las plantas de constants/resources.js
        if (this.PLANTS && this.PLANTS.length > 0) {
            this.allPlants = [...this.PLANTS];
            console.log('Plantas cargadas desde constants/resources.js:', this.allPlants.length);
            return;
        }
        
        // SEGUNDO: Si no hay plantas en constants, usar fetch como fallback
        this.loadPlantsFromJSON();
    }

    async loadPlantsFromJSON() {
        try {
            const response = await fetch('data-name.json');
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            // Procesar el JSON
            if (Array.isArray(data)) {
                this.allPlants = data;
            } else if (data.plants && Array.isArray(data.plants)) {
                this.allPlants = data.plants;
            } else if (data.allPlants && Array.isArray(data.allPlants)) {
                this.allPlants = data.allPlants;
            } else {
                // Intentar extraer cualquier array que contenga nombres de plantas
                const plantArrays = Object.values(data).filter(item => Array.isArray(item));
                if (plantArrays.length > 0) {
                    this.allPlants = plantArrays[0];
                } else {
                    throw new Error('Formato de JSON no reconocido');
                }
            }

            console.log('Plantas cargadas desde JSON:', this.allPlants.length);

        } catch (error) {
            console.error('Error cargando lista de plantas:', error);
            
            // TERCERO: Lista predeterminada mínima
            this.allPlants = [
                "sunflower",
                "peashooter",
                "wallnut",
                "potatomine",
                "bloomerang",
                "cabbagepult",
                "iceburg",
                "twinsunflower"
            ];
            
            console.log('Usando lista predeterminada:', this.allPlants.length);
        } finally {
            // Asegurarse de actualizar las vistas después de cargar
            this.updatePlantDisplays();
        }
    }

    getPlantImageUrl(plantName) {
        const normalizedName = plantName.toLowerCase().replace(/\s+/g, '');
        
        // PRIMERO: Usar ruta desde constants/resources.js si está disponible
        if (this.PATHS.IMAGES && this.PATHS.IMAGES.PLANTS) {
            const url = `${this.PATHS.IMAGES.PLANTS}${normalizedName}.webp`;
            console.log(`Imagen desde PATHS: ${url}`);
            return url;
        }
        
        // SEGUNDO: Fallback a la ruta anterior
        const fallbackUrl = `Assets/Plants/${normalizedName}.webp`;
        console.log(`Imagen desde fallback: ${fallbackUrl}`);
        return fallbackUrl;
    }

    // El resto de los métodos se mantienen igual...

    cleanupModal(mode) {
        const modalId = mode === 'select' ? 'selectPlantsModal' : 'excludePlantsModal';
        const modal = document.getElementById(modalId);

        if (modal) {
            // Obtener instancia de Bootstrap
            const modalInstance = bootstrap.Modal.getInstance(modal);

            // Si existe la instancia, cerrarla
            if (modalInstance) {
                modalInstance.hide();
                modalInstance.dispose();
            }

            // Remover el modal del DOM
            modal.remove();
        }

        // Restaurar el scroll de la página
        this.restorePageScroll();
    }

    setupEventListeners() {
        // Botón para seleccionar plantas
        document.getElementById('selectPlantsBtn').addEventListener('click', () => {
            this.showPlantModal('select');
        });

        // Botón para excluir plantas
        document.getElementById('excludePlantsBtn').addEventListener('click', () => {
            this.showPlantModal('exclude');
        });

        // Switch para habilitar/deshabilitar selección
        document.getElementById('enablePlantSelection').addEventListener('change', (e) => {
            this.togglePlantSelection(e.target.checked);
        });
    }

    togglePlantSelection(enabled) {
        const section = document.getElementById('plantConfigSection');
        const selectBtn = document.getElementById('selectPlantsBtn');
        const excludeBtn = document.getElementById('excludePlantsBtn');

        if (!enabled) {
            section.classList.add('disabled');
            selectBtn.disabled = true;
            excludeBtn.disabled = true;

            // Limpiar selecciones cuando se deshabilita
            this.selectedPlants = [];
            this.excludedPlants = [];
            this.updatePlantDisplays();
        } else {
            section.classList.remove('disabled');
            selectBtn.disabled = false;
            excludeBtn.disabled = false;
        }
    }

    showPlantModal(mode) {
        const modalId = mode === 'select' ? 'selectPlantsModal' : 'excludePlantsModal';
        const title = mode === 'select' ? 'Seleccionar Plantas' : 'Excluir Plantas';
        const actionText = mode === 'select' ? 'Seleccionar' : 'Excluir';

        // 1. Guardar el transform original del body
        const bodyTransform = document.body.style.transform;

        // 2. Eliminar modal existente si hay
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        // 3. Crear estructura del modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = modalId;

        // Obtener las plantas disponibles
        const availablePlants = this.getAvailablePlantsForMode(mode);

        modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h5 class="modal-title">
                    ${title} (Máximo: ${mode === 'select' ? this.maxSelectedPlants : 'Sin límite'})
                </h5>
                <button type="button" class="modal-close-btn" aria-label="Cerrar">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="row g-3" id="plantGrid-${mode}">
                    <!-- Plantas se cargarán aquí -->
                </div>
            </div>
            <div class="modal-footer">
                <div class="d-flex justify-content-between w-100 align-items-center">
                    <div>
                        <span id="selectedCount-${mode}" class="badge bg-primary">0 seleccionadas</span>
                    </div>
                    <div>
                        <button type="button" class="btn btn-secondary" id="cancel${mode.charAt(0).toUpperCase() + mode.slice(1)}Btn">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" id="confirm${mode.charAt(0).toUpperCase() + mode.slice(1)}Btn">
                            ${actionText} Plantas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

        document.body.appendChild(modal);

        // 4. Remover el transform del body temporalmente
        document.body.style.transform = 'none';
        document.body.classList.add('modal-open');

        // 5. Cargar plantas en el grid
        this.loadPlantGrid(mode, availablePlants);

        // 6. Función para cerrar el modal
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    modal.remove();
                }
                // Restaurar el transform original del body
                document.body.style.transform = bodyTransform;
                document.body.classList.remove('modal-open');
            }, 300);
        };

        // 7. Configurar eventos
        const closeBtn = modal.querySelector('.modal-close-btn');
        const cancelBtn = modal.querySelector(`#cancel${mode.charAt(0).toUpperCase() + mode.slice(1)}Btn`);
        const confirmBtn = modal.querySelector(`#confirm${mode.charAt(0).toUpperCase() + mode.slice(1)}Btn`);

        // Evento para cerrar con el botón X
        closeBtn.addEventListener('click', closeModal);

        // Evento para cancelar
        cancelBtn.addEventListener('click', closeModal);

        // Evento para confirmar
        confirmBtn.addEventListener('click', () => {
            this.confirmSelection(mode);
            closeModal();
        });

        // Evento para cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Evento para cerrar con ESC
        const handleEscape = (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // 8. Mostrar el modal con animación
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // 9. Limpiar event listener cuando se cierra
        const cleanup = () => {
            document.removeEventListener('keydown', handleEscape);
            // Restaurar el transform original del body si aún no se ha hecho
            if (document.body.style.transform === 'none') {
                document.body.style.transform = bodyTransform;
            }
        };

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cleanup();
            }
        });

        closeBtn.addEventListener('click', cleanup);
        cancelBtn.addEventListener('click', cleanup);
        confirmBtn.addEventListener('click', cleanup);

        // 10. Enfocar el primer elemento del modal para accesibilidad
        setTimeout(() => {
            const firstPlantCard = modal.querySelector('.plant-select-card');
            if (firstPlantCard) {
                firstPlantCard.focus();
            }
        }, 50);
    }

    getAvailablePlantsForMode(mode) {
        if (mode === 'select') {
            // Para seleccionar: todas las plantas excepto las excluidas y ya seleccionadas
            return this.allPlants.filter(plant =>
                !this.excludedPlants.includes(plant) &&
                !this.selectedPlants.includes(plant)
            );
        } else {
            // Para excluir: todas las plantas excepto las ya seleccionadas
            return this.allPlants.filter(plant =>
                !this.selectedPlants.includes(plant)
            );
        }
    }

    isPlantSelected(plant, mode) {
        if (mode === 'select') {
            return this.selectedPlants.includes(plant);
        } else {
            return this.excludedPlants.includes(plant);
        }
    }

    loadPlantGrid(mode, plants) {
        const containerId = `plantGrid-${mode}`;
        const container = document.getElementById(containerId);
        const countElement = document.getElementById(`selectedCount-${mode}`);

        if (!container) return;

        container.innerHTML = '';

        if (plants.length === 0) {
            container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
                <i class="bi bi-flower1 display-1 text-muted mb-3"></i>
                <h5>No hay plantas disponibles</h5>
                <p class="text-muted">Todas las plantas ya están ${mode === 'select' ? 'seleccionadas o excluidas' : 'seleccionadas'}</p>
            </div>
        `;
            return;
        }

        let selectedCount = 0;

        plants.forEach(plant => {
            const card = document.createElement('div');
            card.className = `plant-select-card ${this.isPlantSelected(plant, mode) ? 'selected' : ''}`;
            card.dataset.plant = plant;

            const imageUrl = this.getPlantImageUrl(plant);
            const isAlreadySelected = this.isPlantSelected(plant, mode);

            card.innerHTML = `
            <div class="plant-checkbox">
                <input type="checkbox" class="form-check-input plant-check" 
                       ${isAlreadySelected ? 'checked disabled' : ''}>
            </div>
            <div class="plant-image-container">
                <img src="${imageUrl}" alt="${plant}" class="plant-modal-image"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+Jm5ic3A7PC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="plant-modal-name">${plant}</div>
        `;

            container.appendChild(card);

            if (isAlreadySelected) {
                selectedCount++;
            }
        });

        // Actualizar contador
        if (countElement) {
            countElement.textContent = `${selectedCount} seleccionadas`;
        }

        // Configurar eventos de selección
        this.setupPlantCardEvents(mode);
    }

    setupPlantCardEvents(mode) {
        const cards = document.querySelectorAll(`#plantGrid-${mode} .plant-select-card`);
        const countElement = document.getElementById(`selectedCount-${mode}`);
        const maxSelectable = mode === 'select' ? this.maxSelectedPlants - this.selectedPlants.length : this.allPlants.length;

        cards.forEach(card => {
            const checkbox = card.querySelector('.plant-check');
            const isAlreadySelected = checkbox.checked;

            if (isAlreadySelected) return;

            card.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT') return;

                const plant = card.dataset.plant;
                const isChecked = checkbox.checked;

                if (!isChecked && this.getSelectedCount(mode) >= maxSelectable) {
                    this.showAlert('Límite alcanzado',
                        `Solo puedes ${mode === 'select' ? 'seleccionar' : 'excluir'} máximo ${maxSelectable} plantas.`);
                    return;
                }

                checkbox.checked = !isChecked;
                card.classList.toggle('selected', checkbox.checked);

                // Actualizar contador
                this.updateSelectedCount(mode);
            });

            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();

                if (checkbox.checked && this.getSelectedCount(mode) > maxSelectable) {
                    checkbox.checked = false;
                    card.classList.remove('selected');
                    this.showAlert('Límite alcanzado',
                        `Solo puedes ${mode === 'select' ? 'seleccionar' : 'excluir'} máximo ${maxSelectable} plantas.`);
                } else {
                    card.classList.toggle('selected', checkbox.checked);
                }

                this.updateSelectedCount(mode);
            });
        });
    }

    getSelectedCount(mode) {
        const containerId = `plantGrid-${mode}`;
        const container = document.getElementById(containerId);
        if (!container) return 0;

        const checkedBoxes = container.querySelectorAll('.plant-check:checked');
        return checkedBoxes.length;
    }

    updateSelectedCount(mode) {
        const countElement = document.getElementById(`selectedCount-${mode}`);
        if (countElement) {
            const count = this.getSelectedCount(mode);
            countElement.textContent = `${count} seleccionadas`;

            // Cambiar color si se alcanza el límite
            const maxSelectable = mode === 'select' ? this.maxSelectedPlants - this.selectedPlants.length : this.allPlants.length;
            if (count >= maxSelectable) {
                countElement.className = 'badge bg-danger';
            } else {
                countElement.className = 'badge bg-primary';
            }
        }
    }

    confirmSelection(mode) {
        const containerId = `plantGrid-${mode}`;
        const container = document.getElementById(containerId);
        if (!container) return;

        const checkedBoxes = container.querySelectorAll('.plant-check:checked');
        const selectedPlants = Array.from(checkedBoxes).map(cb => {
            const card = cb.closest('.plant-select-card');
            return card.dataset.plant;
        });

        if (mode === 'select') {
            // Añadir nuevas selecciones (evitar duplicados)
            selectedPlants.forEach(plant => {
                if (!this.selectedPlants.includes(plant)) {
                    this.selectedPlants.push(plant);
                }
            });

            // Limitar a máximo
            if (this.selectedPlants.length > this.maxSelectedPlants) {
                this.selectedPlants = this.selectedPlants.slice(0, this.maxSelectedPlants);
            }
        } else {
            // Añadir a excluidas
            selectedPlants.forEach(plant => {
                if (!this.excludedPlants.includes(plant)) {
                    this.excludedPlants.push(plant);
                }
            });

            // Remover de seleccionadas si están excluidas
            this.selectedPlants = this.selectedPlants.filter(plant =>
                !this.excludedPlants.includes(plant)
            );
        }

        this.updatePlantDisplays();
    }

    updatePlantDisplays() {
        this.updateSelectedPlantsDisplay();
        this.updateExcludedPlantsDisplay();

        // Actualizar contador de plantas seleccionadas
        const selectedCountBadge = document.querySelector('#selectPlantsBtn .badge');
        if (selectedCountBadge) {
            selectedCountBadge.textContent = this.selectedPlants.length;
        }
    }

    updateSelectedPlantsDisplay() {
        const container = document.getElementById('selectedPlantsContainer');
        if (!container) return;

        container.innerHTML = '';

        if (this.selectedPlants.length === 0) {
            container.innerHTML = `
                <div class="alert alert-secondary text-center py-3 mb-0">
                    <p class="mb-0">No hay plantas seleccionadas</p>
                    <small class="text-muted">Máximo: ${this.maxSelectedPlants} plantas</small>
                </div>
            `;
            return;
        }

        // Crear grid para plantas seleccionadas
        const grid = document.createElement('div');
        grid.className = 'row g-2';

        this.selectedPlants.forEach((plant, index) => {
            const col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-3';

            const imageUrl = this.getPlantImageUrl(plant);

            col.innerHTML = `
                <div class="selected-plant-card">
                    <div class="plant-img-small">
                        <img src="${imageUrl}" alt="${plant}" class="img-fluid"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+Jm5ic3A7PC90ZXh0Pjwvc3ZnPg=='">
                    </div>
                    <div class="plant-info">
                        <div class="plant-name-small">${plant}</div>
                        <button class="btn btn-sm btn-outline-danger remove-plant" 
                                data-plant="${plant}" data-index="${index}">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                </div>
            `;

            grid.appendChild(col);
        });

        container.appendChild(grid);

        // Añadir contador
        const counter = document.createElement('div');
        counter.className = 'mt-2 text-center';
        counter.innerHTML = `
            <small class="text-muted">
                ${this.selectedPlants.length} de ${this.maxSelectedPlants} plantas seleccionadas
            </small>
        `;
        container.appendChild(counter);

        // Configurar eventos de eliminación
        this.setupRemoveEvents('selected');
    }

    updateExcludedPlantsDisplay() {
        const container = document.getElementById('excludedPlantsContainer');
        if (!container) return;

        container.innerHTML = '';

        if (this.excludedPlants.length === 0) {
            container.innerHTML = `
                <div class="alert alert-secondary text-center py-3 mb-0">
                    <i class="bi bi-ban display-6 mb-2"></i>
                    <p class="mb-0">No hay plantas excluidas</p>
                </div>
            `;
            return;
        }

        // Crear grid para plantas excluidas
        const grid = document.createElement('div');
        grid.className = 'row g-2';

        this.excludedPlants.forEach((plant, index) => {
            const col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-3';

            const imageUrl = this.getPlantImageUrl(plant);

            col.innerHTML = `
                <div class="excluded-plant-card">
                    <div class="plant-img-small">
                        <img src="${imageUrl}" alt="${plant}" class="img-fluid"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnNzLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlZWUiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY2NiI+Jm5ic3A7PC90ZXh0Pjwvc3ZnPg=='">
                        <div class="excluded-overlay">
                            <i class="bi bi-ban"></i>
                        </div>
                    </div>
                    <div class="plant-info">
                        <div class="plant-name-small text-muted">${plant}</div>
                        <button class="btn btn-sm btn-outline-success remove-exclusion" 
                                data-plant="${plant}" data-index="${index}">
                            <i class="bi bi-check"></i>
                        </button>
                    </div>
                </div>
            `;

            grid.appendChild(col);
        });

        container.appendChild(grid);

        // Añadir contador
        const counter = document.createElement('div');
        counter.className = 'mt-2 text-center';
        counter.innerHTML = `
            <small class="text-muted">
                ${this.excludedPlants.length} plantas excluidas
            </small>
        `;
        container.appendChild(counter);

        // Configurar eventos de eliminación
        this.setupRemoveEvents('excluded');
    }

    setupRemoveEvents(type) {
        const selector = type === 'selected' ? '.remove-plant' : '.remove-exclusion';
        const buttons = document.querySelectorAll(selector);

        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const plant = e.target.closest('button').dataset.plant;

                if (type === 'selected') {
                    // Remover de seleccionadas
                    this.selectedPlants = this.selectedPlants.filter(p => p !== plant);
                } else {
                    // Remover de excluidas
                    this.excludedPlants = this.excludedPlants.filter(p => p !== plant);
                }

                this.updatePlantDisplays();
            });
        });
    }

    showAlert(title, message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: title,
                text: message,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            alert(`${title}: ${message}`);
        }
    }

    // Métodos para obtener datos para el JSON
    getSelectedPlantsForJson() {
        return this.selectedPlants.map(plant => ({
            PlantType: plant
        }));
    }

    getExcludedPlantsForJson() {
        return this.excludedPlants;
    }

    // Método para cargar configuraciones existentes
    loadPlantConfig(config) {
        if (config.selectedPlants) {
            this.selectedPlants = config.selectedPlants;
        }
        if (config.excludedPlants) {
            this.excludedPlants = config.excludedPlants;
        }
        this.updatePlantDisplays();
    }

    // Método para exportar configuración
    exportConfig() {
        return {
            selectedPlants: this.selectedPlants,
            excludedPlants: this.excludedPlants
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.plantManager = new PlantManager();
});