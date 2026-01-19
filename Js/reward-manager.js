// En reward-manager.js
import { PLANTS, REWARDS, PATHS } from '../constants/resources.js';

class RewardManager {
    constructor(levelGenerator) {
        this.levelGenerator = levelGenerator;
        
        this.rewardsData = {
            firstReward: {
                type: "collectable",  // Tipo coleccionable
                param: "moneybag"  // ID del moneybag
            },
            replayReward: {  // Cambia null por esto:
                type: "collectable",  // Tipo coleccionable
                param: "moneybag"  // ID del moneybag
            }
        };
        
        // Cargar plantas y coleccionables desde recursos
        this.plants = [];
        this.collectables = [];
        
        this.currentRewardType = "first";
        this.selectedPlant = null;
        this.selectedCollectable = null;
        
        // Flag para controlar si el modal está abierto
        this.isModalOpen = false;
        
        this.init();
    }

    init() {
        this.loadPlants();
        this.loadCollectables();
        this.setupEventListeners();
        this.displayDefaultMoneybag();
        console.log('✓ RewardManager inicializado');
    }

    // Método para mostrar el moneybag como recompensa por defecto
    displayDefaultMoneybag() {
        console.log('Configurando moneybag como recompensa por defecto...');
        
        // Verificar que el moneybag existe en los coleccionables
        const moneybagExists = this.collectables.some(c => c.id === "moneybag");
        
        if (!moneybagExists) {
            console.warn('⚠️ Moneybag no encontrado en coleccionables');
            return;
        }
        
        // Configurar el moneybag para ambos tipos de recompensa
        const moneybagReward = {
            type: "collectable",
            param: "moneybag"
        };
        
        // 1. Actualizar los datos internos
        this.rewardsData.firstReward = moneybagReward;
        this.rewardsData.replayReward = moneybagReward;
        
        // 2. Mostrar en el contenedor de primera victoria
        this.displayReward('firstRewardContainer', moneybagReward);
        
        // 3. Mostrar en el contenedor de rejugabilidad
        this.displayReward('replayRewardContainer', moneybagReward);
        
        console.log('✓ Moneybag configurado como recompensa por defecto en ambos slots (primera victoria y rejugabilidad)');
    }

    loadPlants() {
        console.log('Cargando plantas desde recursos...');
        this.plants = [];
        
        if (PLANTS && Array.isArray(PLANTS)) {
            PLANTS.forEach(plantName => {
                const displayName = this.formatPlantName(plantName);
                
                let imagePath;
                if (PATHS && PATHS.IMAGES && PATHS.IMAGES.PLANTS) {
                    imagePath = `${PATHS.IMAGES.PLANTS}${plantName}.webp`;
                } else {
                    imagePath = `Assets/Plants/${plantName}.webp`;
                }
                
                console.log(`Cargando planta: ${plantName} -> ${imagePath}`);
                
                this.plants.push({
                    name: plantName,
                    displayName: displayName,
                    image: imagePath
                });
            });
            
            console.log(`✓ ${this.plants.length} plantas cargadas`);
        } else {
            console.warn('⚠️ No se encontraron plantas en los recursos');
            this.plants = this.getDefaultPlants();
        }
    }

    getDefaultPlants() {
        return [
            { 
                name: "peashooter", 
                displayName: "Peashooter", 
                image: "Assets/Plants/peashooter.webp" 
            },
            { 
                name: "sunflower", 
                displayName: "Sunflower", 
                image: "Assets/Plants/sunflower.webp" 
            },
            { 
                name: "wallnut", 
                displayName: "Wallnut", 
                image: "Assets/Plants/wallnut.webp" 
            }
        ];
    }

