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
} from '../../constants/resources.js';

class BoardManager {
    constructor(levelGenerator) {
        this.levelGenerator = levelGenerator;
        this.board = this.initializeBoard();
        this.selectedCell = null;
        this.selectedElement = null;
        this.selectedPlant = null;
        
        // Variable global para copiar/pegar TODA una celda (incluye railcarts)
        this._copiedCellData = null;
        
        this.boardModules = {
            plants: [],
            zombies: [],
            gravestones: [],
            sliders: [],
            potions: [],
            molds: [],
            others: [],
            railcarts: [],
            rails: [],
            protectedPlants: []
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
            type: '',
            parts: [],
            rails: []
        };

        this.railcartParts = ['bottom', 'cart', 'mid', 'top'];
        
        this.fallbackImages = {
            plants: FALLBACK_IMAGES?.plants || 'Assets/Plants/error.webp',
            zombies: `${this.imagePaths.ZOMBIES}error.webp`,
            gravestones: FALLBACK_IMAGES?.gravestones || 'Assets/Zombies/error.webp',
            sliders: FALLBACK_IMAGES?.sliders || 'Assets/Zombies/error.webp',
            potions: FALLBACK_IMAGES?.potions || 'Assets/Zombies/error.webp',
            others: 'Assets/Others/error.webp',
            molds: FALLBACK_IMAGES?.molds || 'Assets/Zombies/error.webp'
        };
        
        this.loadElementData();
        
        this.lawnDialog = null;
        this.lawnDialogBackdrop = null;
    }


    // ─────────────────────────────────────────────────────────────────────────
    // CARGA DE DATOS
    // ─────────────────────────────────────────────────────────────────────────

    async loadElementData() {
        try {
            if (PLANTS && Array.isArray(PLANTS)) {
                this.availableElements.plants = PLANTS.map(plant => ({
                    alias_type: plant,
                    name: plant,
                    type: 'plant',
                    imageUrl: this.getPlantImageUrl(plant)
                }));
            } else {
                this.availableElements.plants = this.loadDefaultPlants();
            }
            
            if (GRAVESTONES && Array.isArray(GRAVESTONES)) {
                this.availableElements.gravestones = GRAVESTONES.map(grave => ({
                    alias_type: grave,
                    name: this.formatGravestoneName(grave),
                    type: 'gravestone',
                    imageUrl: this.getGravestoneImageUrl(grave)
                }));
            } else {
                this.availableElements.gravestones = this.loadDefaultGravestones();
            }

            if (SLIDERS && Array.isArray(SLIDERS)) {
                this.availableElements.sliders = SLIDERS.map(slider => ({
                    alias_type: slider,
                    name: slider,
                    type: 'slider',
                    imageUrl: this.getSliderImageUrl(slider)
                }));
            } else {
                this.availableElements.sliders = this.loadDefaultSliders();
            }

            if (POTIONS && Array.isArray(POTIONS)) {
                this.availableElements.potions = POTIONS.map(potion => ({
                    alias_type: potion,
                    name: this.formatPotionName(potion),
                    type: 'potion',
                    imageUrl: this.getPotionImageUrl(potion)
                }));
            } else {
                this.availableElements.potions = this.loadDefaultPotions();
            }

            if (OTHERS && Array.isArray(OTHERS)) {
                this.availableElements.others = OTHERS.map(item => ({
                    alias_type: item,
                    name: this.formatOtherName(item),
                    type: 'other',
                    imageUrl: this.getOtherImageUrl(item)
                }));
            } else {
                this.availableElements.others = this.loadDefaultOthers();
            }

            if (MOLDS && Array.isArray(MOLDS)) {
                this.availableElements.molds = MOLDS.map(mold => ({
                    alias_type: mold,
                    name: this.formatMoldName(mold),
                    type: 'mold',
                    imageUrl: this.getMoldImageUrl(mold)
                }));
            } else {
                this.availableElements.molds = this.loadDefaultMolds();
            }

            if (RAILCARTS && Array.isArray(RAILCARTS)) {
                this.availableElements.railcarts = RAILCARTS.map(railcart => ({
                    alias_type: railcart,
                    name: this.formatRailcartName(railcart),
                    type: 'railcart',
                    imageUrl: this.getRailcartImageUrl(railcart, false)
                }));
            } else {
                this.availableElements.railcarts = this.loadDefaultRailcarts();
            }

            if (window.levelGenerator && window.levelGenerator.zombieData) {
                this.availableElements.zombies = window.levelGenerator.zombieData.map(zombie => ({
                    alias_type: zombie.alias_type,
                    name: zombie.alias_type,
                    type: 'zombie',
                    imageUrl: this.getZombieImageUrl(zombie.alias_type)
                }));
            } else {
                this.availableElements.zombies = this.loadDefaultZombies();
            }

        } catch (error) {
            console.error('❌ Error cargando datos de elementos:', error);
            this.loadDefaultElements();
        }
    }


    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS DE NOMBRES / IMÁGENES
    // ─────────────────────────────────────────────────────────────────────────

    getPartIcon(part) {
        const icons = { 'bottom': '⬇', 'cart': '', 'mid': '', 'top': '' };
        return icons[part] || '';
    }

    loadDefaultElements() {
        this.availableElements.plants     = this.loadDefaultPlants();
        this.availableElements.zombies    = this.loadDefaultZombies();
        this.availableElements.gravestones = this.loadDefaultGravestones();
        this.availableElements.sliders    = this.loadDefaultSliders();
        this.availableElements.potions    = this.loadDefaultPotions();
    }

    loadDefaultRailcarts() {
        return [
            { alias_type: 'railcart_cowboy', name: 'Vagón del Oeste',    type: 'railcart', imageUrl: this.getRailcartImageUrl('railcart_cowboy', false) },
            { alias_type: 'railcart_future', name: 'Vagón futurista',    type: 'railcart', imageUrl: this.getRailcartImageUrl('railcart_future', false) }
        ];
    }
    loadDefaultPlants() {
        return [
            { alias_type: 'sunflower',   name: 'Girasol',          type: 'plant', imageUrl: this.getPlantImageUrl('sunflower') },
            { alias_type: 'peashooter',  name: 'Lanzaguisantes',   type: 'plant', imageUrl: this.getPlantImageUrl('peashooter') },
            { alias_type: 'wallnut',     name: 'Nuez',             type: 'plant', imageUrl: this.getPlantImageUrl('wallnut') }
        ];
    }
    loadDefaultZombies() {
        return [
            { alias_type: 'zombie',    name: 'Zombie Normal', type: 'zombie', imageUrl: this.getZombieImageUrl('zombie') },
            { alias_type: 'conehead',  name: 'Zombie Cono',   type: 'zombie', imageUrl: this.getZombieImageUrl('conehead') }
        ];
    }
    loadDefaultGravestones() {
        return [{ alias_type: 'gravestone_normal', name: 'Lápida Normal', type: 'gravestone', imageUrl: this.getGravestoneImageUrl('gravestone_normal') }];
    }
    loadDefaultSliders() {
        return [
            { alias_type: 'slider_up',   name: 'Slider Arriba', type: 'slider', imageUrl: this.getSliderImageUrl('slider_up') },
            { alias_type: 'slider_down', name: 'Slider Abajo',  type: 'slider', imageUrl: this.getSliderImageUrl('slider_down') }
        ];
    }
    loadDefaultPotions() {
        return [{ alias_type: 'zombiepotion_speed', name: 'Poción de Velocidad', type: 'potion', imageUrl: this.getPotionImageUrl('zombiepotion_speed') }];
    }
    loadDefaultMolds() {
        return [
            { alias_type: 'mold',          name: 'Mohó Básico',    type: 'mold', imageUrl: this.getMoldImageUrl('mold') },
            { alias_type: 'mold_advanced', name: 'Mohó Avanzado',  type: 'mold', imageUrl: this.getMoldImageUrl('mold') }
        ];
    }
    loadDefaultOthers() {
        return [
            { alias_type: 'goldtile',  name: 'Baldosa Dorada', type: 'other', imageUrl: this.getOtherImageUrl('goldtile') },
            { alias_type: 'spiketrap', name: 'Trampa de Púas', type: 'other', imageUrl: this.getOtherImageUrl('spiketrap') },
            { alias_type: 'spikeweed', name: 'Hierba Pincho',  type: 'other', imageUrl: this.getOtherImageUrl('spikeweed') }
        ];
    }

