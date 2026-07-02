// conveyor-manager.js
import { PLANTS } from '../../constants/resources.js';

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
        
        this.eventListeners = [];
        this.conveyorControlListeners = [];
        this.modalEventListeners = [];
        this.plantListEventListeners = [];
        
        this.domElements = {};
        this.currentModal = null;
    }
    
    initialize() {
        if (this.initialized) {
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
        this.cleanupEventListeners();
        
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
        
        this.setupConveyorControls();
        this.handleSeedMethodChange(seedMethodSelect?.value || 'chooser');
    }
    
    setupConveyorControls() {
        this.cleanupConveyorControlListeners();
        
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
            
            this.levelGenerator.levelData.seed_selection_method = 'conveyor';
            
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
        
        setTimeout(() => {
            if (this.levelGenerator) {
                this.levelGenerator.markTabAsChanged('basic');
                this.levelGenerator.updatePreview();
            }
        }, 100);
    }
    
    // ============================================
    // MODAL EXCLUSIVA PARA CINTA TRANSPORTADORA
    // ============================================
    
    showPlantSelectionModal() {
        const modalOverlay = document.getElementById('conveyorModalOverlay');
        const modal = document.getElementById('conveyorModal');
        
        if (!modalOverlay || !modal) {
            console.error('Modal de conveyor no encontrada en el DOM');
            return;
        }
        
        this.cleanupListenerArray(this.modalEventListeners);
        this.selectedPlant = null;
        this.selectedPlantIndex = null;
        
        this.configureConveyorPlantModal();
        
        modalOverlay.style.display = 'flex';
        this.setupConveyorModalCloseEvents();
    }
    
    configureConveyorPlantModal() {
        const modalBody = document.getElementById('conveyorModalBody');
        if (!modalBody) return;
        
        // Resetear header y footer a estado de "Añadir Planta"
        const title = document.querySelector('#conveyorModal .conveyor-modal-title');
        if (title) {
            title.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Seleccionar Planta';
            title.className = 'conveyor-modal-title mb-0';
        }
        const header = document.querySelector('#conveyorModal .conveyor-modal-header');
        if (header) {
            header.className = 'conveyor-modal-header bg-primary text-white';
        }
        
        // Restaurar footer de "Añadir"
        const footer = document.querySelector('#conveyorModal .conveyor-modal-footer');
        if (footer) {
            footer.innerHTML = `
                <button type="button" class="btn btn-secondary" id="conveyorModalCancel">Cancelar</button>
                <button type="button" class="btn btn-primary" id="conveyorSaveBtn">
                    <i class="bi bi-check-circle me-1"></i>Añadir Planta
                </button>
            `;
        }
        
        modalBody.innerHTML = this.getConveyorModalContent();
        this.loadPlantsForConveyorModal();
        this.setupConveyorModalEvents();
    }
    
    getConveyorModalContent() {
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
    
    loadPlantsForConveyorModal() {
        const grid = document.getElementById('conveyorPlantsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (Array.isArray(PLANTS)) {
            PLANTS.forEach(plantKey => {
                this.createPlantCardForConveyorModal(grid, plantKey, plantKey);
            });
        } else if (typeof PLANTS === 'object') {
            Object.entries(PLANTS).forEach(([plantKey, plantData]) => {
                const displayName = plantData.display_name || plantKey;
                this.createPlantCardForConveyorModal(grid, plantKey, displayName);
            });
        } else {
            grid.innerHTML = '<div class="alert alert-danger">Error: Formato de plantas no válido</div>';
        }
    }
    
    createPlantCardForConveyorModal(grid, plantKey, displayName) {
        const plantCard = document.createElement('div');
        plantCard.className = 'plant-card';
        plantCard.dataset.plant = plantKey;
        
        const imagePath = `Assets/Plants/${plantKey}.webp`;
        
        plantCard.innerHTML = `
            <img src="${imagePath}" 
                 alt="${displayName}"
                 class="plant-img"
                 onerror="this.onerror=null; this.src='Assets/Plants/error.webp';">
            <div class="plant-name">${displayName}</div>
        `;
        
        const handler = () => this.selectPlantInConveyorModal(plantKey);
        plantCard.addEventListener('click', handler);
        
        this.modalEventListeners.push({
            element: plantCard,
            type: 'click',
            handler
        });
        
        grid.appendChild(plantCard);
    }
    
    selectPlantInConveyorModal(plantKey) {
        const selectedCards = document.querySelectorAll('#conveyorPlantsGrid .plant-card.selected');
        selectedCards.forEach(card => card.classList.remove('selected'));
        
        const selectedCard = document.querySelector(`#conveyorPlantsGrid .plant-card[data-plant="${plantKey}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.selectedPlant = plantKey;
        }
    }
    
    setupConveyorModalEvents() {
        const searchInput = document.getElementById('conveyorPlantSearch');
        if (searchInput) {
            const handler = (e) => this.filterPlantsInConveyorModal(e.target.value);
            searchInput.addEventListener('input', handler);
            this.modalEventListeners.push({
                element: searchInput,
                type: 'input',
                handler
            });
        }
        
        const saveBtn = document.getElementById('conveyorSaveBtn');
        if (saveBtn) {
            const saveHandler = () => this.addSelectedPlantFromConveyorModal();
            saveBtn.addEventListener('click', saveHandler);
            this.modalEventListeners.push({
                element: saveBtn,
                type: 'click',
                handler: saveHandler
            });
        }
        
        const cancelBtn = document.getElementById('conveyorModalCancel');
        if (cancelBtn) {
            const cancelHandler = () => this.closeConveyorModal();
            cancelBtn.addEventListener('click', cancelHandler);
            this.modalEventListeners.push({
                element: cancelBtn,
                type: 'click',
                handler: cancelHandler
            });
        }
    }
    
    setupConveyorModalCloseEvents() {
        const closeBtn = document.getElementById('conveyorModalClose');
        const overlay = document.getElementById('conveyorModalOverlay');
        
        if (closeBtn) {
            const closeHandler = () => this.closeConveyorModal();
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
                    this.closeConveyorModal();
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
    
    filterPlantsInConveyorModal(searchTerm) {
        const plantCards = document.querySelectorAll('#conveyorPlantsGrid .plant-card');
        const searchLower = searchTerm.toLowerCase();
        
        plantCards.forEach(card => {
            const plantNameElement = card.querySelector('.plant-name');
            if (!plantNameElement) return;
            
            const plantName = plantNameElement.textContent.toLowerCase();
            const plantKey = card.dataset.plant.toLowerCase();
            
            card.style.display = (plantName.includes(searchLower) || plantKey.includes(searchLower)) 
                ? 'block' 
                : 'none';
        });
    }
    
    addSelectedPlantFromConveyorModal() {
        if (!this.selectedPlant) {
            alert('Por favor, selecciona una planta primero');
            return;
        }
        
        const plantData = {
            PlantType: this.selectedPlant,
            MinCount: 5,
            MaxCount: 10,
            MinWeightFactor: 2,
            MaxWeightFactor: 0,
            Weight: 15
        };
        
        this.conveyorPlants.push(plantData);
        this.updateConveyorDisplay();
        this.updateLevelData();
        
        this.closeConveyorModal();
        
        this.levelGenerator?.markTabAsChanged?.('basic');
        this.levelGenerator?.showMessage?.('Planta Añadida', `La planta "${this.selectedPlant}" ha sido añadida a la cinta`, 'success');
    }
    
    closeConveyorModal() {
        const overlay = document.getElementById('conveyorModalOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        this.selectedPlant = null;
        this.selectedPlantIndex = null;
        
        this.cleanupListenerArray(this.modalEventListeners);
    }
    
    // ============================================
    // EDITAR PLANTA - AHORA USA conveyorModal
    // ============================================
    
    showEditPlantModal(index) {
        const plant = this.conveyorPlants[index];
        if (!plant) return;
        
        this.selectedPlantIndex = index;
        
        // USAR LA MODAL EXCLUSIVA DE CONVEYOR
        const modalOverlay = document.getElementById('conveyorModalOverlay');
        const modal = document.getElementById('conveyorModal');
        
        if (!modalOverlay || !modal) {
            console.error('Modal de conveyor no encontrada en el DOM');
            return;
        }
        
        this.cleanupListenerArray(this.modalEventListeners);
        this.configureEditPlantModal(plant);
        
        modalOverlay.style.display = 'flex';
        this.setupConveyorModalCloseEvents();
    }
    
    configureEditPlantModal(plant) {
        const modal = document.getElementById('conveyorModal');
        if (!modal) return;
        
        const plantInfo = PLANTS[plant.PlantType] || {};
        const displayName = plantInfo.display_name || plant.PlantType;
        
        // Actualizar header
        const title = modal.querySelector('.conveyor-modal-title');
        if (title) {
            title.innerHTML = `<i class="bi bi-pencil-square me-2"></i>${displayName}`;
        }
        const header = modal.querySelector('.conveyor-modal-header');
        if (header) {
            header.className = 'conveyor-modal-header bg-warning text-dark';
        }
        
        const footer = modal.querySelector('.conveyor-modal-footer');
        if (footer) {
            footer.innerHTML = `
                <button type="button" class="btn btn-secondary" id="conveyorModalCancel">Cancelar</button>
                <button type="button" class="btn btn-danger" id="deletePlantBtn">
                    <i class="bi bi-trash me-1"></i>Eliminar
                </button>
                <button type="button" class="btn btn-warning" id="conveyorSaveBtn">
                    <i class="bi bi-check-circle me-1"></i>Guardar Cambios
                </button>
            `;
        }
        
        const modalBody = document.getElementById('conveyorModalBody');
        if (modalBody) {
            modalBody.innerHTML = this.getEditPlantModalContent(plant, displayName);
        }
        
        this.setupEditPlantModalEvents();
    }
    
  getEditPlantModalContent(plant, displayName) {
    return `
        <div class="edit-plant-modal-content">
            <!-- Cabecera de la planta mejorada -->
            <div class="edit-plant-header">
                <div class="edit-plant-header-content">
                    <img src="Assets/Plants/${plant.PlantType}.webp" 
                         alt="${displayName}" 
                         class="edit-plant-img"
                         onerror="this.src='Assets/Plants/error.webp'">
                    <div class="edit-plant-info">
                        <h3 class="edit-plant-name">${displayName}</h3>
                        <span class="edit-plant-type">${plant.PlantType}</span>
                    </div>
                </div>
            </div>
            
            <!-- Alerta de configuración -->
            <div class="edit-config-alert">
                <i class="bi bi-gear-fill"></i>
                <div>
                    <strong>Configuración de la planta</strong>
                    <p class="mb-0 text-muted" style="font-size: 0.85rem;">Ajusta los parámetros para esta planta en la cinta transportadora</p>
                </div>
            </div>
            
            <!-- Grid de configuración -->
            <div class="edit-config-grid">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Cantidad mínima</label>
                        <input type="number" class="form-control" id="editMinCount" 
                               value="${plant.MinCount}" min="1" max="20">
                        <div class="form-text">Mín: 1, Máx: 20</div>
                    </div>
                    
                    <div class="col-md-6">
                        <label class="form-label">Cantidad máxima</label>
                        <input type="number" class="form-control" id="editMaxCount" 
                               value="${plant.MaxCount}" min="1" max="50">
                        <div class="form-text">Mín: 1, Máx: 50</div>
                    </div>
                    
                    <div class="col-md-6">
                        <label class="form-label">Peso</label>
                        <input type="number" class="form-control" id="editWeight" 
                               value="${plant.Weight}" min="1" max="100">
                        <div class="form-text">Probabilidad de aparición (1 = baja, 100 = alta)</div>
                    </div>
                    
                    <div class="col-md-6">
                        <label class="form-label">Factor de peso inicial</label>
                        <input type="number" class="form-control" id="editMinWeightFactor" 
                               value="${plant.MinWeightFactor}" min="0" max="10" step="0.1">
                        <div class="form-text">0.0 - 10.0</div>
                    </div>
                    
                    <div class="col-md-12">
                        <label class="form-label">Factor de peso máximo</label>
                        <input type="number" class="form-control" id="editMaxWeightFactor" 
                               value="${plant.MaxWeightFactor || 0}" min="0" max="10" step="0.1">
                        <div class="form-text">0 = sin límite</div>
                    </div>
                </div>
            </div>
            
            <!-- Nota informativa -->
            <div class="edit-plant-note">
                <i class="bi bi-lightbulb-fill"></i>
                <div class="edit-plant-note-content">
                    <strong>Información importante</strong>
                    <p>El peso determina la probabilidad de que esta planta aparezca en la cinta transportadora. Los factores de peso modifican este valor durante el transcurso del juego.</p>
                </div>
            </div>
        </div>
    `;
}
    
    setupEditPlantModalEvents() {
        const saveBtn = document.getElementById('conveyorSaveBtn');
        const cancelBtn = document.getElementById('conveyorModalCancel');
        const deleteBtn = document.getElementById('deletePlantBtn');
        
        if (saveBtn) {
            const saveHandler = () => this.savePlantChanges(this.selectedPlantIndex);
            saveBtn.addEventListener('click', saveHandler);
            this.modalEventListeners.push({
                element: saveBtn,
                type: 'click',
                handler: saveHandler
            });
        }
        
        if (cancelBtn) {
            const cancelHandler = () => this.closeConveyorModal();
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
                    this.closeConveyorModal();
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
    
    savePlantChanges(index) {
        const plant = this.conveyorPlants[index];
        if (!plant) return;
        
        plant.MinCount = parseInt(document.getElementById('editMinCount')?.value) || 5;
        plant.MaxCount = parseInt(document.getElementById('editMaxCount')?.value) || 10;
        plant.Weight = parseInt(document.getElementById('editWeight')?.value) || 15;
        plant.MinWeightFactor = parseFloat(document.getElementById('editMinWeightFactor')?.value) || 2;
        plant.MaxWeightFactor = parseFloat(document.getElementById('editMaxWeightFactor')?.value) || 0;
        
        if (plant.MinCount > plant.MaxCount) {
            plant.MaxCount = plant.MinCount;
        }
        
        this.updateConveyorDisplay();
        this.updateLevelData();
        this.closeConveyorModal();
        
        this.levelGenerator?.markTabAsChanged?.('basic');
        this.levelGenerator?.showMessage?.('Configuración Actualizada', 'La configuración de la planta ha sido actualizada', 'success');
    }
    
    // ============================================
    // MÉTODOS COMUNES
    // ============================================
    
    updateConveyorDisplay() {
        const container = document.getElementById('conveyorPlantsList');
        if (!container) return;
        
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
        
        const verticalContainer = document.createElement('div');
        verticalContainer.className = 'conveyor-plants-vertical';
        
        this.conveyorPlants.forEach((plant, index) => {
            const plantElement = this.createPlantListItem(plant, index);
            verticalContainer.appendChild(plantElement);
        });
        
        container.appendChild(verticalContainer);
        this.setupPlantListListeners();
    }
    
    createPlantListItem(plant, index) {
        const plantElement = document.createElement('div');
        plantElement.className = 'conveyor-plant-item-vertical';
        plantElement.dataset.index = index;
        
        const plantInfo = PLANTS[plant.PlantType] || {};
        const displayName = plantInfo.display_name || plant.PlantType;
        
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
        document.querySelectorAll('.remove-plant-btn-vertical').forEach(btn => {
            const handler = (e) => {
                e.stopPropagation();
                const index = parseInt(e.currentTarget.dataset.index);
                this.removePlant(index);
            };
            btn.addEventListener('click', handler);
            this.plantListEventListeners.push({ element: btn, type: 'click', handler });
        });
        
        document.querySelectorAll('.edit-plant-btn-vertical').forEach(btn => {
            const handler = (e) => {
                e.stopPropagation();
                const index = parseInt(e.currentTarget.dataset.index);
                this.showEditPlantModal(index);
            };
            btn.addEventListener('click', handler);
            this.plantListEventListeners.push({ element: btn, type: 'click', handler });
        });
        
        document.querySelectorAll('.conveyor-plant-item-vertical .vertical-plant-content').forEach(item => {
            const handler = (e) => {
                if (!e.target.closest('.vertical-plant-controls')) {
                    const plantItem = e.currentTarget.closest('.conveyor-plant-item-vertical');
                    const index = parseInt(plantItem.dataset.index);
                    this.showEditPlantModal(index);
                }
            };
            item.addEventListener('click', handler);
            this.plantListEventListeners.push({ element: item, type: 'click', handler });
        });
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
            listenerArray.length = 0;
        }
    }
    
    cleanupOnTabChange() {
        this.closeConveyorModal();
        this.selectedPlant = null;
        this.selectedPlantIndex = null;
    }
    
    cleanup() {
        this.conveyorPlants = [];
        this.initialized = false;
        this.selectedPlantIndex = null;
        this.selectedPlant = null;
        this.currentModal = null;
        
        this.cleanupEventListeners();
        this.cleanupConveyorControlListeners();
        this.cleanupListenerArray(this.modalEventListeners);
        this.cleanupPlantListListeners();
        this.domElements = {};
    }
}