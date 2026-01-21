import { 
    PLANTS, 
    GRAVESTONES, 
    SLIDERS,
    POTIONS,
    OTHERS,
    MOLDS,
    RAILCARTS,
    GRAVESTONE_DISPLAY_NAMES,
     RAILCART_DISPLAY_NAMES,
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
            railcarts: [], // NUEVO
            rails: [], // NUEVO
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
            molds: [],
            railcarts: [] 
        };
        
        this.imagePaths = PATHS?.IMAGES || {
            PLANTS: 'Assets/Plants/',
            ZOMBIES: 'Assets/Zombies/',
            GRAVESTONES: 'Assets/Gravestones/',
            SLIDERS: 'Assets/Sliders/',
            POTIONS: 'Assets/Potions/',
            OTHERS: 'Assets/Others/',
            MOLDS: 'Assets/Molds/',
            RAILCARTS: 'Assets/Railcarts/'
        };

        this.railcartElements = {
            type: '', // Tipo seleccionado: railcart_cowboy, railcart_future, etc.
            parts: [], // Array de objetos { Part, Column, Row }
            rails: [] // Array de objetos { Column, RowStart, RowEnd }
        };

        this.railcartParts = ['bottom', 'cart', 'mid', 'top'];
        
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


             if (RAILCARTS && Array.isArray(RAILCARTS)) {
                this.availableElements.railcarts = RAILCARTS.map(railcart => ({
                    alias_type: railcart,
                    name: this.formatRailcartName(railcart),
                    type: 'railcart',
                    imageUrl: this.getRailcartImageUrl(railcart, false) // railcart image
                }));
                console.log(`✅ Railcarts cargados desde constants: ${RAILCARTS.length}`);
            } else {
                console.warn('⚠️ No se encontró la constante RAILCARTS o no es un array');
                this.availableElements.railcarts = this.loadDefaultRailcarts();
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


    getPartIcon(part) {
    const icons = {
        'bottom': '⬇️',
        'cart': '🛒',
        'mid': '🟨',
        'top': '⬆️'
    };
    return icons[part] || '📦';
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


     loadDefaultRailcarts() {
        return [
            { 
                alias_type: 'railcart_cowboy', 
                name: 'Vagón del Oeste', 
                type: 'railcart',
                imageUrl: this.getRailcartImageUrl('railcart_cowboy', false)
            },
            { 
                alias_type: 'railcart_future', 
                name: 'Vagón futurista', 
                type: 'railcart',
                imageUrl: this.getRailcartImageUrl('railcart_future', false)
            }
        ];
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



formatPartName(part) {
    const names = {
        'bottom': 'Parte inferior',
        'cart': 'Carro/Vagón',
        'mid': 'Parte media',
        'top': 'Parte superior'
    };
    return names[part] || part;
}



 formatRailcartName(railcartId) {
        if (RAILCART_DISPLAY_NAMES && RAILCART_DISPLAY_NAMES[railcartId]) {
            return RAILCART_DISPLAY_NAMES[railcartId];
        }
        
        return railcartId
            .replace('railcart_', 'Vagón ')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
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




getRailcartImageUrl(railcartType, isRail = false) {
    if (!railcartType) return 'Assets/Railcarts/railcart_cowboy/cart.webp';
    
    // La estructura es: Assets/Railcarts/railcart_cowboy/cart.webp
    // o Assets/Railcarts/railcart_cowboy/rail.webp
    const part = isRail ? 'rail' : 'cart';
    return `Assets/Railcarts/${railcartType}/${part}.webp`;
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
                    molds: [],
                    railcarts: []
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


  // MOSTRAR PARTES DE RAILCART (puede haber múltiples en la misma celda)
            const partsInCell = this.railcartElements.parts.filter(
                part => parseInt(part.Row) === row && parseInt(part.Column) === col
            );
            
            partsInCell.forEach(part => {
                const partDiv = document.createElement('div');
                
                if (part.Part === 'cart') {
                    // ES UN VAGÓN
                    partDiv.className = 'cell-element railcart-element';
                    partDiv.title = `${this.formatRailcartName(this.railcartElements.type)} - Vagón`;
                    
                    const imageUrl = this.getRailcartPartImageUrl(this.railcartElements.type, 'cart');
                    
                    partDiv.innerHTML = `
                        <img src="${imageUrl}" alt="Vagón" 
                             class="cell-thumbnail railcart-thumbnail"
                             onerror="this.onerror=null; this.src='Assets/Railcarts/${this.railcartElements.type}/cart.webp';">
                        <span class="part-indicator">🛒</span>
                    `;
                } else {
                    // ES UN RIEL (bottom, mid, top, etc.)
                    partDiv.className = `cell-element rail-element part-${part.Part}`;
                    partDiv.title = `Riel - ${this.formatPartName(part.Part)}`;
                    
                    const imageUrl = this.getRailcartPartImageUrl(this.railcartElements.type, part.Part);
                    
                    partDiv.innerHTML = `
                        <img src="${imageUrl}" alt="${part.Part}" 
                             class="cell-thumbnail rail-thumbnail"
                             onerror="this.onerror=null; this.src='Assets/Railcarts/${this.railcartElements.type}/${part.Part}.webp';">
                        <span class="part-indicator">${this.getPartIcon(part.Part)}</span>
                    `;
                }
                
                cellContent.appendChild(partDiv);
            });

            // MOSTRAR RAILES DE RANGO (si no hay parte específica en esa celda)
            this.railcartElements.rails.forEach(rail => {
                const railCol = parseInt(rail.Column);
                const startRow = parseInt(rail.RowStart);
                const endRow = parseInt(rail.RowEnd);
                
                if (railCol === col && row >= startRow && row <= endRow) {
                    // Verificar si ya hay una parte específica en esta celda
                    const hasSpecificPart = partsInCell.length > 0;
                    
                    if (!hasSpecificPart) {
                        // Solo mostrar riel genérico si no hay parte específica
                        const railDiv = document.createElement('div');
                        railDiv.className = 'cell-element rail-track';
                        railDiv.title = 'Riel de tren';
                        
                        railDiv.innerHTML = `
                            <div class="rail-track-icon">─</div>
                        `;
                        cellContent.appendChild(railDiv);
                    }
                }
            });

            



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


    // 3. AGREGAR MÉTODO PARA ELIMINAR PARTES DE RAILCART
deleteRailcartPart(row, col, partName) {
    const index = this.railcartElements.parts.findIndex(part => 
        parseInt(part.Row) === row && 
        parseInt(part.Column) === col && 
        part.Part === partName
    );
    
    if (index >= 0) {
        this.railcartElements.parts.splice(index, 1);
        
        // Si eliminamos el vagón principal ("cart"), limpiar rieles asociados
        if (partName === 'cart') {
            const colToClean = this.railcartElements.parts
                .filter(p => p.Part === 'cart')
                .map(p => parseInt(p.Column));
            
            // Limpiar rieles en columnas sin vagón
            this.railcartElements.rails = this.railcartElements.rails.filter(rail => {
                return colToClean.includes(parseInt(rail.Column));
            });
        }
        
        this.renderBoard();
        this.updatePreview();
        this.showToast('Parte eliminada', `${this.formatPartName(partName)} eliminada de (${row}, ${col})`, 'success');
        return true;
    }
    
    return false;
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
         } else if (elements.railcarts.length > 0) {
            return {
                type: 'railcart',
                element: elements.railcarts[0],
                data: { row, col, elementType: 'railcarts' }
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
    
    // Primero verificar si hay una parte de railcart
    const railcartPart = this.getRailcartPartAtCell(row, col);
    
    if (railcartPart) {
        // Si hay una parte de railcart, abrir diálogo de edición específico
        this.openRailcartPartEditDialog(row, col, railcartPart);
    } else {
        // Si no hay parte de railcart, seguir con la lógica normal
        const existingElement = this.getFirstElementInCell(row, col);
        
        if (existingElement) {
            this.openElementEditDialog(row, col, existingElement);
        } else {
            this.openAddElementSelectionDialog(row, col);
        }
    }
    
    this.updateCellInfo();
    this.renderBoard();
}


// 5. AGREGAR MÉTODO AUXILIAR
getRailcartPartAtCell(row, col) {
    for (const part of this.railcartElements.parts) {
        if (parseInt(part.Row) === row && parseInt(part.Column) === col) {
            return {
                type: 'railcartPart',
                part: part.Part,
                data: part
            };
        }
    }
    return null;
}

// 6. CREAR DIÁLOGO DE EDICIÓN PARA PARTES DE RAILCART
openRailcartPartEditDialog(row, col, partInfo) {
    if (this.lawnDialog) {
        this.closeDialog();
    }
    
    this.createRailcartPartEditDialog(row, col, partInfo);
}

createRailcartPartEditDialog(row, col, partInfo) {
    this.lawnDialogBackdrop = document.createElement('div');
    this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';
    
    this.lawnDialog = document.createElement('div');
    this.lawnDialog.className = 'lawn-dialog railcart-part-edit-dialog';
    
    const partName = this.formatPartName(partInfo.part);
    const isCart = partInfo.part === 'cart';
    
    this.lawnDialog.innerHTML = `
        <div class="lawn-dialog-content">
            <header class="dialog-header">
                <h3>${isCart ? 'Editar Vagón' : 'Editar Riel'}</h3>
                <button class="close-btn" aria-label="Cerrar">✕</button>
            </header>

            <section class="dialog-body">
                <div class="railcart-part-info">
                    <div class="part-preview-large">
                        <img src="${this.getRailcartPartImageUrl(this.railcartElements.type, partInfo.part)}" 
                             alt="${partName}"
                             onerror="this.src='Assets/Railcarts/${this.railcartElements.type}/${partInfo.part}.webp'">
                    </div>
                    <div class="part-details">
                        <h4>${partName}</h4>
                        <p><strong>Tipo:</strong> ${isCart ? 'Vagón principal' : 'Parte de riel'}</p>
                        <p><strong>Estilo:</strong> ${this.formatRailcartName(this.railcartElements.type)}</p>
                        <p><strong>Posición:</strong> Fila ${row}, Columna ${col}</p>
                    </div>
                </div>
                
                <div class="action-buttons-grid">
                    <button class="action-btn move-btn" data-action="move">
                        <span class="action-icon">📤</span>
                        <span class="action-text">Mover ${isCart ? 'Vagón' : 'Riel'}</span>
                    </button>
                    
                    <button class="action-btn delete-btn" data-action="delete">
                        <span class="action-icon">🗑️</span>
                        <span class="action-text">Eliminar ${isCart ? 'Vagón' : 'Riel'}</span>
                    </button>
                    
                    ${isCart ? `
                    <button class="action-btn add-rail-btn" data-action="add-rail">
                        <span class="action-icon">➕</span>
                        <span class="action-text">Añadir Riel en esta columna</span>
                    </button>
                    ` : ''}
                </div>
            </section>

            <footer class="dialog-footer">
                <div class="button-group">
                    <button class="btn-back">← Volver</button>
                </div>
            </footer>
        </div>
    `;
    
    this.lawnDialogBackdrop.appendChild(this.lawnDialog);
    document.body.appendChild(this.lawnDialogBackdrop);
    
    this.setupRailcartPartEditDialogListeners(row, col, partInfo);
}

setupRailcartPartEditDialogListeners(row, col, partInfo) {
    const closeBtn = this.lawnDialog.querySelector('.close-btn');
    const backBtn = this.lawnDialog.querySelector('.btn-back');
    
    closeBtn.addEventListener('click', () => this.closeDialog());
    backBtn.addEventListener('click', () => this.closeDialog());
    
    const actionButtons = this.lawnDialog.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            this.handleRailcartPartAction(action, row, col, partInfo);
        });
    });
}

handleRailcartPartAction(action, row, col, partInfo) {
    switch(action) {
        case 'delete':
            if (confirm(`¿Estás seguro de eliminar este ${partInfo.part === 'cart' ? 'vagón' : 'riel'}?`)) {
                this.deleteRailcartPart(row, col, partInfo.part);
                this.closeDialog();
            }
            break;
            
        case 'move':
            // Implementar lógica para mover la parte
            this.moveRailcartPart(row, col, partInfo);
            break;
            
        case 'add-rail':
            // Añadir riel automáticamente en la columna actual
            this.addDefaultRails(col);
            this.closeDialog();
            this.showToast('Riel añadido', `Riel añadido en la columna ${col}`, 'success');
            break;
    }
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


                            <div class="element-type-card" data-type="railcarts">
                            <div class="element-type-icon"><img src="/Assets/Railcarts/railcart_cowboy/cart.webp" alt=""></div>
                            <div class="element-type-name">Vagones y Rieles</div>
                            <div class="element-type-count">${this.availableElements.railcarts.length} estilos</div>
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


    openRailcartSetupDialog() {
        if (this.lawnDialog) {
            this.closeDialog();
        }
        
        this.createRailcartSetupDialog();
    }

createRailcartSetupDialog() {
    this.lawnDialogBackdrop = document.createElement('div');
    this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';
    
    this.lawnDialog = document.createElement('div');
    this.lawnDialog.className = 'lawn-dialog railcart-setup-dialog';
    
    // Generar opciones de railcart types
    let railcartOptions = '';
    this.availableElements.railcarts.forEach(railcart => {
        const isSelected = this.railcartElements.type === railcart.alias_type;
        railcartOptions += `
            <div class="railcart-option ${isSelected ? 'selected' : ''}" 
                 data-type="${railcart.alias_type}">
                <div class="railcart-preview">
                    <img src="${railcart.imageUrl}" alt="${railcart.name}"
                         onerror="this.src='Assets/Railcarts/railcart_cowboy/cart.webp'">
                </div>
                <div class="railcart-name">${railcart.name}</div>
                <div class="railcart-check">${isSelected ? '✓' : ''}</div>
            </div>
        `;
    });
    
    // Generar controles para cada parte
    let partsControls = '';
    this.railcartParts.forEach((part, index) => {
        const existingPart = this.railcartElements.parts.find(p => p.Part === part);
        
        // Posiciones por defecto más separadas
        let defaultCol = 4;
        switch(part) {
            case 'bottom': defaultCol = 3; break;
            case 'cart': defaultCol = 4; break;
            case 'mid': defaultCol = 5; break;
            case 'top': defaultCol = 6; break;
        }
        
        partsControls += `
            <div class="part-control" data-part="${part}">
                <div class="part-header">
                    <div class="part-icon">${this.getPartIcon(part)}</div>
                    <div class="part-name">${this.formatPartName(part)}</div>
                    <label class="part-toggle">
                        <input type="checkbox" class="enable-part" 
                               ${existingPart ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="part-coordinates" style="${existingPart ? '' : 'display: none;'}">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fila (1-5)</label>
                            <input type="number" class="part-row" min="1" max="5" 
                                   value="${existingPart ? existingPart.Row : '3'}" 
                                   ${!existingPart ? 'disabled' : ''}>
                        </div>
                        <div class="form-group">
                            <label>Columna (1-9)</label>
                            <input type="number" class="part-col" min="1" max="9" 
                                   value="${existingPart ? existingPart.Column : defaultCol}" 
                                   ${!existingPart ? 'disabled' : ''}>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Configuración de rieles
    const railCol = this.railcartElements.rails.length > 0 ? this.railcartElements.rails[0].Column : '4';
    const railStart = this.railcartElements.rails.length > 0 ? this.railcartElements.rails[0].RowStart : '2';
    const railEnd = this.railcartElements.rails.length > 0 ? this.railcartElements.rails[0].RowEnd : '4';
    
    this.lawnDialog.innerHTML = `
        <div class="lawn-dialog-content">
            <header class="dialog-header">
                <h3>Configurar Vagones y Rieles</h3>
                <button class="close-btn" aria-label="Cerrar">✕</button>
            </header>

            <section class="dialog-body">
                <div class="railcart-setup-section">
                    <!-- Selección de estilo -->
                    <div class="setup-step">
                        <h6>1. Seleccionar estilo de vagón</h6>
                        <div class="railcart-type-grid">
                            ${railcartOptions}
                        </div>
                    </div>
                    
                    <!-- Configuración de partes -->
                    <div class="setup-step">
                        <h6>2. Configurar partes del vagón</h6>
                        <div class="parts-controls">
                            ${partsControls}
                        </div>
                    </div>
                    
                    <!-- Configuración de rieles -->
                    <div class="setup-step">
                        <h6>3. Configurar rieles</h6>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="enable-rails" 
                                       ${this.railcartElements.rails.length > 0 ? 'checked' : ''}>
                                Habilitar rieles
                            </label>
                        </div>
                        <div class="rail-configuration" id="rail-configuration" 
                             style="${this.railcartElements.rails.length > 0 ? '' : 'display: none;'}">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Columna de rieles</label>
                                    <input type="number" id="rail-col" min="1" max="9" value="${railCol}">
                                </div>
                                <div class="form-group">
                                    <label>Fila inicio</label>
                                    <input type="number" id="rail-start" min="1" max="5" value="${railStart}">
                                </div>
                                <div class="form-group">
                                    <label>Fila fin</label>
                                    <input type="number" id="rail-end" min="1" max="5" value="${railEnd}">
                                </div>
                            </div>
                            <small class="form-hint">Las filas deben estar en orden (inicio ≤ fin)</small>
                        </div>
                    </div>
                    
                    <!-- Vista previa -->
                    <div class="setup-step">
                        <h6>Vista previa</h6>
                        <div class="railcart-preview-grid" id="railcart-preview">
                            <!-- Se llenará dinámicamente -->
                        </div>
                    </div>
                </div>
            </section>

            <footer class="dialog-footer">
                <div class="button-group">
                    <button class="btn-clear-railcarts" id="btn-clear-railcarts">
                        🗑️ Limpiar todo
                    </button>
                    <button class="btn-confirm" id="btn-confirm-railcarts">
                        ✅ Aplicar configuración
                    </button>
                </div>
            </footer>
        </div>
    `;
    
    this.lawnDialogBackdrop.appendChild(this.lawnDialog);
    document.body.appendChild(this.lawnDialogBackdrop);
    
    this.setupRailcartDialogListeners();
    this.updateRailcartPreview();
}




setupRailcartDialogListeners() {
    const closeBtn = this.lawnDialog.querySelector('.close-btn');
    const clearBtn = this.lawnDialog.querySelector('#btn-clear-railcarts');
    const confirmBtn = this.lawnDialog.querySelector('#btn-confirm-railcarts');
    
    closeBtn.addEventListener('click', () => this.closeDialog());
    
    clearBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de eliminar todos los vagones y rieles?')) {
            this.railcartElements = {
                type: '',
                parts: [],
                rails: []
            };
            this.updatePreview();
            this.renderBoard();
            this.updateRailcartPreview();
            this.showToast('Vagones limpiados', 'Se han eliminado todos los vagones y rieles', 'success');
        }
    });
    
    confirmBtn.addEventListener('click', () => {
        this.saveRailcartConfiguration();
    });
    
    // Seleccionar tipo de railcart
    const railcartOptions = this.lawnDialog.querySelectorAll('.railcart-option');
    railcartOptions.forEach(option => {
        option.addEventListener('click', () => {
            railcartOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            this.railcartElements.type = option.dataset.type;
            this.updateRailcartPreview();
        });
    });
    
    // Habilitar/deshabilitar partes
    const partControls = this.lawnDialog.querySelectorAll('.part-control');
    partControls.forEach(control => {
        const toggle = control.querySelector('.enable-part');
        const coordinates = control.querySelector('.part-coordinates');
        const rowInput = control.querySelector('.part-row');
        const colInput = control.querySelector('.part-col');
        
        toggle.addEventListener('change', () => {
            coordinates.style.display = toggle.checked ? 'block' : 'none';
            if (rowInput) rowInput.disabled = !toggle.checked;
            if (colInput) colInput.disabled = !toggle.checked;
            this.updateRailcartPreview();
        });
    });
    
    // Habilitar/deshabilitar rieles
    const enableRails = this.lawnDialog.querySelector('#enable-rails');
    const railConfiguration = this.lawnDialog.querySelector('#rail-configuration');
    
    enableRails.addEventListener('change', () => {
        railConfiguration.style.display = enableRails.checked ? 'block' : 'none';
        this.updateRailcartPreview();
    });
    
    // Actualizar vista previa cuando cambian los inputs
    const inputsToWatch = ['rail-col', 'rail-start', 'rail-end'];
    inputsToWatch.forEach(id => {
        const input = this.lawnDialog.querySelector(`#${id}`);
        if (input) {
            input.addEventListener('change', () => this.updateRailcartPreview());
            input.addEventListener('input', () => this.updateRailcartPreview());
        }
    });
    
    // También para los inputs de partes
    partControls.forEach(control => {
        const rowInput = control.querySelector('.part-row');
        const colInput = control.querySelector('.part-col');
        
        if (rowInput) {
            rowInput.addEventListener('input', () => this.updateRailcartPreview());
            rowInput.addEventListener('change', () => this.updateRailcartPreview());
        }
        if (colInput) {
            colInput.addEventListener('input', () => this.updateRailcartPreview());
            colInput.addEventListener('change', () => this.updateRailcartPreview());
        }
    });
}


updateRailcartPreview() {
    const previewGrid = this.lawnDialog.querySelector('#railcart-preview');
    if (!previewGrid) return;
    
    previewGrid.innerHTML = '';
    
    // Crear mini-tablero 5x9
    for (let row = 1; row <= 5; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'preview-row';
        
        for (let col = 1; col <= 9; col++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'preview-cell';
            cellDiv.dataset.row = row;
            cellDiv.dataset.col = col;
            cellDiv.title = `Fila ${row}, Columna ${col}`;
            
            // Verificar si hay una parte del railcart aquí
            let partInCell = null;
            const partControls = this.lawnDialog.querySelectorAll('.part-control');
            
            partControls.forEach(control => {
                const toggle = control.querySelector('.enable-part');
                const partName = control.dataset.part;
                
                if (toggle && toggle.checked) {
                    const partRow = parseInt(control.querySelector('.part-row').value) || 3;
                    const partCol = parseInt(control.querySelector('.part-col').value) || 4;
                    
                    if (row === partRow && col === partCol) {
                        partInCell = partName;
                    }
                }
            });
            
            // Verificar si hay riel aquí
            let hasRail = false;
            const enableRails = this.lawnDialog.querySelector('#enable-rails');
            
            if (enableRails && enableRails.checked) {
                const railCol = parseInt(this.lawnDialog.querySelector('#rail-col').value) || 4;
                const railStart = parseInt(this.lawnDialog.querySelector('#rail-start').value) || 2;
                const railEnd = parseInt(this.lawnDialog.querySelector('#rail-end').value) || 4;
                
                if (col === railCol && row >= railStart && row <= railEnd) {
                    hasRail = true;
                }
            }
            
            // Mostrar contenido de la celda
            if (partInCell) {
                cellDiv.classList.add(`has-part`, `part-${partInCell}`);
                cellDiv.innerHTML = `<span class="part-marker">${this.getPartIcon(partInCell)}</span>`;
                cellDiv.title += `\n${this.formatPartName(partInCell)}`;
            } else if (hasRail) {
                cellDiv.classList.add('has-rail');
                cellDiv.innerHTML = '─';
                cellDiv.title += '\nRiel';
            }
            
            rowDiv.appendChild(cellDiv);
        }
        
        previewGrid.appendChild(rowDiv);
    }
}

saveRailcartConfiguration() {
    const railcartType = this.railcartElements.type;
    if (!railcartType) {
        this.showToast('Error', 'Selecciona un estilo de vagón', 'error');
        return;
    }
    
    // Recopilar partes configuradas
    const parts = [];
    const partControls = this.lawnDialog.querySelectorAll('.part-control');
    
    partControls.forEach(control => {
        const toggle = control.querySelector('.enable-part');
        const partName = control.dataset.part;
        
        if (toggle && toggle.checked) {
            const partRow = parseInt(control.querySelector('.part-row').value) || 3;
            const partCol = parseInt(control.querySelector('.part-col').value) || 4;
            
            parts.push({
                Part: partName,
                Column: partCol.toString(),
                Row: partRow.toString()
            });
        }
    });
    
    if (parts.length === 0) {
        this.showToast('Advertencia', 'No hay partes del vagón habilitadas', 'warning');
    }
    
    // Configurar rieles
    const rails = [];
    const enableRails = this.lawnDialog.querySelector('#enable-rails');
    
    if (enableRails && enableRails.checked) {
        const railCol = parseInt(this.lawnDialog.querySelector('#rail-col').value) || 4;
        const railStart = parseInt(this.lawnDialog.querySelector('#rail-start').value) || 2;
        const railEnd = parseInt(this.lawnDialog.querySelector('#rail-end').value) || 4;
        
        // Validar que las filas estén en orden
        if (railStart > railEnd) {
            this.showToast('Error', 'La fila inicio debe ser menor o igual a la fila fin', 'error');
            return;
        }
        
        rails.push({
            Column: railCol.toString(),
            RowStart: railStart.toString(),
            RowEnd: railEnd.toString()
        });
    }
    
    // Actualizar railcartElements
    this.railcartElements.type = railcartType;
    this.railcartElements.parts = parts;
    this.railcartElements.rails = rails;
    
    // Actualizar UI
    this.updatePreview();
    this.renderBoard();
    this.closeDialog();
    
    // Mostrar mensaje de éxito
    const partCount = parts.length;
    const railInfo = rails.length > 0 ? ` con rieles en columna ${rails[0].Column}` : '';
    this.showToast('Configuración guardada', 
        `${this.formatRailcartName(railcartType)} con ${partCount} parte(s)${railInfo}`, 
        'success');
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
   // MODIFICADO: Modal normal (para añadir o cambiar elementos)
openNormalElementDialog(row, col, elementType = 'plants', isChanging = false, originalElementInfo = null) {
    if (this.lawnDialog) {
        this.closeDialog();
    }

    if (elementType === 'railcarts') {
        // Primero mostrar estilos de vagones
        this.openRailcartStyleDialog(row, col);
        return;
    }
    
    this.createNormalElementDialog(row, col, elementType, isChanging, originalElementInfo);
}



openRailcartStyleDialog(row, col) {
    if (this.lawnDialog) {
        this.closeDialog();
    }
    
    // Ir directamente al diálogo de partes, mostrando primero los estilos disponibles
    this.createCombinedRailcartDialog(row, col);
}

createCombinedRailcartDialog(row, col) {
    this.lawnDialogBackdrop = document.createElement('div');
    this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';
    
    this.lawnDialog = document.createElement('div');
    this.lawnDialog.className = 'lawn-dialog railcart-combined-dialog';
    
    // Header con selector de estilo
    let styleOptions = '';
    const railcarts = this.availableElements.railcarts;
    
    // Si no hay tipo seleccionado, usar el primero por defecto
    const initialType = this.railcartElements.type || (railcarts.length > 0 ? railcarts[0].alias_type : '');
    
    railcarts.forEach(railcart => {
        const isSelected = initialType === railcart.alias_type;
        styleOptions += `
            <option value="${railcart.alias_type}" ${isSelected ? 'selected' : ''}>
                ${railcart.name}
            </option>
        `;
    });
    
    // Asegurar que el tipo esté establecido
    if (!this.railcartElements.type && railcarts.length > 0) {
        this.railcartElements.type = initialType;
    }
    
    // Generar opciones de partes
    let partsOptions = '';
    const currentRailcartType = this.railcartElements.type;
    
    if (currentRailcartType) {
        this.railcartParts.forEach(part => {
            const imageUrl = this.getRailcartPartImageUrl(currentRailcartType, part);
            const displayName = this.formatPartName(part);
            
            partsOptions += `
                <div class="railcart-part-option combined" data-part="${part}">
                    <div class="part-preview">
                        <img src="${imageUrl}" alt="${displayName}"
                             onerror="this.src='Assets/Railcarts/${currentRailcartType}/${part}.webp'">
                    </div>
                    <div class="part-name">${displayName}</div>
                    <div class="part-description">${this.getPartDescription(part)}</div>
                </div>
            `;
        });
    }
    
    this.lawnDialog.innerHTML = `
        <div class="lawn-dialog-content">
            <header class="dialog-header">
                <h3>Agregar parte de vagón</h3>
                <div class="style-selector">
                    <label>Estilo:</label>
                    <select id="railcart-style-selector">
                        ${styleOptions}
                    </select>
                </div>
                <button class="close-btn" aria-label="Cerrar">✕</button>
            </header>

            <section class="dialog-body">
                <div class="railcart-parts-section">
                    <p class="selection-description">
                        Selecciona una parte del vagón para colocarla en la celda (${row}, ${col})
                    </p>
                    
                    <div class="railcart-parts-grid">
                        ${partsOptions || '<div class="no-parts">No hay estilos de vagón disponibles</div>'}
                    </div>
                    
                    <div class="cell-info-display">
                        <strong>Celda destino:</strong> Fila ${row}, Columna ${col}
                    </div>
                </div>
            </section>

            <footer class="dialog-footer">
                <div class="button-group">
                    <button class="btn-back" id="btn-back-railcart">
                        ← Volver a elementos
                    </button>
                    <button class="btn-confirm" id="btn-place-part" ${!currentRailcartType ? 'disabled' : ''}>
                        ✅ Selecciona una parte primero
                    </button>
                </div>
            </footer>
        </div>
    `;
    
    this.lawnDialogBackdrop.appendChild(this.lawnDialog);
    document.body.appendChild(this.lawnDialogBackdrop);
    
    this.setupCombinedRailcartDialogListeners(row, col);
}



setupCombinedRailcartDialogListeners(row, col) {
    const closeBtn = this.lawnDialog.querySelector('.close-btn');
    const backBtn = this.lawnDialog.querySelector('#btn-back-railcart');
    const confirmBtn = this.lawnDialog.querySelector('#btn-place-part');
    const styleSelector = this.lawnDialog.querySelector('#railcart-style-selector');
    
    closeBtn.addEventListener('click', () => this.closeDialog());
    
    backBtn.addEventListener('click', () => {
        this.closeDialog();
        this.openAddElementSelectionDialog(row, col);
    });
    
    // Cambiar estilo
    styleSelector.addEventListener('change', () => {
        const newType = styleSelector.value;
        this.railcartElements.type = newType;
        
        // Actualizar imágenes de partes
        const partOptions = this.lawnDialog.querySelectorAll('.railcart-part-option');
        partOptions.forEach(option => {
            const part = option.dataset.part;
            const img = option.querySelector('img');
            img.src = this.getRailcartPartImageUrl(newType, part);
        });
    });
    
    // Selección de parte
    let selectedPart = null;
    const partOptions = this.lawnDialog.querySelectorAll('.railcart-part-option');
    
    partOptions.forEach(option => {
        option.addEventListener('click', () => {
            partOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedPart = option.dataset.part;
            
            confirmBtn.disabled = false;
            confirmBtn.textContent = `✅ Colocar ${this.formatPartName(selectedPart)}`;
        });
    });
    
    confirmBtn.addEventListener('click', () => {
        if (!selectedPart) {
            this.showToast('Error', 'Selecciona una parte primero', 'error');
            return;
        }
        
        // Asegurar que tenemos el tipo correcto
        const railcartType = styleSelector.value;
        if (railcartType && railcartType !== this.railcartElements.type) {
            this.railcartElements.type = railcartType;
        }
        
        this.placeRailcartPart(row, col, selectedPart);
    });
    
    // Seleccionar automáticamente la primera parte si hay partes disponibles
    setTimeout(() => {
        if (partOptions.length > 0) {
            partOptions[0].click();
            
            // Asegurar que el botón esté habilitado
            confirmBtn.disabled = false;
            confirmBtn.textContent = `✅ Colocar ${this.formatPartName(partOptions[0].dataset.part)}`;
        }
    }, 100);
}

createRailcartStyleDialog(row, col) {
    this.lawnDialogBackdrop = document.createElement('div');
    this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';
    
    this.lawnDialog = document.createElement('div');
    this.lawnDialog.className = 'lawn-dialog railcart-style-dialog';
    
    // Generar opciones de railcart types
    let railcartOptions = '';
    this.availableElements.railcarts.forEach(railcart => {
        const isSelected = this.railcartElements.type === railcart.alias_type;
        railcartOptions += `
            <div class="railcart-style-option ${isSelected ? 'selected' : ''}" 
                 data-type="${railcart.alias_type}">
                <div class="railcart-preview">
                    <img src="${railcart.imageUrl}" alt="${railcart.name}"
                         onerror="this.src='Assets/Railcarts/railcart_cowboy/cart.webp'">
                </div>
                <div class="railcart-name">${railcart.name}</div>
                <div class="railcart-check">${isSelected ? '✓' : ''}</div>
            </div>
        `;
    });
    
    this.lawnDialog.innerHTML = `
        <div class="lawn-dialog-content">
            <header class="dialog-header">
                <h3>Seleccionar estilo de vagón</h3>
                <button class="close-btn" aria-label="Cerrar">✕</button>
            </header>

            <section class="dialog-body">
                <div class="railcart-style-section">
                    <p class="selection-description">
                        Elige un estilo de vagón. Luego podrás seleccionar las partes individuales.
                    </p>
                    
                    <div class="railcart-style-grid">
                        ${railcartOptions}
                    </div>
                </div>
            </section>

            <footer class="dialog-footer">
                <div class="button-group">
                    <button class="btn-back" id="btn-back-railcart">
                        ← Volver
                    </button>
                    <button class="btn-continue" id="btn-continue-railcart" ${!this.railcartElements.type ? 'disabled' : ''}>
                        Continuar →
                    </button>
                </div>
            </footer>
        </div>
    `;
    
    this.lawnDialogBackdrop.appendChild(this.lawnDialog);
    document.body.appendChild(this.lawnDialogBackdrop);
    
    this.setupRailcartStyleDialogListeners(row, col);
}

setupRailcartStyleDialogListeners(row, col) {
    const closeBtn = this.lawnDialog.querySelector('.close-btn');
    const backBtn = this.lawnDialog.querySelector('#btn-back-railcart');
    const continueBtn = this.lawnDialog.querySelector('#btn-continue-railcart');
    
    closeBtn.addEventListener('click', () => this.closeDialog());
    
    backBtn.addEventListener('click', () => {
        // Volver al diálogo anterior
        this.closeDialog();
        // Abrir diálogo de selección de tipo de elemento
        this.openAddElementSelectionDialog(row, col);
    });
    
    continueBtn.addEventListener('click', () => {
        // Continuar a seleccionar partes
        this.openRailcartPartsDialog(row, col);
    });
    
    // Seleccionar tipo de railcart
    const railcartOptions = this.lawnDialog.querySelectorAll('.railcart-style-option');
    railcartOptions.forEach(option => {
        option.addEventListener('click', () => {
            railcartOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            this.railcartElements.type = option.dataset.type;
            continueBtn.disabled = false;
        });
    });
}

openRailcartPartsDialog(row, col) {
    if (this.lawnDialog) {
        this.closeDialog();
    }
    
    this.createRailcartPartsDialog(row, col);
}

createRailcartPartsDialog(row, col) {
    this.lawnDialogBackdrop = document.createElement('div');
    this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';
    
    this.lawnDialog = document.createElement('div');
    this.lawnDialog.className = 'lawn-dialog railcart-parts-dialog';
    
    // Obtener el estilo seleccionado
    const railcartType = this.railcartElements.type;
    const railcartName = this.formatRailcartName(railcartType);
    
    // Generar opciones de partes
    let partsOptions = '';
    this.railcartParts.forEach(part => {
        const imageUrl = this.getRailcartPartImageUrl(railcartType, part);
        const displayName = this.formatPartName(part);
        
        partsOptions += `
            <div class="railcart-part-option" data-part="${part}">
                <div class="part-preview">
                    <img src="${imageUrl}" alt="${displayName}"
                         onerror="this.src='Assets/Railcarts/${railcartType}/${part}.webp'">
                </div>
                <div class="part-name">${displayName}</div>
                <div class="part-description">${this.getPartDescription(part)}</div>
            </div>
        `;
    });
    
    this.lawnDialog.innerHTML = `
        <div class="lawn-dialog-content">
            <header class="dialog-header">
                <h3>Seleccionar parte del vagón</h3>
                <div class="current-railcart-info">
                    <span>Estilo: <strong>${railcartName}</strong></span>
                </div>
                <button class="close-btn" aria-label="Cerrar">✕</button>
            </header>

            <section class="dialog-body">
                <div class="railcart-parts-section">
                    <p class="selection-description">
                        Selecciona una parte del vagón para colocarla en la celda (${row}, ${col})
                    </p>
                    
                    <div class="railcart-parts-grid">
                        ${partsOptions}
                    </div>
                    
                    <div class="cell-info-display">
                        <strong>Celda destino:</strong> Fila ${row}, Columna ${col}
                    </div>
                </div>
            </section>

            <footer class="dialog-footer">
                <div class="button-group">
                    <button class="btn-back" id="btn-back-parts">
                        ← Cambiar estilo
                    </button>
                    <button class="btn-confirm" id="btn-place-part" disabled>
                        ✅ Selecciona una parte primero
                    </button>
                </div>
            </footer>
        </div>
    `;
    
    this.lawnDialogBackdrop.appendChild(this.lawnDialog);
    document.body.appendChild(this.lawnDialogBackdrop);
    
    this.setupRailcartPartsDialogListeners(row, col);
}

setupRailcartPartsDialogListeners(row, col) {
    const closeBtn = this.lawnDialog.querySelector('.close-btn');
    const backBtn = this.lawnDialog.querySelector('#btn-back-parts');
    const confirmBtn = this.lawnDialog.querySelector('#btn-place-part');
    
    closeBtn.addEventListener('click', () => this.closeDialog());
    
    backBtn.addEventListener('click', () => {
        // Volver a seleccionar estilo
        this.openRailcartStyleDialog(row, col);
    });
    
    // Variable local para almacenar la parte seleccionada
    let selectedPart = null;
    
    // Seleccionar parte
    const partOptions = this.lawnDialog.querySelectorAll('.railcart-part-option');
    
    partOptions.forEach(option => {
        option.addEventListener('click', () => {
            console.log('🚀 Clic en parte:', option.dataset.part);
            
            // Remover selección de todas las opciones
            partOptions.forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Agregar selección a la opción actual
            option.classList.add('selected');
            selectedPart = option.dataset.part;
            
            console.log('✅ Parte seleccionada:', selectedPart);
            
            // Habilitar y actualizar botón
            confirmBtn.disabled = false;
            confirmBtn.textContent = `✅ Colocar ${this.formatPartName(selectedPart)}`;
        });
    });
    
    confirmBtn.addEventListener('click', () => {
        console.log('🔍 Intentando colocar parte:', selectedPart);
        
        if (!selectedPart) {
            this.showToast('Error', 'Selecciona una parte primero', 'error');
            return;
        }
        
        console.log('🚀 Llamando a placeRailcartPart con:', {
            row, col, selectedPart
        });
        
        this.placeRailcartPart(row, col, selectedPart);
    });
    
    // Inicializar con la primera parte seleccionada
    setTimeout(() => {
        if (partOptions.length > 0) {
            console.log('🔄 Seleccionando primera opción automáticamente');
            partOptions[0].click();
        }
    }, 100);
}

// MODIFICAR placeRailcartPart para recibir la parte como parámetro
placeRailcartPart(row, col, selectedPart) {
    console.log('🎯 Ejecutando placeRailcartPart:', {
        row, col, selectedPart,
        railcartType: this.railcartElements.type
    });
    
    const railcartType = this.railcartElements.type;
    if (!railcartType) {
        this.showToast('Error', 'No hay estilo de vagón seleccionado', 'error');
        return;
    }
    
    // Validar que selectedPart no sea null/undefined
    if (!selectedPart) {
        this.showToast('Error', 'Parte no válida seleccionada', 'error');
        return;
    }
    
    // Verificar si ya hay una parte en esta celda específica
    const existingPartIndex = this.railcartElements.parts.findIndex(p => 
        parseInt(p.Row) === row && 
        parseInt(p.Column) === col &&
        p.Part === selectedPart
    );
    
    console.log('🔍 Buscando parte existente en esta celda:', {
        existingPartIndex,
        parts: this.railcartElements.parts
    });
    
    if (existingPartIndex >= 0) {
        // Si ya existe la misma parte en la misma celda, eliminarla (toggle)
        this.railcartElements.parts.splice(existingPartIndex, 1);
        console.log('🗑️ Eliminando parte existente');
    } else {
        // Agregar nueva parte - PERMITIR MÚLTIPLES PARTES DEL MISMO TIPO
        const newPart = {
            Part: selectedPart,
            Column: col.toString(),
            Row: row.toString()
        };
        this.railcartElements.parts.push(newPart);
        console.log('➕ Agregando nueva parte:', newPart);
        
        // Si es un vagón (cart), agregar riel automáticamente en la misma posición
        if (selectedPart === 'cart') {
            // Agregar un riel en la misma fila y columna
            const railExists = this.railcartElements.rails.some(rail => 
                parseInt(rail.Column) === col && 
                parseInt(rail.RowStart) <= row && 
                parseInt(rail.RowEnd) >= row
            );
            
            if (!railExists) {
                this.railcartElements.rails.push({
                    Column: col.toString(),
                    RowStart: row.toString(),
                    RowEnd: row.toString()
                });
                console.log('🛤️ Agregando riel específico para vagón');
            }
        }
    }
    
    console.log('✅ Partes después de modificar:', this.railcartElements.parts);
    console.log('✅ Rieles después de modificar:', this.railcartElements.rails);
    
    // Actualizar UI
    this.renderBoard();
    this.updatePreview();
    this.closeDialog();
    
    // Mostrar mensaje
    const partName = this.formatPartName(selectedPart);
    const railcartName = this.formatRailcartName(railcartType);
    const action = existingPartIndex >= 0 ? 'eliminada' : 'colocada';
    this.showToast(`Parte ${action}`, 
        `${partName} de ${railcartName} ${action} en (${row}, ${col})`, 
        existingPartIndex >= 0 ? 'warning' : 'success');
}

clearRailcartParts(partType = null) {
    if (partType) {
        // Limpiar solo partes del tipo especificado
        const beforeCount = this.railcartElements.parts.length;
        this.railcartElements.parts = this.railcartElements.parts.filter(
            part => part.Part !== partType
        );
        const afterCount = this.railcartElements.parts.length;
        
        // Si eliminamos vagones, también limpiar rieles asociados
        if (partType === 'cart') {
            const remainingCartColumns = this.railcartElements.parts
                .filter(p => p.Part === 'cart')
                .map(p => parseInt(p.Column));
            
            this.railcartElements.rails = this.railcartElements.rails.filter(rail => {
                return remainingCartColumns.includes(parseInt(rail.Column));
            });
        }
        
        console.log(`🧹 Limpiadas ${beforeCount - afterCount} partes de tipo ${partType}`);
    } else {
        // Limpiar todo
        this.railcartElements.parts = [];
        this.railcartElements.rails = [];
        console.log('🧹 Limpiadas todas las partes de railcart');
    }
    
    this.renderBoard();
    this.updatePreview();
}

// CORREGIR LA FUNCIÓN addDefaultRails
addDefaultRails(column) {
    // Verificar si ya hay rieles en esta columna
    const existingRail = this.railcartElements.rails.find(rail => 
        parseInt(rail.Column) === column
    );
    
    if (!existingRail) {
        // Agregar rieles en la misma columna, desde la fila 1 hasta la 5
        this.railcartElements.rails.push({
            Column: column.toString(),
            RowStart: '1',
            RowEnd: '5'
        });
    }
    
    this.renderBoard();
    this.updatePreview();
}






// Función para obtener descripción de las partes
getPartDescription(part) {
    const descriptions = {
        'bottom': 'Parte inferior/base del vagón',
        'cart': 'Cuerpo principal del vagón',
        'mid': 'Parte media/central',
        'top': 'Parte superior/techo'
    };
    return descriptions[part] || 'Parte del vagón';
}

// Función para obtener URL de imagen de parte específica
getRailcartPartImageUrl(railcartType, part) {
    return `Assets/Railcarts/${railcartType}/${part}.webp`;
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
            railcarts: [],
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
               railcarts: [], // Para vagones (cart)
             rails: [],
                protectedPlants: []
            };
        }


     // MÓDULO PARA RAILCARTS - SOLO UN MÓDULO, NO DOS
    if (this.railcartElements.type) {
        const railcartData = {
            RailcartType: this.railcartElements.type
        };
        
        // 1. Obtener vagones (cart) - RESTAR 1 PARA CONTAR DESDE 0
        const railcarts = this.railcartElements.parts
            .filter(part => part.Part === 'cart')
            .map(cart => ({
                Column: (parseInt(cart.Column) - 1).toString(),  // RESTAR 1: 1-9 → 0-8
                Row: (parseInt(cart.Row) - 1).toString()         // RESTAR 1: 1-5 → 0-4
            }));
        
        // 2. Obtener todos los rieles - TAMBIÉN RESTAR 1
        const rails = [];
        
        // Rieles de partes específicas
        this.railcartElements.parts
            .filter(part => part.Part !== 'cart')
            .forEach(railPart => {
                rails.push({
                    Column: (parseInt(railPart.Column) - 1).toString(),
                    RowStart: (parseInt(railPart.Row) - 1).toString(),
                    RowEnd: (parseInt(railPart.Row) - 1).toString()
                });
            });
        
        // Rieles de rango
        this.railcartElements.rails.forEach(rail => {
            rails.push({
                Column: (parseInt(rail.Column) - 1).toString(),
                RowStart: (parseInt(rail.RowStart) - 1).toString(),
                RowEnd: (parseInt(rail.RowEnd) - 1).toString()
            });
        });
        
        // Solo agregar el módulo si hay datos
        if (railcarts.length > 0 || rails.length > 0) {
            if (railcarts.length > 0) {
                railcartData.Railcarts = railcarts;
            }
            
            if (rails.length > 0) {
                railcartData.Rails = rails;
            }
            
            modules.push({
                aliases: ["MountingRails"],
                objclass: "RailcartProperties",
                objdata: railcartData
            });
        }
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
            // Limpiar sin preguntar confirmación
            this.board = this.initializeBoard();
            this.boardModules = {
                plants: [],
                zombies: [],
                gravestones: [],
                sliders: [],
                potions: [],
                others: [],
                molds: [],
                railcarts: [],
                rails: [],
                protectedPlants: []
            };

            // Limpiar también los railcart elements
            this.railcartElements = {
                type: '',
                parts: [],
                rails: []
            };
            
            this.renderBoard();
            this.updatePreview();
            this.showToast('Tablero limpiado', 'Todos los elementos han sido removidos', 'warning');
        });
    }

    const btnRailcarts = document.getElementById('btn-railcarts');
    if (btnRailcarts) {
        btnRailcarts.addEventListener('click', () => {
            this.openRailcartSetupDialog();
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