// conveyor-manager.js
import { PLANTS } from '../constants/resources.js';

export class ConveyorManager {
    constructor(levelGenerator) {
        this.levelGenerator = levelGenerator;
        this.conveyorPlants = [];
        this.config = {
            baseSpeed: 100,
            initialDelay: 3,
            randomOrder: false
        };
        
        this.initialized = false;
        this.selectedPlantIndex = null;
        this.selectedPlant = null;
        
        // Almacenar referencias para poder limpiarlas
        this.eventListeners = [];
        this.conveyorControlListeners = [];
        this.modalEventListeners = [];
        this.plantListEventListeners = [];
        
        // Referencias a elementos del DOM
        this.domElements = {};
        
        // Referencia al modal actual
        this.currentModal = null;
    }
    
    initialize() {
        if (this.initialized) {
            // Limpiar listeners previos para evitar duplicados
            this.cleanupEventListeners();
        }
        
        try {
            this.setupEventListeners();
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing ConveyorManager:', error);
        }
    }
    
    setupEventListeners() {
        // Limpiar cualquier listener previo
        this.cleanupEventListeners();
        
        // Mostrar/ocultar configuración según método de selección
        const seedMethodSelect = document.getElementById('seedSelectionMethod');
        
        if (seedMethodSelect) {
            const handler = (e) => {
                this.handleSeedMethodChange(e.target.value);
            };
            seedMethodSelect.addEventListener('change', handler);
            this.eventListeners.push({ 
                element: seedMethodSelect, 
                type: 'change', 
                handler 
            });
        }
        
        // Botón para añadir plantas
        const addPlantBtn = document.getElementById('addConveyorPlantBtn');
        if (addPlantBtn) {
            const handler = () => this.showPlantSelectionModal();
            addPlantBtn.addEventListener('click', handler);
            this.eventListeners.push({ 
                element: addPlantBtn, 
                type: 'click', 
                handler 
            });
        }
        
        // Configurar controles de cinta
        this.setupConveyorControls();
        
        // Inicializar estado
        this.handleSeedMethodChange(seedMethodSelect?.value || 'chooser');
    }
    
    setupConveyorControls() {
        // Limpiar listeners previos si existen
        this.cleanupConveyorControlListeners();
        
        // Velocidad base
        const baseSpeedInput = document.getElementById('conveyorBaseSpeed');
        if (baseSpeedInput) {
            const handler = (e) => {
                this.config.baseSpeed = parseInt(e.target.value) || 100;
                this.updateLevelData();
                this.levelGenerator?.markTabAsChanged?.('basic');
            };
            baseSpeedInput.addEventListener('input', handler);
            this.conveyorControlListeners.push({ 
                element: baseSpeedInput, 
                type: 'input', 
                handler 
            });
        }
        
        // Retraso inicial
        const initialDelayInput = document.getElementById('conveyorInitialDelay');
        if (initialDelayInput) {
            const handler = (e) => {
                this.config.initialDelay = parseFloat(e.target.value) || 3;
                this.updateLevelData();
                this.levelGenerator?.markTabAsChanged?.('basic');
            };
            initialDelayInput.addEventListener('input', handler);
            this.conveyorControlListeners.push({ 
                element: initialDelayInput, 
                type: 'input', 
                handler 
            });
        }
        
        // Orden aleatorio
        const randomOrderCheckbox = document.getElementById('conveyorRandomOrder');
        if (randomOrderCheckbox) {
            const handler = (e) => {
                this.config.randomOrder = e.target.checked;
                this.updateLevelData();
                this.levelGenerator?.markTabAsChanged?.('basic');
            };
            randomOrderCheckbox.addEventListener('change', handler);
            this.conveyorControlListeners.push({ 
                element: randomOrderCheckbox, 
                type: 'change', 
                handler 
            });
        }
    }
    