    formatPartName(part) {
        const names = { 'bottom': 'Parte inferior', 'cart': 'Carro/Vagón', 'mid': 'Parte media', 'top': 'Parte superior' };
        return names[part] || part;
    }
    formatRailcartName(railcartId) {
        if (RAILCART_DISPLAY_NAMES && RAILCART_DISPLAY_NAMES[railcartId]) return RAILCART_DISPLAY_NAMES[railcartId];
        return railcartId.replace('railcart_', 'Vagón ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    formatMoldName(moldId) {
        return moldId.replace('mold_', 'Mohó ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    formatGravestoneName(graveId) {
        if (GRAVESTONE_DISPLAY_NAMES && GRAVESTONE_DISPLAY_NAMES[graveId]) return GRAVESTONE_DISPLAY_NAMES[graveId];
        return graveId.replace('gravestone_', 'Lápida ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    formatPotionName(potionId) {
        return potionId.replace('zombiepotion_', 'Poción ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    formatOtherName(itemId) {
        return itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    getRailcartImageUrl(railcartType, isRail = false) {
        if (!railcartType) return 'Assets/Railcarts/railcart_cowboy/cart.webp';
        return `Assets/Railcarts/${railcartType}/${isRail ? 'rail' : 'cart'}.webp`;
    }
    getMoldImageUrl(itemName) {
        if (!itemName) return this.fallbackImages.molds;
        return `${this.imagePaths.MOLDS}${itemName.toLowerCase().replace(/\s+/g, '')}.webp`;
    }
    getOtherImageUrl(itemName) {
        if (!itemName) return this.fallbackImages.others;
        return `${this.imagePaths.OTHERS}${itemName.toLowerCase().replace(/\s+/g, '')}.webp`;
    }
    getPlantImageUrl(plantName) {
        if (!plantName) return this.fallbackImages.plants;
        return `${this.imagePaths.PLANTS}${plantName.toLowerCase().replace(/\s+/g, '')}.webp`;
    }
    getZombieImageUrl(zombieName) {
        if (!zombieName) return this.fallbackImages.zombies;
        return `${this.imagePaths.ZOMBIES}${zombieName.toLowerCase().replace(/\s+/g, '')}.webp`;
    }
    getGravestoneImageUrl(gravestoneName) {
        if (!gravestoneName) return this.fallbackImages.gravestones;
        return `${this.imagePaths.GRAVESTONES}${gravestoneName.toLowerCase().replace(/\s+/g, '')}.webp`;
    }
    getSliderImageUrl(sliderName) {
        if (!sliderName) return this.fallbackImages.sliders;
        return `${this.imagePaths.SLIDERS}${sliderName.toLowerCase().replace(/\s+/g, '')}.webp`;
    }
    getPotionImageUrl(potionName) {
        if (!potionName) return this.fallbackImages.potions;
        return `${this.imagePaths.POTIONS}${potionName.toLowerCase().replace(/\s+/g, '')}.webp`;
    }
    getElementImageUrl(element, type) {
        if (!element) return this.fallbackImages.plants;
        if (element.imageUrl) return element.imageUrl;
        switch(type) {
            case 'plant':      return this.getPlantImageUrl(element.name);
            case 'zombie':     return this.getZombieImageUrl(element.name);
            case 'gravestone': return this.getGravestoneImageUrl(element.name);
            case 'slider':     return this.getSliderImageUrl(element.name);
            case 'potion':     return this.getPotionImageUrl(element.name);
            case 'mold':       return this.getMoldImageUrl(element.name);
            default:           return this.fallbackImages.plants;
        }
    }
    getFallbackImageByType(type) {
        const typeMap = { 'plant': 'plants', 'zombie': 'zombies', 'gravestone': 'gravestones', 'slider': 'sliders', 'potion': 'potions', 'mold': 'molds' };
        return this.fallbackImages[typeMap[type] || 'plants'];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INICIALIZACIÓN DEL TABLERO
    // ─────────────────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER DEL TABLERO
    // ─────────────────────────────────────────────────────────────────────────

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

                // ── Railcart parts ──
                const partsInCell = this.railcartElements.parts.filter(
                    part => parseInt(part.Row) === row && parseInt(part.Column) === col
                );
                
                partsInCell.forEach(part => {
                    const partDiv = document.createElement('div');
                    if (part.Part === 'cart') {
                        partDiv.className = 'cell-element railcart-element';
                        partDiv.title = `${this.formatRailcartName(this.railcartElements.type)} - Vagón`;
                        partDiv.innerHTML = `
                            <img src="${this.getRailcartPartImageUrl(this.railcartElements.type, 'cart')}" alt="Vagón" 
                                 class="cell-thumbnail railcart-thumbnail"
                                 onerror="this.onerror=null; this.src='Assets/Railcarts/${this.railcartElements.type}/cart.webp';">
                        `;
                    } else {
                        partDiv.className = `cell-element rail-element part-${part.Part}`;
                        partDiv.title = `Riel - ${this.formatPartName(part.Part)}`;
                        partDiv.innerHTML = `
                            <img src="${this.getRailcartPartImageUrl(this.railcartElements.type, part.Part)}" alt="${part.Part}" 
                                 class="cell-thumbnail rail-thumbnail"
                                 onerror="this.onerror=null; this.src='Assets/Railcarts/${this.railcartElements.type}/${part.Part}.webp';">
                           `;
                    }
                    cellContent.appendChild(partDiv);
                });

                // Rieles de rango
                this.railcartElements.rails.forEach(rail => {
                    if (parseInt(rail.Column) === col && row >= parseInt(rail.RowStart) && row <= parseInt(rail.RowEnd)) {
                        if (partsInCell.length === 0) {
                            const railDiv = document.createElement('div');
                            railDiv.className = 'cell-element rail-track';
                            railDiv.title = 'Riel de tren';
                            railDiv.innerHTML = `<div class="rail-track-icon">─</div>`;
                            cellContent.appendChild(railDiv);
                        }
                    }
                });

                const elements = this.board[row][col];

                // ── Others ──
                elements.others.forEach(otherItem => {
                    const div = document.createElement('div');
                    div.className = 'cell-element other-element';
                    div.title = `Otro: ${otherItem.name}`;
                    div.innerHTML = `<img src="${otherItem.imageUrl || this.getOtherImageUrl(otherItem.name)}" alt="${otherItem.name}" class="cell-thumbnail other-thumbnail" onerror="this.onerror=null; this.src='${this.fallbackImages.others}'">`;
                    cellContent.appendChild(div);
                });

                // ── Sliders ──
                elements.sliders.forEach(slider => {
                    const div = document.createElement('div');
                    div.className = 'cell-element slider-element';
                    div.title = `Slider: ${slider.name}`;
                    div.innerHTML = `<img src="${slider.imageUrl || this.getSliderImageUrl(slider.name)}" alt="${slider.name}" class="cell-thumbnail slider-thumbnail" onerror="this.onerror=null; this.src='${this.fallbackImages.sliders}'">`;
                    cellContent.appendChild(div);
                });

                // ── Potions ──
                elements.potions.forEach(potion => {
                    const div = document.createElement('div');
                    div.className = 'cell-element potion-element';
                    div.title = `Poción: ${potion.name}`;
                    div.innerHTML = `<img src="${potion.imageUrl || this.getPotionImageUrl(potion.name)}" alt="${potion.name}" class="cell-thumbnail potion-thumbnail" onerror="this.onerror=null; this.src='${this.fallbackImages.potions}'">`;
                    cellContent.appendChild(div);
                });

                // ── Molds ──
                elements.molds.forEach(mold => {
                    const div = document.createElement('div');
                    div.className = 'cell-element mold-element';
                    div.title = `Mohó: ${mold.name}`;
                    div.innerHTML = `<img src="${mold.imageUrl || this.getMoldImageUrl(mold.name)}" alt="${mold.name}" class="cell-thumbnail mold-thumbnail" onerror="this.onerror=null; this.src='${this.fallbackImages.others}'">`;
                    cellContent.appendChild(div);
                });

                // ── Defeat layer ──
                if (elements.plants.length > 0 && elements.plants[0].defeat) {
                    const defeatLayer = document.createElement('div');
                    defeatLayer.className = 'condition-layer defeat-layer';
                    defeatLayer.innerHTML = `<img src="Assets/Condiciones/defeat-plant.webp" alt="Planta en peligro" class="condition-image defeat-tile" onerror="this.style.display='none'">`;
                    cellContent.appendChild(defeatLayer);
                }

                // ── Plants ──
                elements.plants.forEach(plant => {
                    const div = document.createElement('div');
                    div.className = 'cell-element plant-element';
                    div.title = this.getPlantTitle(plant);
                    div.innerHTML = `
                        <img src="${plant.imageUrl || this.getPlantImageUrl(plant.name)}" alt="${plant.name}" class="cell-thumbnail" onerror="this.onerror=null; this.src='${this.fallbackImages.plants}'">
                        ${this.getPlantModifiersHtml(plant)}`;
                    cellContent.appendChild(div);
                    if (plant.frozen) {
                        const ice = document.createElement('div');
                        ice.className = 'condition-layer ice-layer ice-plant-layer';
                        ice.innerHTML = `<img src="Assets/Condiciones/ice-plant.webp" alt="Planta congelada" class="condition-image ice-overlay" onerror="this.style.display='none'">`;
                        cellContent.appendChild(ice);
                    }
                });

                // ── Zombies ──
                elements.zombies.forEach(zombie => {
                    const div = document.createElement('div');
                    div.className = 'cell-element zombie-element';
                    div.title = this.getZombieTitle(zombie);
                    div.innerHTML = `
                        <img src="${zombie.imageUrl || this.getZombieImageUrl(zombie.name)}" alt="${zombie.name}" class="cell-thumbnail" onerror="this.onerror=null; this.src='${this.fallbackImages.zombies}'">
                        ${this.getZombieModifiersHtml(zombie)}`;
                    cellContent.appendChild(div);
                    if (zombie.frozen) {
                        const ice = document.createElement('div');
                        ice.className = 'condition-layer ice-layer ice-zombie-layer';
                        ice.innerHTML = `<img src="Assets/Condiciones/ice-zombie.webp" alt="Zombie congelado" class="condition-image ice-overlay" onerror="this.style.display='none'">`;
                        cellContent.appendChild(ice);
                    }
                });

                // ── Gravestones ──
                elements.gravestones.forEach(grave => {
                    const div = document.createElement('div');
                    div.className = 'cell-element gravestone-element';
                    div.title = `Lápida: ${grave.name}`;
                    div.innerHTML = `<img src="${grave.imageUrl || this.getGravestoneImageUrl(grave.name)}" alt="${grave.name}" class="cell-thumbnail" onerror="this.onerror=null; this.src='${this.fallbackImages.gravestones}'">`;
                    cellContent.appendChild(div);
                });

                // Indicador de múltiples objetos (incluye railcart parts)
                const totalObjects = elements.plants.length + elements.zombies.length +
                    elements.gravestones.length + elements.sliders.length +
                    elements.potions.length + elements.others.length +
                    elements.molds.length + partsInCell.length;

                if (totalObjects > 1) {
                    const badge = document.createElement('div');
                    badge.className = 'multi-object-badge';
                    badge.textContent = totalObjects;
                    badge.title = `${totalObjects} objetos en esta celda`;
                    cellContent.appendChild(badge);
                }

                td.appendChild(cellContent);
                td.addEventListener('click', (e) => this.handleCellClick(row, col, e));
                tr.appendChild(td);
            }
            
            boardElement.appendChild(tr);
        }
    }


    // ─────────────────────────────────────────────────────────────────────────
    // TÍTULOS Y MODIFICADORES VISUALES
    // ─────────────────────────────────────────────────────────────────────────

    getPlantTitle(plant) {
        let t = `Planta: ${plant.name}`;
        if (plant.plantLevel > 0) t += ` (Nivel ${plant.plantLevel})`;
        if (plant.frozen) t += ' ❄️ Congelada';
        if (plant.defeat) t += ' 🛡️ En Peligro';
        return t;
    }
    getZombieTitle(zombie) {
        let t = `Zombie: ${zombie.name}`;
        if (zombie.frozen) t += ' ❄️ Congelado';
        return t;
    }
    getPlantModifiersHtml(plant) {
        return plant.plantLevel > 0 ? `<span class="cell-modifier level">L${plant.plantLevel}</span>` : '';
    }
    getZombieModifiersHtml(zombie) {
        return zombie.frozen ? '<span class="cell-modifier">❄️</span>' : '';
    }


    // ─────────────────────────────────────────────────────────────────────────
    // CLICK EN CELDA  ←  PUNTO DE ENTRADA PRINCIPAL
    // ─────────────────────────────────────────────────────────────────────────

    handleCellClick(row, col, event) {
        event.stopPropagation();
        this.selectedCell = { row, col };

        // *** COMPORTAMIENTO PRINCIPAL: Si hay datos copiados Y la celda está vacía, pegar automáticamente ***
        if (this._copiedCellData && !this.cellHasAnyObject(row, col) && !this.hasRailcartPartAtCell(row, col)) {
            this.pasteCellDataAuto(row, col);
            return;
        }

        const railcartPart = this.getRailcartPartAtCell(row, col);
        const hasObjects = this.cellHasAnyObject(row, col);

        // Siempre mostrar el diálogo de resumen si hay objetos (incluyendo railcarts)
        if (hasObjects || railcartPart) {
            this.openCellOverviewDialog(row, col);
        } else {
            this.openAddElementSelectionDialog(row, col);
        }

        this.updateCellInfo();
        this.renderBoard();
    }

    cellHasAnyObject(row, col) {
        const e = this.board[row][col];
        return e.plants.length > 0 || e.zombies.length > 0 || e.gravestones.length > 0 ||
               e.sliders.length > 0 || e.potions.length > 0 || e.others.length > 0 ||
               e.molds.length > 0 || e.railcarts.length > 0;
    }

    hasRailcartPartAtCell(row, col) {
        return this.railcartElements.parts.some(
            part => parseInt(part.Row) === row && parseInt(part.Column) === col
        );
    }


    // ─────────────────────────────────────────────────────────────────────────
    // COPIAR / PEGAR CELDA COMPLETA (AHORA INCLUYE RAILCARTS)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Copia todos los objetos de una celda Y las partes de railcart en esa celda
     */
    copyCellData(row, col) {
        const cellData = this.board[row][col];
        
        // Copiar objetos normales del board
        this._copiedCellData = {
            boardObjects: {
                plants: cellData.plants.map(el => JSON.parse(JSON.stringify(el))),
                zombies: cellData.zombies.map(el => JSON.parse(JSON.stringify(el))),
                gravestones: cellData.gravestones.map(el => JSON.parse(JSON.stringify(el))),
                sliders: cellData.sliders.map(el => JSON.parse(JSON.stringify(el))),
                potions: cellData.potions.map(el => JSON.parse(JSON.stringify(el))),
                others: cellData.others.map(el => JSON.parse(JSON.stringify(el))),
                molds: cellData.molds.map(el => JSON.parse(JSON.stringify(el))),
                railcarts: cellData.railcarts.map(el => JSON.parse(JSON.stringify(el)))
            },
            // *** NUEVO: Copiar partes de railcart en esta celda ***
            railcartParts: this.railcartElements.parts
                .filter(part => parseInt(part.Row) === row && parseInt(part.Column) === col)
                .map(part => JSON.parse(JSON.stringify(part))),
            railcartType: this.railcartElements.type,
            // También copiar rieles relacionados
            railcartRails: this.railcartElements.rails.map(rail => JSON.parse(JSON.stringify(rail)))
        };

        const boardObjCount = Object.values(this._copiedCellData.boardObjects).reduce((sum, arr) => sum + arr.length, 0);
        const railcartCount = this._copiedCellData.railcartParts.length;
        const totalObjects = boardObjCount + railcartCount;
        
        this.showToast('📋 Celda copiada', `${totalObjects} objeto(s) copiado(s) de (${row}, ${col}). Haz clic en una celda vacía para pegar.`, 'info');
    }

    /**
     * Pega automáticamente al hacer clic en celda vacía (NO abre modal, pega una sola vez)
     */
    /**
 * Pega automáticamente al hacer clic en celda vacía (NO abre modal, pega una sola vez)
 */
pasteCellDataAuto(row, col) {
    if (!this._copiedCellData) return;

    // Limpiar la celda destino primero
    this.clearCell(row, col);
    
    const targetCell = this.board[row][col];
    const copyData = this._copiedCellData;
    
    // Pegar objetos normales del board
    Object.keys(copyData.boardObjects).forEach(key => {
        copyData.boardObjects[key].forEach(el => {
            targetCell[key].push(JSON.parse(JSON.stringify(el)));
        });
    });

    // Pegar partes de railcart en la nueva ubicación
    if (copyData.railcartParts && copyData.railcartParts.length > 0) {
        if (copyData.railcartType) {
            this.railcartElements.type = copyData.railcartType;
        }
        
        copyData.railcartParts.forEach(part => {
            this.railcartElements.parts.push({
                Part: part.Part,
                Column: col.toString(),
                Row: row.toString()
            });
        });

        if (copyData.railcartRails && copyData.railcartRails.length > 0) {
            const existingRailCol = this.railcartElements.rails.find(r => parseInt(r.Column) === col);
            if (!existingRailCol) {
                const railToCopy = copyData.railcartRails[0];
                this.railcartElements.rails.push({
                    Column: col.toString(),
                    RowStart: railToCopy.RowStart,
                    RowEnd: railToCopy.RowEnd
                });
            }
        }
    }

    const boardObjCount = Object.values(copyData.boardObjects).reduce((sum, arr) => sum + arr.length, 0);
    const railcartCount = copyData.railcartParts ? copyData.railcartParts.length : 0;
    const totalObjects = boardObjCount + railcartCount;

    this.updateBoardModules();
    this.renderBoard();
    this.updatePreview();
    this.updateCellInfo();
    this.showToast('✅ Celda pegada', `${totalObjects} objeto(s) pegado(s) en (${row}, ${col})`, 'success');
    
    // Limpiar la copia para que solo se pegue UNA vez
    this._copiedCellData = null;
    
    // *** ELIMINADO: Ya no abre la modal después de pegar ***
    // this.openCellOverviewDialog(row, col);
}

    /**
     * Pega usando el botón (para compatibilidad)
     */
    pasteCellData(row, col) {
        if (!this._copiedCellData) {
            this.showToast('Sin datos', 'Primero copia una celda con "📋 Copiar toda la celda"', 'warning');
            return;
        }
        this.pasteCellDataAuto(row, col);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // DIÁLOGO DE RESUMEN MULTI-OBJETO (INCLUYE RAILCARTS)
    // ─────────────────────────────────────────────────────────────────────────

    openCellOverviewDialog(row, col) {
        if (this.lawnDialog) this.closeDialog();
        this.createCellOverviewDialog(row, col);
    }

    createCellOverviewDialog(row, col) {
    this.lawnDialogBackdrop = document.createElement('div');
    this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';

    this.lawnDialog = document.createElement('div');
    this.lawnDialog.className = 'lawn-dialog cell-overview-dialog';

    const elements = this.board[row][col];

    const typeLabels = {
        plants:     { label: 'Planta',    icon: '' },
        zombies:    { label: 'Zombie',     icon: '' },
        gravestones:{ label: 'Lápida',     icon: '' },
        sliders:    { label: 'Slider',     icon: '' },
        potions:    { label: 'Poción',     icon: '' },
        others:     { label: 'Otro',       icon: '' },
        molds:      { label: 'Mohó',       icon: '' }
    };

    let objectsHtml = '';
    let totalCount = 0;

    // Objetos normales del board
    Object.entries(typeLabels).forEach(([key, meta]) => {
        elements[key].forEach((el, idx) => {
            totalCount++;
            const imageUrl = el.imageUrl || this.getFallbackImageByType(meta.label.toLowerCase());
            const fallback  = this.getFallbackImageByType(key.replace(/s$/, ''));

            let badges = '';
            if (el.frozen) badges += '<span class="overview-badge frozen">❄️</span>';
            if (el.defeat) badges += '<span class="overview-badge defeat">🛡️</span>';
            if (el.plantLevel > 0) badges += `<span class="overview-badge level">L${el.plantLevel}</span>`;

            objectsHtml += `
                <div class="overview-object-card" data-type="${key}" data-index="${idx}">
                    <div class="overview-obj-img">
                        <img src="${imageUrl}" alt="${el.name}"
                             onerror="this.onerror=null;this.src='${fallback}'">
                    </div>
                    <div class="overview-obj-info">
                        <span class="overview-obj-icon">${meta.icon}</span>
                        <span class="overview-obj-label">${meta.label}</span>
                        <span class="overview-obj-name">${el.name}</span>
                        <div class="overview-badges">${badges}</div>
                    </div>
                    <div class="overview-obj-actions">
                        <button class="ov-btn-delete" data-type="${key}" data-index="${idx}" title="Eliminar">🗑️</button>
                    </div>
                </div>`;
        });
    });

    // Mostrar partes de railcart en esta celda
    const railcartPartsInCell = this.railcartElements.parts.filter(
        part => parseInt(part.Row) === row && parseInt(part.Column) === col
    );

    railcartPartsInCell.forEach((part, idx) => {
        totalCount++;
        const partName = this.formatPartName(part.Part);
        const railcartName = this.formatRailcartName(this.railcartElements.type);
        const imageUrl = this.getRailcartPartImageUrl(this.railcartElements.type, part.Part);
        const icon = this.getPartIcon(part.Part);

        objectsHtml += `
            <div class="overview-object-card railcart-part-card" data-railcart-part="${part.Part}" data-railcart-index="${idx}">
                <div class="overview-obj-img">
                    <img src="${imageUrl}" alt="${partName}"
                         onerror="this.onerror=null;this.src='Assets/Railcarts/${this.railcartElements.type}/${part.Part}.webp'">
                </div>
                <div class="overview-obj-info">
                    <span class="overview-obj-label">Vagón</span>
                    <span class="overview-obj-name"> ${partName}</span>
                    <div class="overview-badges">
                        <span class="overview-badge railcart">${icon}</span>
                    </div>
                </div>
                <div class="overview-obj-actions">
                    <button class="ov-btn-delete-railcart" data-railcart-part="${part.Part}" data-row="${row}" data-col="${col}" title="Eliminar parte">🗑️</button>
                </div>
            </div>`;
    });

    this.lawnDialog.innerHTML = `
        <div class="lawn-dialog-content">
            <header class="dialog-header">
                <h3>Celda (${row}, ${col}) — ${totalCount} objeto${totalCount !== 1 ? 's' : ''}</h3>
                <button class="close-btn" aria-label="Cerrar">✕</button>
            </header>
            <section class="dialog-body">
                <div class="overview-objects-list">
                    ${objectsHtml || '<p class="no-objects-msg">Esta celda está vacía.</p>'}
                </div>
            </section>
            <footer class="dialog-footer">
                <div class="footer-actions-row">
                    <button class="btn-copy-cell">🟰 Copiar toda la celda</button>
                    <button class="btn-add-another">➕ Agregar otro objeto</button>
                </div>
                <button class="btn-clear-cell btn-danger-outline">🗑️ Limpiar celda</button>
            </footer>
        </div>`;

    this.lawnDialogBackdrop.appendChild(this.lawnDialog);
    document.body.appendChild(this.lawnDialogBackdrop);

    this.setupCellOverviewListeners(row, col);
}

setupCellOverviewListeners(row, col) {
    const dlg = this.lawnDialog;

    dlg.querySelector('.close-btn').addEventListener('click', () => this.closeDialog());

    this.lawnDialogBackdrop.addEventListener('click', (e) => {
        if (e.target === this.lawnDialogBackdrop) this.closeDialog();
    });

    // Botón para copiar TODA la celda
    const btnCopyCell = dlg.querySelector('.btn-copy-cell');
    if (btnCopyCell) {
        btnCopyCell.addEventListener('click', () => {
            this.copyCellData(row, col);
            this.closeDialog();
        });
    }

    // Botón añadir otro objeto
    dlg.querySelector('.btn-add-another').addEventListener('click', () => {
        this.closeDialog();
        this.openAddElementSelectionDialog(row, col);
    });

    // Botón limpiar celda
    dlg.querySelector('.btn-clear-cell').addEventListener('click', () => {
        // Limpiar sin preguntar
        this.clearCell(row, col);
        this.closeDialog();  // Cerrar el modal automáticamente
    });

    // *** NUEVO: Hacer clic en la tarjeta completa para editar (excepto botones) ***
    dlg.querySelectorAll('.overview-object-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // No hacer nada si se hizo clic en un botón
            if (e.target.closest('button')) return;
            
            // Si es una parte de railcart
            if (card.classList.contains('railcart-part-card')) {
                const part = card.dataset.railcartPart;
                const r = parseInt(card.querySelector('.ov-btn-delete-railcart')?.dataset.row || row);
                const c = parseInt(card.querySelector('.ov-btn-delete-railcart')?.dataset.col || col);
                this.closeDialog();
                this.openRailcartPartEditDialog(r, c, { 
                    type: 'railcartPart', 
                    part: part, 
                    data: { Row: r, Column: c, Part: part } 
                });
            } else {
                // Es un objeto normal
                const type = card.dataset.type;
                const index = parseInt(card.dataset.index);
                const el = this.board[row][col][type][index];
                this.closeDialog();
                const singularType = type.replace(/s$/, '');
                this.openElementEditDialog(row, col, {
                    type: singularType,
                    element: el,
                    data: { row, col, elementType: type, index }
                });
            }
        });
        
        // Agregar estilo de cursor pointer para indicar que es clicable
        card.style.cursor = 'pointer';
    });

    // Botones eliminar objetos normales
    dlg.querySelectorAll('.ov-btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el clic se propague a la tarjeta
            const type  = btn.dataset.type;
            const index = parseInt(btn.dataset.index);
            const el    = this.board[row][col][type][index];
            this.board[row][col][type].splice(index, 1);
            this.updateBoardModules();
            this.renderBoard();
            this.updatePreview();
            this.showToast('Eliminado', `${el.name} eliminado de (${row}, ${col})`, 'success');
            this.closeDialog();
            if (this.cellHasAnyObject(row, col) || this.hasRailcartPartAtCell(row, col)) {
                this.openCellOverviewDialog(row, col);
            }
        });
    });

    // Botones eliminar partes de railcart - SIN CONFIRMACIÓN
    dlg.querySelectorAll('.ov-btn-delete-railcart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que el clic se propague a la tarjeta
            const part = btn.dataset.railcartPart;
            const r = parseInt(btn.dataset.row);
            const c = parseInt(btn.dataset.col);
            
            // Eliminar directamente sin preguntar
            this.deleteRailcartPart(r, c, part);
            this.closeDialog();
            
            // Si quedan objetos, reabrir el modal
            if (this.cellHasAnyObject(r, c) || this.hasRailcartPartAtCell(r, c)) {
                this.openCellOverviewDialog(r, c);
            }
        });
    });
}


    // ─────────────────────────────────────────────────────────────────────────
    // RAILCART – helpers
    // ─────────────────────────────────────────────────────────────────────────

    getRailcartPartAtCell(row, col) {
        for (const part of this.railcartElements.parts) {
            if (parseInt(part.Row) === row && parseInt(part.Column) === col) {
                return { type: 'railcartPart', part: part.Part, data: part };
            }
        }
        return null;
    }

