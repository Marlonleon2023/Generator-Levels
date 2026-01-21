import { 
    PLANTS, 
    GRAVESTONES, 
    SLIDERS,
    POTIONS,
    OTHERS,
    MOLDS,
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
        this.selectedPlant = null;
        
        // Inicializar boardModules con todas las propiedades necesarias
        this.boardModules = {
            plants: [],
            zombies: [],
            gravestones: [],
            sliders: [],
            potions: [],
            molds: [],
            others: [],
            protectedPlants: [] // Añadido aquí también
        };
        
        this.initialized = false;
        
        this.availableElements = {
            plants: [],
            zombies: [],
            gravestones: [],
            sliders: [],
            potions: [],
            others: [],
            molds: []
        };
        
        this.imagePaths = PATHS?.IMAGES || {
            PLANTS: 'Assets/Plants/',
            ZOMBIES: 'Assets/Zombies/',
            GRAVESTONES: 'Assets/Gravestones/',
            SLIDERS: 'Assets/Sliders/',
            POTIONS: 'Assets/Potions/',
            OTHERS: 'Assets/Others/',
            MOLDS: 'Assets/Molds/'
        };
        
        this.fallbackImages = {
            plants: FALLBACK_IMAGES?.plants || 'Assets/Plants/error.webp',
            zombies: `${this.imagePaths.ZOMBIES}error.webp`,
            gravestones: FALLBACK_IMAGES?.gravestones || 'Assets/Zombies/error.webp',
            sliders: FALLBACK_IMAGES?.sliders || 'Assets/Zombies/error.webp',
            potions: FALLBACK_IMAGES?.potions || 'Assets/Zombies/error.webp',
            others: 'Assets/Others/error.webp' ,
            molds: FALLBACK_IMAGES?.molds || 'Assets/Zombies/error.webp'
        };
        
        this.loadElementData();
        
        this.lawnDialog = null;
        this.lawnDialogBackdrop = null;
    }

    async loadElementData() {
        try {
            console.log('🔍 Cargando datos de elementos...');
            
            if (PLANTS && Array.isArray(PLANTS)) {
                this.availableElements.plants = PLANTS.map(plant => ({
                    alias_type: plant,
                    name: plant,
                    type: 'plant',
                    imageUrl: this.getPlantImageUrl(plant)
                }));
                console.log(`✅ Plantas cargadas desde constants: ${PLANTS.length}`);
            } else {
                console.warn('⚠️ No se encontró la constante PLANTS o no es un array');
                this.availableElements.plants = this.loadDefaultPlants();
            }
            
            if (GRAVESTONES && Array.isArray(GRAVESTONES)) {
                this.availableElements.gravestones = GRAVESTONES.map(grave => ({
                    alias_type: grave,
                    name: this.formatGravestoneName(grave),
                    type: 'gravestone',
                    imageUrl: this.getGravestoneImageUrl(grave)
                }));
                console.log(`✅ Lápidas cargadas desde constants: ${GRAVESTONES.length}`);
            } else {
                console.warn('⚠️ No se encontró la constante GRAVESTONES o no es un array');
                this.availableElements.gravestones = this.loadDefaultGravestones();
            }

            if (SLIDERS && Array.isArray(SLIDERS)) {
                this.availableElements.sliders = SLIDERS.map(slider => ({
                    alias_type: slider,
                    name: slider,
                    type: 'slider',
                    imageUrl: this.getSliderImageUrl(slider)
                }));
                console.log(`✅ Sliders cargados: ${SLIDERS.length}`);
            } else {
                console.warn('⚠️ No se encontró la constante SLIDERS o no es un array');
                this.availableElements.sliders = this.loadDefaultSliders();
            }

            if (POTIONS && Array.isArray(POTIONS)) {
                this.availableElements.potions = POTIONS.map(potion => ({
                    alias_type: potion,
                    name: this.formatPotionName(potion),
                    type: 'potion',
                    imageUrl: this.getPotionImageUrl(potion)
                }));
                console.log(`✅ Pociones cargadas: ${POTIONS.length}`);
            } else {
                console.warn('⚠️ No se encontró la constante POTIONS o no es un array');
                this.availableElements.potions = this.loadDefaultPotions();
            }


            if (OTHERS && Array.isArray(OTHERS)) {
            this.availableElements.others = OTHERS.map(item => ({
                alias_type: item,
                name: this.formatOtherName(item),
                type: 'other',
                imageUrl: this.getOtherImageUrl(item)
            }));
            console.log(`✅ Elementos varios cargados: ${OTHERS.length}`);
        } else {
            console.warn('⚠️ No se encontró la constante OTHERS o no es un array');
            this.availableElements.others = this.loadDefaultOthers();
        }


         // CARGAR MOLDS DESDE RESOURCES.JS
            if (MOLDS && Array.isArray(MOLDS)) {
                this.availableElements.molds = MOLDS.map(mold => ({
                    alias_type: mold,
                    name: this.formatMoldName(mold), // Usar función formateadora
                    type: 'mold',
                    imageUrl: this.getMoldImageUrl(mold)
                }));
                console.log(`✅ Molds cargados desde constants: ${MOLDS.length}`);
            } else {
                console.warn('⚠️ No se encontró la constante MOLDS o no es un array');
                this.availableElements.molds = this.loadDefaultMolds();
            }
            

    



            if (window.levelGenerator && window.levelGenerator.zombieData) {
                this.availableElements.zombies = window.levelGenerator.zombieData.map(zombie => ({
                    alias_type: zombie.alias_type,
                    name: zombie.alias_type,
                    type: 'zombie',
                    imageUrl: this.getZombieImageUrl(zombie.alias_type)
                }));
                console.log(`✅ Zombies cargados: ${this.availableElements.zombies.length}`);
            } else {
                console.warn('⚠️ No se encontraron zombies en levelGenerator');
                this.availableElements.zombies = this.loadDefaultZombies();
            }


            



            
            console.log('✅ Elementos cargados:', {
                plantas: this.availableElements.plants.length,
                zombies: this.availableElements.zombies.length,
                lápidas: this.availableElements.gravestones.length,
                sliders: this.availableElements.sliders.length,
                pociones: this.availableElements.potions.length,
                 varios: this.availableElements.others.length
            });
            
        } catch (error) {
            console.error('❌ Error cargando datos de elementos:', error);
            this.loadDefaultElements();
        }
    }

    loadDefaultElements() {
        console.log('🔄 Cargando elementos por defecto...');
        this.availableElements.plants = this.loadDefaultPlants();
        this.availableElements.zombies = this.loadDefaultZombies();
        this.availableElements.gravestones = this.loadDefaultGravestones();
        this.availableElements.sliders = this.loadDefaultSliders();
        this.availableElements.potions = this.loadDefaultPotions();
        console.log('✅ Elementos por defecto cargados');
    }

    loadDefaultPlants() {
        return [
            { alias_type: 'sunflower', name: 'Girasol', type: 'plant', imageUrl: this.getPlantImageUrl('sunflower') },
            { alias_type: 'peashooter', name: 'Lanzaguisantes', type: 'plant', imageUrl: this.getPlantImageUrl('peashooter') },
            { alias_type: 'wallnut', name: 'Nuez', type: 'plant', imageUrl: this.getPlantImageUrl('wallnut') }
        ];
    }

    loadDefaultZombies() {
        return [
            { alias_type: 'zombie', name: 'Zombie Normal', type: 'zombie', imageUrl: this.getZombieImageUrl('zombie') },
            { alias_type: 'conehead', name: 'Zombie Cono', type: 'zombie', imageUrl: this.getZombieImageUrl('conehead') }
        ];
    }

    loadDefaultGravestones() {
        return [
            { alias_type: 'gravestone_normal', name: 'Lápida Normal', type: 'gravestone', imageUrl: this.getGravestoneImageUrl('gravestone_normal') }
        ];
    }

    loadDefaultSliders() {
        return [
            { alias_type: 'slider_up', name: 'Slider Arriba', type: 'slider', imageUrl: this.getSliderImageUrl('slider_up') },
            { alias_type: 'slider_down', name: 'Slider Abajo', type: 'slider', imageUrl: this.getSliderImageUrl('slider_down') }
        ];
    }

    loadDefaultPotions() {
        return [
            { alias_type: 'zombiepotion_speed', name: 'Poción de Velocidad', type: 'potion', imageUrl: this.getPotionImageUrl('zombiepotion_speed') }
        ];
    }


    loadDefaultMolds() {
                return [
                    { 
                        alias_type: 'mold', 
                        name: 'Mohó Básico', 
                        type: 'mold', 
                        imageUrl: this.getMoldImageUrl('mold') 
                    },
                    { 
                        alias_type: 'mold_advanced', 
                        name: 'Mohó Avanzado', 
                        type: 'mold', 
                        imageUrl: this.getMoldImageUrl('mold') 
                    }
                ];
            }



    loadDefaultOthers() {
    return [
        { alias_type: 'goldtile', name: 'Baldosa Dorada', type: 'other', imageUrl: this.getOtherImageUrl('goldtile') },
        { alias_type: 'spiketrap', name: 'Trampa de Púas', type: 'other', imageUrl: this.getOtherImageUrl('spiketrap') },
        { alias_type: 'spikeweed', name: 'Hierba Pincho', type: 'other', imageUrl: this.getOtherImageUrl('spikeweed') }
    ];
}