    handleSeedMethodChange(method) {
        const conveyorContainer = document.getElementById('conveyorConfigContainer');
        const plantConfigSection = document.getElementById('plantConfigSection');
        
        if (!conveyorContainer) return;
        
        if (method === 'conveyor') {
            conveyorContainer.style.display = 'block';
            
            if (plantConfigSection) {
                plantConfigSection.style.display = 'none';
            }
            
            // Actualizar levelData
            this.levelGenerator.levelData.seed_selection_method = 'conveyor';
            
            // Inicializar conveyor si no está inicializado
            if (!this.initialized) {
                this.initialize();
            }
            
        } else {
            conveyorContainer.style.display = 'none';
            
            if (plantConfigSection) {
                plantConfigSection.style.display = 'block';
            }
            
            this.levelGenerator.levelData.seed_selection_method = method;
        }
        
        // Forzar actualización de la vista previa
        setTimeout(() => {
            if (this.levelGenerator) {
                this.levelGenerator.markTabAsChanged('basic');
                this.levelGenerator.updatePreview();
            }
        }, 100);
    }
    
    showPlantSelectionModal() {
        // Usar la modal existente del HTML
        const modalOverlay = document.getElementById('rewardModalOverlay');
        const modal = document.getElementById('rewardModal');
        
        if (!modalOverlay || !modal) {
            console.error('Modal no encontrada en el DOM');
            return;
        }
        
        // Limpiar contenido y listeners previos
        this.cleanupModalContent();
        
        // Configurar la modal para selección de plantas de conveyor
        this.configureConveyorPlantModal();
        
        // Mostrar la modal
        modalOverlay.style.display = 'flex';
        
        // Almacenar referencia
        this.currentModal = modal;
        
        // Configurar eventos de cierre
        this.setupModalCloseEvents();
    }
    
    configureConveyorPlantModal() {
        const modal = document.getElementById('rewardModal');
        if (!modal) return;
        
        // Actualizar título
        const title = modal.querySelector('.reward-container-modal-title');
        if (title) {
            title.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Seleccionar Planta';
            title.parentElement.className = 'reward-container-modal-header bg-primary text-white';
        }
        
        // Ocultar elementos no necesarios
        const rewardTypeGroup = modal.querySelector('[name="rewardType"]');
        const rewardSearch = document.getElementById('rewardSearch');
        
        if (rewardTypeGroup) rewardTypeGroup.closest('.row').style.display = 'none';
        if (rewardSearch) rewardSearch.parentElement.style.display = 'none';
        
        // Reconfigurar el cuerpo del modal - SOLO SELECCIÓN
        const modalBody = modal.querySelector('.reward-container-modal-body');
        modalBody.innerHTML = this.getConveyorModalContent();
        
        // Cargar plantas
        this.loadPlantsForExistingModal();
        
        // Configurar eventos de la modal
        this.setupConveyorModalEvents();
    }
    
    getConveyorModalContent() {
        // Modal SIMPLE solo para seleccionar
        return `
            <div class="conveyor-modal-content">
                <div class="mb-3">
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="bi bi-search"></i>
                        </span>
                        <input type="text" class="form-control" id="conveyorPlantSearch" 
                               placeholder="Buscar planta...">
                    </div>
                </div>
                
                <div class="alert alert-info mb-3">
                    <i class="bi bi-info-circle me-2"></i>
                    <strong>Instrucciones:</strong> Selecciona una planta para añadirla a la cinta transportadora.
                    Podrás ajustar su configuración después desde la lista.
                </div>
                
                <div class="plants-grid-container" style="max-height: 400px; overflow-y: auto;">
                    <div class="plants-grid" id="conveyorPlantsGrid">
                        <!-- Plantas se cargarán aquí -->
                    </div>
                </div>
            </div>
        `;
    }
    