    formatPlantName(plantName) {
        return plantName
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    loadCollectables() {
        console.log('Cargando coleccionables desde recursos...');
        this.collectables = [];
        
        if (REWARDS && Array.isArray(REWARDS)) {
            REWARDS.forEach(rewardName => {
                const displayName = this.formatRewardName(rewardName);
                
                let imagePath;
                if (PATHS && PATHS.IMAGES && PATHS.IMAGES.REWARDS) {
                    imagePath = `${PATHS.IMAGES.REWARDS}${rewardName}.webp`;
                } else {
                    imagePath = `Assets/Rewards/${rewardName}.webp`;
                }
                
                console.log(`Cargando recompensa: ${rewardName} -> ${imagePath}`);
                
                this.collectables.push({
                    id: rewardName,
                    name: displayName,
                    image: imagePath
                });
            });
            
            console.log(`✓ ${this.collectables.length} coleccionables cargados`);
        } else {
            console.warn('⚠️ No se encontraron coleccionables en los recursos');
            this.collectables = this.getDefaultCollectables();
        }
    }

    formatRewardName(rewardName) {
        return rewardName
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/\s+/g, ' ')
            .trim();
    }

    getDefaultCollectables() {
        return [
            { 
                id: "moneybag", 
                name: "Big Moneybag", 
                image: "Assets/Rewards/moneybag.webp" 
            },
            { 
                id: "coin_big", 
                name: "Coin Big", 
                image: "Assets/Rewards/coin_big.webp" 
            },
            { 
                id: "diamond_big", 
                name: "Diamond Big", 
                image: "Assets/Rewards/diamond_big.webp" 
            },
            { 
                id: "key_big", 
                name: "Key Big", 
                image: "Assets/Rewards/key_big.webp" 
            },
            { 
                id: "silver_key_big", 
                name: "Silver Key Big", 
                image: "Assets/Rewards/silver_key_big.webp" 
            },
            { 
                id: "gold_key_big", 
                name: "Gold Key Big", 
                image: "Assets/Rewards/gold_key_big.webp" 
            }
        ];
    }