// Función para formatear nombres de molds
formatMoldName(moldId) {
    // Si tienes MOLD_DISPLAY_NAMES en resources.js, úsalo
    if (typeof MOLD_DISPLAY_NAMES !== 'undefined' && MOLD_DISPLAY_NAMES[moldId]) {
        return MOLD_DISPLAY_NAMES[moldId];
    }
    
    // Fallback: formatear el ID
    return moldId
        .replace('mold_', 'Mohó ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

    formatGravestoneName(graveId) {
        if (GRAVESTONE_DISPLAY_NAMES && GRAVESTONE_DISPLAY_NAMES[graveId]) {
            return GRAVESTONE_DISPLAY_NAMES[graveId];
        }
        
        return graveId
            .replace('gravestone_', 'Lápida ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    formatPotionName(potionId) {
        return potionId
            .replace('zombiepotion_', 'Poción ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }


    formatOtherName(itemId) {
    // Formatear nombres para mostrar
    return itemId
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}




getMoldImageUrl(itemName) {
    if (!itemName) {
        console.warn('❌ getMoldImageUrl: itemName es undefined');
        return this.fallbackImages.molds;
    }
    
    const normalizedName = itemName.toLowerCase().replace(/\s+/g, '');
    const url = `${this.imagePaths.MOLDS}${normalizedName}.webp`;
    
    console.log('🔍 getMoldImageUrl debug:', {
        input: itemName,
        normalizedName: normalizedName,
        imagePaths: this.imagePaths,
        url: url,
        fallback: this.fallbackImages.molds
    });
    
    return url;
}


getOtherImageUrl(itemName) {
    if (!itemName) return this.fallbackImages.others;
    const normalizedName = itemName.toLowerCase().replace(/\s+/g, '');
    return `${this.imagePaths.OTHERS}${normalizedName}.webp`;
}

    getPlantImageUrl(plantName) {
        if (!plantName) return this.fallbackImages.plants;
        const normalizedName = plantName.toLowerCase().replace(/\s+/g, '');
        return `${this.imagePaths.PLANTS}${normalizedName}.webp`;
    }

    getZombieImageUrl(zombieName) {
        if (!zombieName) return this.fallbackImages.zombies;
        const normalizedName = zombieName.toLowerCase().replace(/\s+/g, '');
        return `${this.imagePaths.ZOMBIES}${normalizedName}.webp`;
    }

    getGravestoneImageUrl(gravestoneName) {
        if (!gravestoneName) return this.fallbackImages.gravestones;
        const normalizedName = gravestoneName.toLowerCase().replace(/\s+/g, '');
        return `${this.imagePaths.GRAVESTONES}${normalizedName}.webp`;
    }

    getSliderImageUrl(sliderName) {
        if (!sliderName) return this.fallbackImages.sliders;
        const normalizedName = sliderName.toLowerCase().replace(/\s+/g, '');
        return `${this.imagePaths.SLIDERS}${normalizedName}.webp`;
    }

    getPotionImageUrl(potionName) {
        if (!potionName) return this.fallbackImages.potions;
        const normalizedName = potionName.toLowerCase().replace(/\s+/g, '');
        return `${this.imagePaths.POTIONS}${normalizedName}.webp`;
    }

    // MÉTODO NUEVO: Obtener URL de imagen según tipo de elemento
    getElementImageUrl(element, type) {
        if (!element) return this.fallbackImages.plants;
        
        // Usar la imagen ya almacenada si existe
        if (element.imageUrl) return element.imageUrl;
        
        // Obtener URL según el tipo
        switch(type) {
            case 'plant':
                return this.getPlantImageUrl(element.name);
            case 'zombie':
                return this.getZombieImageUrl(element.name);
            case 'gravestone':
                return this.getGravestoneImageUrl(element.name);
            case 'slider':
                return this.getSliderImageUrl(element.name);
            case 'potion':
                return this.getPotionImageUrl(element.name);
            case 'mold': // AGREGAR ESTE CASO
               return this.getMoldImageUrl(element.name);
            default:
                return this.fallbackImages.plants;
        }
    }

    // MÉTODO NUEVO: Obtener imagen de fallback según tipo
    getFallbackImageByType(type) {
        const typeMap = {
            'plant': 'plants',
            'zombie': 'zombies',
            'gravestone': 'gravestones',
            'slider': 'sliders',
            'potion': 'potions',
            'mold': 'molds'
        };
        
        const fallbackType = typeMap[type] || 'plants';
        return this.fallbackImages[fallbackType];
    }

    initializeBoard() {
        const board = [];
        for (let row = 1; row <= 5; row++) {
            board[row] = [];
            for (let col = 1; col <= 9; col++) {
                board[row][col] = {
                    plants: [],
                    zombies: [],
                    gravestones: [],
                    sliders: [],
                    potions: [],
                    others: [],
                    molds: []
                };
            }
        }
        return board;
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        if (!boardElement) {
            console.error('❌ No se encontró el elemento #game-board');
            return;
        }
        
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

                 if (elements.others.length > 0) {
                const otherItem = elements.others[0];
                const otherDiv = document.createElement('div');
                otherDiv.className = 'cell-element other-element';
                otherDiv.title = `Otro: ${otherItem.name}`;
                
                const imageUrl = otherItem.imageUrl || this.getOtherImageUrl(otherItem.name);
                
                otherDiv.innerHTML = `
                    <img src="${imageUrl}" alt="${otherItem.name}" class="cell-thumbnail other-thumbnail"
                         onerror="this.onerror=null; this.src='${this.fallbackImages.others}'">
                `;
                cellContent.appendChild(otherDiv);
            }

                // Mostrar sliders
                if (elements.sliders.length > 0) {
                    const slider = elements.sliders[0];
                    const sliderDiv = document.createElement('div');
                    sliderDiv.className = 'cell-element slider-element';
                    sliderDiv.title = `Slider: ${slider.name}`;
                    
                    const imageUrl = slider.imageUrl || this.getSliderImageUrl(slider.name);
                    
                    sliderDiv.innerHTML = `
                        <img src="${imageUrl}" alt="${slider.name}" class="cell-thumbnail slider-thumbnail"
                             onerror="this.onerror=null; this.src='${this.fallbackImages.sliders}'">
                    `;
                    cellContent.appendChild(sliderDiv);
                }

                // Mostrar pociones
                if (elements.potions.length > 0) {
                    const potion = elements.potions[0];
                    const potionDiv = document.createElement('div');
                    potionDiv.className = 'cell-element potion-element';
                    potionDiv.title = `Poción: ${potion.name}`;
                    
                    const imageUrl = potion.imageUrl || this.getPotionImageUrl(potion.name);
                    
                    potionDiv.innerHTML = `
                        <img src="${imageUrl}" alt="${potion.name}" class="cell-thumbnail potion-thumbnail"
                             onerror="this.onerror=null; this.src='${this.fallbackImages.potions}'">
                    `;
                    cellContent.appendChild(potionDiv);
                }


                if (elements.molds.length > 0) {
                        const mold = elements.molds[0];
                        const moldDiv = document.createElement('div');
                        moldDiv.className = 'cell-element mold-element';
                        moldDiv.title = `Mohó: ${mold.name}`;
                        
                        const imageUrl = mold.imageUrl || this.getMoldImageUrl(mold.name);
                        
                        moldDiv.innerHTML = `
                            <img src="${imageUrl}" alt="${mold.name}" class="cell-thumbnail mold-thumbnail"
                                onerror="this.onerror=null; this.src='${this.fallbackImages.others}'">
                        `;
                        cellContent.appendChild(moldDiv);
                    }


            
                // CAPA DE DEFEAT
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

                // Mostrar plantas
                if (elements.plants.length > 0) {
                    const plant = elements.plants[0];
                    const plantDiv = document.createElement('div');
                    plantDiv.className = 'cell-element plant-element';
                    plantDiv.title = this.getPlantTitle(plant);
                    
                    const imageUrl = plant.imageUrl || this.getPlantImageUrl(plant.name);
                    
                    plantDiv.innerHTML = `
                        <img src="${imageUrl}" alt="${plant.name}" class="cell-thumbnail"
                             onerror="this.onerror=null; this.src='${this.fallbackImages.plants}'">
                        ${this.getPlantModifiersHtml(plant)}
                    `;
                    cellContent.appendChild(plantDiv);
                    
                    // CAPA DE HIELO
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
                
                // Mostrar zombies
                if (elements.zombies.length > 0) {
                    const zombie = elements.zombies[0];
                    const zombieDiv = document.createElement('div');
                    zombieDiv.className = 'cell-element zombie-element';
                    zombieDiv.title = this.getZombieTitle(zombie);
                    
                    const imageUrl = zombie.imageUrl || this.getZombieImageUrl(zombie.name);
                    
                    zombieDiv.innerHTML = `
                        <img src="${imageUrl}" alt="${zombie.name}" class="cell-thumbnail"
                             onerror="this.onerror=null; this.src='${this.fallbackImages.zombies}'">
                        ${this.getZombieModifiersHtml(zombie)}
                    `;
                    cellContent.appendChild(zombieDiv);
                    
                    // CAPA DE HIELO
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
                
                // Mostrar lápidas
                if (elements.gravestones.length > 0) {
                    const grave = elements.gravestones[0];
                    const graveDiv = document.createElement('div');
                    graveDiv.className = 'cell-element gravestone-element';
                    graveDiv.title = `Lápida: ${grave.name}`;
                    
                    const imageUrl = grave.imageUrl || this.getGravestoneImageUrl(grave.name);
                    
                    graveDiv.innerHTML = `
                        <img src="${imageUrl}" alt="${grave.name}" class="cell-thumbnail"
                             onerror="this.onerror=null; this.src='${this.fallbackImages.gravestones}'">
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
        if (plant.plantLevel > 0) html += `<span class="cell-modifier level">L${plant.plantLevel}</span>`;
        return html;
    }

    getZombieModifiersHtml(zombie) {
        let html = '';
        if (zombie.frozen) html += '<span class="cell-modifier">❄️</span>';
        return html;
    }

    // NUEVO MÉTODO: Obtener el primer elemento de cualquier tipo en una celda
    getFirstElementInCell(row, col) {
        const elements = this.board[row][col];
        
        // Buscar en orden de prioridad para edición
        if (elements.plants.length > 0) {
            return {
                type: 'plant',
                element: elements.plants[0],
                data: { row, col, elementType: 'plants' }
            };
        } else if (elements.zombies.length > 0) {
            return {
                type: 'zombie',
                element: elements.zombies[0],
                data: { row, col, elementType: 'zombies' }
            };
        } else if (elements.gravestones.length > 0) {
            return {
                type: 'gravestone',
                element: elements.gravestones[0],
                data: { row, col, elementType: 'gravestones' }
            };
        } else if (elements.sliders.length > 0) {
            return {
                type: 'slider',
                element: elements.sliders[0],
                data: { row, col, elementType: 'sliders' }
            };
        } else if (elements.potions.length > 0) {
            return {
                type: 'potion',
                element: elements.potions[0],
                data: { row, col, elementType: 'potions' }
            };
        } else if (elements.others.length > 0) {
        return {
            type: 'other',
            element: elements.others[0],
            data: { row, col, elementType: 'others' }
        };
         }

       // Agregar molds al orden de prioridad
        if (elements.molds.length > 0) {
            return {
                type: 'mold',
                element: elements.molds[0],
                data: { row, col, elementType: 'molds' }
            };
        }
        
        return null; // Celda vacía
    }

    handleCellClick(row, col, event) {
        event.stopPropagation();
        this.selectedCell = { row, col };
        
        // Usar el nuevo método para detectar cualquier elemento
        const existingElement = this.getFirstElementInCell(row, col);
        
        if (existingElement) {
            // Si hay un elemento, abrir diálogo de edición específico
            this.openElementEditDialog(row, col, existingElement);
        } else {
            // Si la celda está vacía, abrir la modal de selección inicial
            this.openAddElementSelectionDialog(row, col);
        }
        
        this.updateCellInfo();
        this.renderBoard();
        
        // Resaltar celdas con plantas en peligro
        const cells = document.querySelectorAll('.board-cell');
        cells.forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            const cellElements = this.board[r][c];
            const hasDefeat = cellElements.plants.length > 0 && cellElements.plants[0].defeat;
            
            if (hasDefeat) {
                cell.classList.add('has-defeat');
            } else {
                cell.classList.remove('has-defeat');
            }
        });
    }

    // NUEVO MÉTODO: Diálogo de selección inicial (¿Qué quieres agregar?)
    openAddElementSelectionDialog(row, col) {
        if (this.lawnDialog) {
            this.closeDialog();
        }
        
        this.createAddElementSelectionDialog(row, col);
    }

    createAddElementSelectionDialog(row, col) {
        // Crear backdrop
        this.lawnDialogBackdrop = document.createElement('div');
        this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';
        
        // Crear diálogo
        this.lawnDialog = document.createElement('div');
        this.lawnDialog.className = 'lawn-dialog element-selection-dialog';
        this.lawnDialog.id = `addElementSelectionDialog-${row}-${col}`;
        
        this.lawnDialog.innerHTML = `
            <div class="lawn-dialog-content">
                <header class="dialog-header">
                    <h3>¿Qué quieres agregar?</h3>
                    <button class="close-btn" aria-label="Cerrar">✕</button>
                </header>

                <section class="dialog-body">
                    <div class="element-selection-section">
                        <p class="selection-description">Selecciona el tipo de elemento que deseas agregar a la celda (${row}, ${col})</p>
                        
                        <div class="element-type-cards">
                            <div class="element-type-card" data-type="plants">
                                <div class="element-type-icon"><img src="/Assets/Plants/sunflower.webp" alt=""></div>
                                <div class="element-type-name">Plantas</div>
                                <div class="element-type-count">${this.availableElements.plants.length} disponibles</div>
                            </div>
                            
                            <div class="element-type-card" data-type="zombies">
                                <div class="element-type-icon"><img src="/Assets/Zombies/tutorial_armor4.webp" alt=""></div>
                                <div class="element-type-name">Zombies</div>
                                <div class="element-type-count">${this.availableElements.zombies.length} disponibles</div>
                            </div>
                            
                            <div class="element-type-card" data-type="gravestones">
                                <div class="element-type-icon"><img src="/Assets/Gravestones/gravestone_egypt.webp" alt=""></div>
                                <div class="element-type-name">Lápidas</div>
                                <div class="element-type-count">${this.availableElements.gravestones.length} disponibles</div>
                            </div>
                            
                            <div class="element-type-card" data-type="sliders">
                                <div class="element-type-icon"><img src="/Assets/Sliders/slider_up.webp" alt=""></div>
                                <div class="element-type-name">Sliders</div>
                                <div class="element-type-count">${this.availableElements.sliders.length} disponibles</div>
                            </div>
                            
                            <div class="element-type-card" data-type="potions">
                                <div class="element-type-icon"><img src="/Assets/Potions/zombiepotion_toughness.webp" alt=""></div>
                                <div class="element-type-name">Pociones</div>
                                <div class="element-type-count">${this.availableElements.potions.length} disponibles</div>
                            </div>


                            <div class="element-type-card" data-type="others">
                                <div class="element-type-icon"><img src="/Assets/Others/crater.webp" alt=""></div>
                                <div class="element-type-name">Otros Elementos</div>
                                <div class="element-type-count">${this.availableElements.others.length} disponibles</div>
                            </div>

                           
                            <div class="element-type-card" data-type="molds">
                                <div class="element-type-icon"><img src="/Assets/Molds/mold.webp" alt=""></div>
                                <div class="element-type-name">Mohós</div>
                                <div class="element-type-count">${this.availableElements.molds.length} disponibles</div>
                            </div>

                            

                        </div>
                        
                        <!-- Recuadro de "+" para abrir modal normal -->
                        <div class="add-more-section">
                            <div class="add-more-card" id="open-normal-modal-btn">
                                <div class="add-more-icon">➕</div>
                                <div class="add-more-text">Abrir selección completa</div>
                                <small>Ver todos los elementos en una modal más grande</small>
                            </div>
                        </div>
                    </div>
                </section>

                <footer class="dialog-footer">
                    <div class="footer-info">
                        <small>Celda: Fila ${row}, Columna ${col}</small>
                    </div>
                </footer>
            </div>
        `;
        
        // Agregar al DOM
        this.lawnDialogBackdrop.appendChild(this.lawnDialog);
        document.body.appendChild(this.lawnDialogBackdrop);
        
        // Configurar event listeners
        this.setupAddElementSelectionDialogListeners(row, col);
    }

    setupAddElementSelectionDialogListeners(row, col) {
        if (!this.lawnDialog) return;
        
        // Botón cerrar
        const closeBtn = this.lawnDialog.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeDialog());
        }
        
        // Cerrar al hacer clic en el backdrop
        this.lawnDialogBackdrop.addEventListener('click', (e) => {
            if (e.target === this.lawnDialogBackdrop) {
                this.closeDialog();
            }
        });
        
        // Tarjetas de tipo de elemento
        const typeCards = this.lawnDialog.querySelectorAll('.element-type-card');
        typeCards.forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                // Cerrar esta modal y abrir la modal normal con el tipo seleccionado
                this.closeDialog();
                this.openNormalElementDialog(row, col, type, false);
            });
        });
        
        // Botón para abrir modal normal
        const openNormalModalBtn = this.lawnDialog.querySelector('#open-normal-modal-btn');
        if (openNormalModalBtn) {
            openNormalModalBtn.addEventListener('click', () => {
                // Cerrar esta modal y abrir la modal normal
                this.closeDialog();
                this.openNormalElementDialog(row, col, 'plants', false);
            });
        }
    }

    // NUEVO MÉTODO: Diálogo de edición de cualquier elemento
    openElementEditDialog(row, col, elementInfo) {
        if (this.lawnDialog) {
            this.closeDialog();
        }
        
        this.createElementEditDialog(row, col, elementInfo);
    }

    createElementEditDialog(row, col, elementInfo) {
        const { type, element, data } = elementInfo;
        
        // Crear backdrop
        this.lawnDialogBackdrop = document.createElement('div');
        this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';
        
        // Crear diálogo
        this.lawnDialog = document.createElement('div');
        this.lawnDialog.className = 'lawn-dialog element-edit-dialog';
        this.lawnDialog.id = `editElementDialog-${row}-${col}`;
        
        // Obtener nombres según tipo
        const typeNames = {
            plant: 'Planta',
            zombie: 'Zombie',
            gravestone: 'Lápida',
            slider: 'Slider',
            potion: 'Poción'
        };
        
        const typeName = typeNames[type] || 'Elemento';
        
        // Obtener imagen del elemento
        const elementImageUrl = this.getElementImageUrl(element, type);
        const fallbackImage = this.getFallbackImageByType(type);
        
        let modifiersHtml = '';
        if (type === 'plant') {
            if (element.plantLevel > 0) modifiersHtml += `<span class="status-badge level">Nivel ${element.plantLevel}</span>`;
            if (element.frozen) modifiersHtml += '<span class="status-badge frozen">❄️ Congelada</span>';
            if (element.defeat) modifiersHtml += '<span class="status-badge defeat">🛡️ En Peligro</span>';
        } else if (type === 'zombie' && element.frozen) {
            modifiersHtml += '<span class="status-badge frozen">❄️ Congelado</span>';
        }
        
        this.lawnDialog.innerHTML = `
            <div class="lawn-dialog-content">
                <header class="dialog-header">
                    <div class="element-header-info">
                        <div class="element-preview">
                            <div class="element-image-large">
                                <img src="${elementImageUrl}" 
                                     alt="${element.name}" 
                                     class="element-thumbnail-large"
                                     onerror="this.onerror=null; this.src='${fallbackImage}'; this.style.objectFit='cover'">
                            </div>
                            <div class="element-details">
                                <h3>${element.name}</h3>
                                <div class="element-type-badge">${typeName}</div>
                                <div class="element-modifiers">
                                    ${modifiersHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="close-btn" aria-label="Cerrar">✕</button>
                </header>

                <section class="dialog-body">
                    <div class="element-actions-section">
                        <h6>Acciones Disponibles</h6>
                        <div class="action-buttons-grid">
                            <button class="action-btn delete-btn" data-action="delete">
                                <span class="action-icon">🗑️</span>
                                <span class="action-text">Eliminar ${typeName}</span>
                            </button>
                            
                            ${type === 'plant' ? `
                            <button class="action-btn toggle-btn ${element.frozen ? 'active' : ''}" data-action="toggle-freeze">
                                <span class="action-icon">❄️</span>
                                <span class="action-text">${element.frozen ? 'Descongelar' : 'Congelar'}</span>
                            </button>
                            
                            <button class="action-btn toggle-btn ${element.defeat ? 'active' : ''}" data-action="toggle-defeat">
                                <span class="action-icon">🛡️</span>
                                <span class="action-text">${element.defeat ? 'Quitar Peligro' : 'Poner en Peligro'}</span>
                            </button>
                            
                            <button class="action-btn level-btn" data-action="change-level">
                                <span class="action-icon">📈</span>
                                <span class="action-text">Cambiar Nivel</span>
                            </button>
                            ` : ''}
                            
                            ${type === 'zombie' ? `
                            <button class="action-btn toggle-btn ${element.frozen ? 'active' : ''}" data-action="toggle-freeze">
                                <span class="action-icon">❄️</span>
                                <span class="action-text">${element.frozen ? 'Descongelar' : 'Congelar'}</span>
                            </button>
                            ` : ''}
                            
                            <button class="action-btn change-btn" data-action="change-element">
                                <span class="action-icon">🔄</span>
                                <span class="action-text">Cambiar ${typeName}</span>
                            </button>
                        </div>
                        
                        <!-- Panel para cambiar nivel (solo plantas) -->
                        ${type === 'plant' ? `
                        <div class="change-level-panel" style="display: none;">
                            <div class="panel-header">
                                <h6>Seleccionar Nivel</h6>
                            </div>
                            <div class="level-options">
                                <label class="level-option">
                                    <input type="radio" name="plant-level" value="1">
                                    <span class="level-badge">Nivel 1</span>
                                </label>
                                <label class="level-option">
                                    <input type="radio" name="plant-level" value="2">
                                    <span class="level-badge">Nivel 2</span>
                                </label>
                                <label class="level-option">
                                    <input type="radio" name="plant-level" value="3">
                                    <span class="level-badge">Nivel 3</span>
                                </label>
                            </div>
                            <div class="panel-actions">
                                <button class="cancel-level-btn">Cancelar</button>
                                <button class="confirm-level-btn">Aplicar</button>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </section>

                <footer class="dialog-footer">
                    <div class="footer-info">
                        <small>Celda: Fila ${row}, Columna ${col}</small>
                    </div>
                </footer>
            </div>
        `;
        
        // Agregar al DOM
        this.lawnDialogBackdrop.appendChild(this.lawnDialog);
        document.body.appendChild(this.lawnDialogBackdrop);
        
        // Configurar event listeners
        this.setupElementEditDialogListeners(row, col, elementInfo);
    }

    setupElementEditDialogListeners(row, col, elementInfo) {
        if (!this.lawnDialog) return;
        
        const { type, element, data } = elementInfo;
        
        // Botón cerrar
        const closeBtn = this.lawnDialog.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeDialog());
        }
        
        // Cerrar al hacer clic en el backdrop
        this.lawnDialogBackdrop.addEventListener('click', (e) => {
            if (e.target === this.lawnDialogBackdrop) {
                this.closeDialog();
            }
        });
        
        // Botones de acción
        const actionButtons = this.lawnDialog.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleElementAction(action, row, col, elementInfo);
            });
        });
        
        // Botones específicos para plantas
        if (type === 'plant') {
            const cancelLevelBtn = this.lawnDialog.querySelector('.cancel-level-btn');
            if (cancelLevelBtn) {
                cancelLevelBtn.addEventListener('click', () => {
                    this.hideChangeLevelPanel();
                });
            }
            
            const confirmLevelBtn = this.lawnDialog.querySelector('.confirm-level-btn');
            if (confirmLevelBtn) {
                confirmLevelBtn.addEventListener('click', () => {
                    this.confirmLevelChange(row, col);
                });
            }
            
            // Seleccionar nivel actual
            const currentLevel = element.plantLevel || 1;
            const radioBtn = this.lawnDialog.querySelector(`input[value="${currentLevel}"]`);
            if (radioBtn) {
                radioBtn.checked = true;
            }
        }
    }

    handleElementAction(action, row, col, elementInfo) {
        const { type, element, data } = elementInfo;
        
        switch(action) {
            case 'delete':
                this.deleteElement(row, col, type);
                break;
                
            case 'toggle-freeze':
                this.toggleElementFreeze(row, col, type);
                break;
                
            case 'toggle-defeat':
                if (type === 'plant') {
                    this.togglePlantDefeat(row, col);
                }
                break;
                
            case 'change-level':
                if (type === 'plant') {
                    this.showChangeLevelPanel();
                }
                break;
                
            case 'change-element':
                // Abrir modal normal en modo "cambio"
                this.openNormalElementDialog(row, col, data.elementType, true, elementInfo);
                break;
        }
    }

    deleteElement(row, col, elementType) {
        // Eliminar el elemento del tipo específico
        this.board[row][col][elementType + 's'] = [];
        
        // Actualizar UI
        this.updateBoardModules();
        this.renderBoard();
        this.updatePreview();
        this.updateCellInfo();
        
        // Cerrar diálogo
        this.closeDialog();
        
        // Mostrar notificación
        this.showToast('Elemento eliminado', 'El elemento ha sido removido del tablero', 'success');
    }

    toggleElementFreeze(row, col, elementType) {
        const elements = this.board[row][col][elementType + 's'];
        if (elements.length > 0) {
            const element = elements[0];
            element.frozen = !element.frozen;
            
            // Actualizar UI
            this.updateBoardModules();
            this.renderBoard();
            this.updatePreview();
            
            // Refrescar el diálogo actual
            const elementInfo = this.getFirstElementInCell(row, col);
            if (elementInfo) {
                this.closeDialog();
                this.openElementEditDialog(row, col, elementInfo);
            }
            
            // Mostrar notificación
            this.showToast(
                element.frozen ? 'Elemento congelado' : 'Elemento descongelado',
                `${element.name} ha sido ${element.frozen ? 'congelado' : 'descongelado'}`,
                'info'
            );
        }
    }

    togglePlantDefeat(row, col) {
        const plant = this.board[row][col].plants[0];
        if (plant) {
            plant.defeat = !plant.defeat;
            
            // Actualizar UI
            this.updateBoardModules();
            this.renderBoard();
            this.updatePreview();
            
            // Refrescar el diálogo actual
            const elementInfo = this.getFirstElementInCell(row, col);
            if (elementInfo) {
                this.closeDialog();
                this.openElementEditDialog(row, col, elementInfo);
            }
            
            // Mostrar notificación
            this.showToast(
                plant.defeat ? 'Planta en peligro' : 'Planta segura',
                `${plant.name} está ahora ${plant.defeat ? 'en peligro' : 'segura'}`,
                plant.defeat ? 'warning' : 'info'
            );
        }
    }

    showChangeLevelPanel() {
        const panel = this.lawnDialog.querySelector('.change-level-panel');
        const actionGrid = this.lawnDialog.querySelector('.action-buttons-grid');
        
        if (panel && actionGrid) {
            actionGrid.style.display = 'none';
            panel.style.display = 'block';
        }
    }

    hideChangeLevelPanel() {
        const panel = this.lawnDialog.querySelector('.change-level-panel');
        const actionGrid = this.lawnDialog.querySelector('.action-buttons-grid');
        
        if (panel && actionGrid) {
            panel.style.display = 'none';
            actionGrid.style.display = 'grid';
        }
    }

    confirmLevelChange(row, col) {
        const panel = this.lawnDialog.querySelector('.change-level-panel');
        const selectedRadio = panel.querySelector('input[name="plant-level"]:checked');
        
        if (!selectedRadio) {
            this.showToast('Error', 'Selecciona un nivel', 'error');
            return;
        }
        
        const newLevel = parseInt(selectedRadio.value);
        const plant = this.board[row][col].plants[0];
        
        if (plant) {
            plant.plantLevel = newLevel;
            
            // Actualizar UI
            this.updateBoardModules();
            this.renderBoard();
            this.updatePreview();
            
            // Volver al panel principal
            this.hideChangeLevelPanel();
            
            // Refrescar el diálogo
            const elementInfo = this.getFirstElementInCell(row, col);
            if (elementInfo) {
                this.closeDialog();
                this.openElementEditDialog(row, col, elementInfo);
            }
            
            this.showToast('Nivel actualizado', 
                `La planta ahora es nivel ${newLevel}`, 
                'success');
        }
    }

    // MODIFICADO: Modal normal (para añadir o cambiar elementos)
    openNormalElementDialog(row, col, elementType = 'plants', isChanging = false, originalElementInfo = null) {
        if (this.lawnDialog) {
            this.closeDialog();
        }
        
        this.createNormalElementDialog(row, col, elementType, isChanging, originalElementInfo);
    }

    createNormalElementDialog(row, col, elementType, isChanging, originalElementInfo) {
        // Crear backdrop
        this.lawnDialogBackdrop = document.createElement('div');
        this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';
        
        // Crear diálogo
        this.lawnDialog = document.createElement('div');
        this.lawnDialog.className = 'lawn-dialog normal-element-dialog';
        this.lawnDialog.id = `normalElementDialog-${row}-${col}`;
        
        const dialogTitle = isChanging ? 'Cambiar Elemento' : '';
        const buttonText = isChanging ? 'Cambiar' : '➕ Añadir';
        
        this.lawnDialog.innerHTML = `
            <div class="lawn-dialog-content">
                <header class="dialog-header">
                    <h3>${dialogTitle}</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Tipo de Elemento</label>
                            <select class="element-type-select">
                                <option value="plants" ${elementType === 'plants' ? 'selected' : ''}>Plantas</option>
                                <option value="zombies" ${elementType === 'zombies' ? 'selected' : ''}>Zombies</option>
                                <option value="gravestones" ${elementType === 'gravestones' ? 'selected' : ''}>Lápidas</option>
                                <option value="sliders" ${elementType === 'sliders' ? 'selected' : ''}>Sliders</option>
                                <option value="potions" ${elementType === 'potions' ? 'selected' : ''}>Pociones</option>
                                <option value="others" ${elementType === 'others' ? 'selected' : ''}>Otros Elementos</option>
                                <option value="molds" ${elementType === 'molds' ? 'selected' : ''}>Mohós</option>
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
                        
                        <div class="form-group">
                            
                            <select class="plant-level">
                                <option value="0">Nivel 1</option>
                                <option value="1">Nivel 2</option>
                                <option value="2">Nivel 3</option>
                            </select>
                        </div>
                    </div>

                    <div class="button-group">
                        ${isChanging ? `
                        <button class="btn-cancel-change">Cancelar</button>
                        ` : ''}
                        <button class="btn-confirm">${buttonText}</button>
                    </div>
                </footer>
            </div>
        `;
        
        // Agregar al DOM
        this.lawnDialogBackdrop.appendChild(this.lawnDialog);
        document.body.appendChild(this.lawnDialogBackdrop);
        
        // Guardar información del elemento original si estamos cambiando
        if (isChanging && originalElementInfo) {
            this.lawnDialog.dataset.originalElementInfo = JSON.stringify(originalElementInfo);
        }
        
        // Configurar event listeners
        this.setupNormalElementDialogListeners(row, col, elementType, isChanging);
        
        // Cargar elementos iniciales
        this.loadElementsForTypeDialog(elementType, row, col, isChanging);
    }

    setupNormalElementDialogListeners(row, col, initialElementType, isChanging) {
        if (!this.lawnDialog) return;
        
        // Botón cerrar
        const closeBtn = this.lawnDialog.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (isChanging) {
                    // Si estamos en modo cambio, volver al diálogo de edición
                    this.closeDialog();
                    const originalElementInfo = JSON.parse(this.lawnDialog.dataset.originalElementInfo || '{}');
                    if (originalElementInfo.type) {
                        this.openElementEditDialog(row, col, originalElementInfo);
                    }
                } else {
                    this.closeDialog();
                }
            });
        }
        
        // Cerrar al hacer clic en el backdrop
        this.lawnDialogBackdrop.addEventListener('click', (e) => {
            if (e.target === this.lawnDialogBackdrop) {
                if (isChanging) {
                    // Si estamos en modo cambio, volver al diálogo de edición
                    this.closeDialog();
                    const originalElementInfo = JSON.parse(this.lawnDialog.dataset.originalElementInfo || '{}');
                    if (originalElementInfo.type) {
                        this.openElementEditDialog(row, col, originalElementInfo);
                    }
                } else {
                    this.closeDialog();
                }
            }
        });
        
        // Selector de tipo
        const elementTypeSelect = this.lawnDialog.querySelector('.element-type-select');
        if (elementTypeSelect) {
            elementTypeSelect.addEventListener('change', () => {
                const type = elementTypeSelect.value;
                this.loadElementsForTypeDialog(type, row, col, isChanging);
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
        
        // Botón confirmar (añadir o cambiar)
        const btnConfirm = this.lawnDialog.querySelector('.btn-confirm');
        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                if (isChanging) {
                    this.changeElementInCell(row, col);
                } else {
                    this.addElementToCell(row, col);
                }
                this.closeDialog();
            });
        }
        
        // Botón cancelar cambio
        const btnCancelChange = this.lawnDialog.querySelector('.btn-cancel-change');
        if (btnCancelChange) {
            btnCancelChange.addEventListener('click', () => {
                // Volver al diálogo de edición
                this.closeDialog();
                const originalElementInfo = JSON.parse(this.lawnDialog.dataset.originalElementInfo || '{}');
                if (originalElementInfo.type) {
                    this.openElementEditDialog(row, col, originalElementInfo);
                }
            });
        }
    }

    loadElementsForTypeDialog(type, row, col, isChanging = false) {
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
            
            const imageUrl = element.imageUrl || this.fallbackImages[type];
            
            card.innerHTML = `
                <div class="element-image-container">
                    <img src="${imageUrl}" alt="${element.name}" 
                         class="element-image"
                         onerror="this.onerror=null; this.src='${this.fallbackImages[type]}'">
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
        
        // Aplicar modificadores si estamos cambiando un elemento
        if (isChanging) {
            this.applyOriginalElementModifiers();
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
        
        const levelControl = this.lawnDialog.querySelector('.plant-level');
        if (levelControl) {
            levelControl.style.display = type === 'plants' ? 'block' : 'none';
        }
        
        this.updateDefeatCheckboxState(type);
    }
    
    updateDefeatCheckboxState(type) {
        if (!this.lawnDialog) return;
        
        const defeatCheckbox = this.lawnDialog.querySelector('.check-defeat');
        const defeatLabel = this.lawnDialog.querySelector('.modifier-label:nth-child(2)');
        
        if (defeatCheckbox && defeatLabel) {
            if (type === 'plants') {
                defeatCheckbox.disabled = false;
                defeatLabel.style.opacity = '1';
            } else {
                defeatCheckbox.checked = false;
                defeatCheckbox.disabled = true;
                defeatLabel.style.opacity = '0.5';
            }
        }
    }

    applyOriginalElementModifiers() {
        // Aplicar los modificadores del elemento original si estamos en modo cambio
        if (!this.lawnDialog || !this.lawnDialog.dataset.originalElementInfo) return;
        
        const originalElementInfo = JSON.parse(this.lawnDialog.dataset.originalElementInfo);
        const { element, type } = originalElementInfo;
        
        if (!element) return;
        
        // Aplicar modificadores según el tipo
        const checkFrozen = this.lawnDialog.querySelector('.check-frozen');
        const checkDefeat = this.lawnDialog.querySelector('.check-defeat');
        const plantLevel = this.lawnDialog.querySelector('.plant-level');
        
        if (checkFrozen && (type === 'plant' || type === 'zombie')) {
            checkFrozen.checked = element.frozen || false;
        }
        
        if (checkDefeat && type === 'plant') {
            checkDefeat.checked = element.defeat || false;
        }
        
        if (plantLevel && type === 'plant' && element.plantLevel) {
            plantLevel.value = element.plantLevel - 1;
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
            rtid: elementName,
            name: elementName,
            imageUrl: this.selectedElement.imageUrl
        };
        
        // Configurar RTID y modificadores según el tipo
        const checkFrozen = this.lawnDialog.querySelector('.check-frozen');
        const checkDefeat = this.lawnDialog.querySelector('.check-defeat');
        const plantLevel = this.lawnDialog.querySelector('.plant-level');
        
        switch(type) {
            case 'plants':
                if (plantLevel) element.plantLevel = parseInt(plantLevel.value) + 1 || 1;
                if (checkFrozen) element.frozen = checkFrozen.checked;
                if (checkDefeat) element.defeat = checkDefeat.checked;
                break;
                
            case 'zombies':
                if (checkFrozen) element.frozen = checkFrozen.checked;
                break;
                
            case 'gravestones':
            case 'sliders':
            case 'potions':
                // Sin modificadores especiales
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
        const typeNames = {
            plants: 'Planta',
            zombies: 'Zombie',
            gravestones: 'Lápida',
            sliders: 'Slider',
            potions: 'Poción'
        };
        
        this.showToast('Elemento añadido', 
            `${typeNames[type] || type} "${elementName}" colocada en (${row}, ${col})`, 
            'success');
    }

    changeElementInCell(row, col) {
        if (!this.selectedElement || !this.lawnDialog) {
            this.showToast('Error', 'Selecciona un elemento primero', 'error');
            return;
        }
        
        const type = this.selectedElement.type;
        const elementName = this.selectedElement.alias_type;
        
        // Obtener información del elemento original si existe
        const originalElementInfo = this.lawnDialog.dataset.originalElementInfo ? 
            JSON.parse(this.lawnDialog.dataset.originalElementInfo) : null;
        
        // Limpiar el tipo de elemento original y agregar el nuevo
        const elementType = type; // plants, zombies, etc.
        
        // Si estamos cambiando a un tipo diferente, limpiar el tipo original
        if (originalElementInfo && originalElementInfo.data.elementType !== elementType) {
            this.board[row][col][originalElementInfo.data.elementType] = [];
        }
        
        // Limpiar elementos del mismo tipo en esta celda
        this.board[row][col][elementType] = [];
        
        // Crear objeto del elemento
        const element = {
            rtid: elementName,
            name: elementName,
            imageUrl: this.selectedElement.imageUrl
        };
        
        // Configurar RTID y modificadores según el tipo
        const checkFrozen = this.lawnDialog.querySelector('.check-frozen');
        const checkDefeat = this.lawnDialog.querySelector('.check-defeat');
        const plantLevel = this.lawnDialog.querySelector('.plant-level');
        
        // Si estamos cambiando a un elemento del mismo tipo, preservar modificadores
        if (originalElementInfo && originalElementInfo.data.elementType === elementType) {
            const originalElement = originalElementInfo.element;
            
            switch(elementType) {
                case 'plants':
                    element.plantLevel = originalElement.plantLevel || 1;
                    element.frozen = originalElement.frozen || false;
                    element.defeat = originalElement.defeat || false;
                    
                    // Sobreescribir con nuevos valores si el usuario los cambió
                    if (plantLevel) element.plantLevel = parseInt(plantLevel.value) + 1 || element.plantLevel;
                    if (checkFrozen) element.frozen = checkFrozen.checked;
                    if (checkDefeat) element.defeat = checkDefeat.checked;
                    break;
                    
                case 'zombies':
                    element.frozen = originalElement.frozen || false;
                    if (checkFrozen) element.frozen = checkFrozen.checked;
                    break;
                    
                case 'gravestones':
                case 'sliders':
                case 'potions':
                    // Sin modificadores
                    break;
            }
        } else {
            // Si es un tipo diferente, aplicar los modificadores seleccionados
            switch(elementType) {
                case 'plants':
                    if (plantLevel) element.plantLevel = parseInt(plantLevel.value) + 1 || 1;
                    if (checkFrozen) element.frozen = checkFrozen.checked;
                    if (checkDefeat) element.defeat = checkDefeat.checked;
                    break;
                    
                case 'zombies':
                    if (checkFrozen) element.frozen = checkFrozen.checked;
                    break;
                    
                case 'gravestones':
                case 'sliders':
                case 'potions':
                    // Sin modificadores especiales
                    break;
            }
        }
        
        // Añadir a la celda
        this.board[row][col][elementType].push(element);
        
        // Actualizar UI
        this.updateBoardModules();
        this.renderBoard();
        this.updatePreview();
        this.updateCellInfo();
        
        // Mostrar mensaje
        const typeNames = {
            plants: 'Planta',
            zombies: 'Zombie',
            gravestones: 'Lápida',
            sliders: 'Slider',
            potions: 'Poción'
        };
        
        this.showToast('Elemento cambiado', 
            `${typeNames[elementType] || elementType} cambiado a "${elementName}" en (${row}, ${col})`, 
            'success');
    }

    closeDialog() {
        if (this.lawnDialogBackdrop && this.lawnDialogBackdrop.parentElement) {
            this.lawnDialogBackdrop.remove();
            this.lawnDialog = null;
            this.lawnDialogBackdrop = null;
            this.selectedElement = null;
            this.selectedPlant = null;
        }
    }

    clearCell(row, col) {
        this.board[row][col] = {
            plants: [],
            zombies: [],
            gravestones: [],
            sliders: [],
            potions: [],
            others: []
        };
        
        this.updateBoardModules();
        this.renderBoard();
        this.updatePreview();
        this.updateCellInfo();
        
        this.showToast('Celda limpiada', `Celda (${row}, ${col}) ha sido limpiada`, 'warning');
    }

    updateBoardModules() {
        this.boardModules = {
            plants: [],
            zombies: [],
            gravestones: [],
            sliders: [],
            potions: [],
            others: [],
            molds: [], // NUEVO
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
                    
                    if (!plant.defeat) {
                        this.boardModules.plants.push(plantModule);
                    } else {
                        this.boardModules.protectedPlants.push({
                            GridY: row - 1,
                            GridX: col - 1,
                            PlantType: plant.name,
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

                // Sliders
                cell.sliders.forEach(slider => {
                    this.boardModules.sliders.push({
                        GridY: row - 1,
                        GridX: col - 1,
                        TypeName: slider.rtid
                    });
                });

                // Pociones
                cell.potions.forEach(potion => {
                    this.boardModules.potions.push({
                        GridY: row - 1,
                        GridX: col - 1,
                        TypeName: potion.rtid
                    });
                });

                


                 cell.molds.forEach(mold => {
                    this.boardModules.molds.push({
                        GridY: row - 1,
                        GridX: col - 1,
                        // Los molds usan un sistema diferente (matriz binaria)
                        // Este es solo para tracking interno
                        TypeName: mold.rtid
                    });
                });

                  cell.others.forEach(other => {
                        this.boardModules.others.push({
                            GridY: row - 1,
                            GridX: col - 1,
                            TypeName: other.rtid
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
        if (elements.sliders.length > 0) {
            elementList.push(`<span class="slider-tag">${elements.sliders[0].name}</span>`);
        }
        if (elements.potions.length > 0) {
            elementList.push(`<span class="potion-tag">${elements.potions[0].name}</span>`);
        }
         if (elements.others.length > 0) {
        elementList.push(`<span class="other-tag">${elements.others[0].name}</span>`);
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
                    <button onclick="window.boardManager.openAddElementSelectionDialog(${row}, ${col})" class="edit-cell-btn">
                        ✏️ Editar
                    </button>
                </div>
            `;
        }
    }

    updatePreview() {
        const preview = document.getElementById('board-json-preview');
        if (!preview) return;
        
        // Asegurar que boardModules esté actualizado
        if (!this.boardModules || !this.boardModules.plants) {
            this.updateBoardModules();
        }
        
        const modules = this.getAllModules();
        if (modules.length === 0) {
            preview.textContent = "// No hay elementos colocados en el tablero\n// Haz clic en una celda para añadir elementos";
            return;
        }
        
        preview.textContent = JSON.stringify(modules, null, 2);
        
        if (window.levelGenerator && typeof window.levelGenerator.syntaxHighlight === 'function') {
            window.levelGenerator.syntaxHighlight(preview);
        }
    }

    getAllModules() {
        const modules = [];
        
        // Verificar que boardModules existe y tiene las propiedades necesarias
        if (!this.boardModules) {
            console.warn('⚠️ boardModules es undefined, inicializando...');
            this.boardModules = {
                plants: [],
                zombies: [],
                gravestones: [],
                sliders: [],
                potions: [],
                others: [],
                 molds: [],
                protectedPlants: []
            };
        }


            // MÓDULO PARA MOLDS - DEBE IR PRIMERO
    if (this.boardModules.molds && this.boardModules.molds.length > 0) {
        // 1. Primero agregar MountingMolds
        modules.push({
            aliases: ["MountingMolds"],
            objclass: "MoldColonyChallengeProps",
            objdata: {
                Locations: "RTID(MoldLocationsCustom@.)"
            }
        });
        
        // 2. Luego agregar MoldLocationsCustom
        const moldMatrix = this.createMoldMatrix();
        
        modules.push({
            aliases: ["MoldLocationsCustom"],
            objclass: "BoardGridMapProps",
            objdata: {
                Values: moldMatrix
            }
        });
    }
    
        
        // Verificar cada propiedad antes de acceder a length
        if (this.boardModules.plants && this.boardModules.plants.length > 0) {
            modules.push({
                aliases: ["MountingPlants"],
                objclass: "InitialPlantProperties",
                objdata: {
                    InitialPlantPlacements: this.boardModules.plants
                }
            });
        }
        
        if (this.boardModules.protectedPlants && this.boardModules.protectedPlants.length > 0) {
            modules.push({
                aliases: ["ProtectThePlant"],
                objclass: "ProtectThePlant",
                objdata: {
                    ProtectedPlants: this.boardModules.protectedPlants
                }
            });
        }
        
        if (this.boardModules.zombies && this.boardModules.zombies.length > 0) {
            modules.push({
                aliases: ["MountingZombies"],
                objclass: "InitialZombieProperties",
                objdata: {
                    InitialZombiePlacements: this.boardModules.zombies
                }
            });
        }
        
        if (this.boardModules.gravestones && this.boardModules.gravestones.length > 0) {
            modules.push({
                aliases: ["MountingGravestones"],
                objclass: "GravestoneProperties",
                objdata: {
                    ForceSpawnData: this.boardModules.gravestones
                }
            });
        }

        if (this.boardModules.sliders && this.boardModules.sliders.length > 0) {
            modules.push({
                aliases: ["MountingSliders"],
                objclass: "InitialGridItemProperties",
                objdata: {
                    InitialGridItemPlacements: this.boardModules.sliders.map(slider => ({
                        GridY: slider.GridY,
                        GridX: slider.GridX,
                        TypeName: slider.TypeName
                    }))
                }
            });
        }

        if (this.boardModules.potions && this.boardModules.potions.length > 0) {
            modules.push({
                aliases: ["MountingPotions"],
                objclass: "InitialGridItemProperties",
                objdata: {
                    InitialGridItemPlacements: this.boardModules.potions.map(potion => ({
                        GridY: potion.GridY,
                        GridX: potion.GridX,
                        TypeName: potion.TypeName
                    }))
                }
            });
        }

            if (this.boardModules.others && this.boardModules.others.length > 0) {
            modules.push({
                aliases: ["MountingOthers"],
                objclass: "InitialGridItemProperties",
                objdata: {
                    InitialGridItemPlacements: this.boardModules.others.map(other => ({
                        GridY: other.GridY,
                        GridX: other.GridX,
                        TypeName: other.TypeName
                    }))
                }
            });
        }


   
    
        return modules;
    }


    // Método para crear la matriz de molds
            createMoldMatrix() {
                // Inicializar matriz 5x9 con ceros
                const matrix = [];
                for (let row = 0; row < 5; row++) {
                    matrix[row] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                }
                // Marcar celdas con molds
                if (this.boardModules.molds) {
                    this.boardModules.molds.forEach(mold => { 
                        const row = mold.GridY;
                        const col = mold.GridX;
                        if (row >= 0 && row < 5 && col >= 0 && col < 9) {
                            matrix[row][col] = 1;
                        }
                    });
                }
                
                return matrix;
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
        this.updateBoardModules(); // Añadido para asegurar que se inicialice
        this.updatePreview();
        this.initialized = true;
    }

    setupEventListeners() {
        const btnClearBoard = document.getElementById('btn-clear-board');
        if (btnClearBoard) {
            btnClearBoard.addEventListener('click', () => {
                if (confirm('¿Estás seguro de limpiar todo el tablero?')) {
                    this.board = this.initializeBoard();
                    this.boardModules = {
                        plants: [],
                        zombies: [],
                        gravestones: [],
                        sliders: [],
                        potions: [],
                        protectedPlants: []
                    };
                    this.renderBoard();
                    this.updatePreview();
                    this.showToast('Tablero limpiado', 'Todos los elementos han sido removidos', 'warning');
                }
            });
        }
        
        const btnEditCell = document.getElementById('btn-edit-cell');
        if (btnEditCell) {
            btnEditCell.addEventListener('click', () => {
                if (this.selectedCell) {
                    this.openAddElementSelectionDialog(this.selectedCell.row, this.selectedCell.col);
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
    const boardPane = document.getElementById('board');
    
    function initBoardManager() {
        if (!window.boardManager) {
            console.log('🚀 Inicializando BoardManager...');
            window.boardManager = new BoardManager(window.levelGenerator);
            
            setTimeout(() => {
                if (window.boardManager) {
                    window.boardManager.initialize();
                    console.log('✅ BoardManager inicializado correctamente');
                }
            }, 300);
        } else if (window.boardManager && !window.boardManager.initialized) {
            window.boardManager.initialize();
        }
    }
    
    if (boardTab) {
        boardTab.addEventListener('click', initBoardManager);
    }
    
    if (boardPane && boardPane.classList.contains('active')) {
        initBoardManager();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BoardManager;
}