    loadPlantsForExistingModal() {
        const grid = document.getElementById('conveyorPlantsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // Verificar si PLANTS es un array u objeto
        if (Array.isArray(PLANTS)) {
            // Si PLANTS es un array (formato antiguo)
            PLANTS.forEach(plantKey => {
                this.createPlantCardForExistingModal(grid, plantKey, plantKey);
            });
        } else if (typeof PLANTS === 'object') {
            // Si PLANTS es un objeto (formato nuevo)
            Object.entries(PLANTS).forEach(([plantKey, plantData]) => {
                const displayName = plantData.display_name || plantKey;
                this.createPlantCardForExistingModal(grid, plantKey, displayName);
            });
        } else {
            console.error('PLANTS no tiene un formato válido');
            grid.innerHTML = '<div class="alert alert-danger">Error: Formato de plantas no válido</div>';
        }
    }
    
    createPlantCardForExistingModal(grid, plantKey, displayName) {
        const plantCard = document.createElement('div');
        plantCard.className = 'plant-card';
        plantCard.dataset.plant = plantKey;
        
        // Usar la ruta correcta desde PATHS
        const imagePath = `Assets/Plants/${plantKey}.webp`;
        
        plantCard.innerHTML = `
            <img src="${imagePath}" 
                 alt="${displayName}"
                 class="plant-img"
                 onerror="this.onerror=null; this.src='Assets/Plants/error.webp';">
            <div class="plant-name">${displayName}</div>
        `;
        
        const handler = () => this.selectPlantInModal(plantKey);
        plantCard.addEventListener('click', handler);
        
        // Almacenar referencia para limpiar
        this.modalEventListeners.push({
            element: plantCard,
            type: 'click',
            handler
        });
        
        grid.appendChild(plantCard);
    }
    
    selectPlantInModal(plantKey) {
        // Remover selección anterior
        const selectedCards = document.querySelectorAll('#conveyorPlantsGrid .plant-card.selected');
        selectedCards.forEach(card => {
            card.classList.remove('selected');
        });
        
        // Añadir selección actual
        const selectedCard = document.querySelector(`#conveyorPlantsGrid .plant-card[data-plant="${plantKey}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.selectedPlant = plantKey;
        }
    }
    
    setupConveyorModalEvents() {
        // Búsqueda de plantas
        const searchInput = document.getElementById('conveyorPlantSearch');
        if (searchInput) {
            const handler = (e) => this.filterPlantsInModal(e.target.value);
            searchInput.addEventListener('input', handler);
            this.modalEventListeners.push({
                element: searchInput,
                type: 'input',
                handler
            });
        }
        
        // Configurar botones del modal
        const saveBtn = document.getElementById('saveRewardBtn');
        const cancelBtn = document.getElementById('rewardModalCancel');
        
        if (saveBtn) {
            const saveHandler = () => this.addSelectedPlantFromModal();
            saveBtn.addEventListener('click', saveHandler);
            this.modalEventListeners.push({
                element: saveBtn,
                type: 'click',
                handler: saveHandler
            });
            
            // Cambiar texto del botón
            saveBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Añadir Planta';
            saveBtn.className = 'btn btn-primary';
        }
        
        if (cancelBtn) {
            const cancelHandler = () => this.closeModal();
            cancelBtn.addEventListener('click', cancelHandler);
            this.modalEventListeners.push({
                element: cancelBtn,
                type: 'click',
                handler: cancelHandler
            });
        }
    }
    
    filterPlantsInModal(searchTerm) {
        const plantCards = document.querySelectorAll('#conveyorPlantsGrid .plant-card');
        const searchLower = searchTerm.toLowerCase();
        
        plantCards.forEach(card => {
            const plantName = card.querySelector('.plant-name').textContent.toLowerCase();
            const plantKey = card.dataset.plant.toLowerCase();
            
            if (plantName.includes(searchLower) || plantKey.includes(searchLower)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    addSelectedPlantFromModal() {
        if (!this.selectedPlant) {
            alert('Por favor, selecciona una planta primero');
            return;
        }
        
        // Valores por defecto SIMPLES
        const plantData = {
            PlantType: this.selectedPlant,
            MinCount: 5,  // Valor por defecto
            MaxCount: 10, // Valor por defecto
            MinWeightFactor: 2,  // Valor por defecto
            MaxWeightFactor: 0,  // Valor por defecto
            Weight: 15  // Valor por defecto
        };
        
        this.conveyorPlants.push(plantData);
        this.updateConveyorDisplay();
        this.updateLevelData();
        
        // Cerrar modal
        this.closeModal();
        
        this.levelGenerator?.markTabAsChanged?.('basic');
        this.levelGenerator?.showMessage?.('Planta Añadida', `La planta "${this.selectedPlant}" ha sido añadida a la cinta`, 'success');
    }
    
    setupModalCloseEvents() {
        const closeBtn = document.getElementById('rewardModalClose');
        const overlay = document.getElementById('rewardModalOverlay');
        
        if (closeBtn) {
            const closeHandler = () => this.closeModal();
            closeBtn.addEventListener('click', closeHandler);
            this.modalEventListeners.push({
                element: closeBtn,
                type: 'click',
                handler: closeHandler
            });
        }
        
        if (overlay) {
            const overlayHandler = (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            };
            overlay.addEventListener('click', overlayHandler);
            this.modalEventListeners.push({
                element: overlay,
                type: 'click',
                handler: overlayHandler
            });
        }
    }
    
    closeModal() {
        const overlay = document.getElementById('rewardModalOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        // Limpiar selección
        this.selectedPlant = null;
        this.selectedPlantIndex = null;
        
        // Limpiar listeners del modal
        this.cleanupModalContent();
    }
    
    cleanupModalContent() {
        // Limpiar todos los listeners del modal
        this.cleanupListenerArray(this.modalEventListeners);
        
        // Limpiar contenido del modal pero mantener la estructura básica
        const modalBody = document.querySelector('.reward-container-modal-body');
        if (modalBody) {
            modalBody.innerHTML = '';
        }
        
        // Restaurar botones del footer completamente
        this.restoreModalFooter();
        
        // Restaurar título y color del header
        const title = document.querySelector('.reward-container-modal-title');
        if (title) {
            title.innerHTML = '<i class="bi bi-gift me-2"></i>Seleccionar Recompensa';
            title.parentElement.className = 'reward-container-modal-header bg-success text-white';
        }
        
        // Mostrar elementos ocultados
        const rewardTypeGroup = document.querySelector('[name="rewardType"]');
        const rewardSearch = document.getElementById('rewardSearch');
        
        if (rewardTypeGroup) rewardTypeGroup.closest('.row').style.display = '';
        if (rewardSearch) rewardSearch.parentElement.style.display = '';
    }
    
    restoreModalFooter() {
        const modalFooter = document.querySelector('.reward-container-modal-footer');
        if (modalFooter) {
            modalFooter.innerHTML = `
                <button type="button" class="btn btn-secondary" id="rewardModalCancel">Cancelar</button>
                <button type="button" class="btn btn-success" id="saveRewardBtn">
                    <i class="bi bi-check-circle me-2"></i>Guardar Recompensa
                </button>
            `;
        }
    }
    
    updateConveyorDisplay() {
        const container = document.getElementById('conveyorPlantsList');
        if (!container) return;
        
        // Limpiar listeners previos
        this.cleanupPlantListListeners();
        
        if (this.conveyorPlants.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    No hay plantas configuradas para la cinta transportadora
                </div>`;
            return;
        }
        
        container.innerHTML = '';
        
        // Crear contenedor vertical
        const verticalContainer = document.createElement('div');
        verticalContainer.className = 'conveyor-plants-vertical';
        
        this.conveyorPlants.forEach((plant, index) => {
            const plantElement = this.createPlantListItem(plant, index);
            verticalContainer.appendChild(plantElement);
        });
        
        container.appendChild(verticalContainer);
        
        // Añadir event listeners
        this.setupPlantListListeners();
    }
    
    createPlantListItem(plant, index) {
        const plantElement = document.createElement('div');
        plantElement.className = 'conveyor-plant-item-vertical';
        plantElement.dataset.index = index;
        
        // Obtener nombre de visualización
        const plantInfo = PLANTS[plant.PlantType] || {};
        const displayName = plantInfo.display_name || plant.PlantType;
        
        // Mostrar solo información BÁSICA en la lista
        plantElement.innerHTML = `
            <div class="vertical-plant-content">
                <div class="vertical-plant-image">
                    <img src="Assets/Plants/${plant.PlantType}.webp" 
                         alt="${displayName}" 
                         class="conveyor-plant-img-vertical"
                         onerror="this.src='Assets/Plants/error.webp'">
                </div>
                 <div class="vertical-plant-details">
                    <div class="vertical-plant-config">
                        <span class="badge bg-primary">${plant.PlantType}</span>
                        <div class="row g-2">
                            <div class="col-12 col-md-6">
                                <div class="config-item">
                                    <span class="config-label">Cantidad:</span>
                                    <span class="config-value">${plant.MinCount}-${plant.MaxCount}</span>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="config-item">
                                    <span class="config-label">Peso:</span>
                                    <span class="config-value">${plant.Weight}</span>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="config-item">
                                    <span class="config-label">Factor inicial:</span>
                                    <span class="config-value">${plant.MinWeightFactor}</span>
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="config-item">
                                    <span class="config-label">Factor máximo:</span>
                                    <span class="config-value">${plant.MaxWeightFactor || '0'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="vertical-plant-controls">
                <button class="btn btn-sm btn-outline-warning edit-plant-btn-vertical" 
                        data-index="${index}" title="Editar configuración">
                    <i class="bi bi-pencil-square"></i> Editar
                </button>
                <button class="btn btn-sm btn-outline-danger remove-plant-btn-vertical" 
                        data-index="${index}" title="Eliminar planta">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        return plantElement;
    }
    
    setupPlantListListeners() {
        // Botones de eliminar
        document.querySelectorAll('.remove-plant-btn-vertical').forEach(btn => {
            const handler = (e) => {
                e.stopPropagation();
                const index = parseInt(e.currentTarget.dataset.index);
                this.removePlant(index);
            };
            btn.addEventListener('click', handler);
            this.plantListEventListeners.push({
                element: btn,
                type: 'click',
                handler
            });
        });
        
        // Botones de editar
        document.querySelectorAll('.edit-plant-btn-vertical').forEach(btn => {
            const handler = (e) => {
                e.stopPropagation();
                const index = parseInt(e.currentTarget.dataset.index);
                this.showEditPlantModal(index);
            };
            btn.addEventListener('click', handler);
            this.plantListEventListeners.push({
                element: btn,
                type: 'click',
                handler
            });
        });
        
        // Hacer que toda la tarjeta sea clickeable para editar
        document.querySelectorAll('.conveyor-plant-item-vertical .vertical-plant-content').forEach(item => {
            const handler = (e) => {
                if (!e.target.closest('.vertical-plant-controls')) {
                    const plantItem = e.currentTarget.closest('.conveyor-plant-item-vertical');
                    const index = parseInt(plantItem.dataset.index);
                    this.showEditPlantModal(index);
                }
            };
            item.addEventListener('click', handler);
            this.plantListEventListeners.push({
                element: item,
                type: 'click',
                handler
            });
        });
    }
    
    showEditPlantModal(index) {
        const plant = this.conveyorPlants[index];
        if (!plant) return;
        
        this.selectedPlantIndex = index;
        
        // Usar la modal existente del HTML
        const modalOverlay = document.getElementById('rewardModalOverlay');
        const modal = document.getElementById('rewardModal');
        
        if (!modalOverlay || !modal) {
            console.error('Modal no encontrada en el DOM');
            return;
        }
        
        // Limpiar contenido y listeners previos
        this.cleanupModalContent();
        
        // Configurar la modal para edición de planta CON TODA LA CONFIGURACIÓN
        this.configureEditPlantModal(plant);
        
        // Mostrar la modal
        modalOverlay.style.display = 'flex';
        
        // Almacenar referencia
        this.currentModal = modal;
        
        // Configurar eventos de cierre
        this.setupModalCloseEvents();
    }
    
    configureEditPlantModal(plant) {
        const modal = document.getElementById('rewardModal');
        if (!modal) return;
        
        // Obtener información de la planta
        const plantInfo = PLANTS[plant.PlantType] || {};
        const displayName = plantInfo.display_name || plant.PlantType;
        
        // Actualizar título
        const title = modal.querySelector('.reward-container-modal-title');
        if (title) {
            title.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Configurar Planta: ${displayName}`;
            title.parentElement.className = 'reward-container-modal-header bg-warning text-dark';
        }
        
        // Reconfigurar el cuerpo del modal CON TODA LA CONFIGURACIÓN
        const modalBody = modal.querySelector('.reward-container-modal-body');
        modalBody.innerHTML = this.getEditPlantModalContent(plant, displayName);
        
        // Configurar eventos de la modal
        this.setupEditPlantModalEvents();
    }
    