    setupEventListeners() {
        console.log('Configurando event listeners de recompensas...');
        
        // Botones para añadir recompensas
        document.querySelectorAll('.add-reward-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.currentRewardType = e.currentTarget.dataset.rewardType;
                console.log(`Abriendo modal para ${this.currentRewardType} reward`);
                this.resetSelection();
                this.showRewardModal();
            });
        });

        // Event listeners para el modal personalizado - CORREGIDOS
        const modalOverlay = document.getElementById('rewardModalOverlay');
        const modalContent = document.querySelector('.reward-container-modal');
        const modalClose = document.getElementById('rewardModalClose');
        const modalCancel = document.getElementById('rewardModalCancel');
        const saveBtn = document.getElementById('saveRewardBtn');
        
        // Cerrar modal con Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                e.preventDefault();
                this.hideRewardModal();
            }
        });
        
        // Cerrar con botón X
        if (modalClose) {
            modalClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideRewardModal();
            });
        }
        
        // Cerrar con botón Cancelar
        if (modalCancel) {
            modalCancel.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideRewardModal();
            });
        }
        
        // Guardar con botón Guardar
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Guardando recompensa...');
                this.saveReward();
            });
        }
        
        // Cerrar al hacer click fuera del modal (solo en el overlay)
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay && this.isModalOpen) {
                    this.hideRewardModal();
                }
            });
        }
        
        // Prevenir que clicks dentro del modal cierren el overlay
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Cambiar tipo de recompensa en el modal
        document.querySelectorAll('input[name="rewardType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const type = e.target.value;
                console.log(`Cambiando a tipo de recompensa: ${type}`);
                this.switchRewardType(type);
            });
        });

        // Búsqueda de plantas
        const plantSearch = document.getElementById('plantSearch');
        if (plantSearch) {
            plantSearch.addEventListener('input', (e) => {
                this.filterPlants(e.target.value);
            });
        }

        // Búsqueda general en modal
        const rewardSearch = document.getElementById('rewardSearch');
        if (rewardSearch) {
            rewardSearch.addEventListener('input', (e) => {
                this.filterAllRewards(e.target.value);
            });
        }

        // Selección de plantas
        const plantsGrid = document.getElementById('plantsGrid');
        if (plantsGrid) {
            plantsGrid.addEventListener('click', (e) => {
                const plantOption = e.target.closest('.plant-option');
                if (plantOption) {
                    console.log(`Planta seleccionada: ${plantOption.dataset.plant}`);
                    this.selectPlant(plantOption.dataset.plant);
                }
            });
        }

        // Selección de coleccionables
        const collectablesGrid = document.getElementById('collectablesGridContent');
        if (collectablesGrid) {
            collectablesGrid.addEventListener('click', (e) => {
                const collectableOption = e.target.closest('.collectable-option');
                if (collectableOption) {
                    console.log(`Coleccionable seleccionado: ${collectableOption.dataset.collectable}`);
                    this.selectCollectable(collectableOption.dataset.collectable);
                }
            });
        }

        // Eliminar recompensas
        document.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-reward-btn');
            if (removeBtn) {
                e.preventDefault();
                e.stopPropagation();
                const containerId = removeBtn.dataset.container;
                console.log(`Eliminando recompensa de ${containerId}`);
                this.removeReward(containerId);
            }
        });
        
        console.log('✓ Event listeners configurados');
    }

    showRewardModal() {
        if (this.isModalOpen) return;
        
        console.log('Mostrando modal de recompensas...');
        
        // Marcar como abierto
        this.isModalOpen = true;
        
        // Bloquear scroll del body
        document.body.classList.add('reward-modal-open');
        
        // Mostrar el overlay del modal
        const overlay = document.getElementById('rewardModalOverlay');
        overlay.style.display = 'flex';
        
        // Forzar reflow para animación
        void overlay.offsetWidth;
        
        // Añadir clase para animación
        overlay.classList.add('show');
        
        // Mostrar panel de plantas por defecto Y ACTUALIZAR RADIO BUTTON
        this.switchRewardType('unlock_plant');
        
        // **CORRECCIÓN: Marcar el radio button correspondiente**
        const plantRadio = document.querySelector('input[name="rewardType"][value="unlock_plant"]');
        if (plantRadio) {
            plantRadio.checked = true;
            console.log('✓ Radio button de plantas seleccionado');
        }
        
        // Limpiar búsquedas
        const plantSearch = document.getElementById('plantSearch');
        const rewardSearch = document.getElementById('rewardSearch');
        
        if (plantSearch) {
            plantSearch.value = '';
            this.filterPlants('');
        }
        
        if (rewardSearch) {
            rewardSearch.value = '';
        }
        
        // Cargar grids
        this.loadPlantsGrid();
        this.loadCollectablesGrid();
        
        console.log('✓ Modal mostrado');
    }

    hideRewardModal() {
        if (!this.isModalOpen) return;
        
        console.log('Ocultando modal de recompensas...');
        
        // Marcar como cerrado
        this.isModalOpen = false;
        
        // Restaurar scroll del body
        document.body.classList.remove('reward-modal-open');
        
        const overlay = document.getElementById('rewardModalOverlay');
        
        // Quitar clase show
        overlay.classList.remove('show');
        
        // Ocultar con retraso para animación (opcional)
        setTimeout(() => {
            overlay.style.display = 'none';
            console.log('✓ Modal completamente oculto');
        }, 150);
        
        this.resetSelection();
    }

    switchRewardType(type) {
        console.log(`Cambiando a panel de: ${type}`);
        
        const plantPanel = document.getElementById('plantRewardPanel');
        const collectablePanel = document.getElementById('collectableRewardPanel');
        
        if (!plantPanel || !collectablePanel) {
            console.error('❌ Paneles no encontrados');
            return;
        }
        
        if (type === 'unlock_plant') {
            plantPanel.classList.remove('d-none');
            collectablePanel.classList.add('d-none');
            console.log('✓ Mostrando panel de plantas');
        } else {
            plantPanel.classList.add('d-none');
            collectablePanel.classList.remove('d-none');
            console.log('✓ Mostrando panel de coleccionables');
        }
        
        // **CORRECCIÓN: Actualizar radio button correspondiente**
        const radio = document.querySelector(`input[name="rewardType"][value="${type}"]`);
        if (radio) {
            radio.checked = true;
            console.log(`✓ Radio button "${type}" marcado`);
        }
        
        this.resetSelection();
    }

    loadPlantsGrid() {
        const grid = document.getElementById('plantsGrid');
        if (!grid) {
            console.error('❌ Grid de plantas no encontrado');
            return;
        }
        
        grid.innerHTML = '';
        
        if (this.plants.length === 0) {
            grid.innerHTML = '<div class="text-center text-muted py-4">No hay plantas disponibles</div>';
            return;
        }
        
        console.log(`Cargando ${this.plants.length} plantas en el grid...`);
        
        this.plants.forEach(plant => {
            const plantDiv = document.createElement('div');
            plantDiv.className = 'plant-option';
            plantDiv.dataset.plant = plant.name;
            plantDiv.title = plant.displayName;
            
            plantDiv.innerHTML = `
                <div class="plant-option-img">
                    <img src="${plant.image}" alt="${plant.displayName}" 
                         loading="lazy"
                         onerror="this.onerror=null; 
                                  this.src='Assets/Plants/peashooter.webp';
                                  this.style.opacity='0.7';
                                  this.style.filter='grayscale(50%)';">
                </div>
                <div class="plant-option-name">${plant.displayName}</div>
            `;
            
            grid.appendChild(plantDiv);
        });
        
        console.log('✓ Grid de plantas cargado');
    }

    loadCollectablesGrid() {
        const grid = document.getElementById('collectablesGridContent');
        if (!grid) {
            console.error('❌ Grid de coleccionables no encontrado');
            return;
        }
        
        grid.innerHTML = '';
        
        if (this.collectables.length === 0) {
            grid.innerHTML = '<div class="text-center text-muted py-4">No hay coleccionables disponibles</div>';
            return;
        }
        
        console.log(`Cargando ${this.collectables.length} coleccionables en el grid...`);
        
        this.collectables.forEach(collectable => {
            const collectableDiv = document.createElement('div');
            collectableDiv.className = 'collectable-option';
            collectableDiv.dataset.collectable = collectable.id;
            collectableDiv.title = collectable.name;
            
            collectableDiv.innerHTML = `
                <div class="collectable-option-img">
                    <img src="${collectable.image}" alt="${collectable.name}" 
                         loading="lazy"
                         onerror="this.onerror=null; 
                                  this.src='Assets/Rewards/moneybag.webp';
                                  this.style.opacity='0.7';
                                  this.style.filter='grayscale(50%)';">
                </div>
                <div class="collectable-option-name">${collectable.name}</div>
            `;
            
            grid.appendChild(collectableDiv);
        });
        
        console.log('✓ Grid de coleccionables cargado con estructura de plantas');
    }

    selectCollectable(collectableId) {
        console.log(`Intentando seleccionar coleccionable: ${collectableId}`);
        
        // Remover selección anterior - ahora ambos tienen la misma estructura
        document.querySelectorAll('.plant-option, .collectable-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Marcar como seleccionado
        const selectedOption = document.querySelector(`.collectable-option[data-collectable="${collectableId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            this.selectedCollectable = collectableId;
            this.selectedPlant = null;
            console.log(`✓ Coleccionable "${collectableId}" seleccionado`);
        } else {
            console.warn(`❌ No se encontró el coleccionable: ${collectableId}`);
        }
    }

    filterPlants(searchTerm) {
        const plantOptions = document.querySelectorAll('.plant-option');
        const searchLower = searchTerm.toLowerCase().trim();
        
        let visibleCount = 0;
        
        plantOptions.forEach(option => {
            const plantName = option.querySelector('.plant-option-name').textContent.toLowerCase();
            
            if (searchLower === '' || plantName.includes(searchLower)) {
                option.style.display = 'block';
                visibleCount++;
            } else {
                option.style.display = 'none';
            }
        });
        
        console.log(`Filtro: ${visibleCount} plantas visibles de ${plantOptions.length}`);
    }

    filterAllRewards(searchTerm) {
        console.log(`Buscando: ${searchTerm}`);
        const searchLower = searchTerm.toLowerCase().trim();
        
        // Si está vacío, mostrar todo
        if (searchLower === '') {
            document.querySelectorAll('.plant-option, .collectable-option').forEach(el => {
                el.style.display = 'block';
            });
            return;
        }
        
        // Filtrar plantas
        document.querySelectorAll('.plant-option').forEach(option => {
            const plantName = option.querySelector('.plant-option-name').textContent.toLowerCase();
            option.style.display = plantName.includes(searchLower) ? 'block' : 'none';
        });
        
        // **CORRECCIÓN: Filtrar coleccionables usando la clase correcta**
        document.querySelectorAll('.collectable-option').forEach(option => {
            const collectableName = option.querySelector('.collectable-option-name').textContent.toLowerCase();
            option.style.display = collectableName.includes(searchLower) ? 'block' : 'none';
        });
    }

    selectPlant(plantName) {
        console.log(`Intentando seleccionar planta: ${plantName}`);
        
        // Remover selección anterior
        document.querySelectorAll('.plant-option, .collectable-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Marcar como seleccionada
        const selectedOption = document.querySelector(`.plant-option[data-plant="${plantName}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            this.selectedPlant = plantName;
            this.selectedCollectable = null;
            console.log(`✓ Planta "${plantName}" seleccionada`);
        } else {
            console.warn(`❌ No se encontró la planta: ${plantName}`);
        }
    }

    selectCollectable(collectableId) {
        console.log(`Intentando seleccionar coleccionable: ${collectableId}`);
        
        // Remover selección anterior
        document.querySelectorAll('.plant-option, .collectable-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Marcar como seleccionado
        const selectedOption = document.querySelector(`.collectable-option[data-collectable="${collectableId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            this.selectedCollectable = collectableId;
            this.selectedPlant = null;
            console.log(`✓ Coleccionable "${collectableId}" seleccionado`);
        } else {
            console.warn(`❌ No se encontró el coleccionable: ${collectableId}`);
        }
    }

    resetSelection() {
        console.log('Reseteando selección...');
        this.selectedPlant = null;
        this.selectedCollectable = null;
        
        document.querySelectorAll('.plant-option, .collectable-option').forEach(option => {
            option.classList.remove('selected');
        });
    }

    saveReward() {
        const rewardType = document.querySelector('input[name="rewardType"]:checked').value;
        console.log(`Guardando recompensa tipo: ${rewardType}`);
        
        if (rewardType === 'unlock_plant' && !this.selectedPlant) {
            this.levelGenerator.showMessage('Error', 'Por favor selecciona una planta', 'error');
            return;
        }
        
        if (rewardType === 'collectable' && !this.selectedCollectable) {
            this.levelGenerator.showMessage('Error', 'Por favor selecciona un coleccionable', 'error');
            return;
        }
        
        const rewardData = {
            type: rewardType,
            param: rewardType === 'unlock_plant' ? this.selectedPlant : this.selectedCollectable
        };
        
        console.log(`Datos de recompensa:`, rewardData);
        
        // Guardar según el tipo de recompensa
        if (this.currentRewardType === 'first') {
            this.rewardsData.firstReward = rewardData;
            this.displayReward('firstRewardContainer', rewardData);
            console.log('✓ Recompensa de primera victoria guardada');
        } else {
            this.rewardsData.replayReward = rewardData;
            this.displayReward('replayRewardContainer', rewardData);
            console.log('✓ Recompensa de rejugabilidad guardada');
        }
        
        // Cerrar modal
        this.hideRewardModal();
        
        // Marcar cambios
        if (this.levelGenerator && typeof this.levelGenerator.markTabAsChanged === 'function') {
            this.levelGenerator.markTabAsChanged('basic');
        }
        
        this.levelGenerator.showMessage('Recompensa Guardada', 'La recompensa se ha configurado correctamente', 'success');
    }

    displayReward(containerId, rewardData) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Contenedor ${containerId} no encontrado`);
            return;
        }
        
        console.log(`Mostrando recompensa en ${containerId}:`, rewardData);
        
        let html = '';
        
        if (rewardData.type === 'unlock_plant') {
            const plant = this.plants.find(p => p.name === rewardData.param);
            let plantImage, plantDisplayName;
            
            if (plant) {
                plantImage = plant.image;
                plantDisplayName = plant.displayName;
            } else {
                plantDisplayName = this.formatPlantName(rewardData.param);
                if (PATHS && PATHS.IMAGES && PATHS.IMAGES.PLANTS) {
                    plantImage = `${PATHS.IMAGES.PLANTS}${rewardData.param}.webp`;
                } else {
                    plantImage = `Assets/Plants/${rewardData.param}.webp`;
                }
            }
            
            html = `
                <div class="reward-display">
                    <div class="d-flex align-items-center">
                        <div class="reward-image me-3">
                            <img src="${plantImage}" alt="${plantDisplayName}" 
                                 class="img-thumbnail" style="width: 60px; height: 60px; object-fit: cover;"
                                 onerror="this.onerror=null; 
                                          this.src='Assets/Plants/peashooter.webp';
                                          this.style.opacity='0.7';">
                        </div>
                        <div class="reward-details flex-grow-1">
                            <h6 class="mb-1">${plantDisplayName}</h6>
                            <div class="reward-type-badge">
                                <span class="badge bg-success">
                                    <i class="bi bi-flower1 me-1"></i>Planta
                                </span>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger remove-reward-btn" 
                                data-container="${containerId}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        } else {
            const collectable = this.collectables.find(c => c.id === rewardData.param);
            let collectableImage, collectableName;
            
            if (collectable) {
                collectableImage = collectable.image;
                collectableName = collectable.name;
            } else {
                collectableName = this.formatRewardName(rewardData.param);
                if (PATHS && PATHS.IMAGES && PATHS.IMAGES.REWARDS) {
                    collectableImage = `${PATHS.IMAGES.REWARDS}${rewardData.param}.webp`;
                } else {
                    collectableImage = `Assets/Rewards/${rewardData.param}.webp`;
                }
            }
            
            html = `
                <div class="reward-display">
                    <div class="d-flex align-items-center">
                        <div class="reward-image me-3">
                            <img src="${collectableImage}" alt="${collectableName}" 
                                 class="img-thumbnail" style="width: 60px; height: 60px; object-fit: cover;"
                                 onerror="this.onerror=null; 
                                          this.src='Assets/Rewards/moneybag.webp';
                                          this.style.opacity='0.7';">
                        </div>
                        <div class="reward-details flex-grow-1">
                            <h6 class="mb-1">${collectableName}</h6>
                            <div class="reward-type-badge">
                                <span class="badge bg-warning">
                                    <i class="bi bi-coin me-1"></i>Coleccionable
                                </span>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-danger remove-reward-btn" 
                                data-container="${containerId}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        console.log('✓ Recompensa mostrada en interfaz');
    }

    removeReward(containerId) {
        console.log(`Eliminando recompensa de ${containerId}`);
        
        if (containerId === 'firstRewardContainer') {
            this.rewardsData.firstReward = null;
            document.getElementById(containerId).innerHTML = `
                <div class="text-center text-muted py-2">
                    <i class="bi bi-gift display-6 mb-2"></i>
                    <p class="mb-0">No hay recompensa configurada</p>
                </div>
            `;
        } else if (containerId === 'replayRewardContainer') {
            this.rewardsData.replayReward = null;
            document.getElementById(containerId).innerHTML = `
                <div class="text-center text-muted py-2">
                    <i class="bi bi-arrow-repeat display-6 mb-2"></i>
                    <p class="mb-0">No hay recompensa configurada</p>
                </div>
            `;
        }
        
        if (this.levelGenerator && typeof this.levelGenerator.markTabAsChanged === 'function') {
            this.levelGenerator.markTabAsChanged('basic');
        }
        
        this.levelGenerator.showMessage('Recompensa Eliminada', 'La recompensa ha sido eliminada', 'info');
    }

    getRewardsForJson() {
        return {
            firstReward: this.rewardsData.firstReward,
            replayReward: this.rewardsData.replayReward
        };
    }
    
    debugPaths() {
        console.log('=== DEBUG PATHS ===');
        console.log('PATHS:', PATHS);
        console.log('PLANTS count:', PLANTS ? PLANTS.length : 0);
        console.log('REWARDS count:', REWARDS ? REWARDS.length : 0);
        console.log('Loaded plants:', this.plants.length);
        console.log('Loaded collectables:', this.collectables.length);
    }
    
    // Método para debug del modal
    debugModalState() {
        const overlay = document.getElementById('rewardModalOverlay');
        console.log('=== DEBUG MODAL STATE ===');
        console.log('isModalOpen:', this.isModalOpen);
        console.log('Overlay display:', overlay.style.display);
        console.log('Overlay classList:', overlay.classList);
        console.log('Body classes:', document.body.classList);
    }
}

export { RewardManager };