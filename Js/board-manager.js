
import { 
    PLANTS, 
    GRAVESTONES, 
    GRAVESTONE_DISPLAY_NAMES,
    PATHS,
    FALLBACK_IMAGES 
} from '../constants/resources.js';


class BoardManager {
     constructor(levelGenerator) {
        this.levelGenerator = levelGenerator;
        this.board = this.initializeBoard();
        this.selectedCell = null;
        this.selectedElement = null;
        this.boardModules = {
            plants: [],
            zombies: [],
            gravestones: []
        };
        this.initialized = false;
        
        // Elementos disponibles
        this.availableElements = {
            plants: [],
            zombies: [],
            gravestones: []
        };
        
        // Rutas base para imágenes (USAR LAS CONSTANTES IMPORTADAS)
        
        this.imagePaths = PATHS.IMAGES; // <- CAMBIAR ESTA LÍNEA
        
         this.fallbackImages = {
        plants: FALLBACK_IMAGES.plants, // Usa el valor de las constantes
        zombies: `${this.imagePaths.ZOMBIES}error.png`, // Solo zombies usa error.png
        gravestones: FALLBACK_IMAGES.gravestones // Usa el valor de las constantes
    };
        
        // Cargar datos de elementos
        this.loadElementData();
        
        // Referencia al diálogo
        this.lawnDialog = null;
        this.lawnDialogBackdrop = null;
    }

    async loadElementData() {
        try {
            // **CARGAR PLANTAS DESDE CONSTANTES**
            if (PLANTS && Array.isArray(PLANTS)) {
                this.availableElements.plants = PLANTS.map(plant => ({
                    alias_type: plant,
                    name: plant,
                    type: 'plant',
                    imageUrl: this.getPlantImageUrl(plant)
                }));
                console.log(`✅ Plantas cargadas desde constants: ${PLANTS.length}`);
            }
            
            // **CARGAR LÁPIDAS DESDE CONSTANTES**
            if (GRAVESTONES && Array.isArray(GRAVESTONES)) {
                this.availableElements.gravestones = GRAVESTONES.map(grave => ({
                    alias_type: grave,
                    name: this.formatGravestoneName(grave),
                    type: 'gravestone',
                    imageUrl: this.getGravestoneImageUrl(grave)
                }));
                console.log(`✅ Lápidas cargadas desde constants: ${GRAVESTONES.length}`);
            }
            
            // **CARGAR ZOMBIES DESDE EL LEVELGENERATOR**
            if (window.levelGenerator && window.levelGenerator.zombieData) {
                this.availableElements.zombies = window.levelGenerator.zombieData.map(zombie => ({
                    alias_type: zombie.alias_type,
                    name: zombie.alias_type,
                    type: 'zombie',
                    imageUrl: this.getZombieImageUrl(zombie.alias_type)
                }));
                console.log(`✅ Zombies cargados: ${this.availableElements.zombies.length}`);
            }
            
            console.log('✅ Elementos cargados:', {
                plantas: this.availableElements.plants.length,
                zombies: this.availableElements.zombies.length,
                lápidas: this.availableElements.gravestones.length
            });
            
        } catch (error) {
            console.error('❌ Error cargando datos de elementos:', error);
            
            // Fallback: usar datos por defecto si hay error
            this.loadDefaultElements();
        }
    }