    getEditPlantModalContent(plant, displayName) {
        return `
            <div class="edit-plant-modal-content">
                <div class="text-center mb-4">
                    <img src="Assets/Plants/${plant.PlantType}.webp" 
                         alt="${displayName}" 
                         class="edit-plant-img"
                         style="width: 100px; height: 100px; object-fit: cover;"
                         onerror="this.src='Assets/Plants/error.webp'">
                    <h5 class="mt-2">${displayName}</h5>
                    <p class="text-muted">${plant.PlantType}</p>
                </div>
                
                <div class="alert alert-info mb-3">
                    <i class="bi bi-gear me-2"></i>
                    <strong>Configuración completa de la planta:</strong>
                </div>
                
                <div class="row g-3">
                    <!-- Cantidad -->
                    <div class="col-md-6">
                        <label class="form-label">Cantidad mínima:</label>
                        <input type="number" class="form-control" id="editMinCount" 
                               value="${plant.MinCount}" min="1" max="20">
                        <div class="form-text">Mín: 1, Máx: 20</div>
                    </div>
                    
                    <div class="col-md-6">
                        <label class="form-label">Cantidad máxima:</label>
                        <input type="number" class="form-control" id="editMaxCount" 
                               value="${plant.MaxCount}" min="1" max="50">
                        <div class="form-text">Mín: 1, Máx: 50</div>
                    </div>
                    
                    <!-- Peso y factores -->
                    <div class="col-md-6">
                        <label class="form-label">Peso:</label>
                        <input type="number" class="form-control" id="editWeight" 
                               value="${plant.Weight}" min="1" max="100">
                        <div class="form-text">Probabilidad (1=baja, 100=alta)</div>
                    </div>
                    
                    <div class="col-md-6">
                        <label class="form-label">Factor de peso inicial:</label>
                        <input type="number" class="form-control" id="editMinWeightFactor" 
                               value="${plant.MinWeightFactor}" min="0" max="10" step="0.1">
                        <div class="form-text">0.0 - 10.0</div>
                    </div>
                    
                    <div class="col-md-12">
                        <label class="form-label">Factor de peso máximo:</label>
                        <input type="number" class="form-control" id="editMaxWeightFactor" 
                               value="${plant.MaxWeightFactor || 0}" min="0" max="10" step="0.1">
                        <div class="form-text">0 = sin límite</div>
                    </div>
                    
                    <div class="col-md-12 mt-3">
                        <div class="alert alert-warning">
                            <i class="bi bi-lightbulb me-2"></i>
                            <strong>Nota:</strong> El peso determina la probabilidad de que esta planta aparezca en la cinta.
                            Los factores de peso modifican este peso durante el juego.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEditPlantModalEvents() {
        // Primero restaurar el footer completamente
        this.restoreEditModalFooter();
        
        // Luego configurar los eventos
        const saveBtn = document.getElementById('saveRewardBtn');
        const cancelBtn = document.getElementById('rewardModalCancel');
        const deleteBtn = document.getElementById('deletePlantBtn');
        
        if (saveBtn) {
            const saveHandler = () => this.savePlantChanges(this.selectedPlantIndex);
            saveBtn.addEventListener('click', saveHandler);
            this.modalEventListeners.push({
                element: saveBtn,
                type: 'click',
                handler: saveHandler
            });
            
            // Cambiar texto del botón
            saveBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i>Guardar Cambios';
            saveBtn.className = 'btn btn-warning';
        }
        
        if (cancelBtn) {
            const cancelHandler = () => this.closeModal();
            cancelBtn.addEventListener('click', cancelHandler);
            this.modalEventListeners.push({
                element: cancelBtn,
                type: 'click',
                handler: cancelHandler
            });
        }
        
        if (deleteBtn) {
            const deleteHandler = () => {
                if (confirm('¿Estás seguro de que quieres eliminar esta planta de la cinta?')) {
                    this.removePlant(this.selectedPlantIndex);
                    this.closeModal();
                }
            };
            deleteBtn.addEventListener('click', deleteHandler);
            this.modalEventListeners.push({
                element: deleteBtn,
                type: 'click',
                handler: deleteHandler
            });
        }
    }
    
    restoreEditModalFooter() {
        const modalFooter = document.querySelector('.reward-container-modal-footer');
        if (modalFooter) {
            modalFooter.innerHTML = `
                <button type="button" class="btn btn-secondary" id="rewardModalCancel">Cancelar</button>
                <button type="button" class="btn btn-danger" id="deletePlantBtn">
                    <i class="bi bi-trash me-1"></i>Eliminar
                </button>
                <button type="button" class="btn btn-warning" id="saveRewardBtn">
                    <i class="bi bi-check-circle me-1"></i>Guardar Cambios
                </button>
            `;
        }
    }
    
    savePlantChanges(index) {
        const plant = this.conveyorPlants[index];
        if (!plant) return;
        
        // Obtener nuevos valores
        plant.MinCount = parseInt(document.getElementById('editMinCount').value) || 5;
        plant.MaxCount = parseInt(document.getElementById('editMaxCount').value) || 10;
        plant.Weight = parseInt(document.getElementById('editWeight').value) || 15;
        plant.MinWeightFactor = parseFloat(document.getElementById('editMinWeightFactor').value) || 2;
        plant.MaxWeightFactor = parseFloat(document.getElementById('editMaxWeightFactor').value) || 0;
        
        // Validar
        if (plant.MinCount > plant.MaxCount) {
            plant.MaxCount = plant.MinCount;
        }
        
        // Actualizar display
        this.updateConveyorDisplay();
        this.updateLevelData();
        
        // Cerrar modal
        this.closeModal();
        
        this.levelGenerator?.markTabAsChanged?.('basic');
        this.levelGenerator?.showMessage?.('Configuración Actualizada', 'La configuración de la planta ha sido actualizada', 'success');
    }
    
    removePlant(index) {
        if (index >= 0 && index < this.conveyorPlants.length) {
            const plantName = this.conveyorPlants[index].PlantType;
            this.conveyorPlants.splice(index, 1);
            this.updateConveyorDisplay();
            this.updateLevelData();
            this.levelGenerator?.markTabAsChanged?.('basic');
            this.levelGenerator?.showMessage?.('Planta Eliminada', `La planta "${plantName}" ha sido removida de la cinta`, 'warning');
        }
    }
    
    updateLevelData() {
        if (!this.levelGenerator?.levelData) return;
        
        this.levelGenerator.levelData.conveyor_config = {
            enabled: this.levelGenerator.levelData.seed_selection_method === 'conveyor',
            drop_delay_conditions: [
                { "Delay": this.config.initialDelay, "MaxPackets": 0 },
                { "Delay": 6, "MaxPackets": 2 },
                { "Delay": 9, "MaxPackets": 4 },
                { "Delay": 12, "MaxPackets": 8 }
            ],
            initial_plant_list: [...this.conveyorPlants],
            speed_conditions: [
                { "MaxPackets": 0, "Speed": this.config.baseSpeed }
            ],
            random_order: this.config.randomOrder
        };
    }
    
    getConveyorModule() {
        if (this.levelGenerator?.levelData?.seed_selection_method !== 'conveyor') {
            return null;
        }
        
        return {
            "aliases": ["ConveyorBelt"],
            "objclass": "ConveyorSeedBankProperties",
            "objdata": {
                "DropDelayConditions": this.levelGenerator.levelData.conveyor_config.drop_delay_conditions,
                "InitialPlantList": this.levelGenerator.levelData.conveyor_config.initial_plant_list,
                "SpeedConditions": this.levelGenerator.levelData.conveyor_config.speed_conditions,
            }
        };
    }
    
    // Métodos de limpieza mejorados
    cleanupEventListeners() {
        this.cleanupListenerArray(this.eventListeners);
    }
    
    cleanupConveyorControlListeners() {
        this.cleanupListenerArray(this.conveyorControlListeners);
    }
    
    cleanupPlantListListeners() {
        this.cleanupListenerArray(this.plantListEventListeners);
    }
    
    cleanupListenerArray(listenerArray) {
        if (listenerArray && listenerArray.length > 0) {
            listenerArray.forEach(({ element, type, handler }) => {
                if (element && element.removeEventListener && handler) {
                    try {
                        element.removeEventListener(type, handler);
                    } catch (e) {
                        console.warn('Error removing event listener:', e);
                    }
                }
            });
            listenerArray.length = 0; // Vaciar el array
        }
    }
    
    // Método para limpiar todo al cambiar de pestaña
    cleanupOnTabChange() {
        // Cerrar cualquier modal abierto
        this.closeModal();
        
        // Resetear variables de estado
        this.selectedPlant = null;
        this.selectedPlantIndex = null;
    }
    
    // Método para limpiar referencias si es necesario
    cleanup() {
        this.conveyorPlants = [];
        this.initialized = false;
        this.selectedPlantIndex = null;
        this.selectedPlant = null;
        this.currentModal = null;
        
        // Limpiar todos los listeners
        this.cleanupEventListeners();
        this.cleanupConveyorControlListeners();
        this.cleanupModalContent();
        this.cleanupPlantListListeners();
        
        // Limpiar referencias del DOM
        this.domElements = {};
    }
}