deleteRailcartPart(row, col, partName) {
    const index = this.railcartElements.parts.findIndex(p =>
        parseInt(p.Row) === row && parseInt(p.Column) === col && p.Part === partName
    );
    if (index >= 0) {
        this.railcartElements.parts.splice(index, 1);
        if (partName === 'cart') {
            const colToClean = this.railcartElements.parts.filter(p => p.Part === 'cart').map(p => parseInt(p.Column));
            this.railcartElements.rails = this.railcartElements.rails.filter(rail => colToClean.includes(parseInt(rail.Column)));
        }
        this.renderBoard();
        this.updatePreview();
        this.showToast('Parte eliminada', `${this.formatPartName(partName)} eliminada de (${row}, ${col})`, 'success');
        
        // Cerrar el modal automáticamente
        this.closeDialog();
        
        // Verificar si la celda quedó vacía o aún tiene objetos
        if (this.cellHasAnyObject(row, col) || this.hasRailcartPartAtCell(row, col)) {
            this.openCellOverviewDialog(row, col);
        }
        
        return true;
    }
    return false;
}

    openRailcartPartEditDialog(row, col, partInfo) {
        if (this.lawnDialog) this.closeDialog();
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
                        <button class="action-btn delete-btn" data-action="delete">
                            <span class="action-icon">🗑️</span>
                            <span class="action-text">Eliminar ${isCart ? 'Vagón' : 'Riel'}</span>
                        </button>
                        ${isCart ? `
                        <button class="action-btn add-rail-btn" data-action="add-rail">
                            <span class="action-icon">➕</span>
                            <span class="action-text">Añadir Riel en esta columna</span>
                        </button>` : ''}
                        <button class="action-btn add-object-btn" data-action="add-object">
                            <span class="action-icon">➕</span>
                            <span class="action-text">Agregar otro objeto</span>
                        </button>
                    </div>
                </section>
                <footer class="dialog-footer">
                    <div class="button-group">
                        <button class="btn-back-overview">← Ver celda</button>
                    </div>
                </footer>
            </div>`;

        this.lawnDialogBackdrop.appendChild(this.lawnDialog);
        document.body.appendChild(this.lawnDialogBackdrop);
        this.setupRailcartPartEditDialogListeners(row, col, partInfo);
    }

    setupRailcartPartEditDialogListeners(row, col, partInfo) {
        this.lawnDialog.querySelector('.close-btn').addEventListener('click', () => this.closeDialog());
        
        const backBtn = this.lawnDialog.querySelector('.btn-back-overview');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.closeDialog();
                this.openCellOverviewDialog(row, col);
            });
        }

        this.lawnDialog.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleRailcartPartAction(btn.dataset.action, row, col, partInfo));
        });
    }

handleRailcartPartAction(action, row, col, partInfo) {
    switch(action) {
        case 'delete':
            // Eliminar directamente sin confirmación
            this.deleteRailcartPart(row, col, partInfo.part);
            // Ya no necesitamos closeDialog() aquí porque deleteRailcartPart ya lo hace
            break;
        case 'add-rail':
            this.addDefaultRails(col);
            this.closeDialog();
            this.showToast('Riel añadido', `Riel añadido en la columna ${col}`, 'success');
            break;
        case 'add-object':
            this.closeDialog();
            this.openAddElementSelectionDialog(row, col);
            break;
    }
}


    // ─────────────────────────────────────────────────────────────────────────
    // DIÁLOGO DE SELECCIÓN DE TIPO (celda vacía)
    // ─────────────────────────────────────────────────────────────────────────

    openAddElementSelectionDialog(row, col) {
        if (this.lawnDialog) this.closeDialog();
        this.createAddElementSelectionDialog(row, col);
    }

    createAddElementSelectionDialog(row, col) {
        this.lawnDialogBackdrop = document.createElement('div');
        this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';

        this.lawnDialog = document.createElement('div');
        this.lawnDialog.className = 'lawn-dialog element-selection-dialog';

        this.lawnDialog.innerHTML = `
            <div class="lawn-dialog-content">
                <header class="dialog-header">
                    <h3>${__('emptyCell')} (${row}, ${col})</h3>
                    <button class="close-btn" aria-label="${__('close')}">✕</button>
                </header>
                <section class="dialog-body">
                    <div class="element-selection-section">
                        <p class="selection-description">${__('selectElementType')}</p>
                        <div class="element-type-cards">
                            <div class="element-type-card" data-type="plants">
                                <div class="element-type-icon"><img src="/Assets/Plants/sunflower.webp" alt=""></div>
                                <div class="element-type-name">${__('typePlants')}</div>
                                <div class="element-type-count">${this.availableElements.plants.length} ${__('available')}</div>
                            </div>
                            <div class="element-type-card" data-type="zombies">
                                <div class="element-type-icon"><img src="/Assets/Zombies/tutorial_armor4.webp" alt=""></div>
                                <div class="element-type-name">${__('typeZombies')}</div>
                                <div class="element-type-count">${this.availableElements.zombies.length} ${__('available')}</div>
                            </div>
                            <div class="element-type-card" data-type="gravestones">
                                <div class="element-type-icon"><img src="/Assets/Gravestones/gravestone_egypt.webp" alt=""></div>
                                <div class="element-type-name">${__('typeGravestones')}</div>
                                <div class="element-type-count">${this.availableElements.gravestones.length} ${__('available')}</div>
                            </div>
                            <div class="element-type-card" data-type="sliders">
                                <div class="element-type-icon"><img src="/Assets/Sliders/slider_up.webp" alt=""></div>
                                <div class="element-type-name">${__('typeSliders')}</div>
                                <div class="element-type-count">${this.availableElements.sliders.length} ${__('available')}</div>
                            </div>
                            <div class="element-type-card" data-type="potions">
                                <div class="element-type-icon"><img src="/Assets/Potions/zombiepotion_toughness.webp" alt=""></div>
                                <div class="element-type-name">${__('typePotions')}</div>
                                <div class="element-type-count">${this.availableElements.potions.length} ${__('available')}</div>
                            </div>
                            <div class="element-type-card" data-type="others">
                                <div class="element-type-icon"><img src="/Assets/Others/crater.webp" alt=""></div>
                                <div class="element-type-name">${__('typeOthers')}</div>
                                <div class="element-type-count">${this.availableElements.others.length} ${__('available')}</div>
                            </div>
                            <div class="element-type-card" data-type="molds">
                                <div class="element-type-icon"><img src="/Assets/Molds/mold.webp" alt=""></div>
                                <div class="element-type-name">${__('typeMolds')}</div>
                                <div class="element-type-count">${this.availableElements.molds.length} ${__('available')}</div>
                            </div>
                            <div class="element-type-card" data-type="railcarts">
                                <div class="element-type-icon"><img src="/Assets/Railcarts/railcart_cowboy/cart.webp" alt=""></div>
                                <div class="element-type-name">${__('typeRailcarts')}</div>
                                <div class="element-type-count">${this.availableElements.railcarts.length} ${__('styles')}</div>
                            </div>
                        </div>
                    </div>
                </section>
                <footer class="dialog-footer">
                    <small>${__('rowLabel')} ${row}, ${__('colLabel')} ${col}</small>
                </footer>
            </div>`;

        this.lawnDialogBackdrop.appendChild(this.lawnDialog);
        document.body.appendChild(this.lawnDialogBackdrop);
        this.setupAddElementSelectionDialogListeners(row, col);
    }

    setupAddElementSelectionDialogListeners(row, col) {
        this.lawnDialog.querySelector('.close-btn').addEventListener('click', () => this.closeDialog());
        this.lawnDialogBackdrop.addEventListener('click', (e) => { if (e.target === this.lawnDialogBackdrop) this.closeDialog(); });

        this.lawnDialog.querySelectorAll('.element-type-card').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                this.closeDialog();
                this.openNormalElementDialog(row, col, type, false);
            });
        });
    }


    // ─────────────────────────────────────────────────────────────────────────
    // DIÁLOGO DE EDICIÓN DE UN ELEMENTO INDIVIDUAL
    // ─────────────────────────────────────────────────────────────────────────

    openElementEditDialog(row, col, elementInfo) {
        if (this.lawnDialog) this.closeDialog();
        this.createElementEditDialog(row, col, elementInfo);
    }

    createElementEditDialog(row, col, elementInfo) {
        const { type, element, data } = elementInfo;

        this.lawnDialogBackdrop = document.createElement('div');
        this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';

        this.lawnDialog = document.createElement('div');
        this.lawnDialog.className = 'lawn-dialog element-edit-dialog';

        const typeNames = { plant: 'Planta', zombie: 'Zombie', gravestone: 'Lápida', slider: 'Slider', potion: 'Poción', other: 'Otro', mold: 'Mohó' };
        const typeName = typeNames[type] || 'Elemento';
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
                                <img src="${elementImageUrl}" alt="${element.name}" class="element-thumbnail-large"
                                     onerror="this.onerror=null; this.src='${fallbackImage}'">
                            </div>
                            <div class="element-details">
                                <h3>${element.name}</h3>
                                <div class="element-type-badge">${typeName}</div>
                                <div class="element-modifiers">${modifiersHtml}</div>
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
                            </button>` : ''}
                            ${type === 'zombie' ? `
                            <button class="action-btn toggle-btn ${element.frozen ? 'active' : ''}" data-action="toggle-freeze">
                                <span class="action-icon">❄️</span>
                                <span class="action-text">${element.frozen ? 'Descongelar' : 'Congelar'}</span>
                            </button>` : ''}
                            <button class="action-btn change-btn" data-action="change-element">
                                <span class="action-icon">🔄</span>
                                <span class="action-text">Cambiar ${typeName}</span>
                            </button>
                            <button class="action-btn add-object-btn" data-action="add-object">
                                <span class="action-icon">➕</span>
                                <span class="action-text">Agregar otro objeto</span>
                            </button>
                        </div>
                        ${type === 'plant' ? `
                        <div class="change-level-panel" style="display: none;">
                            <div class="panel-header"><h6>Seleccionar Nivel</h6></div>
                            <div class="level-options">
                                <label class="level-option"><input type="radio" name="plant-level" value="1"><span class="level-badge">Nivel 1</span></label>
                                <label class="level-option"><input type="radio" name="plant-level" value="2"><span class="level-badge">Nivel 2</span></label>
                                <label class="level-option"><input type="radio" name="plant-level" value="3"><span class="level-badge">Nivel 3</span></label>
                            </div>
                            <div class="panel-actions">
                                <button class="cancel-level-btn">Cancelar</button>
                                <button class="confirm-level-btn">Aplicar</button>
                            </div>
                        </div>` : ''}
                    </div>
                </section>
                <footer class="dialog-footer">
                    <div class="button-group">
                        <button class="btn-back-overview">← Ver celda</button>
                    </div>
                    <small>Celda: Fila ${row}, Columna ${col}</small>
                </footer>
            </div>`;

        this.lawnDialogBackdrop.appendChild(this.lawnDialog);
        document.body.appendChild(this.lawnDialogBackdrop);
        this.setupElementEditDialogListeners(row, col, elementInfo);
    }

    setupElementEditDialogListeners(row, col, elementInfo) {
        const { type, element } = elementInfo;

        this.lawnDialog.querySelector('.close-btn').addEventListener('click', () => this.closeDialog());
        this.lawnDialogBackdrop.addEventListener('click', (e) => { if (e.target === this.lawnDialogBackdrop) this.closeDialog(); });

        const backBtn = this.lawnDialog.querySelector('.btn-back-overview');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.closeDialog();
                if (this.cellHasAnyObject(row, col) || this.hasRailcartPartAtCell(row, col)) {
                    this.openCellOverviewDialog(row, col);
                }
            });
        }

        this.lawnDialog.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleElementAction(btn.dataset.action, row, col, elementInfo));
        });

        if (type === 'plant') {
            const cancelLevelBtn = this.lawnDialog.querySelector('.cancel-level-btn');
            if (cancelLevelBtn) cancelLevelBtn.addEventListener('click', () => this.hideChangeLevelPanel());

            const confirmLevelBtn = this.lawnDialog.querySelector('.confirm-level-btn');
            if (confirmLevelBtn) confirmLevelBtn.addEventListener('click', () => this.confirmLevelChange(row, col, elementInfo));

            const currentLevel = element.plantLevel || 1;
            const radioBtn = this.lawnDialog.querySelector(`input[value="${currentLevel}"]`);
            if (radioBtn) radioBtn.checked = true;
        }
    }

    handleElementAction(action, row, col, elementInfo) {
        const { type, element, data } = elementInfo;
        switch(action) {
            case 'delete':
                this.deleteElementByInfo(row, col, elementInfo);
                break;
            case 'toggle-freeze':
                this.toggleElementFreezeByInfo(row, col, elementInfo);
                break;
            case 'toggle-defeat':
                if (type === 'plant') this.togglePlantDefeatByInfo(row, col, elementInfo);
                break;
            case 'change-level':
                if (type === 'plant') this.showChangeLevelPanel();
                break;
            case 'change-element':
                this.openNormalElementDialog(row, col, data.elementType, true, elementInfo);
                break;
            case 'add-object':
                this.closeDialog();
                this.openAddElementSelectionDialog(row, col);
                break;
        }
    }

    deleteElementByInfo(row, col, elementInfo) {
        const { type, data } = elementInfo;
        const arrKey = data.elementType;
        const index  = data.index;

        if (index !== undefined) {
            this.board[row][col][arrKey].splice(index, 1);
        } else {
            this.board[row][col][arrKey] = [];
        }

        this.updateBoardModules();
        this.renderBoard();
        this.updatePreview();
        this.closeDialog();
        this.showToast('Elemento eliminado', 'El elemento ha sido removido del tablero', 'success');

        if (this.cellHasAnyObject(row, col) || this.hasRailcartPartAtCell(row, col)) {
            this.openCellOverviewDialog(row, col);
        }
    }

    toggleElementFreezeByInfo(row, col, elementInfo) {
        const { type, element, data } = elementInfo;
        const arrKey = data.elementType;
        const index  = data.index !== undefined ? data.index : 0;
        const el = this.board[row][col][arrKey][index];
        if (!el) return;
        el.frozen = !el.frozen;
        this.updateBoardModules();
        this.renderBoard();
        this.updatePreview();
        this.closeDialog();
        this.openElementEditDialog(row, col, { type, element: el, data });
        this.showToast(el.frozen ? 'Congelado' : 'Descongelado', `${el.name} actualizado`, 'info');
    }

    togglePlantDefeatByInfo(row, col, elementInfo) {
        const { type, data } = elementInfo;
        const index = data.index !== undefined ? data.index : 0;
        const plant = this.board[row][col].plants[index];
        if (!plant) return;
        plant.defeat = !plant.defeat;
        this.updateBoardModules();
        this.renderBoard();
        this.updatePreview();
        this.closeDialog();
        this.openElementEditDialog(row, col, { type, element: plant, data });
        this.showToast(plant.defeat ? 'Planta en peligro' : 'Planta segura', `${plant.name} actualizada`, plant.defeat ? 'warning' : 'info');
    }

    deleteElement(row, col, elementType) {
        this.board[row][col][elementType + 's'] = [];
        this.updateBoardModules();
        this.renderBoard();
        this.updatePreview();
        this.updateCellInfo();
        this.closeDialog();
        this.showToast('Elemento eliminado', 'El elemento ha sido removido del tablero', 'success');
    }

    toggleElementFreeze(row, col, elementType) {
        const elements = this.board[row][col][elementType + 's'];
        if (elements.length > 0) {
            elements[0].frozen = !elements[0].frozen;
            this.updateBoardModules();
            this.renderBoard();
            this.updatePreview();
            this.closeDialog();
        }
    }

    togglePlantDefeat(row, col) {
        const plant = this.board[row][col].plants[0];
        if (plant) {
            plant.defeat = !plant.defeat;
            this.updateBoardModules();
            this.renderBoard();
            this.updatePreview();
            this.closeDialog();
        }
    }

    showChangeLevelPanel() {
        const panel = this.lawnDialog.querySelector('.change-level-panel');
        const actionGrid = this.lawnDialog.querySelector('.action-buttons-grid');
        if (panel && actionGrid) { actionGrid.style.display = 'none'; panel.style.display = 'block'; }
    }
    hideChangeLevelPanel() {
        const panel = this.lawnDialog.querySelector('.change-level-panel');
        const actionGrid = this.lawnDialog.querySelector('.action-buttons-grid');
        if (panel && actionGrid) { panel.style.display = 'none'; actionGrid.style.display = 'grid'; }
    }

    confirmLevelChange(row, col, elementInfo) {
        const selectedRadio = this.lawnDialog.querySelector('input[name="plant-level"]:checked');
        if (!selectedRadio) { this.showToast('Error', 'Selecciona un nivel', 'error'); return; }
        const newLevel = parseInt(selectedRadio.value);
        const { data } = elementInfo;
        const index = data.index !== undefined ? data.index : 0;
        const plant = this.board[row][col].plants[index];
        if (plant) {
            plant.plantLevel = newLevel;
            this.updateBoardModules();
            this.renderBoard();
            this.updatePreview();
            this.closeDialog();
            this.openElementEditDialog(row, col, { type: 'plant', element: plant, data });
            this.showToast('Nivel actualizado', `La planta ahora es nivel ${newLevel}`, 'success');
        }
    }


    // ─────────────────────────────────────────────────────────────────────────
    // MODAL NORMAL (añadir / cambiar elementos)
    // ─────────────────────────────────────────────────────────────────────────

    openNormalElementDialog(row, col, elementType = 'plants', isChanging = false, originalElementInfo = null) {
        if (this.lawnDialog) this.closeDialog();
        if (elementType === 'railcarts') {
            this.openRailcartStyleDialog(row, col);
            return;
        }
        this.createNormalElementDialog(row, col, elementType, isChanging, originalElementInfo);
    }

    createNormalElementDialog(row, col, elementType, isChanging, originalElementInfo) {
        this.lawnDialogBackdrop = document.createElement('div');
        this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';

        this.lawnDialog = document.createElement('div');
        this.lawnDialog.className = 'lawn-dialog normal-element-dialog';

        const dialogTitle = isChanging ? __('elementChanged') : __('elementAdded');
        const buttonText  = isChanging ? __('elementChanged') : '➕ ' + __('elementAdded');

        this.lawnDialog.innerHTML = `
            <div class="lawn-dialog-content">
                <header class="dialog-header">
                    <h3>${dialogTitle}</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label>${__('elementTypeLabel')}</label>
                            <select class="element-type-select">
                                <option value="plants"      ${elementType === 'plants'      ? 'selected' : ''}>${__('typePlants')}</option>
                                <option value="zombies"     ${elementType === 'zombies'     ? 'selected' : ''}>${__('typeZombies')}</option>
                                <option value="gravestones" ${elementType === 'gravestones' ? 'selected' : ''}>${__('typeGravestones')}</option>
                                <option value="sliders"     ${elementType === 'sliders'     ? 'selected' : ''}>${__('typeSliders')}</option>
                                <option value="potions"     ${elementType === 'potions'     ? 'selected' : ''}>${__('typePotions')}</option>
                                <option value="others"      ${elementType === 'others'      ? 'selected' : ''}>${__('typeOthers')}</option>
                                <option value="molds"       ${elementType === 'molds'       ? 'selected' : ''}>${__('typeMolds')}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>${__('search')}</label>
                            <input type="text" class="element-search" placeholder="${__('searchElementPlaceholder')}">
                        </div>
                    </div>
                    <button class="close-btn" aria-label="${__('close')}">✕</button>
                </header>
                <section class="dialog-body">
                    <div class="elements-section">
                        <h6>${__('availableElements')}</h6>
                        <div class="elements-grid"></div>
                    </div>
                </section>
                <footer class="dialog-footer">
                    <div class="modifier-controls">
                        <label class="modifier-label">
                            <input type="checkbox" class="check-frozen"> Congelado
                        </label>
                        <label class="modifier-label">
                            <input type="checkbox" class="check-defeat"> En peligro
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
                        ${isChanging ? `<button class="btn-cancel-change">Cancelar</button>` : ''}
                        <button class="btn-confirm">${buttonText}</button>
                    </div>
                </footer>
            </div>`;

        this.lawnDialogBackdrop.appendChild(this.lawnDialog);
        document.body.appendChild(this.lawnDialogBackdrop);

        if (isChanging && originalElementInfo) {
            this.lawnDialog.dataset.originalElementInfo = JSON.stringify(originalElementInfo);
        }

        this.setupNormalElementDialogListeners(row, col, elementType, isChanging);
        this.loadElementsForTypeDialog(elementType, row, col, isChanging);
    }

    setupNormalElementDialogListeners(row, col, initialElementType, isChanging) {
        const closeBtn = this.lawnDialog.querySelector('.close-btn');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeDialog());

        this.lawnDialogBackdrop.addEventListener('click', (e) => { if (e.target === this.lawnDialogBackdrop) this.closeDialog(); });

        const elementTypeSelect = this.lawnDialog.querySelector('.element-type-select');
        if (elementTypeSelect) {
            elementTypeSelect.addEventListener('change', () => {
                this.loadElementsForTypeDialog(elementTypeSelect.value, row, col, isChanging);
                this.toggleModifiersDialog(elementTypeSelect.value);
            });
        }

        const elementSearch = this.lawnDialog.querySelector('.element-search');
        if (elementSearch) elementSearch.addEventListener('input', (e) => this.filterElementsDialog(e.target.value));

        const btnConfirm = this.lawnDialog.querySelector('.btn-confirm');
        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                if (isChanging) this.changeElementInCell(row, col);
                else            this.addElementToCell(row, col);
                this.closeDialog();
            });
        }

        const btnCancelChange = this.lawnDialog.querySelector('.btn-cancel-change');
        if (btnCancelChange) {
            btnCancelChange.addEventListener('click', () => {
                this.closeDialog();
                if (this.cellHasAnyObject(row, col) || this.hasRailcartPartAtCell(row, col)) this.openCellOverviewDialog(row, col);
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
                    <img src="${imageUrl}" alt="${element.name}" class="element-image"
                         onerror="this.onerror=null; this.src='${this.fallbackImages[type] || this.fallbackImages.plants}'">
                </div>
                <div class="element-name">${element.name}</div>`;

            card.addEventListener('click', () => {
                this.lawnDialog.querySelectorAll('.element-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedElement = { alias_type: element.alias_type, name: element.name, type, imageUrl };
                this.updateDefeatCheckboxState(type);
            });

            elementsList.appendChild(card);
        });

        const firstCard = elementsList.querySelector('.element-card');
        if (firstCard) firstCard.click();

        if (isChanging) this.applyOriginalElementModifiers();
    }

    filterElementsDialog(searchTerm) {
        if (!this.lawnDialog) return;
        const cards = this.lawnDialog.querySelectorAll('.element-card');
        const s = searchTerm.toLowerCase();
        cards.forEach(card => {
            card.style.display = card.querySelector('.element-name').textContent.toLowerCase().includes(s) ? '' : 'none';
        });
    }

    toggleModifiersDialog(type) {
        if (!this.lawnDialog) return;
        const levelControl = this.lawnDialog.querySelector('.plant-level');
        if (levelControl) levelControl.style.display = type === 'plants' ? 'block' : 'none';
        this.updateDefeatCheckboxState(type);
    }

    updateDefeatCheckboxState(type) {
        if (!this.lawnDialog) return;
        const defeatCheckbox = this.lawnDialog.querySelector('.check-defeat');
        const defeatLabel    = this.lawnDialog.querySelector('.modifier-label:nth-child(2)');
        if (defeatCheckbox && defeatLabel) {
            defeatCheckbox.disabled = type !== 'plants';
            defeatLabel.style.opacity = type === 'plants' ? '1' : '0.5';
            if (type !== 'plants') defeatCheckbox.checked = false;
        }
    }

    applyOriginalElementModifiers() {
        if (!this.lawnDialog || !this.lawnDialog.dataset.originalElementInfo) return;
        const { element, type } = JSON.parse(this.lawnDialog.dataset.originalElementInfo);
        if (!element) return;

        const checkFrozen = this.lawnDialog.querySelector('.check-frozen');
        const checkDefeat = this.lawnDialog.querySelector('.check-defeat');
        const plantLevel  = this.lawnDialog.querySelector('.plant-level');

        if (checkFrozen && (type === 'plant' || type === 'zombie')) checkFrozen.checked = element.frozen || false;
        if (checkDefeat && type === 'plant') checkDefeat.checked = element.defeat || false;
        if (plantLevel  && type === 'plant' && element.plantLevel) plantLevel.value = element.plantLevel - 1;
    }

    addElementToCell(row, col) {
        if (!this.selectedElement || !this.lawnDialog) {
            this.showToast(__('selectError'), __('selectElementFirst'), 'error');
            return;
        }

        const type        = this.selectedElement.type;
        const elementName = this.selectedElement.alias_type;

        const element = {
            rtid:     elementName,
            name:     elementName,
            imageUrl: this.selectedElement.imageUrl
        };

        const checkFrozen = this.lawnDialog.querySelector('.check-frozen');
        const checkDefeat = this.lawnDialog.querySelector('.check-defeat');
        const plantLevel  = this.lawnDialog.querySelector('.plant-level');

        switch(type) {
            case 'plants':
                element.plantLevel = parseInt(plantLevel?.value || 0) + 1;
                element.frozen  = checkFrozen?.checked || false;
                element.defeat  = checkDefeat?.checked || false;
                break;
            case 'zombies':
                element.frozen = checkFrozen?.checked || false;
                break;
        }

        this.board[row][col][type].push(element);

        this.updateBoardModules();
        this.renderBoard();
        this.updatePreview();
        this.updateCellInfo();

        const typeNames = { plants: __('typePlant'), zombies: __('typeZombie'), gravestones: __('typeGravestone'), sliders: __('typeSlider'), potions: __('typePotion'), others: __('typeOther'), molds: __('typeMold') };
        this.showToast(__('elementAdded'), `${typeNames[type] || type} "${elementName}" colocado en (${row}, ${col})`, 'success');
    }

    changeElementInCell(row, col) {
        if (!this.selectedElement || !this.lawnDialog) {
            this.showToast(__('selectError'), __('selectElementFirst'), 'error');
            return;
        }

        const type        = this.selectedElement.type;
        const elementName = this.selectedElement.alias_type;
        const originalElementInfo = this.lawnDialog.dataset.originalElementInfo ?
            JSON.parse(this.lawnDialog.dataset.originalElementInfo) : null;

        if (originalElementInfo && originalElementInfo.data.elementType !== type) {
            const origIndex = originalElementInfo.data.index;
            if (origIndex !== undefined) {
                this.board[row][col][originalElementInfo.data.elementType].splice(origIndex, 1);
            } else {
                this.board[row][col][originalElementInfo.data.elementType] = [];
            }
        }

        const element = { rtid: elementName, name: elementName, imageUrl: this.selectedElement.imageUrl };

        const checkFrozen = this.lawnDialog.querySelector('.check-frozen');
        const checkDefeat = this.lawnDialog.querySelector('.check-defeat');
        const plantLevel  = this.lawnDialog.querySelector('.plant-level');

        if (originalElementInfo && originalElementInfo.data.elementType === type) {
            const orig = originalElementInfo.element;
            if (type === 'plants') {
                element.plantLevel = parseInt(plantLevel?.value || 0) + 1 || orig.plantLevel;
                element.frozen     = checkFrozen?.checked ?? orig.frozen ?? false;
                element.defeat     = checkDefeat?.checked ?? orig.defeat ?? false;
            } else if (type === 'zombies') {
                element.frozen = checkFrozen?.checked ?? orig.frozen ?? false;
            }
        } else {
            if (type === 'plants') {
                element.plantLevel = parseInt(plantLevel?.value || 0) + 1;
                element.frozen     = checkFrozen?.checked || false;
                element.defeat     = checkDefeat?.checked || false;
            } else if (type === 'zombies') {
                element.frozen = checkFrozen?.checked || false;
            }
        }

        if (originalElementInfo && originalElementInfo.data.elementType === type && originalElementInfo.data.index !== undefined) {
            this.board[row][col][type][originalElementInfo.data.index] = element;
        } else {
            this.board[row][col][type].push(element);
        }

        this.updateBoardModules();
        this.renderBoard();
        this.updatePreview();
        this.updateCellInfo();

        const typeNames = { plants: __('typePlant'), zombies: __('typeZombie'), gravestones: __('typeGravestone'), sliders: __('typeSlider'), potions: __('typePotion'), others: __('typeOther'), molds: __('typeMold') };
        this.showToast(__('elementChanged'), `${typeNames[type] || type} cambiado a "${elementName}" en (${row}, ${col})`, 'success');
    }


    // ─────────────────────────────────────────────────────────────────────────
    // RAILCART – DIÁLOGOS
    // ─────────────────────────────────────────────────────────────────────────

    openRailcartSetupDialog() {
        if (this.lawnDialog) this.closeDialog();
        this.createRailcartSetupDialog();
    }

    createRailcartSetupDialog() {
        this.lawnDialogBackdrop = document.createElement('div');
        this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';
        this.lawnDialog = document.createElement('div');
        this.lawnDialog.className = 'lawn-dialog railcart-setup-dialog';

        let railcartOptions = '';
        this.availableElements.railcarts.forEach(rc => {
            const sel = this.railcartElements.type === rc.alias_type;
            railcartOptions += `<div class="railcart-option ${sel ? 'selected' : ''}" data-type="${rc.alias_type}">
                <div class="railcart-preview"><img src="${rc.imageUrl}" alt="${rc.name}" onerror="this.src='Assets/Railcarts/railcart_cowboy/cart.webp'"></div>
                <div class="railcart-name">${rc.name}</div>
                <div class="railcart-check">${sel ? '✓' : ''}</div>
            </div>`;
        });

        let partsControls = '';
        this.railcartParts.forEach(part => {
            const existingPart = this.railcartElements.parts.find(p => p.Part === part);
            const defaultCols  = { bottom: 3, cart: 4, mid: 5, top: 6 };
            partsControls += `
                <div class="part-control" data-part="${part}">
                    <div class="part-header">
                        <div class="part-icon">${this.getPartIcon(part)}</div>
                        <div class="part-name">${this.formatPartName(part)}</div>
                        <label class="part-toggle">
                            <input type="checkbox" class="enable-part" ${existingPart ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="part-coordinates" style="${existingPart ? '' : 'display:none;'}">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Fila (1-5)</label>
                                <input type="number" class="part-row" min="1" max="5" value="${existingPart ? existingPart.Row : '3'}" ${!existingPart ? 'disabled' : ''}>
                            </div>
                            <div class="form-group">
                                <label>Columna (1-9)</label>
                                <input type="number" class="part-col" min="1" max="9" value="${existingPart ? existingPart.Column : defaultCols[part]}" ${!existingPart ? 'disabled' : ''}>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

        const railCol   = this.railcartElements.rails.length > 0 ? this.railcartElements.rails[0].Column   : '4';
        const railStart = this.railcartElements.rails.length > 0 ? this.railcartElements.rails[0].RowStart : '2';
        const railEnd   = this.railcartElements.rails.length > 0 ? this.railcartElements.rails[0].RowEnd   : '4';

        this.lawnDialog.innerHTML = `
            <div class="lawn-dialog-content">
                <header class="dialog-header">
                    <h3>${__('configureRailcarts')}</h3>
                    <button class="close-btn" aria-label="${__('close')}">✕</button>
                </header>
                <section class="dialog-body">
                    <div class="setup-step"><h6>${__('railcartStep1')}</h6><div class="railcart-type-grid">${railcartOptions}</div></div>
                    <div class="setup-step"><h6>${__('railcartStep2')}</h6><div class="parts-controls">${partsControls}</div></div>
                    <div class="setup-step">
                        <h6>${__('railcartStep3')}</h6>
                        <label><input type="checkbox" id="enable-rails" ${this.railcartElements.rails.length > 0 ? 'checked' : ''}> ${__('enableRails')}</label>
                        <div id="rail-configuration" style="${this.railcartElements.rails.length > 0 ? '' : 'display:none;'}">
                            <div class="form-row">
                                <div class="form-group"><label>${__('colLabel')}</label><input type="number" id="rail-col" min="1" max="9" value="${railCol}"></div>
                                <div class="form-group"><label>${__('rowLabel')} inicio</label><input type="number" id="rail-start" min="1" max="5" value="${railStart}"></div>
                                <div class="form-group"><label>${__('rowLabel')} fin</label><input type="number" id="rail-end" min="1" max="5" value="${railEnd}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="setup-step"><h6>${__('previewTab')}</h6><div class="railcart-preview-grid" id="railcart-preview"></div></div>
                </section>
                <footer class="dialog-footer">
                    <button class="btn-clear-railcarts" id="btn-clear-railcarts">🗑️ ${__('clearAll')}</button>
                    <button class="btn-confirm" id="btn-confirm-railcarts">✅ ${__('accept')}</button>
                </footer>
            </div>`;

        this.lawnDialogBackdrop.appendChild(this.lawnDialog);
        document.body.appendChild(this.lawnDialogBackdrop);
        this.setupRailcartDialogListeners();
        this.updateRailcartPreview();
    }

    setupRailcartDialogListeners() {
        this.lawnDialog.querySelector('.close-btn').addEventListener('click', () => this.closeDialog());

        this.lawnDialog.querySelector('#btn-clear-railcarts').addEventListener('click', () => {
            if (confirm(__('confirmDeleteRailcarts'))) {
                this.railcartElements = { type: '', parts: [], rails: [] };
                this.updatePreview(); this.renderBoard(); this.updateRailcartPreview();
                this.showToast(__('cleaned'), __('railcartDeleted'), 'success');
            }
        });

        this.lawnDialog.querySelector('#btn-confirm-railcarts').addEventListener('click', () => this.saveRailcartConfiguration());

        this.lawnDialog.querySelectorAll('.railcart-option').forEach(opt => {
            opt.addEventListener('click', () => {
                this.lawnDialog.querySelectorAll('.railcart-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                this.railcartElements.type = opt.dataset.type;
                this.updateRailcartPreview();
            });
        });

        this.lawnDialog.querySelectorAll('.part-control').forEach(control => {
            const toggle = control.querySelector('.enable-part');
            const coords = control.querySelector('.part-coordinates');
            const rInput = control.querySelector('.part-row');
            const cInput = control.querySelector('.part-col');
            toggle.addEventListener('change', () => {
                coords.style.display = toggle.checked ? 'block' : 'none';
                if (rInput) rInput.disabled = !toggle.checked;
                if (cInput) cInput.disabled = !toggle.checked;
                this.updateRailcartPreview();
            });
            [rInput, cInput].forEach(inp => { if (inp) { inp.addEventListener('input', () => this.updateRailcartPreview()); inp.addEventListener('change', () => this.updateRailcartPreview()); } });
        });

        const enableRails = this.lawnDialog.querySelector('#enable-rails');
        enableRails.addEventListener('change', () => {
            this.lawnDialog.querySelector('#rail-configuration').style.display = enableRails.checked ? 'block' : 'none';
            this.updateRailcartPreview();
        });

        ['rail-col', 'rail-start', 'rail-end'].forEach(id => {
            const inp = this.lawnDialog.querySelector(`#${id}`);
            if (inp) { inp.addEventListener('input', () => this.updateRailcartPreview()); inp.addEventListener('change', () => this.updateRailcartPreview()); }
        });
    }

    updateRailcartPreview() {
        const previewGrid = this.lawnDialog.querySelector('#railcart-preview');
        if (!previewGrid) return;
        previewGrid.innerHTML = '';

        for (let row = 1; row <= 5; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'preview-row';
            for (let col = 1; col <= 9; col++) {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'preview-cell';

                let partInCell = null;
                this.lawnDialog.querySelectorAll('.part-control').forEach(ctrl => {
                    const toggle = ctrl.querySelector('.enable-part');
                    if (toggle && toggle.checked) {
                        const pr = parseInt(ctrl.querySelector('.part-row').value) || 3;
                        const pc = parseInt(ctrl.querySelector('.part-col').value) || 4;
                        if (row === pr && col === pc) partInCell = ctrl.dataset.part;
                    }
                });

                let hasRail = false;
                const enableRails = this.lawnDialog.querySelector('#enable-rails');
                if (enableRails && enableRails.checked) {
                    const rc = parseInt(this.lawnDialog.querySelector('#rail-col').value)   || 4;
                    const rs = parseInt(this.lawnDialog.querySelector('#rail-start').value) || 2;
                    const re = parseInt(this.lawnDialog.querySelector('#rail-end').value)   || 4;
                    if (col === rc && row >= rs && row <= re) hasRail = true;
                }

                if (partInCell) {
                    cellDiv.classList.add('has-part', `part-${partInCell}`);
                    cellDiv.innerHTML = `<span class="part-marker">${this.getPartIcon(partInCell)}</span>`;
                } else if (hasRail) {
                    cellDiv.classList.add('has-rail');
                    cellDiv.innerHTML = '─';
                }
                rowDiv.appendChild(cellDiv);
            }
            previewGrid.appendChild(rowDiv);
        }
    }

    saveRailcartConfiguration() {
        const railcartType = this.railcartElements.type;
        if (!railcartType) { this.showToast('Error', 'Selecciona un estilo de vagón', 'error'); return; }

        const parts = [];
        this.lawnDialog.querySelectorAll('.part-control').forEach(ctrl => {
            const toggle = ctrl.querySelector('.enable-part');
            if (toggle && toggle.checked) {
                parts.push({ Part: ctrl.dataset.part, Column: ctrl.querySelector('.part-col').value, Row: ctrl.querySelector('.part-row').value });
            }
        });

        const rails = [];
        const enableRails = this.lawnDialog.querySelector('#enable-rails');
        if (enableRails && enableRails.checked) {
            const rc = parseInt(this.lawnDialog.querySelector('#rail-col').value)   || 4;
            const rs = parseInt(this.lawnDialog.querySelector('#rail-start').value) || 2;
            const re = parseInt(this.lawnDialog.querySelector('#rail-end').value)   || 4;
            if (rs > re) { this.showToast('Error', 'Fila inicio debe ser ≤ fila fin', 'error'); return; }
            rails.push({ Column: rc.toString(), RowStart: rs.toString(), RowEnd: re.toString() });
        }

        this.railcartElements = { type: railcartType, parts, rails };
        this.updatePreview(); this.renderBoard(); this.closeDialog();
        this.showToast('Configuración guardada', `${this.formatRailcartName(railcartType)} con ${parts.length} parte(s)`, 'success');
    }

    openRailcartStyleDialog(row, col) {
        if (this.lawnDialog) this.closeDialog();
        this.createCombinedRailcartDialog(row, col);
    }

    createCombinedRailcartDialog(row, col) {
        this.lawnDialogBackdrop = document.createElement('div');
        this.lawnDialogBackdrop.className = 'lawn-dialog-backdrop';
        this.lawnDialog = document.createElement('div');
        this.lawnDialog.className = 'lawn-dialog railcart-combined-dialog';

        const railcarts = this.availableElements.railcarts;
        const initialType = this.railcartElements.type || (railcarts.length > 0 ? railcarts[0].alias_type : '');
        if (!this.railcartElements.type && railcarts.length > 0) this.railcartElements.type = initialType;

        let styleOptions = railcarts.map(rc => `<option value="${rc.alias_type}" ${initialType === rc.alias_type ? 'selected' : ''}>${rc.name}</option>`).join('');

        let partsOptions = '';
        if (initialType) {
            this.railcartParts.forEach(part => {
                partsOptions += `
                    <div class="railcart-part-option combined" data-part="${part}">
                        <div class="part-preview"><img src="${this.getRailcartPartImageUrl(initialType, part)}" alt="${this.formatPartName(part)}" onerror="this.src='Assets/Railcarts/${initialType}/${part}.webp'"></div>
                        <div class="part-name">${this.formatPartName(part)}</div>
                        <div class="part-description">${this.getPartDescription(part)}</div>
                    </div>`;
            });
        }

        this.lawnDialog.innerHTML = `
            <div class="lawn-dialog-content">
                <header class="dialog-header">
                    <h3>Agregar parte de vagón</h3>
                    <div class="style-selector">
                        <label>Estilo:</label>
                        <select id="railcart-style-selector">${styleOptions}</select>
                    </div>
                    <button class="close-btn" aria-label="Cerrar">✕</button>
                </header>
                <section class="dialog-body">
                    <p class="selection-description">Selecciona una parte del vagón para colocarla en (${row}, ${col})</p>
                    <div class="railcart-parts-grid">${partsOptions || '<div class="no-parts">No hay estilos disponibles</div>'}</div>
                </section>
                <footer class="dialog-footer">
                    <div class="button-group">
                        <button class="btn-back" id="btn-back-railcart">← Volver</button>
                        <button class="btn-confirm" id="btn-place-part" disabled>✅ Selecciona una parte primero</button>
                    </div>
                </footer>
            </div>`;

        this.lawnDialogBackdrop.appendChild(this.lawnDialog);
        document.body.appendChild(this.lawnDialogBackdrop);
        this.setupCombinedRailcartDialogListeners(row, col);
    }

    setupCombinedRailcartDialogListeners(row, col) {
        const confirmBtn    = this.lawnDialog.querySelector('#btn-place-part');
        const styleSelector = this.lawnDialog.querySelector('#railcart-style-selector');

        this.lawnDialog.querySelector('.close-btn').addEventListener('click', () => this.closeDialog());
        this.lawnDialog.querySelector('#btn-back-railcart').addEventListener('click', () => {
            this.closeDialog(); this.openAddElementSelectionDialog(row, col);
        });

        styleSelector.addEventListener('change', () => {
            this.railcartElements.type = styleSelector.value;
            this.lawnDialog.querySelectorAll('.railcart-part-option').forEach(opt => {
                opt.querySelector('img').src = this.getRailcartPartImageUrl(styleSelector.value, opt.dataset.part);
            });
        });

        let selectedPart = null;
        this.lawnDialog.querySelectorAll('.railcart-part-option').forEach(opt => {
            opt.addEventListener('click', () => {
                this.lawnDialog.querySelectorAll('.railcart-part-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                selectedPart = opt.dataset.part;
                confirmBtn.disabled = false;
                confirmBtn.textContent = `✅ Colocar ${this.formatPartName(selectedPart)}`;
            });
        });

        confirmBtn.addEventListener('click', () => {
            if (!selectedPart) { this.showToast('Error', 'Selecciona una parte primero', 'error'); return; }
            this.railcartElements.type = styleSelector.value;
            this.placeRailcartPart(row, col, selectedPart);
        });

        setTimeout(() => { const first = this.lawnDialog.querySelector('.railcart-part-option'); if (first) first.click(); }, 100);
    }

    placeRailcartPart(row, col, selectedPart) {
    const railcartType = this.railcartElements.type;
    if (!railcartType || !selectedPart) { 
        this.showToast('Error', 'Configuración inválida', 'error'); 
        return; 
    }

    const existingIdx = this.railcartElements.parts.findIndex(p =>
        parseInt(p.Row) === row && parseInt(p.Column) === col && p.Part === selectedPart
    );

    if (existingIdx >= 0) {
        // Si estamos eliminando un cart, también eliminamos el mid asociado
        if (selectedPart === 'cart') {
            const midIdx = this.railcartElements.parts.findIndex(p =>
                parseInt(p.Row) === row && parseInt(p.Column) === col && p.Part === 'mid'
            );
            if (midIdx >= 0) {
                this.railcartElements.parts.splice(midIdx, 1);
            }
        }
        this.railcartElements.parts.splice(existingIdx, 1);
    } else {
        // *** CAMBIO: Si es un cart, agregar PRIMERO el mid y LUEGO el cart ***
        if (selectedPart === 'cart') {
            const midExists = this.railcartElements.parts.some(p =>
                parseInt(p.Row) === row && parseInt(p.Column) === col && p.Part === 'mid'
            );
            
            if (!midExists) {
                // Primero se agrega el mid (aparecerá abajo en el render)
                this.railcartElements.parts.push({ 
                    Part: 'mid', 
                    Column: col.toString(), 
                    Row: row.toString() 
                });
            }
        }
        
        // Luego se agrega la parte seleccionada (el cart aparecerá encima del mid)
        this.railcartElements.parts.push({ 
            Part: selectedPart, 
            Column: col.toString(), 
            Row: row.toString() 
        });
        
        // Agregar rieles si es necesario
        if (selectedPart === 'cart') {
            const railExists = this.railcartElements.rails.some(r =>
                parseInt(r.Column) === col && 
                parseInt(r.RowStart) <= row && 
                parseInt(r.RowEnd) >= row
            );
            if (!railExists) {
                this.railcartElements.rails.push({ 
                    Column: col.toString(), 
                    RowStart: row.toString(), 
                    RowEnd: row.toString() 
                });
            }
        }
    }

    this.renderBoard(); 
    this.updatePreview(); 
    this.closeDialog();
    
    const action = existingIdx >= 0 ? 'eliminada' : 'colocada';
    const message = selectedPart === 'cart' && action === 'colocada' 
        ? `Vagón colocado en (${row}, ${col}) con riel mid debajo automático`
        : `${this.formatPartName(selectedPart)} de ${this.formatRailcartName(railcartType)} ${action} en (${row}, ${col})`;
    
    this.showToast(`Parte ${action}`, message, existingIdx >= 0 ? 'warning' : 'success');
}

    addDefaultRails(column) {
        if (!this.railcartElements.rails.some(r => parseInt(r.Column) === column)) {
            this.railcartElements.rails.push({ Column: column.toString(), RowStart: '1', RowEnd: '5' });
        }
        this.renderBoard(); this.updatePreview();
    }

    getPartDescription(part) {
        const d = { 'bottom': 'Parte inferior/base del vagón', 'cart': 'Cuerpo principal del vagón', 'mid': 'Parte media/central', 'top': 'Parte superior/techo' };
        return d[part] || 'Parte del vagón';
    }
    getRailcartPartImageUrl(railcartType, part) {
        return `Assets/Railcarts/${railcartType}/${part}.webp`;
    }


    // ─────────────────────────────────────────────────────────────────────────
    // CERRAR DIÁLOGO
    // ─────────────────────────────────────────────────────────────────────────

    closeDialog() {
        if (this.lawnDialogBackdrop && this.lawnDialogBackdrop.parentElement) {
            this.lawnDialogBackdrop.remove();
        }
        this.lawnDialog = null;
        this.lawnDialogBackdrop = null;
        this.selectedElement = null;
        this.selectedPlant   = null;
    }


    // ─────────────────────────────────────────────────────────────────────────
    // LIMPIAR CELDA
    // ─────────────────────────────────────────────────────────────────────────

    clearCell(row, col) {
    // Limpiar objetos normales del board
    this.board[row][col] = { plants: [], zombies: [], gravestones: [], sliders: [], potions: [], others: [], molds: [], railcarts: [] };
    
    // *** NUEVO: Limpiar también las partes de railcart en esta celda ***
    this.railcartElements.parts = this.railcartElements.parts.filter(
        part => !(parseInt(part.Row) === row && parseInt(part.Column) === col)
    );
    
    // Si se eliminó un 'cart', actualizar los rieles
    const remainingCartCols = this.railcartElements.parts
        .filter(p => p.Part === 'cart')
        .map(p => parseInt(p.Column));
    
    this.railcartElements.rails = this.railcartElements.rails.filter(
        rail => remainingCartCols.includes(parseInt(rail.Column))
    );
    
    this.updateBoardModules();
    this.renderBoard();
    this.updatePreview();
    this.updateCellInfo();
    this.showToast('Celda limpiada', `Celda (${row}, ${col}) limpiada`, 'warning');
}


    // ─────────────────────────────────────────────────────────────────────────
    // MÓDULOS
    // ─────────────────────────────────────────────────────────────────────────

    updateBoardModules() {
        this.boardModules = { plants: [], zombies: [], gravestones: [], sliders: [], potions: [], others: [], molds: [], railcarts: [], rails: [], protectedPlants: [] };

        for (let row = 1; row <= 5; row++) {
            for (let col = 1; col <= 9; col++) {
                const cell = this.board[row][col];

                cell.plants.forEach(plant => {
                    const m = { GridY: row - 1, GridX: col - 1, TypeName: plant.rtid };
                    if (plant.plantLevel > 0) m.Level = plant.plantLevel - 1;
                    if (plant.frozen) m.Condition = 'icecubed';
                    if (!plant.defeat) {
                        this.boardModules.plants.push(m);
                    } else {
                        this.boardModules.protectedPlants.push({ GridY: row - 1, GridX: col - 1, PlantType: plant.name, Level: plant.plantLevel > 0 ? plant.plantLevel - 1 : -1 });
                    }
                });

                cell.zombies.forEach(zombie => {
                    const m = { GridY: row - 1, GridX: col - 1, TypeName: zombie.rtid };
                    if (zombie.frozen) m.Condition = 'icecubed';
                    this.boardModules.zombies.push(m);
                });

                cell.gravestones.forEach(g => this.boardModules.gravestones.push({ GridY: row - 1, GridX: col - 1, TypeName: g.rtid }));
                cell.sliders.forEach(s   => this.boardModules.sliders.push({ GridY: row - 1, GridX: col - 1, TypeName: s.rtid }));
                cell.potions.forEach(p   => this.boardModules.potions.push({ GridY: row - 1, GridX: col - 1, TypeName: p.rtid }));
                cell.molds.forEach(m     => this.boardModules.molds.push({ GridY: row - 1, GridX: col - 1, TypeName: m.rtid }));
                cell.others.forEach(o    => this.boardModules.others.push({ GridY: row - 1, GridX: col - 1, TypeName: o.rtid }));
            }
        }
    }

    getAllModules() {
        const modules = [];

        if (!this.boardModules) this.updateBoardModules();

        if (this.railcartElements.type) {
            const railcarts = this.railcartElements.parts.filter(p => p.Part === 'cart').map(c => ({ Column: (parseInt(c.Column) - 1).toString(), Row: (parseInt(c.Row) - 1).toString() }));
            const rails = [
                ...this.railcartElements.parts.filter(p => p.Part !== 'cart').map(rp => ({ Column: (parseInt(rp.Column) - 1).toString(), RowStart: (parseInt(rp.Row) - 1).toString(), RowEnd: (parseInt(rp.Row) - 1).toString() })),
                ...this.railcartElements.rails.map(r => ({ Column: (parseInt(r.Column) - 1).toString(), RowStart: (parseInt(r.RowStart) - 1).toString(), RowEnd: (parseInt(r.RowEnd) - 1).toString() }))
            ];
            if (railcarts.length > 0 || rails.length > 0) {
                const data = { RailcartType: this.railcartElements.type };
                if (railcarts.length > 0) data.Railcarts = railcarts;
                if (rails.length > 0) data.Rails = rails;
                modules.push({ aliases: ['MountingRails'], objclass: 'RailcartProperties', objdata: data });
            }
        }

        if (this.boardModules.molds && this.boardModules.molds.length > 0) {
            modules.push({ aliases: ['MountingMolds'], objclass: 'MoldColonyChallengeProps', objdata: { Locations: 'RTID(MoldLocationsCustom@.)' } });
            modules.push({ aliases: ['MoldLocationsCustom'], objclass: 'BoardGridMapProps', objdata: { Values: this.createMoldMatrix() } });
        }

        if (this.boardModules.plants?.length > 0)
            modules.push({ aliases: ['MountingPlants'], objclass: 'InitialPlantProperties', objdata: { InitialPlantPlacements: this.boardModules.plants } });

        if (this.boardModules.protectedPlants?.length > 0)
            modules.push({ aliases: ['ProtectThePlant'], objclass: 'ProtectThePlant', objdata: { ProtectedPlants: this.boardModules.protectedPlants } });

        if (this.boardModules.zombies?.length > 0)
            modules.push({ aliases: ['MountingZombies'], objclass: 'InitialZombieProperties', objdata: { InitialZombiePlacements: this.boardModules.zombies } });

        if (this.boardModules.gravestones?.length > 0)
            modules.push({ aliases: ['MountingGravestones'], objclass: 'GravestoneProperties', objdata: { ForceSpawnData: this.boardModules.gravestones } });

        if (this.boardModules.sliders?.length > 0)
            modules.push({ aliases: ['MountingSliders'], objclass: 'InitialGridItemProperties', objdata: { InitialGridItemPlacements: this.boardModules.sliders.map(s => ({ GridY: s.GridY, GridX: s.GridX, TypeName: s.TypeName })) } });

        if (this.boardModules.potions?.length > 0)
            modules.push({ aliases: ['MountingPotions'], objclass: 'InitialGridItemProperties', objdata: { InitialGridItemPlacements: this.boardModules.potions.map(p => ({ GridY: p.GridY, GridX: p.GridX, TypeName: p.TypeName })) } });

        if (this.boardModules.others?.length > 0)
            modules.push({ aliases: ['MountingOthers'], objclass: 'InitialGridItemProperties', objdata: { InitialGridItemPlacements: this.boardModules.others.map(o => ({ GridY: o.GridY, GridX: o.GridX, TypeName: o.TypeName })) } });

        return modules;
    }

    createMoldMatrix() {
        const matrix = Array.from({ length: 5 }, () => [0,0,0,0,0,0,0,0,0]);
        (this.boardModules.molds || []).forEach(m => { if (m.GridY >= 0 && m.GridY < 5 && m.GridX >= 0 && m.GridX < 9) matrix[m.GridY][m.GridX] = 1; });
        return matrix;
    }


    // ─────────────────────────────────────────────────────────────────────────
    // UTILIDADES UI
    // ─────────────────────────────────────────────────────────────────────────

    updateCellInfo() {
        const cellInfo = document.getElementById('cell-info');
        if (!cellInfo || !this.selectedCell) return;
        const { row, col } = this.selectedCell;
        const elements = this.board[row][col];

        let elementList = [];
        elements.plants.forEach(p => {
            let t = `<span class="plant-tag">${p.name}</span>`;
            if (p.plantLevel > 0) t += ` <small class="plant-level-tag">L${p.plantLevel}</small>`;
            if (p.frozen) t += ' <small class="frozen-tag">❄️</small>';
            if (p.defeat) t += ' <small class="defeat-tag">🛡️</small>';
            elementList.push(t);
        });
        elements.zombies.forEach(z => {
            let t = `<span class="zombie-tag">${z.name}</span>`;
            if (z.frozen) t += ' <small class="frozen-tag">❄️</small>';
            elementList.push(t);
        });
        elements.gravestones.forEach(g => elementList.push(`<span class="gravestone-tag">${g.name}</span>`));
        elements.sliders.forEach(s => elementList.push(`<span class="slider-tag">${s.name}</span>`));
        elements.potions.forEach(p => elementList.push(`<span class="potion-tag">${p.name}</span>`));
        elements.others.forEach(o => elementList.push(`<span class="other-tag">${o.name}</span>`));
        elements.molds.forEach(m => elementList.push(`<span class="mold-tag">${m.name}</span>`));

        if (elementList.length === 0) {
            cellInfo.innerHTML = `<div class="cell-info-container"><span>📊 Celda: Fila ${row}, Columna ${col} (Vacía)</span><span class="empty-cell-tag">Haz clic para editar</span></div>`;
        } else {
            cellInfo.innerHTML = `
                <div class="cell-info-container">
                    <div>
                        <span>📊 Celda: Fila ${row}, Columna ${col}</span>
                        <div class="cell-tags">${elementList.join(' ')}</div>
                    </div>
                    <button onclick="window.boardManager.openCellOverviewDialog(${row}, ${col})" class="edit-cell-btn">✏️ Editar</button>
                </div>`;
        }
    }

    updatePreview() {
        const preview = document.getElementById('board-json-preview');
        if (!preview) return;
        if (!this.boardModules?.plants) this.updateBoardModules();
        const modules = this.getAllModules();
        if (modules.length === 0) {
            preview.textContent = '// No hay elementos colocados en el tablero';
            return;
        }
        preview.textContent = JSON.stringify(modules, null, 2);
        if (window.levelGenerator?.syntaxHighlight) window.levelGenerator.syntaxHighlight(preview);
    }

    showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <strong>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'} ${title}</strong>
            <div>${message}</div>
            <button onclick="this.parentElement.remove()">×</button>`;
        document.body.appendChild(toast);
        setTimeout(() => { if (toast.parentElement) toast.remove(); }, 3000);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // GETTERS DE COMPATIBILIDAD
    // ─────────────────────────────────────────────────────────────────────────

    getFirstElementInCell(row, col) {
        const e = this.board[row][col];
        if (e.plants.length > 0)      return { type: 'plant',      element: e.plants[0],      data: { row, col, elementType: 'plants',      index: 0 } };
        if (e.zombies.length > 0)     return { type: 'zombie',     element: e.zombies[0],     data: { row, col, elementType: 'zombies',     index: 0 } };
        if (e.gravestones.length > 0) return { type: 'gravestone', element: e.gravestones[0], data: { row, col, elementType: 'gravestones', index: 0 } };
        if (e.sliders.length > 0)     return { type: 'slider',     element: e.sliders[0],     data: { row, col, elementType: 'sliders',     index: 0 } };
        if (e.potions.length > 0)     return { type: 'potion',     element: e.potions[0],     data: { row, col, elementType: 'potions',     index: 0 } };
        if (e.others.length > 0)      return { type: 'other',      element: e.others[0],      data: { row, col, elementType: 'others',      index: 0 } };
        if (e.molds.length > 0)       return { type: 'mold',       element: e.molds[0],       data: { row, col, elementType: 'molds',       index: 0 } };
        if (e.railcarts.length > 0)   return { type: 'railcart',   element: e.railcarts[0],   data: { row, col, elementType: 'railcarts',   index: 0 } };
        return null;
    }


    // ─────────────────────────────────────────────────────────────────────────
    // INICIALIZACIÓN
    // ─────────────────────────────────────────────────────────────────────────

    initialize() {
        if (this.initialized) return;
        this.renderBoard();
        this.setupEventListeners();
        this.updateBoardModules();
        this.updatePreview();
        this.initialized = true;
    }

    setupEventListeners() {
        const btnClearBoard = document.getElementById('btn-clear-board');
        if (btnClearBoard) {
            btnClearBoard.addEventListener('click', () => {
                this.board = this.initializeBoard();
                this.boardModules = { plants: [], zombies: [], gravestones: [], sliders: [], potions: [], others: [], molds: [], railcarts: [], rails: [], protectedPlants: [] };
                this.railcartElements = { type: '', parts: [], rails: [] };
                this._copiedCellData = null;
                this.renderBoard();
                this.updatePreview();
                this.showToast('Tablero limpiado', 'Todos los elementos han sido removidos', 'warning');
            });
        }

        const btnRailcarts = document.getElementById('btn-railcarts');
        if (btnRailcarts) btnRailcarts.addEventListener('click', () => this.openRailcartSetupDialog());

        const btnEditCell = document.getElementById('btn-edit-cell');
        if (btnEditCell) {
            btnEditCell.addEventListener('click', () => {
                if (this.selectedCell) {
                    const { row, col } = this.selectedCell;
                    if (this.cellHasAnyObject(row, col) || this.hasRailcartPartAtCell(row, col)) this.openCellOverviewDialog(row, col);
                    else this.openAddElementSelectionDialog(row, col);
                } else {
                    this.showToast('Sin selección', 'Selecciona una celda primero', 'warning');
                }
            });
        }
    }
}


// ─────────────────────────────────────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    const boardTab  = document.getElementById('board-tab');
    const boardPane = document.getElementById('board');

    function initBoardManager() {
        if (!window.boardManager) {
            window.boardManager = new BoardManager(window.levelGenerator);
            setTimeout(() => { if (window.boardManager) window.boardManager.initialize(); }, 300);
        } else if (!window.boardManager.initialized) {
            window.boardManager.initialize();
        }
    }

    if (boardTab) boardTab.addEventListener('click', initBoardManager);
    if (boardPane && boardPane.classList.contains('active')) initBoardManager();
});

if (typeof module !== 'undefined' && module.exports) module.exports = BoardManager;