    formatGravestoneName(graveId) {
        // USAR EL MAPEO DE NOMBRES AMIGABLES IMPORTADO
        if (GRAVESTONE_DISPLAY_NAMES[graveId]) {
            return GRAVESTONE_DISPLAY_NAMES[graveId];
        }
        
        // Si no existe un nombre mapeado, formatear automáticamente
        return graveId
            .replace('gravestone_', 'Lápida ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

     getPlantImageUrl(plantName) {
        if (!plantName) return this.fallbackImages.plants;
        
        const normalizedName = plantName.toLowerCase().replace(/\s+/g, '');
        return `${this.imagePaths.PLANTS}${normalizedName}.png`; // <- USAR this.imagePaths.PLANTS
    }

    getZombieImageUrl(zombieName) {
    if (!zombieName) return `${this.imagePaths.ZOMBIES}error.png`;
    
    const normalizedName = zombieName.toLowerCase().replace(/\s+/g, '');
    return `${this.imagePaths.ZOMBIES}${normalizedName}.png`;
}


    getGravestoneImageUrl(gravestoneName) {
        if (!gravestoneName) return this.fallbackImages.gravestones;
        
        const normalizedName = gravestoneName.toLowerCase().replace(/\s+/g, '');
        return `${this.imagePaths.GRAVESTONES}${normalizedName}.png`; // <- USAR this.imagePaths.GRAVESTONES
    }

    initializeBoard() {
        const board = [];
        for (let row = 1; row <= 5; row++) {
            board[row] = [];
            for (let col = 1; col <= 9; col++) {
                board[row][col] = {
                    plants: [],
                    zombies: [],
                    gravestones: []
                };
            }
        }
        return board;
    }

    renderBoard() {
    const boardElement = document.getElementById('game-board');
    if (!boardElement) return;
    
    boardElement.innerHTML = '';
    
    for (let row = 1; row <= 5; row++) {
        const tr = document.createElement('tr');
        
        for (let col = 1; col <= 9; col++) {
            const td = document.createElement('td');
            td.dataset.row = row;
            td.dataset.col = col;
            td.className = 'board-cell';
            
            const cellContent = document.createElement('div');
            cellContent.className = 'cell-content';
            
            const elements = this.board[row][col];
            
            // **CAPA DE DEFEAT (BALDOSA DEBAJO)**
            if (elements.plants.length > 0 && elements.plants[0].defeat) {
                const defeatLayer = document.createElement('div');
                defeatLayer.className = 'condition-layer defeat-layer';
                defeatLayer.innerHTML = `
                    <img src="Assets/Condiciones/defeat-plant.webp" alt="Planta en peligro" 
                         class="condition-image defeat-tile"
                         onerror="this.style.display='none'">
                `;
                cellContent.appendChild(defeatLayer);
            }
            
            // **Mostrar plantas**
            if (elements.plants.length > 0) {
                const plant = elements.plants[0];
                const plantDiv = document.createElement('div');
                plantDiv.className = 'cell-element plant-element';
                plantDiv.title = this.getPlantTitle(plant);
                
                // Obtener imagen de la planta
                const imageUrl = plant.imageUrl || this.getPlantImageUrl(plant.name);
                
                plantDiv.innerHTML = `
                    <img src="${imageUrl}" alt="${plant.name}" class="cell-thumbnail"
                         onerror="this.src='${this.fallbackImages.plants}'">
                    ${this.getPlantModifiersHtml(plant)}
                `;
                cellContent.appendChild(plantDiv);
                
                // **CAPA DE HIELO POR DELANTE (PLANTAS)**
                if (plant.frozen) {
                    const iceLayer = document.createElement('div');
                    iceLayer.className = 'condition-layer ice-layer ice-plant-layer';
                    iceLayer.innerHTML = `
                        <img src="Assets/Condiciones/ice-plant.webp" alt="Planta congelada" 
                             class="condition-image ice-overlay"
                             onerror="this.style.display='none'">
                    `;
                    cellContent.appendChild(iceLayer);
                }
            }
            
            // **Mostrar zombies**
            if (elements.zombies.length > 0) {
                const zombie = elements.zombies[0];
                const zombieDiv = document.createElement('div');
                zombieDiv.className = 'cell-element zombie-element';
                zombieDiv.title = this.getZombieTitle(zombie);
                
                // Obtener imagen del zombie
                const imageUrl = zombie.imageUrl || this.getZombieImageUrl(zombie.name);
                
                zombieDiv.innerHTML = `
                    <img src="${imageUrl}" alt="${zombie.name}" class="cell-thumbnail"
                         onerror="this.src='${this.fallbackImages.zombies}'">
                    ${this.getZombieModifiersHtml(zombie)}
                `;
                cellContent.appendChild(zombieDiv);
                
                // **CAPA DE HIELO POR DELANTE (ZOMBIES)**
                if (zombie.frozen) {
                    const iceLayer = document.createElement('div');
                    iceLayer.className = 'condition-layer ice-layer ice-zombie-layer';
                    iceLayer.innerHTML = `
                        <img src="Assets/Condiciones/ice-zombie.webp" alt="Zombie congelado" 
                             class="condition-image ice-overlay"
                             onerror="this.style.display='none'">
                    `;
                    cellContent.appendChild(iceLayer);
                }
            }
            
            // **Mostrar lápidas**
            if (elements.gravestones.length > 0) {
                const grave = elements.gravestones[0];
                const graveDiv = document.createElement('div');
                graveDiv.className = 'cell-element gravestone-element';
                graveDiv.title = `Lápida: ${grave.name}`;
                
                // Obtener imagen
                const imageUrl = grave.imageUrl || this.getGravestoneImageUrl(grave.name);
                
                graveDiv.innerHTML = `
                    <img src="${imageUrl}" alt="${grave.name}" class="cell-thumbnail"
                         onerror="this.src='${this.fallbackImages.gravestones}'">
                `;
                cellContent.appendChild(graveDiv);
            }
            
            td.appendChild(cellContent);
            td.addEventListener('click', (e) => this.handleCellClick(row, col, e));
            tr.appendChild(td);
        }
        
        boardElement.appendChild(tr);
    }
}

    getPlantTitle(plant) {
        let title = `Planta: ${plant.name}`;
        if (plant.plantLevel > 0) title += ` (Nivel ${plant.plantLevel})`;
        if (plant.frozen) title += ' ❄️ Congelada';
        if (plant.defeat) title += ' 🛡️ En Peligro';
        return title;
    }

    getZombieTitle(zombie) {
        let title = `Zombie: ${zombie.name}`;
        if (zombie.frozen) title += ' ❄️ Congelado';
        return title;
    }

    getPlantModifiersHtml(plant) {
        let html = '';
       // if (plant.frozen) html += '<span class="cell-modifier">❄️</span>';
        //if (plant.defeat) html += '<span class="cell-modifier">🛡️</span>';
        if (plant.plantLevel > 0) html += `<span class="cell-modifier level">L${plant.plantLevel}</span>`;
        return html;
    }

    getZombieModifiersHtml(zombie) {
        let html = '';
        if (zombie.frozen) html += '<span class="cell-modifier">❄️</span>';
        return html;
    }

    handleCellClick(row, col, event) {
    event.stopPropagation();
    this.selectedCell = { row, col };
    this.updateCellInfo();
    this.openEditDialog(row, col);
    this.renderBoard();
    
    // Resaltar celdas con plantas en peligro
    const cells = document.querySelectorAll('.board-cell');
    cells.forEach(cell => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        const elements = this.board[r][c];
        const hasDefeat = elements.plants.length > 0 && elements.plants[0].defeat;
        
        if (hasDefeat) {
            cell.classList.add('has-defeat');
        } else {
            cell.classList.remove('has-defeat');
        }
    });
}

    openEditDialog(row, col) {
        // Si ya existe un diálogo, eliminarlo
        if (this.lawnDialog) {
            this.closeDialog();
        }
        
        // Crear el diálogo dinámicamente
        this.createDialog(row, col);
    }

    createDialog(row, col) {
        // Crear backdrop
        this.lawnDialogBackdrop = document.createElement('div');
        this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';
        
        // Crear diálogo
        this.lawnDialog = document.createElement('div');
        this.lawnDialog.className = 'lawn-dialog';
        this.lawnDialog.id = `editCellDialog-${row}-${col}`;
        
this.lawnDialog.innerHTML = `
<div class="lawn-dialog">
    <header class="dialog-header">
        <div class="form-row">
            <div class="form-group">
                <label>Tipo de Elemento</label>
                <select class="element-type-select">
                    <option value="plants">Plantas</option>
                    <option value="zombies">Zombies</option>
                    <option value="gravestones">Lápidas</option>
                </select>
            </div>

            <div class="form-group">
                <label>Buscar</label>
                <input type="text" class="element-search" placeholder="Buscar elemento…">
            </div>
            
        </div>
         <button class="close-btn" aria-label="Cerrar">✕</button>
    </header>

    <section class="dialog-body">
       

        <div class="elements-section">
            <h6>Elementos disponibles</h6>
            <div class="elements-grid"></div>
        </div>
    </section>

    <footer class="dialog-footer">
        <div class="modifier-controls">
            <label class="modifier-label">
                <input type="checkbox" class="check-frozen">
                Congelado
            </label>

            <label class="modifier-label">
                <input type="checkbox" class="check-defeat">
                En peligro
            </label>
        </div>

        <div class="button-group">
            <button class="btn-remove">🗑 Limpiar</button>
            <button class="btn-add">➕ Añadir</button>
        </div>
    </footer>
</div>
`;

        
        // Agregar al DOM
        this.lawnDialogBackdrop.appendChild(this.lawnDialog);
        document.body.appendChild(this.lawnDialogBackdrop);
        
        // Configurar event listeners
        this.setupDialogListeners(row, col);
        
        // Cargar elementos iniciales
        this.loadElementsForTypeDialog('plants', row, col);
    }

    setupDialogListeners(row, col) {
        if (!this.lawnDialog) return;
        
        // Botón cerrar
        const closeBtn = this.lawnDialog.querySelector('.close-btn');
        const cancelBtn = this.lawnDialog.querySelector('.btn-cancel');
        
        const closeDialog = () => this.closeDialog();
        
        if (closeBtn) closeBtn.addEventListener('click', closeDialog);
        if (cancelBtn) cancelBtn.addEventListener('click', closeDialog);
        
        // Cerrar al hacer clic en el backdrop
        this.lawnDialogBackdrop.addEventListener('click', (e) => {
            if (e.target === this.lawnDialogBackdrop) {
                closeDialog();
            }
        });
        
        // Selector de tipo
        const elementTypeSelect = this.lawnDialog.querySelector('.element-type-select');
        if (elementTypeSelect) {
            elementTypeSelect.addEventListener('change', () => {
                const type = elementTypeSelect.value;
                this.loadElementsForTypeDialog(type, row, col);
                this.toggleModifiersDialog(type);
            });
        }
        
        // Búsqueda
        const elementSearch = this.lawnDialog.querySelector('.element-search');
        if (elementSearch) {
            elementSearch.addEventListener('input', (e) => {
                this.filterElementsDialog(e.target.value, row, col);
            });
        }
        
        // Botón añadir
        const btnAddElement = this.lawnDialog.querySelector('.btn-add');
        if (btnAddElement) {
            btnAddElement.addEventListener('click', () => {
                this.addElementToCell(row, col);
                this.closeDialog();
            });
        }
        
        // Botón eliminar
        const btnRemoveElement = this.lawnDialog.querySelector('.btn-remove');
        if (btnRemoveElement) {
            btnRemoveElement.addEventListener('click', () => {
                this.clearCell(row, col);
                this.closeDialog();
            });
        }
    }

    closeDialog() {
        if (this.lawnDialogBackdrop && this.lawnDialogBackdrop.parentElement) {
            this.lawnDialogBackdrop.remove();
            this.lawnDialog = null;
            this.lawnDialogBackdrop = null;
        }
    }

    loadElementsForTypeDialog(type, row, col) {
        if (!this.lawnDialog) return;
        
        const elementsList = this.lawnDialog.querySelector('.elements-grid');
        if (!elementsList) return;
        
        elementsList.innerHTML = '';
        
        const elements = this.availableElements[type] || [];
        
        if (elements.length === 0) {
            elementsList.innerHTML = '<div class="no-elements">No hay elementos disponibles</div>';
            return;
        }
        
        elements.forEach(element => {
            const card = document.createElement('div');
            card.className = 'element-card';
            card.dataset.element = element.alias_type;
            card.dataset.type = type;
            
            // Obtener imagen o usar fallback
            const imageUrl = element.imageUrl || this.fallbackImages[type];
            
            card.innerHTML = `
                <div class="element-image-container">
                    <img src="${imageUrl}" alt="${element.name}" 
                         class="element-image"
                         onerror="this.src='${this.fallbackImages[type]}'">
                </div>
                <div class="element-name">${element.name}</div>
            `;
            
            card.addEventListener('click', () => {
                // Deseleccionar todos los cards
                this.lawnDialog.querySelectorAll('.element-card').forEach(c => {
                    c.classList.remove('selected');
                });
                // Seleccionar este card
                card.classList.add('selected');
                this.selectedElement = {
                    alias_type: element.alias_type,
                    name: element.name,
                    type: type,
                    imageUrl: imageUrl
                };
                
                // Actualizar estado del checkbox "En Peligro" basado en el tipo seleccionado
                this.updateDefeatCheckboxState(type);
            });
            
            elementsList.appendChild(card);
        });
        
        // Seleccionar el primer elemento por defecto
        const firstCard = elementsList.querySelector('.element-card');
        if (firstCard) {
            firstCard.click();
        }
    }

    filterElementsDialog(searchTerm, row, col) {
        if (!this.lawnDialog) return;
        
        const elementsList = this.lawnDialog.querySelector('.elements-grid');
        if (!elementsList) return;
        
        const cards = elementsList.querySelectorAll('.element-card');
        const searchLower = searchTerm.toLowerCase();
        
        cards.forEach(card => {
            const elementName = card.querySelector('.element-name').textContent.toLowerCase();
            if (elementName.includes(searchLower)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    toggleModifiersDialog(type) {
        if (!this.lawnDialog) return;
        
        // No necesitamos mostrar/ocultar secciones específicas
        // Solo actualizamos el estado del checkbox "En Peligro"
        this.updateDefeatCheckboxState(type);
    }
    
    updateDefeatCheckboxState(type) {
        if (!this.lawnDialog) return;
        
        const defeatCheckbox = this.lawnDialog.querySelector('.check-defeat');
        const defeatLabel = this.lawnDialog.querySelector('.danger-checkbox .checkbox-label');
        
        if (defeatCheckbox && defeatLabel) {
            if (type === 'plants') {
                // Para plantas: habilitar y mostrar "En Peligro"
                defeatCheckbox.disabled = false;
                defeatLabel.innerHTML = '<span class="emoji">🛡️</span> En Peligro';
            } else {
                // Para zombies y lápidas: deshabilitar y mostrar "(Solo Plantas)"
                defeatCheckbox.checked = false;
                defeatCheckbox.disabled = true;
                defeatLabel.innerHTML = '<span class="emoji">🛡️</span> Solo Plantas';
            }
        }
    }

    addElementToCell(row, col) {
        if (!this.selectedElement || !this.lawnDialog) {
            this.showToast('Error', 'Selecciona un elemento primero', 'error');
            return;
        }
        
        const type = this.selectedElement.type;
        const elementName = this.selectedElement.alias_type;
        
        // Limpiar elementos del mismo tipo en esta celda
        this.board[row][col][type] = [];
        
        // Crear objeto del elemento
        const element = {
            rtid: '',
            name: elementName,
            imageUrl: this.selectedElement.imageUrl
        };
        
        // Configurar RTID y modificadores según el tipo
        const checkFrozen = this.lawnDialog.querySelector('.check-frozen');
        const checkDefeat = this.lawnDialog.querySelector('.check-defeat');
        
        switch(type) {
            case 'plants':
                element.rtid = `${elementName}`;
                const plantLevel = this.lawnDialog.querySelector('.plant-level');
                
                if (plantLevel) element.plantLevel = parseInt(plantLevel.value) || 0;
                if (checkFrozen) element.frozen = checkFrozen.checked;
                if (checkDefeat) element.defeat = checkDefeat.checked;
                break;
                
            case 'zombies':
                element.rtid = `${elementName}`;
                // El checkbox congelado funciona para zombies también
                if (checkFrozen) element.frozen = checkFrozen.checked;
                break;
                
            case 'gravestones':
                element.rtid = `${elementName}`;
                // Las lápidas no tienen modificadores
                break;
        }
        
        // Añadir a la celda
        this.board[row][col][type].push(element);
        
        // Actualizar UI
        this.updateBoardModules();
        this.renderBoard();
        this.updatePreview();
        this.updateCellInfo();
        
        // Mostrar mensaje
        this.showToast('Elemento añadido', 
            `${type === 'plants' ? 'Planta' : type === 'zombies' ? 'Zombie' : 'Lápida'} "${elementName}" colocada en (${row}, ${col})`, 
            'success');
    }

    clearCell(row, col) {
        if (confirm(`¿Estás seguro de limpiar la celda (Fila ${row}, Columna ${col})?`)) {
            this.board[row][col] = {
                plants: [],
                zombies: [],
                gravestones: []
            };
            
            this.updateBoardModules();
            this.renderBoard();
            this.updatePreview();
            this.updateCellInfo();
            
            this.showToast('Celda limpiada', `Celda (${row}, ${col}) ha sido limpiada`, 'warning');
        }
    }

 updateBoardModules() {
    this.boardModules = {
        plants: [],
        zombies: [],
        gravestones: [],
        protectedPlants: []
    };
    
    for (let row = 1; row <= 5; row++) {
        for (let col = 1; col <= 9; col++) {
            const cell = this.board[row][col];
            
            // Plantas
            cell.plants.forEach(plant => {
                const plantModule = {
                    GridY: row - 1,
                    GridX: col - 1,
                    TypeName: plant.rtid
                };
                
                if (plant.plantLevel > 0) {
                    plantModule.Level = plant.plantLevel - 1;
                }
                if (plant.frozen) {
                    plantModule.Condition = "icecubed";
                }
                
                // **CORRECCIÓN AQUÍ:**
                // Si la planta NO está en peligro, agregarla a plantas normales
                if (!plant.defeat) {
                    this.boardModules.plants.push(plantModule);
                }
                // Si la planta SÍ está en peligro, agregarla a plantas protegidas
                else {
                    this.boardModules.protectedPlants.push({
                        GridY: row - 1,
                        GridX: col - 1,
                        PlantType: plant.name,  // Solo nombre, no RTID
                        Level: plant.plantLevel > 0 ? plant.plantLevel - 1 : -1
                    });
                }
            });
            
            // Zombies
            cell.zombies.forEach(zombie => {
                const zombieModule = {
                    GridY: row - 1,
                    GridX: col - 1,
                    TypeName: zombie.rtid
                };
                
                if (zombie.frozen) {
                    zombieModule.Condition = "icecubed";
                }
                
                this.boardModules.zombies.push(zombieModule);
            });
            
            // Lápidas
            cell.gravestones.forEach(gravestone => {
                this.boardModules.gravestones.push({
                    GridY: row - 1,
                    GridX: col - 1,
                    TypeName: gravestone.rtid
                });
            });
        }
    }

}

    updateCellInfo() {
        const cellInfo = document.getElementById('cell-info');
        if (!cellInfo || !this.selectedCell) return;
        
        const { row, col } = this.selectedCell;
        const elements = this.board[row][col];
        
        let elementList = [];
        if (elements.plants.length > 0) {
            const plant = elements.plants[0];
            let plantText = `<span class="plant-tag">${plant.name}</span>`;
            if (plant.plantLevel > 0) plantText += ` <small class="plant-level-tag">L${plant.plantLevel}</small>`;
            if (plant.frozen) plantText += ` <small class="frozen-tag">❄️</small>`;
            if (plant.defeat) plantText += ` <small class="defeat-tag">🛡️</small>`;
            elementList.push(plantText);
        }
        if (elements.zombies.length > 0) {
            const zombie = elements.zombies[0];
            let zombieText = `<span class="zombie-tag">${zombie.name}</span>`;
            if (zombie.frozen) zombieText += ` <small class="frozen-tag">❄️</small>`;
            elementList.push(zombieText);
        }
        if (elements.gravestones.length > 0) {
            elementList.push(`<span class="gravestone-tag">${elements.gravestones[0].name}</span>`);
        }
        
        if (elementList.length === 0) {
            cellInfo.innerHTML = `
                <div class="cell-info-container">
                    <span>📊 Celda: Fila ${row}, Columna ${col} (Vacía)</span>
                    <span class="empty-cell-tag">Haz clic para editar</span>
                </div>
            `;
        } else {
            cellInfo.innerHTML = `
                <div class="cell-info-container">
                    <div>
                        <span>📊 Celda: Fila ${row}, Columna ${col}</span>
                        <div class="cell-tags">${elementList.join(' ')}</div>
                    </div>
                    <button onclick="window.boardManager.openEditDialog(${row}, ${col})" class="edit-cell-btn">
                        ✏️ Editar
                    </button>
                </div>
            `;
        }
    }

    updatePreview() {
        const preview = document.getElementById('board-json-preview');
        if (!preview) return;
        
        const modules = this.getAllModules();
        if (modules.length === 0) {
            preview.textContent = "// No hay elementos colocados en el tablero\n// Haz clic en una celda para añadir elementos";
            return;
        }
        
        preview.textContent = JSON.stringify(modules, null, 2);
        
        // Aplicar syntax highlighting si existe
        if (window.levelGenerator && typeof window.levelGenerator.syntaxHighlight === 'function') {
            window.levelGenerator.highlightJson(preview);
        }
    }

    
getAllModules() {
    const modules = [];
    
    // **Plantas normales** (solo las que NO están en peligro)
    if (this.boardModules.plants.length > 0) {
        modules.push({
            aliases: ["MountingPlants"],
            objclass: "InitialPlantProperties",
            objdata: {
                InitialPlantPlacements: this.boardModules.plants
            }
        });
    }
    
    // **NOTA IMPORTANTE: NO crear ProtectThePlant aquí**
    // Los datos de plantas protegidas están en this.boardModules.protectedPlants
    // El objeto ProtectThePlant se creará SOLO en generateChallengeObjects()
    // para evitar duplicidad
    
    if (this.boardModules.zombies.length > 0) {
        modules.push({
            aliases: ["MountingZombies"],
            objclass: "InitialZombieProperties",
            objdata: {
                InitialZombiePlacements: this.boardModules.zombies
            }
        });
    }
    
    if (this.boardModules.gravestones.length > 0) {
        modules.push({
            aliases: ["MountingGravestones"],
            objclass: "GravestoneProperties",
            objdata: {
                ForceSpawnData: this.boardModules.gravestones
            }
        });
    }
    
    return modules;
}

    showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        
        toast.innerHTML = `
            <strong>
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
                ${title}
            </strong>
            <div>${message}</div>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 3000);
    }

    initialize() {
        if (this.initialized) return;
        
        this.renderBoard();
        this.setupEventListeners();
        this.updatePreview();
        this.initialized = true;
    }

    setupEventListeners() {
        // Botón limpiar todo
        const btnClearBoard = document.getElementById('btn-clear-board');
        if (btnClearBoard) {
            btnClearBoard.addEventListener('click', () => {
                if (confirm('¿Estás seguro de limpiar todo el tablero?')) {
                    this.board = this.initializeBoard();
                    this.boardModules = {
                        plants: [],
                        zombies: [],
                        gravestones: []
                    };
                    this.renderBoard();
                    this.updatePreview();
                    this.showToast('Tablero limpiado', 'Todos los elementos han sido removidos', 'warning');
                }
            });
        }
        
        // Botón editar celda en el panel de info
        const btnEditCell = document.getElementById('btn-edit-cell');
        if (btnEditCell) {
            btnEditCell.addEventListener('click', () => {
                if (this.selectedCell) {
                    this.openEditDialog(this.selectedCell.row, this.selectedCell.col);
                } else {
                    this.showToast('Sin selección', 'Selecciona una celda primero', 'warning');
                }
            });
        }
    }
}

// Inicializar cuando la pestaña esté activa
document.addEventListener('DOMContentLoaded', function() {
    const boardTab = document.getElementById('board-tab');
    if (boardTab) {
        boardTab.addEventListener('click', function() {
            if (!window.boardManager) {
                window.boardManager = new BoardManager(window.levelGenerator);
                setTimeout(() => {
                    window.boardManager.initialize();
                }, 100);
            }
        });
    }
    
    // Inicializar si ya estamos en la pestaña board
    const boardPane = document.getElementById('board');
    if (boardPane && boardPane.classList.contains('active')) {
        if (!window.boardManager) {
            window.boardManager = new BoardManager(window.levelGenerator);
            setTimeout(() => {
                window.boardManager.initialize();
            }, 100);
        }
    }
});