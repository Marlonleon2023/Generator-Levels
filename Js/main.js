import {
    WORLD_IMAGES,
    STAGE_IMAGES,
    VISUAL_EFFECTS,
    MOWER_TYPES,
    MOWER_DISPLAY_NAMES,
    MOWER_IMAGES,
    WORLDS,
    PATHS,
    COLORS,
    //ZOMBIE_CATEGORIES ,
    MOD_CONFIG,
    detectModFromZombie,
    isModZombie,
    isModCategory,
    PLANTS, // Nueva importación
    GRAVESTONES, // Nueva importación
    GRAVESTONE_DISPLAY_NAMES, // Nueva importación
    FALLBACK_IMAGES // Nueva importación
} from '../constants/resources.js';

import { RewardManager } from './reward-manager.js';

import { ZombieDataLoader } from './zombieDataLoader.js';


class EnhancedLevelGenerator {
    constructor() {
        console.log('🔧 Constructor de EnhancedLevelGenerator llamado');

        // 1. DATOS DEL NIVEL (Configuración principal)
        this.levelData = {
            level_name: "Mi Nivel Personalizado",
            level_number: 1,
            world: "Moderno",
            stage: "None",
            visual_effect: "",
            enable_sun_dropper: true,
            enable_seed_slots: false,
            seed_slots_count: 8,
            mower_type: "ModernMowers",
            seed_selection_method: "chooser",
            starting_sun: 50,
            zombie_level: 1,
            grid_level: 1,
            wave_count: 10,
            flag_wave_interval: 4,
            plant_food_waves: [3, 6, 9],
            zombies: [],
            waves: [],
            use_underground_zombies: false,
            underground_wave_start: 5,
            underground_wave_interval: 3,
            underground_columns_start: 2,
            underground_columns_end: 4,
            spawn_col_start: 6,
            spawn_col_end: 9,
            wave_spending_points: 150,
            wave_spending_point_increment: 75,
            underground_max_zombies: 3,
            underground_min_zombies: 1
        };

        // 2. RECURSOS Y CONSTANTES
        this.worldImages = WORLD_IMAGES;
        this.stageImages = STAGE_IMAGES;
        this.visualEffects = VISUAL_EFFECTS;
        this.mowerTypes = MOWER_TYPES;
        this.mowerDisplayNames = MOWER_DISPLAY_NAMES;
        this.mowerImages = MOWER_IMAGES;
        this.worlds = WORLDS;
        this.paths = PATHS;
        this.colors = COLORS;
        this.zombieCategories = {}
        this.modConfig = MOD_CONFIG;

        this.rewardManager = new RewardManager(this);



        console.log('✓ Recursos y constantes cargados');
        console.log(`- Mundos: ${Object.keys(this.worldImages).length}`);
        console.log(`- Categorías de zombies: ${Object.keys(this.zombieCategories).length}`);

        // 3. SISTEMA DE ZOMBIES
        this.zombieDataLoader = new ZombieDataLoader();
        this.zombieData = []; // Datos de zombies
        this.zombieCategories = {}; // Se llenará dinámicamente desde el JSON
        this.autoDetectOnZombieSelection = false; // DESACTIVADO

        // 4. SISTEMA DE DESAFÍOS
        this.challengesData = {
            enabled: false,
            challenges: [
                {
                    id: "ZombieDistance",
                    enabled: false,
                    type: "StarChallengeZombieDistanceProps",
                    value: 5.5
                },
                {
                    id: "SunUsed",
                    enabled: false,
                    type: "StarChallengeSunUsedProps",
                    value: 500
                },
                {
                    id: "SunProduced",
                    enabled: false,
                    type: "StarChallengeSunProducedProps",
                    value: 500
                },
                {
                    id: "SunHoldout",
                    enabled: false,
                    type: "StarChallengeSpendSunHoldoutProps",
                    value: 60
                },
                {
                    id: "KillZombies",
                    enabled: false,
                    type: "StarChallengeKillZombiesInTimeProps",
                    values: { zombies: 15, time: 10 }
                },
                {
                    id: "PlantsLost",
                    enabled: false,
                    type: "StarChallengePlantsLostProps",
                    value: 5
                },
                {
                    id: "SimultaneousPlants",
                    enabled: false,
                    type: "StarChallengeSimultaneousPlantsProps",
                    value: 15
                },
                {
                    id: "SaveMowers",
                    enabled: false,
                    type: "StarChallengeSaveMowersProps",
                    value: 3
                }
            ]
        };

        // 5. GESTIÓN DEL TABLERO
        this.boardManager = null;
        this.boardInitialized = false;

        // 6. SISTEMA DE GUARDADO AUTOMÁTICO
        this.autoSaveEnabled = true;
        this.currentTab = 'basic';
        this.autoSaveDelay = 500;
        this.hasUnsavedChanges = {};
        this.autoSaveTimeout = null;

        // 7. BANDERA DE INICIALIZACIÓN COMPLETADA
        this.initializationComplete = false;
        this.initializationError = null;

        console.log('✓ Propiedades inicializadas');

        // 8. INICIALIZACIÓN DIFERIDA - NO INICIAR INMEDIATAMENTE
        // En lugar de llamar init() aquí, programamos la inicialización

        // Solo inicializar componentes que NO dependen del DOM
        this.setupConverterListeners();
        console.log('✓ Listeners del convertidor configurados (sin DOM)');

        // Programar la inicialización principal cuando el DOM esté listo
        this.initPromise = this.scheduleInitialization();

        console.log('🚀 Constructor completado - Inicialización programada');
    }

    scheduleInitialization() {
        return new Promise((resolve, reject) => {
            const initWhenReady = () => {
                console.log('⏳ Verificando estado del DOM para inicialización...');

                // Si el DOM ya está listo
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    console.log('✓ DOM ya está listo, iniciando...');
                    this.init()
                        .then(() => {
                            console.log('✅ Inicialización completada exitosamente');
                            resolve();
                        })
                        .catch(error => {
                            console.error('❌ Error en inicialización:', error);
                            this.initializationError = error;
                            reject(error);
                        });
                }
                // Si el DOM aún se está cargando, esperar
                else if (document.readyState === 'loading') {
                    console.log('⌛ DOM aún cargando, esperando evento DOMContentLoaded...');
                    document.addEventListener('DOMContentLoaded', () => {
                        console.log('✓ DOMContentLoaded disparado, iniciando...');
                        this.init()
                            .then(() => {
                                console.log('✅ Inicialización completada exitosamente');
                                resolve();
                            })
                            .catch(error => {
                                console.error('❌ Error en inicialización:', error);
                                this.initializationError = error;
                                reject(error);
                            });
                    });
                }
                // Estado desconocido
                else {
                    console.log('⚠ Estado del DOM desconocido:', document.readyState);
                    // Intentar igualmente después de un breve retraso
                    setTimeout(() => {
                        console.log('🔄 Intentando inicialización después de retraso...');
                        this.init()
                            .then(() => {
                                console.log('✅ Inicialización completada exitosamente');
                                resolve();
                            })
                            .catch(error => {
                                console.error('❌ Error en inicialización:', error);
                                this.initializationError = error;
                                reject(error);
                            });
                    }, 100);
                }
            };

            // Pequeño retraso para asegurar que el constructor haya terminado
            setTimeout(initWhenReady, 10);
        });
    }

    debugZombieData() {
        console.log('=== DEBUG ZOMBIE DATA ===');
        console.log('Zombie categories:', Object.keys(this.zombieCategories));
        console.log('First category:', Object.keys(this.zombieCategories)[0]);

        if (this.zombieCategories && Object.keys(this.zombieCategories).length > 0) {
            const firstCategory = Object.keys(this.zombieCategories)[0];
            console.log(`Zombies in ${firstCategory}:`, this.zombieCategories[firstCategory]);
        }

        console.log('=== END DEBUG ===');
    }

    initializeNewZombieSelection() {
        console.log('Inicializando nueva selección de zombies...');

        // Asegurar que el DOM esté listo
        const checkDOM = () => {
            const categoriesPanel = document.getElementById('zombieCategoriesPanel');
            const contentPanel = document.getElementById('zombieCategoriesContent');

            if (!categoriesPanel || !contentPanel) {
                console.log('Esperando a que el DOM esté listo...');
                setTimeout(checkDOM, 100);
                return;
            }

            console.log('Elementos del DOM encontrados');

            // Los datos de zombies ya están disponibles (generados en el constructor)
            console.log('Datos de zombies listos:', this.zombieData.length);
            this.setupNewZombieSelectionUI();
            this.setupNewZombieSelectionListeners();
        };

        // Iniciar verificación del DOM
        checkDOM();
    }

    // Configurar la interfaz de usuario
    setupNewZombieSelectionUI() {
        console.log('Configurando UI de selección de zombies...');

        const categoriesPanel = document.getElementById('zombieCategoriesPanel');
        const contentPanel = document.getElementById('zombieCategoriesContent');

        if (!categoriesPanel || !contentPanel) {
            console.error('Elementos del DOM no encontrados');
            return;
        }

        // Mostrar mensaje de carga temporal
        categoriesPanel.innerHTML = '<div class="text-center p-4">Cargando categorías...</div>';
        contentPanel.innerHTML = '<div class="text-center p-4">Cargando zombies...</div>';

        // Verificar que tengamos categorías
        if (!this.zombieCategories || Object.keys(this.zombieCategories).length === 0) {
            console.log('No hay categorías disponibles');
            categoriesPanel.innerHTML = '<div class="text-center p-4 text-danger">No hay categorías disponibles</div>';
            contentPanel.innerHTML = '<div class="text-center p-4 text-danger">No hay zombies disponibles</div>';
            return;
        }

        console.log(`Generando UI con ${Object.keys(this.zombieCategories).length} categorías`);

        // Generar botones de categorías
        this.generateCategoryButtons();

        // Generar contenido de categorías
        this.generateZombieCategoriesContent();
    }

    generateCategoryButtons() {
        const categoriesPanel = document.getElementById('zombieCategoriesPanel');
        if (!categoriesPanel) return;

        categoriesPanel.innerHTML = '';

        if (Object.keys(this.zombieCategories).length === 0) {
            categoriesPanel.innerHTML = '<div class="text-muted text-center p-4">Cargando categorías...</div>';
            return;
        }

        console.log('=== GENERANDO BOTONES DE CATEGORÍAS ===');
        console.log('Categorías disponibles:', Object.keys(this.zombieCategories));

        // ORDEN MANUAL - ESTO ES IMPERATIVO
        const manualWorldOrder = [
            'Modern',
            'Egypt',
            'Pirate',
            "Wildwest",
            'Dino',
            'Lostcity',
            'Dark',
            'Iceage',
            'Eighties',
            'Future',
            'Beach',

        ];

        // 1. FILTRAR y ORDENAR mundos según el orden manual
        const worldCategories = [];
        manualWorldOrder.forEach(world => {
            if (this.zombieCategories.hasOwnProperty(world)) {
                worldCategories.push(world);
            } else {
                // Buscar coincidencia insensible a mayúsculas
                const matchingCategory = Object.keys(this.zombieCategories).find(cat =>
                    cat.toLowerCase() === world.toLowerCase()
                );
                if (matchingCategory) {
                    worldCategories.push(matchingCategory);
                }
            }
        });

        console.log('Mundos en orden manual:', worldCategories);

        // 2. Crear sección de Mundos
        if (worldCategories.length > 0) {
            const worldSection = document.createElement('div');
            worldSection.className = 'category-group';

            const worldTitle = document.createElement('h6');
            worldTitle.className = 'text-muted mb-2';
            worldTitle.textContent = 'Mundos';
            worldSection.appendChild(worldTitle);

            const worldButtonsContainer = document.createElement('div');
            worldButtonsContainer.className = 'category-buttons';

            // Agregar mundos en el ORDEN MANUAL
            worldCategories.forEach(category => {
                const zombieCount = this.zombieCategories[category].length;
                const displayName = this.formatCategoryName(category); // ¡CAMBIADO!

                const button = document.createElement('button');
                button.className = 'category-btn';
                button.dataset.category = category;

                button.innerHTML = `
                <span>${displayName}</span>
                <span class="badge">${zombieCount}</span>
            `;

                worldButtonsContainer.appendChild(button);
            });

            worldSection.appendChild(worldButtonsContainer);
            categoriesPanel.appendChild(worldSection);
        }

        // 3. Obtener las demás categorías (excluyendo mundos ya mostrados)
        const allCategories = Object.keys(this.zombieCategories);
        const shownWorlds = new Set(worldCategories);
        const remainingCategories = allCategories.filter(cat => !shownWorlds.has(cat));

        console.log('Categorías restantes:', remainingCategories);

        // 4. Clasificar las demás categorías

        const modCats = [];
        const otherCats = [];
        const specialCats = [];

        remainingCategories.forEach(category => {
            if (this.isSpecialCategory(category)) {
                specialCats.push(category);
            } else if (this.isModCategory(category)) {
                modCats.push(category);
            } else {
                otherCats.push(category);
            }
        });



        // 7. Crear sección de Otros (orden alfabético)
        if (otherCats.length > 0) {
            const otherSection = document.createElement('div');
            otherSection.className = 'category-group';

            const otherTitle = document.createElement('h6');
            otherTitle.className = 'text-muted mb-2';
            otherTitle.textContent = 'Otros';
            otherSection.appendChild(otherTitle);

            const otherButtonsContainer = document.createElement('div');
            otherButtonsContainer.className = 'category-buttons';

            otherCats.sort().forEach(category => {
                const zombieCount = this.zombieCategories[category].length;
                const displayName = this.formatCategoryName(category); // ¡CAMBIADO!

                const button = document.createElement('button');
                button.className = 'category-btn';
                button.dataset.category = category;

                button.innerHTML = `
                <span>${displayName}</span>
                <span class="badge">${zombieCount}</span>
            `;

                otherButtonsContainer.appendChild(button);
            });

            otherSection.appendChild(otherButtonsContainer);
            categoriesPanel.appendChild(otherSection);
        }
        // 5. Crear sección de Especiales (orden alfabético)
        if (specialCats.length > 0) {
            const specialSection = document.createElement('div');
            specialSection.className = 'category-group';

            const specialTitle = document.createElement('h6');
            specialTitle.className = 'text-muted mb-2';
            specialTitle.textContent = 'Especiales';
            specialSection.appendChild(specialTitle);

            const specialButtonsContainer = document.createElement('div');
            specialButtonsContainer.className = 'category-buttons';

            specialCats.sort().forEach(category => {
                const zombieCount = this.zombieCategories[category].length;
                const displayName = this.formatCategoryName(category); // ¡CAMBIADO!

                const button = document.createElement('button');
                button.className = 'category-btn';
                button.dataset.category = category;

                button.innerHTML = `
                <span>${displayName}</span>
                <span class="badge">${zombieCount}</span>
            `;

                specialButtonsContainer.appendChild(button);
            });

            specialSection.appendChild(specialButtonsContainer);
            categoriesPanel.appendChild(specialSection);
        }

        // 6. Crear sección de Mods (orden alfabético)
        if (modCats.length > 0) {
            const modSection = document.createElement('div');
            modSection.className = 'category-group';

            const modTitle = document.createElement('h6');
            modTitle.className = 'text-muted mb-2';
            modTitle.textContent = 'Mods';
            modSection.appendChild(modTitle);

            const modButtonsContainer = document.createElement('div');
            modButtonsContainer.className = 'category-buttons';

            modCats.sort().forEach(category => {
                const zombieCount = this.zombieCategories[category].length;
                const displayName = this.formatCategoryName(category); // ¡CAMBIADO!

                const button = document.createElement('button');
                button.className = 'category-btn mod-category';
                button.dataset.category = category;

                button.innerHTML = `
                <span>${displayName}</span>
                 <span class="mod-badge-small">MOD</span>
                <span class="badge">${zombieCount}</span>
               
            `;

                modButtonsContainer.appendChild(button);
            });

            modSection.appendChild(modButtonsContainer);
            categoriesPanel.appendChild(modSection);
        }

        console.log('=== FIN GENERACIÓN BOTONES ===');
    }


    // En el método groupCategoriesDynamically()
    groupCategoriesDynamically() {
        console.log('=== INICIANDO groupCategoriesDynamically ===');

        // ORDEN EXACTO como quieres que aparezcan (basado en lo que muestras)
        const worldOrder = [
            'Modern',
            'Egypt',
            'Pirate',
            "Wildwest",
            'Dino',
            'Lostcity',
            'Dark',
            'Iceage',
            'Eighties',
            'Future',
            'Beach',

        ];

        console.log('Mundos en orden deseado:', worldOrder);
        console.log('Todas las categorías disponibles:', Object.keys(this.zombieCategories));

        // Grupo inicial
        const categoryGroups = {
            "Mundos": [],
            "Especiales": [],
            "Mods": [],
            "Otros": []
        };

        // 1. Primero, separar los mundos (comparación EXACTA)
        const worldCategories = [];
        const otherCategories = [];

        Object.keys(this.zombieCategories).forEach(category => {
            // Buscar coincidencia EXACTA (case-sensitive)
            const isExactMatch = worldOrder.some(world => category === world);

            // Si no es exacto, buscar insensible a mayúsculas
            const isMatch = isExactMatch || worldOrder.some(world =>
                category.toLowerCase() === world.toLowerCase()
            );

            if (isMatch) {
                worldCategories.push(category);
            } else {
                otherCategories.push(category);
            }
        });

        console.log('Mundos encontrados:', worldCategories);
        console.log('Otras categorías:', otherCategories.length);

        // 2. Ordenar mundos según worldOrder
        const sortedWorldCategories = [];

        // Agregar en el orden especificado
        worldOrder.forEach(desiredWorld => {
            // Buscar la categoría que coincida
            const foundCategory = worldCategories.find(category =>
                category === desiredWorld ||
                category.toLowerCase() === desiredWorld.toLowerCase()
            );

            if (foundCategory) {
                sortedWorldCategories.push(foundCategory);
            }
        });

        console.log('Mundos ordenados:', sortedWorldCategories);

        // 3. Clasificar otras categorías
        const specialCategories = [];
        const modCategories = [];
        const otherRemaining = [];

        otherCategories.forEach(category => {
            const lowerCat = category.toLowerCase();

            if (this.isSpecialCategory(category)) {
                specialCategories.push(category);
            } else if (this.isModCategory(category)) {
                modCategories.push(category);
            } else {
                otherRemaining.push(category);
            }
        });

        // 4. Ordenar alfabéticamente las demás categorías
        const sortedSpecialCategories = specialCategories.sort((a, b) => a.localeCompare(b));
        const sortedModCategories = modCategories.sort((a, b) => a.localeCompare(b));
        const sortedOtherCategories = otherRemaining.sort((a, b) => a.localeCompare(b));

        // 5. Asignar a grupos
        categoryGroups["Mundos"] = sortedWorldCategories;
        categoryGroups["Especiales"] = sortedSpecialCategories;
        categoryGroups["Mods"] = sortedModCategories;
        categoryGroups["Otros"] = sortedOtherCategories;

        console.log('=== RESULTADO FINAL ===');
        console.log('Mundos:', categoryGroups["Mundos"]);
        console.log('Especiales:', categoryGroups["Especiales"].length);
        console.log('Mods:', categoryGroups["Mods"].length);
        console.log('Otros:', categoryGroups["Otros"].length);

        return categoryGroups;
    }


    getCategoryDisplayName(category) {
        // Si ya es un string válido, formatearlo
        if (typeof category === 'string') {
            return category
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
        }
        return String(category);
    }

    // Elimina el método isWorldCategory que está causando conflicto
    // o déjalo simple:
    isWorldCategory(category) {
        const worldNames = [
            'Modern',
            'Egypt',
            'Pirate',
            "Wildwest",
            'Dino',
            'Lostcity',
            'Dark',
            'Iceage',
            'Eighties',
            'Future',
            'Beach',
        ];

        return worldNames.some(world =>
            category === world ||
            category.toLowerCase() === world.toLowerCase()
        );
    }

    isModCategory(category) {
        const zombies = this.zombieCategories[category] || [];
        return isModCategory(category, zombies);
    }

    // Generar contenido de categorías
    generateZombieCategoriesContent() {
        const contentPanel = document.getElementById('zombieCategoriesContent');
        if (!contentPanel) return;

        contentPanel.innerHTML = '';

        console.log('=== GENERANDO CONTENIDO DE CATEGORÍAS ===');

        // ORDEN MANUAL para mostrar las secciones
        const displayOrder = [
            'Modern',
            'Egypt',
            'Pirate',
            "Wildwest",
            'Dino',
            'Lostcity',
            'Dark',
            'Iceage',
            'Eighties',
            'Future',
            'Beach',
        ];

        // 1. Primero mostrar los mundos en orden
        displayOrder.forEach(desiredCategory => {
            // Buscar la categoría que coincida
            const category = Object.keys(this.zombieCategories).find(cat =>
                cat === desiredCategory ||
                cat.toLowerCase() === desiredCategory.toLowerCase()
            );

            if (category && this.zombieCategories[category] && this.zombieCategories[category].length > 0) {
                console.log(`Mostrando categoría: ${category}`);

                const categorySection = document.createElement('div');
                categorySection.className = 'category-section';
                categorySection.id = `category-${category.replace(/\s+/g, '-').toLowerCase()}`;

                const zombies = this.zombieCategories[category];

                categorySection.innerHTML = `
                <div class="category-header">
                    <h4>${category}</h4>
                    <div class="category-description">
                        ${zombies.length} zombies disponibles
                    </div>
                </div>
                <div class="zombie-grid" data-category="${category}">
                    ${this.generateZombieCardsHTML(zombies)}
                </div>
            `;

                contentPanel.appendChild(categorySection);
            }
        });

        // 2. Luego mostrar las demás categorías (excluyendo las ya mostradas)
        const shownCategories = new Set(displayOrder);
        const remainingCategories = Object.entries(this.zombieCategories).filter(([category, zombies]) =>
            !shownCategories.has(category) &&
            zombies && zombies.length > 0
        );

        // Ordenar alfabéticamente las demás categorías
        remainingCategories.sort(([catA], [catB]) => catA.localeCompare(catB));

        remainingCategories.forEach(([category, zombies]) => {
            console.log(`Mostrando categoría restante: ${category}`);

            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            categorySection.id = `category-${category.replace(/\s+/g, '-').toLowerCase()}`;

            categorySection.innerHTML = `
            <div class="category-header">
                <h4>${category}</h4>
                <div class="category-description">
                    ${zombies.length} zombies disponibles
                </div>
            </div>
            <div class="zombie-grid" data-category="${category}">
                ${this.generateZombieCardsHTML(zombies)}
            </div>
        `;

            contentPanel.appendChild(categorySection);
        });

        // Verificar si hay contenido
        this.checkNoResults();

        console.log('=== FIN GENERACIÓN CONTENIDO ===');
    }

    // Añade este método en tu clase EnhancedLevelGenerator
    formatCategoryName(category) {
        if (!category || typeof category !== 'string') return category;

        // Lista de palabras especiales que deben mantener su formato
        const specialFormats = {
            'modern': 'Modern',
            'egypt': 'Egypt',
            'pirate': 'Pirate',
            'wildwest': 'Wildwest',
            'dino': 'Dino',
            'lostcity': 'Lostcity',
            'dark': 'Dark',
            'iceage': 'Iceage',
            'eighties': 'Eighties',
            'future': 'Future',
            'beach': 'Beach'
        };

        const lowerCategory = category.toLowerCase();

        // Si es un mundo conocido, usar el formato especial
        if (specialFormats[lowerCategory]) {
            return specialFormats[lowerCategory];
        }

        // Si no, formatear normalmente: primera letra mayúscula, resto minúsculas
        return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    }

    generateZombieCardsHTML(zombies) {
        console.log('Generando tarjetas para', zombies.length, 'zombies');

        return zombies.map(zombieName => {
            const info = this.getZombieInfo(zombieName);
            const threat = this.calculateZombieThreatLevel(zombieName);
            const weight = this.getZombieWeight(zombieName);

            // Determinar si tiene datos del JSON
            const hasJsonData = this.zombieDataLoader.loaded &&
                this.zombieDataLoader.getZombieInfo(zombieName);

            // Obtener categoría del zombie
            const zombieCategory = info?.category || 'Sin categoría';

            // Determinar si es un zombie de mod
            const isModZombie = this.isModZombie(zombieName);
            const modInfo = isModZombie ? this.detectModFromZombie(zombieName) : null;

            // Rutas de imágenes
            const zombieImagePath = `Assets/Zombies/${zombieName}.webp`;
            const errorImagePath = 'Assets/Zombies/error.webp';

            return `
            <div class="zombie-card" data-zombie="${zombieName}" 
                 data-category="${zombieCategory}"
                 data-has-data="${hasJsonData ? 'true' : 'false'}"
                 ${isModZombie ? `data-mod="${modInfo?.name || 'custom'}"` : ''}>
                <div class="selection-indicator">
                    <i class="bi bi-check"></i>
                </div>
                <div class="zombie-image-container">
                    <img src="${zombieImagePath}" 
                         alt="${zombieName}" 
                         class="zombie-image"
                         onerror="
                            console.log('Imagen no encontrada para ${zombieName}, usando error.webp');
                            this.src = '${errorImagePath}';
                            this.style.filter = 'grayscale(20%) opacity(90%)';
                         ">
                    ${isModZombie ? `<div class="mod-badge" title="${modInfo?.displayName || 'Mod'}">M</div>` : ''}
                </div>
                <div class="zombie-name">${zombieName}</div>
                <div class="zombie-stats">
                    <span class="stat-item">HP: ${info?.hitpoints || 'N/A'}</span>
                    <span class="stat-item">Vel: ${info?.speed || 'N/A'}</span>
                    <span class="stat-item">Amenaza: ${threat.toFixed(1)}</span>
                    ${info?.tiene_armadura ? '<span class="badge armor-badge">🛡️ Armadura</span>' : ''}
                    ${info?.tipo_mod ? `<span class="badge mod-badge-label">${info.tipo_mod}</span>` : ''}
                    ${isModZombie && modInfo ? `<span class="badge mod-source-badge">${modInfo.displayName}</span>` : ''}
                </div>
            </div>
        `;
        }).join('');
    }


    isModZombie(zombieName) {
        return isModZombie(zombieName);
    }

    detectModFromZombie(zombieName) {
        return detectModFromZombie(zombieName);
    }
    detectAndGroupMods() {
        const modGroups = {};
        const allZombies = [];

        // Recopilar todos los zombies de todas las categorías
        Object.values(this.zombieCategories).forEach(zombies => {
            allZombies.push(...zombies);
        });

        // Agrupar zombies SOLO por mods predefinidos
        allZombies.forEach(zombieName => {
            const modInfo = this.detectModFromZombie(zombieName);

            // SOLO procesar si es un mod predefinido (no null)
            if (modInfo && modInfo.name) {
                const modName = modInfo.name;

                if (!modGroups[modName]) {
                    modGroups[modName] = {
                        name: modName,
                        displayName: modInfo.displayName,
                        zombies: []
                    };
                }

                if (!modGroups[modName].zombies.includes(zombieName)) {
                    modGroups[modName].zombies.push(zombieName);
                }
            }
        });

        // Crear categorías SOLO para mods predefinidos detectados
        Object.values(modGroups).forEach(modGroup => {
            if (modGroup.zombies.length > 0) {
                const categoryName = `Mod - ${modGroup.displayName}`;
                if (!this.zombieCategories[categoryName]) {
                    this.zombieCategories[categoryName] = modGroup.zombies;
                    console.log(`✓ Categoría de mod predefinido detectada: ${categoryName} (${modGroup.zombies.length} zombies)`);
                }
            }
        });
    }

    // Configurar listeners para la nueva interfaz
    setupNewZombieSelectionListeners() {
        console.log('Configurando listeners de selección de zombies...');

        // Botones de categoría
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-btn')) {
                const category = e.target.closest('.category-btn').dataset.category;
                this.scrollToCategory(category);
                this.setActiveCategory(category);
            }
        });

        // Tarjetas de zombies
        document.addEventListener('click', (e) => {
            const zombieCard = e.target.closest('.zombie-card');
            if (zombieCard) {
                const zombieName = zombieCard.dataset.zombie;
                zombieCard.classList.toggle('selected');
                this.updateSelectionCount();
            }
        });

        // Búsqueda global
        const globalSearch = document.getElementById('zombieSearchGlobal');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.filterAllZombies(e.target.value);
            });
        }

        // Botones de acción
        const addBtn = document.getElementById('addSelectedZombiesBtn');
        const clearBtn = document.getElementById('clearAllZombiesBtn');

        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.addSelectedZombiesFromGrid();
                this.markTabAsChanged('waves');
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllZombiesFromGrid();
            });
        }

        // Inicializar contador
        this.updateSelectionCount();
    }

    // Navegar a categoría
    scrollToCategory(category) {
        const categoryId = `category-${category.replace(/\s+/g, '-').toLowerCase()}`;
        const element = document.getElementById(categoryId);

        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Establecer categoría activa
    setActiveCategory(category) {
        // Remover clase active de todos los botones
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Agregar clase active al botón correspondiente
        const activeBtn = document.querySelector(`.category-btn[data-category="${category}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    filterAllZombies(searchTerm) {
        const searchLower = searchTerm.toLowerCase().trim();
        const contentPanel = document.getElementById('zombieCategoriesContent');
        const noResultsMessage = document.getElementById('noResultsMessage');

        if (!contentPanel) return;

        let totalVisible = 0;

        // Mostrar/ocultar categorías y filtrar zombies dentro de ellas
        document.querySelectorAll('.category-section').forEach(section => {
            const categoryId = section.id.replace('category-', '');
            const category = Object.keys(this.zombieCategories).find(
                cat => cat.replace(/\s+/g, '-').toLowerCase() === categoryId
            );

            if (category) {
                const zombies = this.zombieCategories[category];
                const grid = section.querySelector('.zombie-grid');

                if (searchLower === '') {
                    // Mostrar todos los zombies en el ORDEN ORIGINAL
                    section.style.display = 'block';
                    grid.innerHTML = this.generateZombieCardsHTML(zombies);
                    totalVisible += zombies.length;
                } else {
                    // Filtrar zombies pero mantener el orden de los que coinciden
                    const filteredZombies = zombies.filter(zombie =>
                        zombie.toLowerCase().includes(searchLower)
                    );

                    if (filteredZombies.length > 0) {
                        section.style.display = 'block';
                        grid.innerHTML = this.generateZombieCardsHTML(filteredZombies);
                        totalVisible += filteredZombies.length;
                    } else {
                        section.style.display = 'none';
                    }
                }
            }
        });

        // Mostrar/ocultar mensaje de no resultados
        this.checkNoResults();
    }



    // Verificar si hay resultados
    checkNoResults() {
        const contentPanel = document.getElementById('zombieCategoriesContent');
        const noResultsMessage = document.getElementById('noResultsMessage');
        const searchInput = document.getElementById('zombieSearchGlobal');

        if (!contentPanel || !noResultsMessage) return;

        // Contar secciones visibles
        const visibleSections = Array.from(contentPanel.querySelectorAll('.category-section'))
            .filter(section => section.style.display !== 'none');

        if (visibleSections.length === 0 && searchInput && searchInput.value.trim() !== '') {
            noResultsMessage.classList.remove('d-none');
        } else {
            noResultsMessage.classList.add('d-none');
        }
    }


    // Añadir zombies seleccionados desde la cuadrícula
    addSelectedZombiesFromGrid() {
        const selectedCards = document.querySelectorAll('.zombie-card.selected');
        let addedCount = 0;

        selectedCards.forEach(card => {
            const zombieName = card.dataset.zombie;
            if (zombieName && !this.levelData.zombies.includes(zombieName)) {
                this.levelData.zombies.push(zombieName);
                addedCount++;
                card.classList.remove('selected');
            }
        });

        if (addedCount > 0) {
            this.showMessage('Zombies Añadidos', `Se añadieron ${addedCount} zombies a la lista`, 'success');
            this.updateSelectedZombiesDisplay();
            this.updateSelectionCount();

            if (this.autoDetectOnZombieSelection) {
                this.autoDetectSettings();
            }
        } else {
            this.showMessage('Sin Selección', 'No hay zombies seleccionados para añadir', 'warning');
        }
    }

    // Limpiar todos los zombies de la cuadrícula
    clearAllZombiesFromGrid() {
        document.querySelectorAll('.zombie-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        this.updateSelectionCount();
    }

    // Actualizar contador de selección
    updateSelectionCount() {
        const selectedCount = document.querySelectorAll('.zombie-card.selected').length;
        const countElement = document.getElementById('selectedCount');
        if (countElement) {
            countElement.textContent = `${selectedCount} seleccionados`;
        }
    }


    isSpecialCategory(category) {
        const categoryLower = category.toLowerCase();

        // Lista de indicadores de categorías especiales
        const specialWords = [
            'flag', 'gargantuar', 'armor', 'flying', 'aquatic',
            'underground', 'special', 'balloon', 'digger', 'boss',
            'cannon', 'balloon', 'digger', 'imp'
        ];

        return specialWords.some(word => categoryLower.includes(word));
    }

    getCategoryDisplayName(category) {
        const displayNames = {

        };

        // Si tenemos un nombre de display específico, usarlo
        if (displayNames[category]) {
            return displayNames[category];
        }

        // Si no, formatear el nombre
        return category
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

    }





    initializeMowerModal() {
        // Generar opciones de podadoras
        this.generateMowerModalOptions();

        // Configurar listeners del modal de podadoras
        this.setupMowerModalListeners();

        // Configurar apertura/cierre del modal
        const selectedMowerCard = document.getElementById('selectedMowerCard');
        const mowerModalOverlay = document.getElementById('mowerModalOverlay');
        const mowerModalClose = document.getElementById('mowerModalClose');
        const mowerModalCancel = document.getElementById('mowerModalCancel');
        const mowerModalAccept = document.getElementById('mowerModalAccept');

        // Abrir modal al hacer clic en la tarjeta
        if (selectedMowerCard) {
            selectedMowerCard.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (mowerModalOverlay) {
                    const scrollY = window.scrollY || document.documentElement.scrollTop;

                    mowerModalOverlay.classList.add('show');
                    document.body.classList.add('modal-open');

                    setTimeout(() => {
                        window.scrollTo(0, scrollY);
                    }, 0);

                    // Resaltar la podadora actualmente seleccionada
                    this.highlightSelectedMower(this.levelData.mower_type || "ModernMowers");

                    // Enfocar el campo de búsqueda
                    const mowerSearch = document.getElementById('mowerSearch');
                    if (mowerSearch) {
                        setTimeout(() => {
                            mowerSearch.focus();
                        }, 100);
                        mowerSearch.value = '';
                        this.filterMowers('');
                    }
                }
            });
        }

        // Función para cerrar el modal
        const closeModal = () => {
            if (mowerModalOverlay) {
                const scrollY = window.scrollY || document.documentElement.scrollTop;

                mowerModalOverlay.classList.remove('show');
                document.body.classList.remove('modal-open');

                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                }, 10);
            }
        };

        // Cerrar modal con botones
        if (mowerModalClose) {
            mowerModalClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }

        if (mowerModalCancel) {
            mowerModalCancel.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }

        if (mowerModalAccept) {
            mowerModalAccept.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
                console.log('Podadoras seleccionadas:', this.levelData.mower_type);
            });
        }

        // Cerrar modal haciendo clic fuera
        if (mowerModalOverlay) {
            mowerModalOverlay.addEventListener('click', (e) => {
                if (e.target === mowerModalOverlay) {
                    e.preventDefault();
                    closeModal();
                }
            });
        }

        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mowerModalOverlay &&
                mowerModalOverlay.classList.contains('show')) {
                e.preventDefault();
                closeModal();
            }
        });
    }




    generateMowerModalOptions() {
        const mowerGrid = document.getElementById('mowerGrid');
        if (!mowerGrid) return;

        mowerGrid.innerHTML = '';

        // USAR LAS CONSTANTES IMPORTADAS
        this.mowerTypes.forEach(mowerType => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-sm-6';

            const displayName = MOWER_DISPLAY_NAMES[mowerType] || mowerType;
            const imagePath = MOWER_IMAGES[mowerType] || 'Assets/Mowers/Modern.webp';

            col.innerHTML = `
            <div class="mower-option" data-mower="${mowerType}">
                <img src="${imagePath}" alt="${displayName}" 
                     class="mower-option-img" />
                <div class="mower-option-overlay">${displayName}</div>
            </div>
        `;

            mowerGrid.appendChild(col);
        });
    }



    setupMowerModalListeners() {
        const mowerGrid = document.getElementById('mowerGrid');

        // Seleccionar podadoras
        if (mowerGrid) {
            mowerGrid.addEventListener('click', (e) => {
                const mowerOption = e.target.closest('.mower-option');
                if (mowerOption) {
                    const mowerType = mowerOption.dataset.mower;
                    this.selectMower(mowerType);
                }
            });
        }

        // Filtro de búsqueda
        const mowerSearch = document.getElementById('mowerSearch');
        if (mowerSearch) {
            mowerSearch.addEventListener('input', (e) => {
                this.filterMowers(e.target.value.toLowerCase());
            });
        }
    }

    selectMower(mowerType) {
        // Actualizar el nivel de datos
        this.levelData.mower_type = mowerType;

        // Actualizar la imagen mostrada
        this.updateSelectedMowerDisplay();

        // Marcar como cambiado
        this.markTabAsChanged('basic');

        // Resaltar la opción seleccionada en el modal
        this.highlightSelectedMower(mowerType);
    }

    updateSelectedMowerDisplay() {
        const selectedMowerImage = document.getElementById('selectedMowerImage');
        const selectedMowerName = document.getElementById('selectedMowerName');

        if (!selectedMowerImage || !selectedMowerName) return;

        const mowerType = this.levelData.mower_type || "ModernMowers";

        // USAR LAS CONSTANTES IMPORTADAS
        const displayName = MOWER_DISPLAY_NAMES[mowerType] || mowerType;
        const imagePath = MOWER_IMAGES[mowerType] || 'Assets/Mowers/Modern.webp';

        // Actualizar imagen
        selectedMowerImage.src = imagePath;
        selectedMowerImage.alt = displayName;

        // Actualizar nombre
        selectedMowerName.textContent = displayName;
    }

    highlightSelectedMower(mowerType) {
        // Remover la clase 'selected' de todas las opciones
        document.querySelectorAll('.mower-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Agregar la clase 'selected' a la opción actual
        const selectedOption = document.querySelector(`.mower-option[data-mower="${mowerType}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
    }

    filterMowers(searchTerm) {
        const mowerOptions = document.querySelectorAll('.mower-option');

        mowerOptions.forEach(option => {
            const mowerType = option.dataset.mower.toLowerCase();
            const displayName = option.querySelector('.mower-option-overlay').textContent.toLowerCase();

            if (mowerType.includes(searchTerm) || displayName.includes(searchTerm)) {
                option.style.display = 'block';
                setTimeout(() => {
                    option.style.opacity = '1';
                    option.style.transform = 'translateY(0)';
                }, 10);
            } else {
                option.style.opacity = '0';
                option.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    option.style.display = 'none';
                }, 300);
            }
        });
    }



    initializeScenarioModal() {
        // Generar opciones de escenarios
        this.generateScenarioModalOptions();

        // Configurar listeners del modal de escenarios
        this.setupScenarioModalListeners();

        // Configurar apertura/cierre del modal
        const selectedScenarioCard = document.getElementById('selectedScenarioCard');
        const scenarioModalOverlay = document.getElementById('scenarioModalOverlay');
        const scenarioModalClose = document.getElementById('scenarioModalClose');
        const scenarioModalCancel = document.getElementById('scenarioModalCancel');
        const scenarioModalAccept = document.getElementById('scenarioModalAccept');

        // Abrir modal al hacer clic en la tarjeta del escenario seleccionado
        if (selectedScenarioCard) {
            selectedScenarioCard.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (scenarioModalOverlay) {
                    // Guardar posición actual del scroll
                    const scrollY = window.scrollY || document.documentElement.scrollTop;

                    // Mostrar el modal
                    scenarioModalOverlay.classList.add('show');
                    document.body.classList.add('modal-open');

                    // Restaurar posición del scroll
                    setTimeout(() => {
                        window.scrollTo(0, scrollY);
                    }, 0);

                    // Resaltar el escenario actualmente seleccionado
                    this.highlightSelectedScenario(this.levelData.stage || "ModernStage");

                    // Enfocar el campo de búsqueda
                    const scenarioSearch = document.getElementById('scenarioSearch');
                    if (scenarioSearch) {
                        setTimeout(() => {
                            scenarioSearch.focus();
                        }, 100);
                        scenarioSearch.value = '';
                        this.filterScenarios('');
                    }
                }
            });
        }

        // Función para cerrar el modal
        const closeModal = () => {
            if (scenarioModalOverlay) {
                const scrollY = window.scrollY || document.documentElement.scrollTop;

                scenarioModalOverlay.classList.remove('show');
                document.body.classList.remove('modal-open');

                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                }, 10);
            }
        };

        // Cerrar modal con botones
        if (scenarioModalClose) {
            scenarioModalClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }

        if (scenarioModalCancel) {
            scenarioModalCancel.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }

        if (scenarioModalAccept) {
            scenarioModalAccept.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
                console.log('Escenario seleccionado:', this.levelData.stage);
            });
        }

        // Cerrar modal haciendo clic fuera
        if (scenarioModalOverlay) {
            scenarioModalOverlay.addEventListener('click', (e) => {
                if (e.target === scenarioModalOverlay) {
                    e.preventDefault();
                    closeModal();
                }
            });
        }

        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && scenarioModalOverlay &&
                scenarioModalOverlay.classList.contains('show')) {
                e.preventDefault();
                closeModal();
            }
        });
    }



    generateScenarioModalOptions() {
        const scenarioGrid = document.getElementById('scenarioGrid');
        if (!scenarioGrid) return;

        scenarioGrid.innerHTML = '';

        // Obtener TODOS los escenarios (no solo los del mundo actual)
        const allStages = Object.keys(this.stageImages);

        // Filtrar el placeholder "default" si existe
        const stages = allStages.filter(stage => stage !== 'default');

        stages.forEach(stage => {
            const col = document.createElement('div');
            col.className = 'col-md-4 col-sm-6';

            const imagePath = this.stageImages[stage] || this.stageImages['default'];

            col.innerHTML = `
            <div class="scenario-option" data-stage="${stage}">
                <img src="${imagePath}" alt="${stage}" 
                     class="scenario-option-img" />
                <div class="scenario-option-overlay">${stage}</div>
            </div>
        `;

            scenarioGrid.appendChild(col);
        });
    }

    setupScenarioModalListeners() {
        const scenarioGrid = document.getElementById('scenarioGrid');

        // Seleccionar escenario
        if (scenarioGrid) {
            scenarioGrid.addEventListener('click', (e) => {
                const scenarioOption = e.target.closest('.scenario-option');
                if (scenarioOption) {
                    const stageName = scenarioOption.dataset.stage;
                    this.selectScenario(stageName);
                }
            });
        }

        // Cuando se abre el modal, marcar la opción seleccionada
        const scenarioModal = document.getElementById('scenarioModal');
        if (scenarioModal) {
            scenarioModal.addEventListener('show.bs.modal', () => {
                // Regenerar opciones basadas en el mundo actual
                this.generateScenarioModalOptions();

                const currentStage = this.levelData.stage || "";
                this.highlightSelectedScenario(currentStage);
            });
        }

        // Filtro de búsqueda
        const scenarioSearch = document.getElementById('scenarioSearch');
        if (scenarioSearch) {
            scenarioSearch.addEventListener('input', (e) => {
                this.filterScenarios(e.target.value.toLowerCase());
            });
        }
    }

    selectScenario(stageName) {
        // Actualizar el nivel de datos
        this.levelData.stage = stageName;

        // Actualizar la imagen mostrada
        this.updateSelectedScenarioDisplay();

        // Marcar como cambiado
        this.markTabAsChanged('basic');

        // Resaltar la opción seleccionada en el modal
        this.highlightSelectedScenario(stageName);
    }

    updateSelectedScenarioDisplay() {
        const selectedScenarioImage = document.getElementById('selectedScenarioImage');
        const selectedScenarioName = document.getElementById('selectedScenarioName');

        if (!selectedScenarioImage || !selectedScenarioName) return;

        const stageName = this.levelData.stage || "";

        // Actualizar imagen
        const imagePath = this.stageImages[stageName] || this.stageImages['default'];
        selectedScenarioImage.src = imagePath;
        selectedScenarioImage.alt = `Escenario ${stageName}`;

        // Actualizar nombre
        selectedScenarioName.textContent = stageName || "Seleccionar Escenario";
    }

    highlightSelectedScenario(stageName) {
        // Remover la clase 'selected' de todas las opciones
        document.querySelectorAll('.scenario-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Agregar la clase 'selected' a la opción actual
        const selectedOption = document.querySelector(`.scenario-option[data-stage="${stageName}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
    }

    filterScenarios(searchTerm) {
        const scenarioOptions = document.querySelectorAll('.scenario-option');

        scenarioOptions.forEach(option => {
            const stageName = option.dataset.stage.toLowerCase();

            if (stageName.includes(searchTerm)) {
                option.style.display = 'block';
                setTimeout(() => {
                    option.style.opacity = '1';
                    option.style.transform = 'translateY(0)';
                }, 10);
            } else {
                option.style.opacity = '0';
                option.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    option.style.display = 'none';
                }, 300);
            }
        });
    }

    initializeWorldModal() {
        // El modal ya existe en el HTML, solo necesitamos inicializarlo

        // Generar opciones de mundos
        this.generateWorldModalOptions();

        // Configurar listeners del modal
        this.setupWorldModalListeners();

        // *** AGREGAR: Configurar apertura/cierre del modal ***
        const selectedWorldCard = document.getElementById('selectedWorldCard');
        const worldModalOverlay = document.getElementById('worldModalOverlay');
        const worldModalClose = document.getElementById('worldModalClose');
        const worldModalCancel = document.getElementById('worldModalCancel');
        const worldModalAccept = document.getElementById('worldModalAccept');

        // Verificar que los elementos existen
        console.log('Elementos del modal:', {
            selectedWorldCard: !!selectedWorldCard,
            worldModalOverlay: !!worldModalOverlay,
            worldModalClose: !!worldModalClose,
            worldModalCancel: !!worldModalCancel,
            worldModalAccept: !!worldModalAccept
        });

        // Abrir modal al hacer clic en la tarjeta del mundo seleccionado
        if (selectedWorldCard) {
            selectedWorldCard.addEventListener('click', (e) => {
                console.log('Clic en selectedWorldCard');

                // *** PREVENIR COMPORTAMIENTO POR DEFECTO ***
                e.preventDefault();
                e.stopPropagation();

                if (worldModalOverlay) {
                    // *** GUARDAR POSICIÓN ACTUAL DEL SCROLL ***
                    const scrollY = window.scrollY || document.documentElement.scrollTop;

                    // Añadir clase 'show' para mostrar el modal
                    worldModalOverlay.classList.add('show');
                    // Añadir clase al body para prevenir scroll
                    document.body.classList.add('modal-open');

                    // *** RESTAURAR POSICIÓN DEL SCROLL INMEDIATAMENTE ***
                    setTimeout(() => {
                        window.scrollTo(0, scrollY);
                    }, 0);

                    // Resaltar el mundo actualmente seleccionado
                    this.highlightSelectedWorld(this.levelData.world || "Moderno");

                    // Enfocar el campo de búsqueda (pero no hacer scroll)
                    const worldSearch = document.getElementById('worldSearch');
                    if (worldSearch) {
                        // Usar setTimeout para que no afecte el scroll
                        setTimeout(() => {
                            worldSearch.focus();
                        }, 100);
                        worldSearch.value = ''; // Limpiar búsqueda previa
                        this.filterWorlds(''); // Mostrar todos los mundos
                    }
                }
            });
        } else {
            console.error('No se encontró selectedWorldCard');
        }

        // Función para cerrar el modal
        const closeModal = () => {
            if (worldModalOverlay) {
                // *** GUARDAR POSICIÓN ACTUAL ANTES DE CERRAR ***
                const scrollY = window.scrollY || document.documentElement.scrollTop;

                // Remover clase 'show' para ocultar el modal
                worldModalOverlay.classList.remove('show');
                // Remover clase del body
                document.body.classList.remove('modal-open');

                // *** RESTAURAR POSICIÓN DEL SCROLL ***
                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                }, 10);
            }
        };

        // Cerrar modal con el botón X
        if (worldModalClose) {
            worldModalClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }

        // Cerrar modal con el botón Cancelar
        if (worldModalCancel) {
            worldModalCancel.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
            });
        }

        // Cerrar modal con el botón Aceptar
        if (worldModalAccept) {
            worldModalAccept.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModal();
                console.log('Mundo seleccionado:', this.levelData.world);
            });
        }

        // Cerrar modal haciendo clic fuera del contenido
        if (worldModalOverlay) {
            worldModalOverlay.addEventListener('click', (e) => {
                if (e.target === worldModalOverlay) {
                    e.preventDefault();
                    closeModal();
                }
            });
        }

        // Cerrar modal con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && worldModalOverlay &&
                worldModalOverlay.classList.contains('show')) {
                e.preventDefault();
                closeModal();
            }
        });


    }

    generateWorldModalOptions() {
        const worldGrid = document.getElementById('worldGrid');
        if (!worldGrid) return;

        worldGrid.innerHTML = '';

        Object.entries(this.worldImages).forEach(([worldName, imagePath]) => {
            const col = document.createElement('div');
            col.className = 'col-md-4 col-sm-6';

            col.innerHTML = `
            <div class="world-option" data-world="${worldName}">
                <img src="${imagePath}" alt="${worldName}" 
                     class="world-option-img" />
                <div class="world-option-overlay">${worldName}</div>
            </div>
        `;

            worldGrid.appendChild(col);
        });
    }

    setupWorldModalListeners() {
        const worldGrid = document.getElementById('worldGrid');
        const worldModal = document.getElementById('worldModal');

        // Seleccionar mundo
        if (worldGrid) {
            worldGrid.addEventListener('click', (e) => {
                const worldOption = e.target.closest('.world-option');
                if (worldOption) {
                    const worldName = worldOption.dataset.world;
                    this.selectWorld(worldName);
                }
            });
        }

        // Cuando se abre el modal, marcar la opción seleccionada
        if (worldModal) {
            worldModal.addEventListener('show.bs.modal', () => {
                const currentWorld = this.levelData.world || "Moderno";
                this.highlightSelectedWorld(currentWorld);
            });
        }

        // Filtro de búsqueda
        const worldSearch = document.getElementById('worldSearch');
        if (worldSearch) {
            worldSearch.addEventListener('input', (e) => {
                this.filterWorlds(e.target.value.toLowerCase());
            });
        }
    }

    selectWorld(worldName) {
        // Actualizar el nivel de datos
        this.levelData.world = worldName;

        // Actualizar la imagen mostrada
        this.updateSelectedWorldDisplay();

        // Actualizar las etapas (stages) disponibles
        this.updateStages();

        // Marcar como cambiado
        this.markTabAsChanged('basic');

        // Resaltar la opción seleccionada en el modal
        this.highlightSelectedWorld(worldName);
    }

    updateSelectedWorldDisplay() {
        const selectedWorldImage = document.getElementById('selectedWorldImage');
        const selectedWorldName = document.getElementById('selectedWorldName');

        if (!selectedWorldImage || !selectedWorldName) return;

        const worldName = this.levelData.world || "Moderno";

        // Actualizar imagen
        if (this.worldImages[worldName]) {
            selectedWorldImage.src = this.worldImages[worldName];
            selectedWorldImage.alt = `Mundo ${worldName}`;
        }

        // Actualizar nombre
        selectedWorldName.textContent = worldName;
    }

    highlightSelectedWorld(worldName) {
        // Remover la clase 'selected' de todas las opciones
        document.querySelectorAll('.world-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Agregar la clase 'selected' a la opción actual
        const selectedOption = document.querySelector(`.world-option[data-world="${worldName}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');

        }
    }

    filterWorlds(searchTerm) {
        const worldOptions = document.querySelectorAll('.world-option');

        worldOptions.forEach(option => {
            const worldName = option.dataset.world.toLowerCase();

            if (worldName.includes(searchTerm)) {
                option.style.display = 'block';
                setTimeout(() => {
                    option.style.opacity = '1';
                    option.style.transform = 'translateY(0)';
                }, 10);
            } else {
                option.style.opacity = '0';
                option.style.transform = 'translateY(10px)';
                setTimeout(() => {
                    option.style.display = 'none';
                }, 300);
            }
        });
    }

    initializeBoardTab() {
        const boardTab = document.getElementById('board-tab');
        if (boardTab) {
            boardTab.addEventListener('shown.bs.tab', () => {
                if (!this.boardInitialized) {
                    this.initializeBoard();
                }
            });
        }
    }

    initializeBoard() {
        if (this.boardInitialized) return;

        this.boardManager = new BoardManager(this);
        window.boardManager = this.boardManager;

        this.boardManager.initialize();
        this.boardInitialized = true;
    }


    tryRecovery() {
        console.log('🔄 Intentando recuperación...');

        try {
            console.log('1. Reintentando inicialización básica...');

            // Intentar inicializar solo lo esencial
            this.initializeUIWithFallbacks();

            console.log('2. Intentando cargar datos guardados...');
            this.loadSavedData();

            console.log('3. Intentando mostrar al menos la interfaz básica...');

            // Intentar mostrar categorías de zombies aunque falle el resto
            setTimeout(() => {
                try {
                    if (document.getElementById('zombieCategoriesPanel')) {
                        console.log('4. Mostrando categorías de zombies...');
                        this.initializeNewZombieSelection();
                    }
                } catch (e) {
                    console.warn('No se pudo mostrar categorías:', e);
                }
            }, 500);

            console.log('✓ Recuperación parcial completada');
            this.showMessage('Recuperación parcial',
                'Algunas funciones pueden no estar disponibles. La aplicación funciona en modo limitado.',
                'warning');
        } catch (recoveryError) {
            console.error('❌ Recuperación fallida:', recoveryError);
            this.showMessage('Error crítico',
                'La aplicación no puede funcionar correctamente. Por favor, recarga la página.',
                'error');
        }
    }

    initializeUIWithFallbacks() {
        console.log('🛡️ Inicializando UI con manejo de errores...');

        try {
            // Solo inicializar controles básicos que SÍ existen
            if (document.getElementById('levelName')) {
                document.getElementById('levelName').value = this.levelData.level_name;
            }

            if (document.getElementById('levelNumber')) {
                document.getElementById('levelNumber').value = this.levelData.level_number;
            }

            if (document.getElementById('startingSun')) {
                document.getElementById('startingSun').value = this.levelData.starting_sun;
            }

            // Actualizar controles que SÍ existen
            this.updateAllControls();

            console.log('✓ UI básica inicializada con fallbacks');
        } catch (error) {
            console.warn('Error al inicializar UI con fallbacks:', error);
        }
    }

    async init() {
        try {
            console.log('=== INICIANDO GENERADOR DE NIVELES ===');

            // 1. PRIMERO: Verificar que el DOM esté listo
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            console.log('✓ DOM completamente cargado');

            // 2. Verificar elementos requeridos (solo críticos)
            const canContinue = this.checkRequiredElements();
            if (!canContinue) {
                throw new Error('Faltan elementos críticos en el DOM');
            }

            // 3. Inicializar UI básica CON FALLBACKS
            this.initializeUIWithFallbacks();
            this.updateUndergroundControls();
            

            console.log('✓ UI básica inicializada');

            // 4. Cargar datos asíncronos
            await this.loadZombieData();
            console.log('✓ Datos de zombies cargados');

            // 5. Depurar datos (opcional)


            this.debugZombieData();

            // 6. Inicializar componentes que necesitan datos (con try-catch)
            try {
                this.plantManager = new PlantManager();
                console.log('✓ PlantManager inicializado');
            } catch (e) {
                console.warn('Error inicializando PlantManager:', e);
            }

            try {
                this.initializeWorldModal();
                console.log('✓ Modal de mundos inicializado');
            } catch (e) {
                console.warn('Error inicializando modal de mundos:', e);
            }

            try {
                this.initializeMowerModal();
                console.log('✓ Modal de podadoras inicializado');
            } catch (e) {
                console.warn('Error inicializando modal de podadoras:', e);
            }

            try {
                this.initializeScenarioModal();
                console.log('✓ Modal de escenarios inicializado');
            } catch (e) {
                console.warn('Error inicializando modal de escenarios:', e);
            }

            try {
                this.initializeTabSystem();
                console.log('✓ Sistema de pestañas inicializado');
            } catch (e) {
                console.warn('Error inicializando sistema de pestañas:', e);
            }

            // 7. Configurar listeners (con verificación de existencia)
            this.setupEventListenersSafe();
            // setupConverterListeners ya se llamó en el constructor

            console.log('✓ Event listeners configurados');

            // 8. Limpiar estado inicial
            this.cleanZombiesOnStart();

            // 9. Inicializar la nueva selección de zombies (ESTE ES EL MÁS IMPORTANTE)
            this.initializeNewZombieSelection();
            

            // 10. Cargar datos guardados si existen
            this.loadSavedData();

            // 11. Actualizar preview inicial
            this.updatePreview();

            // 12. Marcar como completado
            this.initializationComplete = true;

            console.log('=== GENERADOR DE NIVELES INICIALIZADO EXITOSAMENTE ===');


        } catch (error) {
            console.error('✗ Error durante la inicialización:', error);
            this.showMessage('Error de Inicialización',
                'No se pudo inicializar completamente la aplicación: ' + error.message,
                'error');

            // Intentar recuperación
            this.tryRecovery();
        }
    }

    setupEventListenersSafe() {
        console.log('🔌 Configurando event listeners de forma segura...');

        // Lista de listeners con IDs
        const listeners = [
            {
                id: 'seedSelectionMethod', event: 'change', handler: (e) => {
                    this.levelData.seed_selection_method = e.target.value;
                    this.markTabAsChanged('basic');
                }
            },
            {
                id: 'useUnderground', event: 'change', handler: (e) => {
                    this.levelData.use_underground_zombies = e.target.checked;
                    this.updateUndergroundControls();
                    this.markTabAsChanged('basic');
                }
            },
            {
                id: 'enableSunDropper', event: 'change', handler: (e) => {
                    this.levelData.enable_sun_dropper = e.target.checked;
                    this.markTabAsChanged('basic');
                }
            },
            {
                id: 'challengesEnabled', event: 'change', handler: (e) => {
                    this.challengesData.enabled = e.target.checked;
                    this.toggleChallengesContainer(e.target.checked);
                    this.markTabAsChanged('challenges');
                }
            },
            {
                id: 'enableSeedSlots', event: 'change', handler: (e) => {
                    this.levelData.enable_seed_slots = e.target.checked;
                    this.updateSeedSlotsControl();
                    this.markTabAsChanged('basic');
                }
            },
            {
                id: 'seedSlotsCount', event: 'input', handler: (e) => {
                    this.levelData.seed_slots_count = parseInt(e.target.value) || 8;
                    this.markTabAsChanged('basic');
                }
            },
            { id: 'generateLevelBtn', event: 'click', handler: () => this.generateLevel() },
            { id: 'generateThematicBtn', event: 'click', handler: () => this.generateThematicLevel() },
            { id: 'saveLevelBtn', event: 'click', handler: () => this.saveLevel() },
            { id: 'loadConfigBtn', event: 'click', handler: () => this.loadConfig() },
            { id: 'autoDetectBtn', event: 'click', handler: () => this.autoDetectSettings() },
            { id: 'generateWavesBtn', event: 'click', handler: () => this.generateSmartWaves() },
            { id: 'updateStatsBtn', event: 'click', handler: () => this.updateStats() },
            { id: 'copyJsonBtn', event: 'click', handler: () => this.copyJsonToClipboard() },
            { id: 'resetBtn', event: 'click', handler: () => this.resetAllSettings() },
            { id: 'exportSettingsBtn', event: 'click', handler: () => this.exportSettings() },
            { id: 'importSettingsBtn', event: 'click', handler: () => this.importSettings() },


            {
                id: 'levelName', event: 'input', handler: (e) => {
                    this.levelData.level_name = e.target.value;
                    this.markTabAsChanged('basic');
                }
            },
            { id: 'plantFoodWaves', event: 'input', handler: () => this.markTabAsChanged('waves') }
        ];

        // Configurar cada listener con verificación
        let configured = 0;
        listeners.forEach(({ id, event, handler }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
                configured++;
                console.log(`✓ Listener configurado: ${id}`);
            } else {
                console.log(`ℹ️ Elemento no encontrado para listener: ${id}`);
            }
        });

        // Listeners especiales para elementos múltiples
        try {
            // Checkboxes de desafíos
            document.querySelectorAll('.challenge-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    const challengeId = e.target.dataset.challenge;
                    if (challengeId) {
                        this.updateChallengeState(challengeId, e.target.checked);
                        this.markTabAsChanged('challenges');
                    }
                });
            });

            // Inputs de desafíos
            document.querySelectorAll('.challenge-input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const challengeId = e.target.dataset.challenge;
                    if (challengeId) {
                        this.updateChallengeValue(challengeId, e.target);
                        this.markTabAsChanged('challenges');
                    }
                });
            });

            // Dificultad (radio buttons)
            document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
                radio.addEventListener('change', () => this.markTabAsChanged('waves'));
            });

            console.log('✓ Listeners especiales configurados');
        } catch (e) {
            console.warn('Error configurando listeners especiales:', e);
        }

        console.log(`✅ Total listeners configurados: ${configured}/${listeners.length}`);
    }

    checkRequiredElements() {
        console.log('=== VERIFICANDO ELEMENTOS REQUERIDOS ===');

        // Elementos CRÍTICOS (sin estos no funciona)
        const criticalElements = [
            'zombieCategoriesPanel',
            'zombieCategoriesContent',
            'jsonPreview'
        ];

        // Elementos IMPORTANTES (pueden faltar pero la app sigue funcionando)
        const importantElements = [
            'selectedMowerCard',
            'selectedWorldCard',
            'selectedScenarioCard',
            'levelName',
            'generateLevelBtn',
            'mainTabs'
        ];

        // Elementos OPCIONALES (de la interfaz antigua)
        const optionalElements = [
            'categorySelect',
            'zombieSearch'
        ];

        let missingCritical = [];
        let missingImportant = [];
        let missingOptional = [];

        // Verificar críticos
        criticalElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                missingCritical.push(id);
                console.error(`❌ CRÍTICO faltante: ${id}`);
            } else {
                console.log(`✓ CRÍTICO encontrado: ${id}`);
            }
        });

        // Verificar importantes
        importantElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                missingImportant.push(id);
                console.warn(`⚠ IMPORTANTE faltante: ${id}`);
            } else {
                console.log(`✓ IMPORTANTE encontrado: ${id}`);
            }
        });

        // Verificar opcionales
        optionalElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                missingOptional.push(id);
                console.log(`ℹ️ OPCIONAL faltante: ${id} (interfaz antigua)`);
            } else {
                console.log(`✓ OPCIONAL encontrado: ${id}`);
            }
        });

        if (missingCritical.length > 0) {
            console.error(`❌ Faltan ${missingCritical.length} elementos CRÍTICOS:`, missingCritical);
            return false; // No podemos continuar
        }

        if (missingImportant.length > 0) {
            console.warn(`⚠ Faltan ${missingImportant.length} elementos importantes:`, missingImportant);
            this.showMessage('Funciones limitadas',
                `Algunas funciones no estarán disponibles (faltan ${missingImportant.length} elementos).`,
                'warning');
        }

        if (missingOptional.length > 0) {
            console.log(`ℹ️ Faltan ${missingOptional.length} elementos opcionales (interfaz antigua)`);
        }

        return true; // Podemos continuar
    }

    cleanZombiesOnStart() {
        // Limpiar zombies en memoria
        this.levelData.zombies = [];
        this.levelData.waves = [];

        // Actualizar UI
        this.updateSelectedZombiesDisplay();

        // Limpiar también de localStorage
        const savedData = localStorage.getItem('pvz_tab_waves');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                delete data.selected_zombies;
                localStorage.setItem('pvz_tab_waves', JSON.stringify(data));
            } catch (e) {
                console.error('Error limpiando zombies de localStorage:', e);
            }
        }

        console.log('Zombies limpiados automáticamente al iniciar');
    }

    initializeTabSystem() {
        // Detectar pestaña activa inicial
        const activeTab = document.querySelector('#mainTabs .nav-link.active');
        if (activeTab) {
            this.currentTab = activeTab.getAttribute('id').replace('-tab', '');
        }

        // Configurar listeners para pestañas
        this.setupTabListeners();

        // Configurar auto-guardado de inputs
        this.setupAutoSaveListeners();
    }

    setupTabListeners() {
        const tabButtons = document.querySelectorAll('#mainTabs button[data-bs-toggle="tab"]');

        tabButtons.forEach(button => {
            button.addEventListener('show.bs.tab', (e) => {
                // Guardar pestaña actual antes de cambiar
                this.saveCurrentTab();

                // Actualizar pestaña actual
                this.currentTab = e.target.getAttribute('id').replace('-tab', '');

                // Cargar datos de la nueva pestaña
                setTimeout(() => this.loadTabData(this.currentTab), 50);
            });
        });
    }

    setupAutoSaveListeners() {
        // Configurar eventos para todos los inputs
        document.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('change', () => {
                this.markTabAsChanged(this.currentTab);
                this.autoSaveCurrentTab();
            });

            input.addEventListener('input', () => {
                this.markTabAsChanged(this.currentTab);
            });
        });

        // Guardar antes de cerrar la página
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges[this.currentTab]) {
                this.saveCurrentTab();
            }
        });
    }

    markTabAsChanged(tabId) {
        this.hasUnsavedChanges[tabId] = true;
        this.updateTabIndicator(tabId, true);
    }

    updateTabIndicator(tabId, hasChanges) {
        const tabButton = document.querySelector(`#${tabId}-tab`);
        if (!tabButton) return;

        let indicator = tabButton.querySelector('.unsaved-indicator');

        if (hasChanges && !indicator) {
            indicator = document.createElement('span');
            indicator.className = 'unsaved-indicator';
            indicator.innerHTML = '●';
            indicator.style.cssText = `
                color: #dc3545;
                font-size: 12px;
                margin-left: 5px;
                vertical-align: top;
            `;
            tabButton.appendChild(indicator);
        } else if (!hasChanges && indicator) {
            indicator.remove();
        }

        // También actualizar clase para estilos CSS
        if (hasChanges) {
            tabButton.classList.add('has-unsaved-changes');
        } else {
            tabButton.classList.remove('has-unsaved-changes');
        }
    }

    saveCurrentTab() {
        if (!this.autoSaveEnabled) return;

        const tabData = this.collectTabData(this.currentTab);
        if (tabData) {
            // Guardar en localStorage
            localStorage.setItem(`pvz_tab_${this.currentTab}`, JSON.stringify(tabData));

            // Actualizar datos principales
            this.updateLevelDataFromTab(this.currentTab, tabData);

            // Marcar como guardado
            this.hasUnsavedChanges[this.currentTab] = false;
            this.updateTabIndicator(this.currentTab, false);

            console.log(`Pestaña ${this.currentTab} guardada automáticamente`);
        }
    }

    autoSaveCurrentTab() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(() => {
            this.saveCurrentTab();
        }, this.autoSaveDelay);
    }

    loadTabData(tabId) {
        const savedData = localStorage.getItem(`pvz_tab_${tabId}`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.applyTabData(tabId, data);
                this.hasUnsavedChanges[tabId] = false;
                this.updateTabIndicator(tabId, false);
            } catch (e) {
                console.error('Error cargando datos de pestaña:', e);
            }
        }
    }


applyTabData(tabId, data) {
    console.log(`Aplicando datos para pestaña ${tabId}`, data);

    if (!data) return;

    switch (tabId) {
        case 'basic':
            // Aplicar valores a controles de la pestaña básica
            this.safeAssignValue('levelName', data.level_name);
            this.safeAssignValue('levelNumber', data.level_number.toString());
            this.safeAssignValue('startingSun', data.starting_sun?.toString());
            this.safeAssignValue('zombieLevel', data.zombie_level?.toString());
            this.safeAssignValue('gridLevel', data.grid_level?.toString());
            this.safeAssignValue('waveCount', data.wave_count?.toString());
            this.safeAssignValue('flagInterval', data.flag_interval?.toString());
            this.safeAssignValue('spawnColStart', data.spawn_col_start?.toString());
            this.safeAssignValue('spawnColEnd', data.spawn_col_end?.toString());
            this.safeAssignValue('wavePoints', data.wave_points?.toString());
            this.safeAssignValue('waveIncrement', data.wave_increment?.toString());
            this.safeAssignValue('seedSlotsCount', data.seed_slots_count?.toString());

            // Checkboxes
            this.safeAssignValue('enableSunDropper', data.enable_sun_dropper, 'checked');
            this.safeAssignValue('enableSeedSlots', data.enable_seed_slots, 'checked');
            this.safeAssignValue('useUnderground', data.use_underground, 'checked');

            // Actualizar selecciones visuales
            if (data.mower_type) {
                this.selectMower(data.mower_type);
            }
            if (data.world) {
                this.selectWorld(data.world);
            }
            if (data.stage) {
                this.selectScenario(data.stage);
            }
            if (data.visual_effect) {
                this.safeAssignValue('effectSelect', data.visual_effect);
            }
            if (data.seed_selection_method) {
                this.safeAssignValue('seedSelectionMethod', data.seed_selection_method);
            }

            // Controles subterráneos
            if (data.use_underground !== undefined) {
                this.levelData.use_underground_zombies = data.use_underground;
                this.updateUndergroundControls();
            }

            // Valores subterráneos
            this.safeAssignValue('undergroundStart', data.underground_start?.toString());
            this.safeAssignValue('undergroundInterval', data.underground_interval?.toString());
            this.safeAssignValue('undergroundColStart', data.underground_col_start?.toString());
            this.safeAssignValue('undergroundColEnd', data.underground_col_end?.toString());
            this.safeAssignValue('undergroundMin', data.underground_min?.toString());
            this.safeAssignValue('undergroundMax', data.underground_max?.toString());

            break;

        case 'waves':
            // Aplicar zombies seleccionados
            if (data.selected_zombies && Array.isArray(data.selected_zombies)) {
                this.levelData.zombies = [...data.selected_zombies];
                this.updateSelectedZombiesDisplay();
            }

            // Dificultad
            if (data.difficulty) {
                const radio = document.querySelector(`input[name="difficulty"][value="${data.difficulty}"]`);
                if (radio) radio.checked = true;
            }

            // Otros controles
            this.safeAssignValue('plantFoodWaves', data.plant_food_waves);
            this.safeAssignValue('zombieSearch', data.zombie_search);
            this.safeAssignValue('categorySelect', data.category);

            break;

        case 'challenges':
            // MODIFICADO: Siempre forzar que los desafíos inicien DESHABILITADOS
            // Ignorar completamente el estado guardado en localStorage
            this.challengesData.enabled = false;
            this.safeAssignValue('challengesEnabled', false, 'checked');
            
            // Deshabilitar el contenedor (esto deshabilitará todos los controles internos)
            this.toggleChallengesContainer(false);

            // Aplicar valores de los desafíos, PERO NO su estado 'enabled'
            this.challengesData.challenges.forEach(challenge => {
                const challengeData = data[`challenge_${challenge.id}`];
                if (challengeData) {
                    // FORZAR que el desafío esté deshabilitado
                    challenge.enabled = false;

                    // Actualizar checkbox (siempre desmarcado)
                    const checkbox = document.getElementById(`challenge_${challenge.id.toLowerCase()}`);
                    if (checkbox) {
                        checkbox.checked = false;
                    }

                    // Solo cargar los valores, no el estado
                    if (challenge.id === 'KillZombies' && challengeData.values) {
                        challenge.values = { 
                            ...challenge.values,  // Valores por defecto
                            ...challengeData.values  // Sobreescribir con valores guardados
                        };
                        this.safeAssignValue('killZombies_count', challenge.values.zombies?.toString());
                        this.safeAssignValue('killZombies_time', challenge.values.time?.toString());
                    } else if (challengeData.value !== undefined) {
                        challenge.value = challengeData.value;
                        const input = document.getElementById(`${challenge.id.toLowerCase()}_value`);
                        if (input) input.value = challenge.value;
                    }
                }
            });
            
            console.log('Desafíos forzados a estado deshabilitado al cargar pestaña');
            break;

        case 'preview':
            // Solo mostrar el JSON
            if (data.json_content) {
                const preview = document.getElementById('jsonPreview');
                if (preview) {
                    preview.textContent = data.json_content;
                    this.highlightJson(preview);
                }
            }
            break;

        case 'stats':
            // Solo mostrar estadísticas
            if (data.stats_content) {
                const stats = document.getElementById('statsContent');
                if (stats) {
                    stats.innerHTML = data.stats_content;
                }
            }
            break;
    }
}




loadSavedData() {
    // *** CAMBIADO: NO cargar NADA de localStorage - siempre usar valores por defecto ***
    
    console.log('🔧 Inicializando con valores por defecto (sin cargar guardados)');
    
    // 1. Asegurar que zombies y waves estén vacíos
    this.levelData.zombies = [];
    this.levelData.waves = [];
    
    // 2. Resetear valores específicos que podrían haber sido guardados incorrectamente
    this.levelData.level_name = "Mi Nivel Personalizado";
    this.levelData.level_number = 1;
    this.levelData.world = "Moderno";
    this.levelData.stage = "None";
    this.levelData.visual_effect = "";
    this.levelData.enable_sun_dropper = true;
    this.levelData.enable_seed_slots = false;
    this.levelData.seed_slots_count = 8;
    this.levelData.mower_type = "ModernMowers";
    this.levelData.seed_selection_method = "chooser";
    this.levelData.starting_sun = 50;
    this.levelData.zombie_level = 1;
    this.levelData.grid_level = 1;
    this.levelData.wave_count = 10;
    this.levelData.flag_wave_interval = 4;
    this.levelData.plant_food_waves = [3, 6, 9];
    this.levelData.use_underground_zombies = false;
    this.levelData.underground_wave_start = 5;
    this.levelData.underground_wave_interval = 3;
    this.levelData.underground_columns_start = 2;
    this.levelData.underground_columns_end = 4;
    this.levelData.spawn_col_start = 6;
    this.levelData.spawn_col_end = 9;
    this.levelData.wave_spending_points = 150;
    this.levelData.wave_spending_point_increment = 75;
    this.levelData.underground_max_zombies = 3;
    this.levelData.underground_min_zombies = 1;
    
    // 3. Resetear desafíos
    this.challengesData.enabled = false;
    this.challengesData.challenges.forEach(challenge => {
        challenge.enabled = false;
        // Restablecer valores por defecto
        if (challenge.id === 'ZombieDistance') challenge.value = 5.5;
        if (challenge.id === 'SunUsed') challenge.value = 500;
        if (challenge.id === 'SunProduced') challenge.value = 500;
        if (challenge.id === 'SunHoldout') challenge.value = 60;
        if (challenge.id === 'KillZombies') challenge.values = { zombies: 15, time: 10 };
        if (challenge.id === 'PlantsLost') challenge.value = 5;
        if (challenge.id === 'SimultaneousPlants') challenge.value = 15;
        if (challenge.id === 'SaveMowers') challenge.value = 3;
    });
    
 
    
    // 5. Actualizar controles con valores por defecto
    this.updateAllControls();
    this.updateSelectedZombiesDisplay();
    this.updateChallengesUI();
    
    // 6. Forzar valores en la UI
    setTimeout(() => {
        if (document.getElementById('challengesEnabled')) {
            document.getElementById('challengesEnabled').checked = false;
            this.toggleChallengesContainer(false);
        }
        
        // Asegurar que la dificultad sea "media"
        const difficultyRadio = document.querySelector('input[name="difficulty"][value="media"]');
        if (difficultyRadio) difficultyRadio.checked = true;
        
        // Asegurar que plant food waves sea el valor por defecto
        document.getElementById('plantFoodWaves').value = '3,6,9';
    }, 100);
    
    console.log('✅ Configuración inicializada con valores por defecto');
}

    setupConverterListeners() {
        // Botones del convertidor
        document.getElementById('jsonToRtonBtn').addEventListener('click', () => this.convertJsonToRton());
        document.getElementById('rtonToJsonBtn').addEventListener('click', () => this.convertRtonToJson());

        // Botones de carga de archivos
        document.getElementById('loadJsonFileBtn').addEventListener('click', () => this.loadJsonFile());
        document.getElementById('loadRtonFileBtn').addEventListener('click', () => this.loadRtonFile());

        // Botones de utilidad
        document.getElementById('copyResultBtn').addEventListener('click', () => this.copyResult());
        document.getElementById('downloadResultBtn').addEventListener('click', () => this.downloadResult());
        document.getElementById('clearResultBtn').addEventListener('click', () => this.clearResult());
    }

    convertJsonToRton() {
        try {
            const jsonInput = document.getElementById('jsonInput').value;

            if (!jsonInput.trim()) {
                this.showConverterMessage('Error', 'Por favor ingresa JSON para convertir', 'error');
                return;
            }

            const converter = new JSONARTON();
            converter.set(jsonInput);

            const outputFormat = document.getElementById('outputFormat').value;
            const result = converter.get(outputFormat === 'hex' ? 'hex' : 'binary');

            let displayResult;
            let downloadBlob;
            let fileName;
            let mimeType;

            if (outputFormat === 'hex') {
                displayResult = result;
                downloadBlob = new Blob([result], { type: 'text/plain' });
                fileName = `converted_${Date.now()}.hex`;
                mimeType = 'text/plain';
            } else if (outputFormat === 'array') {
                displayResult = JSON.stringify(Array.from(result), null, 2);
                downloadBlob = new Blob([displayResult], { type: 'application/json' });
                fileName = `converted_${Date.now()}.json`;
                mimeType = 'application/json';
            } else if (outputFormat === 'compact') {
                displayResult = JSON.stringify(Array.from(result));
                downloadBlob = new Blob([displayResult], { type: 'application/json' });
                fileName = `converted_${Date.now()}.json`;
                mimeType = 'application/json';
            } else {
                // Formatear como hex legible
                const hexString = Array.from(result)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('')
                    .toUpperCase();

                // Agrupar en líneas de 32 bytes
                displayResult = '';
                for (let i = 0; i < hexString.length; i += 32) {
                    const chunk = hexString.substr(i, 32);
                    const line = chunk.replace(/(.{2})/g, '$1 ') + '\n';
                    displayResult += line;
                }

                // Para descargar RTON binario
                downloadBlob = result;
                fileName = `converted_${Date.now()}.rton`;
                mimeType = 'application/octet-stream';
            }

            document.getElementById('conversionResult').textContent = displayResult;

            // DESCARGAR AUTOMÁTICAMENTE
            this.downloadFile(downloadBlob, fileName, mimeType);

            this.showConverterMessage('Éxito', 'JSON convertido a RTON y descargado', 'success');

        } catch (error) {
            document.getElementById('conversionResult').textContent = `Error: ${error.message}`;
            this.showConverterMessage('Error', error.message, 'error');
        }
    }

    convertRtonToJson() {
        try {
            const rtonInput = document.getElementById('rtonInput').value.trim();

            if (!rtonInput) {
                this.showConverterMessage('Error', 'Por favor ingresa RTON para convertir', 'error');
                return;
            }

            // Convertir hex string a Uint8Array
            let bytes;
            if (rtonInput.includes(' ')) {
                // Si tiene espacios, limpiar
                const cleanHex = rtonInput.replace(/\s+/g, '');
                bytes = new Uint8Array(cleanHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            } else {
                // Asumir que es hex sin espacios
                bytes = new Uint8Array(rtonInput.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            }

            const converter = new RTONAJSON();
            const success = converter.set(bytes);

            if (!success) {
                throw new Error('No se pudo procesar el RTON');
            }

            const jsonResult = converter.get();
            const outputFormat = document.getElementById('outputFormat').value;

            let displayResult;
            let downloadResult;

            if (outputFormat === 'pretty') {
                displayResult = JSON.stringify(JSON.parse(jsonResult), null, 2);
                downloadResult = displayResult;
            } else if (outputFormat === 'compact') {
                displayResult = jsonResult;
                downloadResult = displayResult;
            } else {
                displayResult = jsonResult;
                downloadResult = displayResult;
            }

            document.getElementById('conversionResult').textContent = displayResult;

            // DESCARGAR AUTOMÁTICAMENTE
            const blob = new Blob([downloadResult], { type: 'application/json' });
            const fileName = `converted_${Date.now()}.json`;
            this.downloadFile(blob, fileName, 'application/json');

            this.showConverterMessage('Éxito', 'RTON convertido a JSON y descargado', 'success');

        } catch (error) {
            document.getElementById('conversionResult').textContent = `Error: ${error.message}`;
            this.showConverterMessage('Error', error.message, 'error');
        }
    }

    loadJsonFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                document.getElementById('jsonInput').value = text;
                this.showConverterMessage('Archivo cargado', `JSON cargado: ${file.name}`, 'success');
            } catch (error) {
                this.showConverterMessage('Error', `Error al cargar archivo: ${error.message}`, 'error');
            }
        };

        input.click();
    }

    loadRtonFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.rton,.bin';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const arrayBuffer = await file.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);

                // Convertir a hexadecimal para mostrar
                const hexString = Array.from(bytes)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('')
                    .toUpperCase();

                document.getElementById('rtonInput').value = hexString;
                this.showConverterMessage('Archivo cargado', `RTON cargado: ${file.name}`, 'success');
            } catch (error) {
                this.showConverterMessage('Error', `Error al cargar archivo: ${error.message}`, 'error');
            }
        };

        input.click();
    }

    copyResult() {
        const result = document.getElementById('conversionResult').textContent;

        if (!result || result === 'Resultado aparecerá aquí...') {
            this.showConverterMessage('Sin resultado', 'No hay resultado para copiar', 'warning');
            return;
        }

        navigator.clipboard.writeText(result).then(() => {
            this.showConverterMessage('Copiado', 'Resultado copiado al portapapeles', 'success');
        }).catch(err => {
            this.showConverterMessage('Error', 'No se pudo copiar: ' + err, 'error');
        });
    }

    downloadResult() {
        const result = document.getElementById('conversionResult').textContent;

        if (!result || result === 'Resultado aparecerá aquí...') {
            this.showConverterMessage('Sin resultado', 'No hay resultado para descargar', 'warning');
            return;
        }

        const outputFormat = document.getElementById('outputFormat').value;
        let extension, mimeType;

        if (outputFormat === 'hex' || outputFormat === 'array') {
            extension = 'txt';
            mimeType = 'text/plain';
        } else {
            extension = 'json';
            mimeType = 'application/json';
        }

        const blob = new Blob([result], { type: mimeType });
        const fileName = `conversion_result_${Date.now()}.${extension}`;

        this.downloadFile(blob, fileName, mimeType);
        this.showConverterMessage('Descargado', 'Resultado descargado correctamente', 'success');
    }

    downloadFile(blob, fileName, mimeType) {
        // Crear URL para el blob
        const url = URL.createObjectURL(blob);

        // Crear elemento <a> para descargar
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';

        // Agregar al documento y hacer click
        document.body.appendChild(a);
        a.click();

        // Limpiar
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearResult() {
        document.getElementById('conversionResult').textContent = 'Resultado aparecerá aquí...';
        document.getElementById('jsonInput').value = '';
        document.getElementById('rtonInput').value = '';
        this.showConverterMessage('Limpiado', 'Todos los campos han sido limpiados', 'info');
    }

    showConverterMessage(title, message, type = 'info') {
        this.showMessage(title, message, type);
    }

    loadWaveTabWithoutZombies() {
        const savedData = localStorage.getItem('pvz_tab_waves');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);

                // Cargar TODAS las configuraciones EXCEPTO los zombies
                if (data.difficulty !== undefined) {
                    const difficultyRadio = document.querySelector(`input[name="difficulty"][value="${data.difficulty}"]`);
                    if (difficultyRadio) difficultyRadio.checked = true;
                }
                if (data.plant_food_waves !== undefined) {
                    document.getElementById('plantFoodWaves').value = data.plant_food_waves;
                }


                this.hasUnsavedChanges['waves'] = false;
                this.updateTabIndicator('waves', false);

                console.log('Configuración de waves cargada (sin zombies)');
            } catch (e) {
                console.error('Error cargando datos de pestaña waves:', e);
            }
        }
    }

    collectTabData(tabId) {
        const data = {};

        // Función auxiliar para obtener valores de manera segura
        const getValue = (id, defaultValue = '') => {
            const element = document.getElementById(id);
            return element && element.value !== undefined ? element.value : defaultValue;
        };

        const getIntValue = (id, defaultValue = 0) => {
            const element = document.getElementById(id);
            return element && element.value !== undefined ? parseInt(element.value) || defaultValue : defaultValue;
        };

        const getBoolValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.checked : false;
        };

        switch (tabId) {
            case 'basic':
                data.level_name = getValue('levelName', 'Mi Nivel Personalizado');
                data.level_number = getIntValue('levelNumber', 1);
                data.world = this.levelData.world || "Moderno";

                // CORREGIDO: Ya no usamos stageSelect, usamos el valor almacenado
                data.stage = this.levelData.stage || "";

                data.visual_effect = getValue('effectSelect', '');
                data.starting_sun = getIntValue('startingSun', 50);
                data.zombie_level = getIntValue('zombieLevel', 1);
                data.grid_level = getIntValue('gridLevel', 1);
                data.mower_type = this.levelData.mower_type || "ModernMowers";
                data.enable_sun_dropper = getBoolValue('enableSunDropper');
                data.enable_seed_slots = getBoolValue('enableSeedSlots');
                data.seed_slots_count = getIntValue('seedSlotsCount', 8);
                data.wave_count = getIntValue('waveCount', 10);
                data.flag_interval = getIntValue('flagInterval', 4);
                data.wave_points = getIntValue('wavePoints', 150);
                data.wave_increment = getIntValue('waveIncrement', 75);
                data.use_underground = getBoolValue('useUnderground');
                data.underground_start = getIntValue('undergroundStart', 5);
                data.underground_interval = getIntValue('undergroundInterval', 3);
                data.underground_col_start = getIntValue('undergroundColStart', 2);
                data.underground_col_end = getIntValue('undergroundColEnd', 4);
                data.underground_min = getIntValue('undergroundMin', 3);
                data.underground_max = getIntValue('undergroundMax', 8);
                data.spawn_col_start = getIntValue('spawnColStart', 6);
                data.spawn_col_end = getIntValue('spawnColEnd', 9);
                data.seed_selection_method = getValue('seedSelectionMethod', 'chooser');
                break;

            case 'waves':
                // Guardar zombies seleccionados
                if (this.levelData.zombies.length > 0) {
                    data.selected_zombies = [...this.levelData.zombies];
                }

                // Guardar otras configuraciones
                const difficultyRadio = document.querySelector('input[name="difficulty"]:checked');
                if (difficultyRadio) {
                    data.difficulty = difficultyRadio.value;
                }
                data.plant_food_waves = getValue('plantFoodWaves', '');

                break;

            case 'challenges':
                data.challenges_enabled = getBoolValue('challengesEnabled');
                // Guardar cada desafío individualmente
                this.challengesData.challenges.forEach(challenge => {
                    data[`challenge_${challenge.id}`] = {
                        enabled: challenge.enabled,
                        value: challenge.value,
                        ...(challenge.values && { values: challenge.values })
                    };
                });
                break;

            case 'preview':
                // Guardar el JSON actual
                const previewElement = document.getElementById('jsonPreview');
                if (previewElement && previewElement.textContent) {
                    data.json_content = previewElement.textContent;
                }
                break;

            case 'stats':
                // Guardar estadísticas
                const statsElement = document.getElementById('statsContent');
                if (statsElement && statsElement.innerHTML) {
                    data.stats_content = statsElement.innerHTML;
                }
                break;
        }

        return data;
    }

    // Método auxiliar para asignar valores de forma segura
    safeAssignValue(elementId, value, property = 'value') {
        const element = document.getElementById(elementId);
        if (element && element[property] !== undefined) {
            element[property] = value;
            return true;
        }
        // Opcional: descomenta para debug
        // console.log(`Elemento ${elementId} no encontrado para asignar ${property}`);
        return false;
    }

    updateLevelDataFromTab(tabId, tabData) {
        if (tabId === 'basic') {
            Object.assign(this.levelData, tabData);
        } else if (tabId === 'waves' && tabData.selected_zombies) {
            this.levelData.zombies = tabData.selected_zombies;
        }
    }


    async loadZombieData() {
        try {
            console.log('📋 Cargando datos de zombies desde JSON...');

            // Cargar datos reales del archivo
            const zombieMap = await this.zombieDataLoader.loadZombieData();

            if (!zombieMap || zombieMap.size === 0) {
                console.warn('⚠️ No se pudieron cargar datos reales, usando categorías estáticas');
                this.zombieCategories = {};
                this.zombieData = this.createZombieDataFromCategories();
                return;
            }

            // 1. Obtener los datos de zombies procesados
            this.zombieData = this.zombieDataLoader.getAllZombies();
            console.log(`✓ ${this.zombieData.length} zombies cargados con datos reales`);

            // 2. Obtener las categorías DINÁMICAS del JSON
            this.zombieCategories = this.zombieDataLoader.getCategories();

            // 3. Detectar y agrupar mods automáticamente
            this.detectAndGroupMods();

            // 4. Combinar con categorías estáticas si es necesario
            this.mergeCategoriesWithDefaults();

            console.log(`✓ Categorías disponibles: ${Object.keys(this.zombieCategories).length}`);
            console.log('📊 Distribución por tipo:');

            // Contar por tipo
            const counts = { Mundos: 0, Especiales: 0, Mods: 0, Otros: 0 };
            Object.keys(this.zombieCategories).forEach(category => {
                if (this.isWorldCategory(category)) counts.Mundos++;
                else if (this.isSpecialCategory(category)) counts.Especiales++;
                else if (this.isModCategory(category)) counts.Mods++;
                else counts.Otros++;
            });

            Object.entries(counts).forEach(([type, count]) => {
                console.log(`  - ${type}: ${count} categorías`);
            });

        } catch (error) {
            console.error('❌ Error cargando datos de zombies:', error);

            // Fallback a categorías estáticas
            console.log('🔄 Usando categorías estáticas como respaldo...');
            this.zombieCategories = ZOMBIE_CATEGORIES;
            this.zombieData = this.createZombieDataFromCategories();
        }
    }


    mergeCategoriesWithDefaults() {
        // Si no hay categorías dinámicas, inicializar vacío
        if (!this.zombieCategories) {
            this.zombieCategories = {};
        }

        // NO combinar con ZOMBIE_CATEGORIES estáticas
        console.log('Usando solo categorías dinámicas del JSON');
    }


    // Método para crear datos de zombies basados en las categorías
    createZombieDataFromCategories() {
        console.log('Creando datos de zombies desde categorías...');

        const zombieData = [];
        const processedZombies = new Set();

        // Recorrer todas las categorías y sus zombies
        Object.entries(this.zombieCategories).forEach(([category, zombies]) => {
            if (!zombies || !Array.isArray(zombies)) return;

            zombies.forEach(zombieName => {
                // Evitar duplicados
                if (processedZombies.has(zombieName)) return;
                processedZombies.add(zombieName);

                // Crear objeto de datos básicos para el zombie
                const zombieInfo = {
                    alias_type: zombieName,
                    // Asignar valores por defecto basados en el nombre del zombie
                    hitpoints: this.calculateDefaultHP(zombieName),
                    speed: this.calculateDefaultSpeed(zombieName),
                    eat_dps: this.calculateDefaultDPS(zombieName),
                    tiene_armadura: zombieName.includes('armor') ||
                        zombieName.includes('armor1') ||
                        zombieName.includes('armor2') ||
                        zombieName.includes('armor3'),
                    home_world: this.detectHomeWorldFromCategory(category, zombieName),
                    zombie_class: this.detectZombieClass(zombieName),
                    // Bandera para zombies flag
                    flag_type: zombieName.includes('flag') ? 'flag' : 'none',
                    // Indicar si es zombie básico
                    is_basic_zombie: this.isBasicZombie(zombieName)
                };

                zombieData.push(zombieInfo);
            });
        });

        console.log(`✓ Datos de zombies generados: ${zombieData.length} zombies únicos`);
        return zombieData;
    }

    // Métodos auxiliares para calcular valores por defecto
    calculateDefaultHP(zombieName) {
        const baseHP = 100;

        // Ajustar HP basado en el tipo de zombie
        if (zombieName.includes('gargantuar') || zombieName.includes('allstar')) {
            return baseHP * 10; // Gargantuars tienen mucha vida
        }
        if (zombieName.includes('armor')) {
            return baseHP * 2; // Zombies con armadura tienen más vida
        }
        if (zombieName.includes('imp')) {
            return baseHP * 0.5; // Imps tienen poca vida
        }
        if (zombieName.includes('flag')) {
            return baseHP * 1.2; // Flag zombies un poco más resistentes
        }

        return baseHP;
    }

    calculateDefaultSpeed(zombieName) {
        // Velocidad base
        let speed = 0.8;

        // Ajustes basados en tipo
        if (zombieName.includes('runner') || zombieName.includes('speed')) {
            speed = 1.5; // Zombies rápidos
        }
        if (zombieName.includes('gargantuar')) {
            speed = 0.4; // Gargantuars son lentos
        }
        if (zombieName.includes('armor')) {
            speed = 0.6; // Zombies con armadura son más lentos
        }

        return speed;
    }

    calculateDefaultDPS(zombieName) {
        // Daño por segundo base
        let dps = 10;

        // Ajustes basados en tipo
        if (zombieName.includes('gargantuar')) {
            dps = 50; // Gargantuars hacen mucho daño
        }
        if (zombieName.includes('armor')) {
            dps = 15; // Zombies con armadura hacen más daño
        }
        if (zombieName.includes('imp')) {
            dps = 5; // Imps hacen poco daño
        }

        return dps;
    }

    // Detectar mundo de origen basado en categoría y nombre
    detectHomeWorldFromCategory(category, zombieName) {
        // Mapear categorías a mundos
        const worldMapping = {
        'Modern': 'modern',
        'Egypt': 'egypt',
        'Pirate': 'pirate',
        'Wildwest': 'wildwest',
        'Dino': 'dino',
        'Lostcity': 'lostcity',
        'Dark': 'dark',
        'Iceage': 'iceage',
        'Eighties': 'eighties',
        'Future': 'future',
        'Beach': 'beach',
        'Atlantis': 'atlantis',
        'Renai': 'renai',
        'Canival': 'carnival'



        };

        // Primero intentar por categoría
        if (worldMapping[category]) {
            return worldMapping[category];
        }

        // Si no, intentar por nombre
        return this.detectHomeWorld(zombieName);
    }

    // Detectar clase de zombie basado en nombre
    detectZombieClass(zombieName) {
        if (zombieName.includes('gargantuar')) {
            return 'Gargantuar';
        }
        if (zombieName.includes('armor')) {
            return 'Armored';
        }
        if (zombieName.includes('flag')) {
            return 'Flag';
        }
        if (zombieName.includes('imp')) {
            return 'Imp';
        }
        if (zombieName.includes('balloon')) {
            return 'Balloon';
        }
        if (zombieName.includes('digger') || zombieName.includes('underground')) {
            return 'Digger';
        }

        return 'Normal';
    }

    // Determinar si es un zombie básico
    isBasicZombie(zombieName) {
        const basicIndicators = [
            'tutorial', 'basic', 'normal',
            'modern_basic', 'egypt_basic', 'pirate_basic'
        ];

        return basicIndicators.some(indicator =>
            zombieName.includes(indicator) &&
            !zombieName.includes('armor') &&
            !zombieName.includes('flag')
        );
    }

    updateAllControls() {
        // Actualizar todos los controles con los valores actuales
        document.getElementById('levelName').value = this.levelData.level_name;
        document.getElementById('levelNumber').value = this.levelData.level_number;
        document.getElementById('startingSun').value = this.levelData.starting_sun;
        document.getElementById('zombieLevel').value = this.levelData.zombie_level;
        document.getElementById('gridLevel').value = this.levelData.grid_level;
        document.getElementById('waveCount').value = this.levelData.wave_count;
        document.getElementById('flagInterval').value = this.levelData.flag_wave_interval;
        document.getElementById('spawnColStart').value = this.levelData.spawn_col_start;
        document.getElementById('spawnColEnd').value = this.levelData.spawn_col_end;
        document.getElementById('wavePoints').value = this.levelData.wave_spending_points;
        document.getElementById('waveIncrement').value = this.levelData.wave_spending_point_increment;
        document.getElementById('useUnderground').checked = this.levelData.use_underground_zombies;
        document.getElementById('undergroundStart').value = this.levelData.underground_wave_start;
        document.getElementById('undergroundInterval').value = this.levelData.underground_wave_interval;
        document.getElementById('undergroundColStart').value = this.levelData.underground_columns_start;
        document.getElementById('undergroundColEnd').value = this.levelData.underground_columns_end;
        document.getElementById('undergroundMin').value = this.levelData.underground_min_zombies;
        document.getElementById('undergroundMax').value = this.levelData.underground_max_zombies;
        document.getElementById('enableSunDropper').checked = this.levelData.enable_sun_dropper;
        document.getElementById('enableSeedSlots').checked = this.levelData.enable_seed_slots;
        document.getElementById('seedSlotsCount').value = this.levelData.seed_slots_count;
        this.updateSeedSlotsControl();
        

        const seedMethodSelect = document.getElementById('seedSelectionMethod');
        if (seedMethodSelect) {
            seedMethodSelect.value = this.levelData.seed_selection_method || 'chooser';
        }

        // Actualizar visualización del mundo
        this.updateSelectedMowerDisplay();
        this.updateSelectedWorldDisplay();
    }

updateSeedSlotsControl() {
    const enableSeedSlotsCheckbox = document.getElementById('enableSeedSlots');
    const seedSlotsCount = document.getElementById('seedSlotsCount');
    
    if (!enableSeedSlotsCheckbox || !seedSlotsCount) return;
    
    const isEnabled = enableSeedSlotsCheckbox.checked;
    
    // IMPORTANTE: Habilitar/deshabilitar el campo según el checkbox
    seedSlotsCount.disabled = !isEnabled;
    
    // Si está deshabilitado, establecer valor por defecto
    if (!isEnabled) {
        seedSlotsCount.value = 8;
        this.levelData.seed_slots_count = 8;
    }
    
    console.log('Seed slots control actualizado:', {
        checkboxChecked: isEnabled,
        inputDisabled: seedSlotsCount.disabled,
        value: seedSlotsCount.value
    });
}

    updateChallengesUI() {
        document.getElementById('challengesEnabled').checked = this.challengesData.enabled;

        this.toggleChallengesContainer(this.challengesData.enabled);

        this.challengesData.challenges.forEach(challenge => {
            const checkbox = document.getElementById(`challenge_${challenge.id.toLowerCase()}`);
            if (checkbox) {
                checkbox.checked = challenge.enabled;
            }

            if (challenge.id === 'KillZombies') {
                document.getElementById('killZombies_count').value = challenge.values?.zombies || 15;
                document.getElementById('killZombies_time').value = challenge.values?.time || 10;
            } else if (challenge.id === 'SaveMowers') {
                document.getElementById('saveMowers_value').value = challenge.value || 3;
            } else {
                const input = document.getElementById(`${challenge.id.toLowerCase()}_value`);
                if (input) {
                    input.value = challenge.value;
                }
            }
        });
    }

    toggleChallengesContainer(enabled) {
        const container = document.getElementById('challengesContainer');
        if (!container) return;

        // Obtener todos los checkboxes de desafíos individuales
        const challengeCheckboxes = container.querySelectorAll('.challenge-checkbox');
        const challengeInputs = container.querySelectorAll('.challenge-input');
        const challengeSelects = container.querySelectorAll('select');

        const allControls = [...challengeCheckboxes, ...challengeInputs, ...challengeSelects];

        allControls.forEach(control => {
            control.disabled = !enabled;

            // Si está deshabilitando el contenedor, DESMARCAR los checkboxes
            if (!enabled && control.type === 'checkbox') {
                control.checked = false;

                // También actualizar el estado en challengesData
                const challengeId = control.dataset.challenge;
                if (challengeId) {
                    const challenge = this.challengesData.challenges.find(c => c.id === challengeId);
                    if (challenge) {
                        challenge.enabled = false;
                    }
                }
            }
        });

        // Si está deshabilitando el contenedor, actualizar todos los desafíos en challengesData
        if (!enabled) {
            this.challengesData.challenges.forEach(challenge => {
                challenge.enabled = false;
            });
        }
    }

    updateChallengeState(challengeId, enabled) {
        const challenge = this.challengesData.challenges.find(c => c.id === challengeId);
        if (challenge) {
            challenge.enabled = enabled;
        }
    }

    updateChallengeValue(challengeId, inputElement) {
        const challenge = this.challengesData.challenges.find(c => c.id === challengeId);
        if (challenge) {
            if (challengeId === 'KillZombies') {
                const inputId = inputElement.id;
                if (inputId === 'killZombies_count') {
                    challenge.values.zombies = parseInt(inputElement.value) || 15;
                } else if (inputId === 'killZombies_time') {
                    challenge.values.time = parseInt(inputElement.value) || 10;
                }
            } else {
                challenge.value = parseFloat(inputElement.value);
            }
        }
    }

    updateStages() {
        const world = this.levelData.world;

        // Regenerar opciones del modal (ahora muestra todos)
        this.generateScenarioModalOptions();

        // Verificar si el escenario actual es compatible con el mundo seleccionado
        const currentStage = this.levelData.stage;
        const worldScenarios = this.worlds[world] || [];

        // Solo resetear si el escenario actual no está en la lista del mundo
        // (ignorando separadores)
        const isValidStage = worldScenarios.some(s =>
            s !== "---StagesHexius---" && s === currentStage
        );

        if (currentStage && !isValidStage) {
            // Si no es válido, seleccionar el primero disponible
            const firstStage = worldScenarios.find(s => s !== "---StagesHexius---");
            if (firstStage) {
                this.levelData.stage = firstStage;
                this.updateSelectedScenarioDisplay();
            }
        }
    }

    updateUndergroundControls() {
        const isEnabled = document.getElementById('useUnderground').checked;
        const configElements = document.querySelectorAll('#undergroundConfig');

        configElements.forEach(el => {
            const inputs = el.querySelectorAll('input');
            inputs.forEach(input => {
                input.disabled = !isEnabled;
            });
        });
    }



    clearAllZombies() {
        this.levelData.zombies = [];
        this.updateSelectedZombiesDisplay();
        this.showMessage('Zombies Limpiados', 'Todos los zombies han sido removidos', 'success');
    }

    updateSelectedZombiesDisplay() {
        const container = document.getElementById('selectedZombies');
        const noSelectedMessage = document.getElementById('noSelectedZombiesMessage');

        if (!container || !noSelectedMessage) return;

        container.innerHTML = '';

        if (this.levelData.zombies.length === 0) {
            noSelectedMessage.style.display = 'block';
            return;
        }

        noSelectedMessage.style.display = 'none';

        // Crear una fila para organizar las imágenes
        const row = document.createElement('div');
        row.className = 'row g-3';

        this.levelData.zombies.forEach(zombieName => {
            const info = this.getZombieInfo(zombieName);
            const threat = this.calculateZombieThreatLevel(zombieName);

            // Crear tarjeta con imagen
            const col = document.createElement('div');
            col.className = 'col-md-3 col-sm-4 col-6';

            // Ruta de la imagen del zombie
            const zombieImagePath = `Assets/Zombies/${zombieName}.webp`;
            const errorImagePath = 'Assets/Zombies/error.webp';

            col.innerHTML = `
            <div class="selected-zombie-card" data-zombie="${zombieName}">
                <button class="selected-zombie-remove" data-zombie="${zombieName}">
                    <i class="bi bi-x"></i>
                </button>
                <div class="selected-zombie-img-container">
                    <img src="${zombieImagePath}" 
                         alt="${zombieName}" 
                         class="selected-zombie-img"
                         onerror="
                            this.src = '${errorImagePath}';
                            this.style.filter = 'grayscale(20%) opacity(90%)';
                         ">
                </div>
                <div class="selected-zombie-info">
                    <div class="selected-zombie-name">${zombieName}</div>
                    <div class="selected-zombie-stats">
                        <span>HP: ${info?.hitpoints || 'N/A'}</span>
                        <span>Amen: ${threat.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        `;

            row.appendChild(col);
        });

        container.appendChild(row);

        // Añadir event listeners para los botones de eliminar
        container.querySelectorAll('.selected-zombie-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const zombieName = button.dataset.zombie;
                this.removeZombie(zombieName);
                this.markTabAsChanged('waves');
            });
        });

        // Actualizar contador en la pestaña
        this.updateSelectedZombiesCount();
    }


    updateSelectedZombiesCount() {
        const count = this.levelData.zombies.length;

        // Actualizar badge en la pestaña
        const tabBadge = document.getElementById('tabSelectedCount');
        if (tabBadge) {
            tabBadge.textContent = count;
        }

        // También puedes actualizar otros contadores si los tienes
        const zombiesCountBadge = document.getElementById('selectedZombiesCount');
        if (zombiesCountBadge) {
            zombiesCountBadge.textContent = count;
        }
    }

    removeZombie(zombieName) {
        const index = this.levelData.zombies.indexOf(zombieName);
        if (index > -1) {
            this.levelData.zombies.splice(index, 1);
            this.updateSelectedZombiesDisplay();
            this.updateSelectedZombiesCount();
        }
    }

    getZombieInfo(zombieName) {
        // PRIMERO: Buscar en datos del JSON
        const jsonData = this.zombieDataLoader.getZombieInfo(zombieName);
        if (jsonData) {
            return jsonData;
        }

        // SEGUNDO: Buscar en datos generados (fallback)
        const exactMatch = this.zombieData.find(z =>
            z.alias_type.toLowerCase() === zombieName.toLowerCase()
        );
        if (exactMatch) return exactMatch;

        // TERCERO: Crear datos básicos si no existe
        console.log(`⚠️ Creando datos básicos para zombie no encontrado: ${zombieName}`);
        return this.createBasicZombieInfo(zombieName);
    }

    // Método para crear datos básicos si un zombie no está en la lista
    createBasicZombieInfo(zombieName) {
        return {
            alias_type: zombieName,
            hitpoints: this.calculateDefaultHP(zombieName),
            speed: this.calculateDefaultSpeed(zombieName),
            eat_dps: this.calculateDefaultDPS(zombieName),
            tiene_armadura: zombieName.includes('armor'),
            home_world: this.detectHomeWorld(zombieName),
            zombie_class: this.detectZombieClass(zombieName),
            flag_type: zombieName.includes('flag') ? 'flag' : 'none',
            is_basic_zombie: this.isBasicZombie(zombieName)
        };
    }

    calculateZombieThreatLevel(zombieAlias) {
        const zombie = this.getZombieInfo(zombieAlias);
        if (!zombie) return 0.8;

        const hp = zombie.hitpoints || 0;
        const speed = zombie.speed || 0;
        const dps = zombie.eat_dps || 0;
        const hasArmor = zombie.tiene_armadura || false;

        let threat = (hp / 150) + (speed * 8) + (dps / 15);
        if (hasArmor) threat *= 1.3;
        if (zombieAlias.toLowerCase().includes('gargantuar')) threat *= 2.0;
        if (zombieAlias.toLowerCase().includes('imp')) threat *= 0.8;

        return Math.max(0.3, threat);
    }

    getZombieWeight(zombieName) {
        const threat = this.calculateZombieThreatLevel(zombieName);
        return Math.max(1, Math.floor(8 / threat));
    }

    autoDetectSettings() {
        if (this.levelData.zombies.length === 0) {
            this.showMessage('Sin Zombies', 'No hay zombies seleccionados para detectar configuración', 'warning');
            return;
        }

        const worldCounts = {};

        this.levelData.zombies.forEach(zombieAlias => {
            const zombieInfo = this.getZombieInfo(zombieAlias);
            if (zombieInfo && zombieInfo.home_world) {
                const worldMap = {
                    "Tutorial": "Tutorial",
                    "modern": "Moderno",
                    "egypt": "Egipto",
                    "pirate": "Pirata",
                    "west": "Oeste",
                    "future": "Futuro",
                    "eighties": "Eighties",
                    "iceage": "Edad de Hielo",
                    "renai": "Renai",
                    "atlantis": "Atlantis"
                };

                const displayWorld = worldMap[zombieInfo.home_world] || zombieInfo.home_world;
                worldCounts[displayWorld] = (worldCounts[displayWorld] || 0) + 1;
            }
        });

        if (Object.keys(worldCounts).length > 0) {
            const dominantWorld = Object.entries(worldCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
            this.autoSetWorldConfig(dominantWorld);
        }
    }

    autoSetWorldConfig(world) {
        // Verificar si la auto-configuración está deshabilitada
        if (!this.autoDetectOnZombieSelection) {
            console.log('Auto-configuración deshabilitada');
            return;
        }

        const worldMappings = {
            "Egipto": { effect: "Ninguno", mower: "EgyptMowers", sunDropper: true },
            "Canival": { effect: "Ninguno", mower: "CarnivalMowers", sunDropper: true },
            "Moderno": { effect: "Solo Lluvia", mower: "ModernMowers", sunDropper: true },
            "Futuro": { effect: "Ninguno", mower: "FutureMowers", sunDropper: true },
            "Atlantis": { effect: "Atlantis", mower: "BeachMowers", sunDropper: true },
            "Edad de Hielo": { effect: "Nieve", mower: "IceageMowers", sunDropper: true },
            "Pirata": { effect: "Ninguno", mower: "PirateMowers", sunDropper: true },
            "Oeste": { effect: "Ninguno", mower: "WestMowers", sunDropper: true },
            "Roman": { effect: "Ninguno", mower: "RomanMowers", sunDropper: true },
            "Renai": { effect: "Ninguno", mower: "RenaiMowers", sunDropper: true }
        };

        if (worldMappings[world]) {
            const config = worldMappings[world];
            this.selectWorld(world);

            Object.entries(this.visualEffects).forEach(([key, value]) => {
                if (value === config.effect || key === config.effect) {
                    document.getElementById('effectSelect').value = value;
                }
            });

            this.selectMower(config.mower);

            this.levelData.enable_sun_dropper = config.sunDropper;
            document.getElementById('enableSunDropper').checked = this.levelData.enable_sun_dropper;

            this.markTabAsChanged('basic');
            this.showMessage('Configuración Automática', `Configuración ajustada para mundo: ${world}`, 'success');
        }
    }

    generateSmartWaves() {
        if (this.levelData.zombies.length === 0) {
            this.showMessage('Error', 'No hay zombies seleccionados. Selecciona zombies primero.', 'error');
            return;
        }

        this.levelData.wave_count = parseInt(document.getElementById('waveCount').value) || 10;
        this.levelData.use_underground_zombies = document.getElementById('useUnderground').checked;
        this.levelData.underground_wave_start = parseInt(document.getElementById('undergroundStart').value) || 5;
        this.levelData.underground_wave_interval = parseInt(document.getElementById('undergroundInterval').value) || 3;
        this.levelData.underground_columns_start = parseInt(document.getElementById('undergroundColStart').value) || 2;
        this.levelData.underground_columns_end = parseInt(document.getElementById('undergroundColEnd').value) || 4;
        this.levelData.underground_min_zombies = parseInt(document.getElementById('undergroundMin').value) || 3;
        this.levelData.underground_max_zombies = parseInt(document.getElementById('undergroundMax').value) || 8;

        const pfInput = document.getElementById('plantFoodWaves').value;
        const pfWaves = pfInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));

        this.levelData.waves = [];

        const zombieThreats = {};
        this.levelData.zombies.forEach(z => {
            zombieThreats[z] = this.calculateZombieThreatLevel(z);
        });

        let undergroundWavesCount = 0;

        for (let wave = 1; wave <= this.levelData.wave_count; wave++) {
            let useUnderground = false;
            if (this.levelData.use_underground_zombies &&
                wave >= this.levelData.underground_wave_start &&
                ((wave - this.levelData.underground_wave_start) % this.levelData.underground_wave_interval === 0)) {
                useUnderground = true;
                undergroundWavesCount++;
            }

            let waveData;
            if (useUnderground) {
                waveData = this.generateUndergroundWave(wave, pfWaves, zombieThreats, this.levelData.wave_count);
            } else {
                waveData = this.generateNormalWave(wave, pfWaves, zombieThreats, this.levelData.wave_count);
            }

            this.levelData.waves.push(waveData);
        }

        const totalZombies = this.levelData.waves.reduce((sum, wave) => sum + wave.zombies.length, 0);
        const difficulty = document.querySelector('input[name="difficulty"]:checked').value;

        this.showMessage('Oleadas Generadas',
            `Se generaron ${this.levelData.wave_count} oleadas con ${totalZombies} zombies totales\n` +
            `Oleadas subterráneas: ${undergroundWavesCount} (cada ${this.levelData.underground_wave_interval} oleadas)\n` +
            `Dificultad: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
            'success'
        );

        this.updatePreview();
    }

    generateNormalWave(waveNumber, pfWaves, zombieThreats, totalWaves) {
        const baseZombies = this.calculateZombiesPerWave(waveNumber, totalWaves);

        const waveData = {
            wave_number: waveNumber,
            plant_food: pfWaves.includes(waveNumber) ? 1 : 0,
            objclass: "SpawnZombiesJitteredWaveActionProps",
            zombies: []
        };

        // Clasificar zombies por tipo
        const zombieCategories = this.categorizeZombies(this.levelData.zombies);

        // REGLA 1: Flag zombies - solo uno por oleada, al final
        const flagZombies = zombieCategories.flag || [];
        let flagZombieAdded = false;
        let flagZombieType = null;

        if (flagZombies.length > 0 && waveNumber % this.levelData.flag_wave_interval === 0) {
            flagZombieType = flagZombies[Math.floor(Math.random() * flagZombies.length)];
            flagZombieAdded = true;
        }

        // REGLA 2: Gargantuars - solo en oleadas avanzadas (último 30%)
        const gargantuars = zombieCategories.gargantuar || [];
        let gargantuarAdded = false;
        let gargantuarType = null;

        if (gargantuars.length > 0 && waveNumber > totalWaves * 0.7 && Math.random() < 0.3) {
            gargantuarType = gargantuars[Math.floor(Math.random() * gargantuars.length)];
            gargantuarAdded = true;
        }

        // REGLA 3: Zombies poderosos (últimos 4 por amenaza) - menos frecuentes
        const powerfulZombies = this.getPowerfulZombies(zombieThreats, 4);

        // REGLA 4: Zombies básicos (normales, armor1, armor2)
        const basicZombies = zombieCategories.basic || [];
        const armoredZombies = zombieCategories.armored || [];
        const specialZombies = zombieCategories.special || [];

        // Sistema de progresión por oleadas
        let availableZombies = [];
        let availableWeights = [];

        // OLEADAS 1-2: Solo zombies básicos
        if (waveNumber <= 2) {
            console.log(`Oleada ${waveNumber}: Usando solo zombies básicos`);
            basicZombies.forEach(zombie => {
                availableZombies.push(zombie);
                availableWeights.push(this.getZombieWeight(zombie));
            });
        }
        // OLEADAS 3-5: Agregar zombies con armadura ligera
        else if (waveNumber <= 5) {
            console.log(`Oleada ${waveNumber}: Agregando zombies con armadura`);
            // Zombies básicos
            basicZombies.forEach(zombie => {
                availableZombies.push(zombie);
                availableWeights.push(this.getZombieWeight(zombie) * 1.5);
            });

            // Zombies con armadura ligera
            const lightArmored = armoredZombies.filter(zombie =>
                zombie.includes('armor1') ||
                zombie.includes('_armor1') ||
                (armoredZombies.length > 0 && !zombie.includes('armor2') && !zombie.includes('armor3'))
            );

            if (lightArmored.length > 0) {
                lightArmored.forEach(zombie => {
                    availableZombies.push(zombie);
                    availableWeights.push(this.getZombieWeight(zombie) * 0.8);
                });
            }
        }
        // OLEADAS 6-8: Agregar más variedad
        else if (waveNumber <= 8) {
            console.log(`Oleada ${waveNumber}: Agregando más variedad`);
            // Todos los zombies básicos
            basicZombies.forEach(zombie => {
                availableZombies.push(zombie);
                availableWeights.push(this.getZombieWeight(zombie));
            });

            // Todos los zombies con armadura
            armoredZombies.forEach(zombie => {
                availableZombies.push(zombie);
                availableWeights.push(this.getZombieWeight(zombie) * 1.0);
            });

            // Algunos zombies especiales
            if (specialZombies.length > 0 && Math.random() < 0.3) {
                const selectedSpecial = specialZombies[Math.floor(Math.random() * specialZombies.length)];
                availableZombies.push(selectedSpecial);
                availableWeights.push(this.getZombieWeight(selectedSpecial) * 0.5);
            }
        }
        // OLEADAS 9+: Todos los tipos disponibles
        else {
            console.log(`Oleada ${waveNumber}: Todos los tipos disponibles`);
            // Todos los zombies básicos
            basicZombies.forEach(zombie => {
                availableZombies.push(zombie);
                availableWeights.push(this.getZombieWeight(zombie) * 1.2);
            });

            // Todos los zombies con armadura
            armoredZombies.forEach(zombie => {
                availableZombies.push(zombie);
                availableWeights.push(this.getZombieWeight(zombie) * 1.0);
            });

            // Zombies especiales
            specialZombies.forEach(zombie => {
                availableZombies.push(zombie);
                availableWeights.push(this.getZombieWeight(zombie) * 0.7);
            });

            // Añadir zombies poderosos solo en oleadas avanzadas
            if (waveNumber > totalWaves * 0.6 && Math.random() < 0.4) {
                const selectedPowerful = powerfulZombies[Math.floor(Math.random() * powerfulZombies.length)];
                availableZombies.push(selectedPowerful);
                availableWeights.push(this.getZombieWeight(selectedPowerful) * 0.3);
            }
        }

        // Generar zombies para la oleada
        let zombiesToAdd = baseZombies;

        // Si hay gargantuar, reducir cantidad de otros zombies
        if (gargantuarAdded) {
            zombiesToAdd = Math.max(1, Math.floor(baseZombies * 0.5));
        }

        // Control de variedad por oleada
        const zombieCounts = {};
        const maxSameType = 2;
        const maxDifferentTypes = Math.min(4, Math.max(2, Math.floor(waveNumber / 3)));

        const usedTypes = new Set();

        for (let i = 0; i < zombiesToAdd; i++) {
            let zombieType;

            // Añadir flag zombie al final de la oleada
            if (flagZombieAdded && i === zombiesToAdd - 1) {
                zombieType = flagZombieType;
            }
            // Añadir gargantuar
            else if (gargantuarAdded && i === 0 && availableZombies.length > 0) {
                zombieType = gargantuarType;
            }
            // Selección normal
            else if (availableZombies.length > 0) {
                // Priorizar tipos no usados aún
                const candidateTypes = [];
                const candidateWeights = [];

                availableZombies.forEach((zombie, index) => {
                    const currentCount = zombieCounts[zombie] || 0;
                    const typeCount = usedTypes.size;

                    let isPreferred = false;

                    // Prioridad 1: Tipos no usados aún
                    if (!usedTypes.has(zombie) && typeCount < maxDifferentTypes) {
                        isPreferred = true;
                        candidateWeights.push(availableWeights[index] * 1.5);
                    }
                    // Prioridad 2: Tipos ya usados pero dentro del límite
                    else if (currentCount < maxSameType &&
                        (typeCount < maxDifferentTypes || usedTypes.has(zombie))) {
                        isPreferred = true;
                        candidateWeights.push(availableWeights[index]);
                    }

                    if (isPreferred) {
                        candidateTypes.push(zombie);
                    }
                });

                if (candidateTypes.length > 0) {
                    zombieType = this.weightedRandomChoice(candidateTypes, candidateWeights);
                } else {
                    // Si no hay candidatos válidos, seleccionar aleatoriamente
                    zombieType = availableZombies[Math.floor(Math.random() * availableZombies.length)];
                }
            } else {
                // Fallback
                zombieType = this.levelData.zombies[Math.floor(Math.random() * this.levelData.zombies.length)];
            }

            // Actualizar conteos
            zombieCounts[zombieType] = (zombieCounts[zombieType] || 0) + 1;
            usedTypes.add(zombieType);

            waveData.zombies.push({
                row: Math.floor(Math.random() * 5).toString(),
                Type: `RTID(${zombieType}@ZombieTypes)`
            });
        }

        // Asegurar que el flag zombie esté al final si existe
        if (flagZombieAdded) {
            const flagZombieIndex = waveData.zombies.findIndex(z =>
                z.Type.includes(flagZombieType)
            );

            if (flagZombieIndex !== -1 && flagZombieIndex !== waveData.zombies.length - 1) {
                const flagZombie = waveData.zombies.splice(flagZombieIndex, 1)[0];
                waveData.zombies.push(flagZombie);
            }
        }

        return waveData;
    }

    categorizeZombies(zombieList) {
        const categories = {
            basic: [],
            armored: [],
            flag: [],
            gargantuar: [],
            special: []
        };

        zombieList.forEach(zombie => {
            const info = this.getZombieInfo(zombie);

            // Detectar flag zombies
            if (zombie.includes('flag') ||
                (info && info.flag_type && info.flag_type !== 'none')) {
                categories.flag.push(zombie);
            }
            // Detectar gargantuars
            else if (zombie.includes('gargantuar') ||
                (info && info.zombie_class && info.zombie_class.includes('Gargantuar'))) {
                categories.gargantuar.push(zombie);
            }
            // Detectar zombies con armadura
            else if (zombie.includes('armor') ||
                (info && info.tiene_armadura)) {
                categories.armored.push(zombie);
            }
            // Zombies básicos
            else if (zombie.includes('basic') ||
                (info && info.is_basic_zombie)) {
                categories.basic.push(zombie);
            }
            // Otros tipos especiales
            else {
                categories.special.push(zombie);
            }
        });

        return categories;
    }

    getPowerfulZombies(zombieThreats, count = 4) {
        // Ordenar zombies por amenaza (mayor primero)
        const sortedZombies = Object.entries(zombieThreats)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);

        // Tomar los más poderosos
        return sortedZombies.slice(0, Math.min(count, sortedZombies.length));
    }

    generateUndergroundWave(waveNumber, pfWaves, zombieThreats, totalWaves) {
        const minZombies = this.levelData.underground_min_zombies;
        const maxZombies = this.levelData.underground_max_zombies;

        const progress = waveNumber / totalWaves;
        let zombieCount = minZombies + Math.floor((maxZombies - minZombies) * progress);
        zombieCount = Math.max(minZombies, Math.min(zombieCount, maxZombies));

        const waveData = {
            wave_number: waveNumber,
            plant_food: pfWaves.includes(waveNumber) ? 1 : 0,
            objclass: "SpawnZombiesFromGroundSpawnerProps",
            column_start: this.levelData.underground_columns_start,
            column_end: this.levelData.underground_columns_end,
            zombies: []
        };

        // Filtrar zombies prohibidos para oleadas subterráneas
        const prohibitedZombies = ['carnie_cannon', '_flag', '_cannon'];

        const availableZombies = this.levelData.zombies.filter(zombie => {
            const isProhibited = prohibitedZombies.some(prohibited =>
                zombie.includes(prohibited) ||
                zombie.toLowerCase().includes(prohibited.toLowerCase())
            );
            return !isProhibited;
        });

        // Si no hay zombies disponibles después del filtrado, usar zombies normales
        if (availableZombies.length === 0) {
            availableZombies.push(...this.levelData.zombies);
        }

        // Recalcular pesos solo para los zombies disponibles
        const weights = availableZombies.map(z => this.getZombieWeight(z));

        for (let i = 0; i < zombieCount; i++) {
            let zombieType;

            if (Math.random() < 0.6 && availableZombies.length > 0) {
                const strongZombies = availableZombies.filter(z => zombieThreats[z] > 1.2);
                if (strongZombies.length > 0) {
                    const adjustedWeights = strongZombies.map(z => weights[availableZombies.indexOf(z)]);
                    zombieType = this.weightedRandomChoice(strongZombies, adjustedWeights);
                } else {
                    zombieType = this.weightedRandomChoice(availableZombies, weights);
                }
            } else if (availableZombies.length > 0) {
                zombieType = this.weightedRandomChoice(availableZombies, weights);
            } else {
                // Fallback si no hay zombies disponibles
                zombieType = this.levelData.zombies[Math.floor(Math.random() * this.levelData.zombies.length)];
            }

            waveData.zombies.push({
                row: Math.floor(Math.random() * 5).toString(),
                Type: `RTID(${zombieType}@ZombieTypes)`
            });
        }

        return waveData;
    }

    selectZombieType(waveNumber, totalWaves, availableZombies, weights, zombieThreats) {
        if (waveNumber > totalWaves * 0.6 && Math.random() < 0.4) {
            const strongZombies = availableZombies.filter(z => zombieThreats[z] > 1.5);
            if (strongZombies.length > 0) {
                const adjustedWeights = strongZombies.map(z => weights[availableZombies.indexOf(z)]);
                return this.weightedRandomChoice(strongZombies, adjustedWeights);
            }
        }

        return this.weightedRandomChoice(availableZombies, weights);
    }

    weightedRandomChoice(items, weights) {
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random < 0) {
                return items[i];
            }
        }

        return items[items.length - 1];
    }

    calculateZombiesPerWave(currentWave, totalWaves) {
        if (currentWave === 1) return 1;
        if (currentWave === 2) return 2;

        const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
        const difficultyFactors = {
            "facil": 0.8,
            "media": 1.0,
            "dificil": 1.3,
            "extrema": 1.6
        };
        const difficultyFactor = difficultyFactors[difficulty] || 1.0;

        const progress = currentWave / totalWaves;
        let baseCount;

        if (progress <= 0.3) {
            baseCount = Math.floor(Math.random() * 2) + 1;
        } else if (progress <= 0.6) {
            baseCount = Math.floor(Math.random() * 3) + 2;
        } else if (progress <= 0.8) {
            baseCount = Math.floor(Math.random() * 4) + 3;
        } else {
            baseCount = Math.floor(Math.random() * 5) + 4;
        }
        return Math.max(1, Math.floor(baseCount * difficultyFactor));
    }

    generateThematicLevel() {
        const world = this.levelData.world;

        this.levelData.zombies = [];

        if (this.zombieCategories[world]) {
            const thematicZombies = this.zombieCategories[world];
            const numZombies = Math.min(6, Math.max(4, thematicZombies.length));

            const shuffled = [...thematicZombies].sort(() => 0.5 - Math.random());
            this.levelData.zombies = shuffled.slice(0, numZombies);
        }

        this.updateSelectedZombiesDisplay();

        // SOLO SI la auto-detección está habilitada
        if (this.autoDetectOnZombieSelection) {
            this.autoDetectSettings();
        }

        this.generateSmartWaves();

        this.markTabAsChanged('waves');
        this.showMessage('Nivel Temático Generado', `Se ha generado un nivel temático de ${world}`, 'success');
    }

    updatePreview() {
        // Función auxiliar para obtener valores de elementos DOM de manera segura
        const getElementValue = (id, defaultValue = '') => {
            const element = document.getElementById(id);
            return element && element.value !== undefined ? element.value : defaultValue;
        };

        const getElementIntValue = (id, defaultValue = 0) => {
            const element = document.getElementById(id);
            return element && element.value !== undefined ? parseInt(element.value) || defaultValue : defaultValue;
        };

        const getElementBoolValue = (id, defaultValue = true) => {
            const element = document.getElementById(id);
            return element ? element.checked : defaultValue;
        };

        // Obtener valores de manera segura
        this.levelData.level_name = getElementValue('levelName', 'Mi Nivel Personalizado');
        this.levelData.level_number = getElementIntValue('levelNumber', 1);

        // CORREGIDO: Ya no busca stageSelect, usa el valor actual almacenado
        // stage se actualiza a través de selectScenario()
        // this.levelData.stage ya contiene el valor correcto

        this.levelData.visual_effect = getElementValue('effectSelect', '');
        //  this.levelData.mower_type = getElementValue('mowerSelect', 'ModernMowers');
        this.levelData.starting_sun = getElementIntValue('startingSun', 50);
        this.levelData.zombie_level = getElementIntValue('zombieLevel', 1);
        this.levelData.grid_level = getElementIntValue('gridLevel', 1);
        this.levelData.wave_count = getElementIntValue('waveCount', 10);
        this.levelData.flag_wave_interval = getElementIntValue('flagInterval', 4);
        this.levelData.spawn_col_start = getElementIntValue('spawnColStart', 6);
        this.levelData.spawn_col_end = getElementIntValue('spawnColEnd', 9);
        this.levelData.wave_spending_points = getElementIntValue('wavePoints', 150);
        this.levelData.wave_spending_point_increment = getElementIntValue('waveIncrement', 75);
        this.levelData.enable_sun_dropper = getElementBoolValue('enableSunDropper', true);

        // También obtener seed_selection_method si existe
        const seedMethodElement = document.getElementById('seedSelectionMethod');
        if (seedMethodElement) {
            this.levelData.seed_selection_method = seedMethodElement.value || 'chooser';
        }

        // Actualizar módulos del tablero si existe el boardManager
        if (this.boardManager) {
            this.boardManager.updateBoardModules();
        } else if (window.boardManager) {
            window.boardManager.updateBoardModules();
        }

        // Generar y mostrar JSON
        const json = this.generateJson();
        const preview = document.getElementById('jsonPreview');

        if (preview) {
            const jsonString = JSON.stringify(json, null, 2);
            preview.textContent = jsonString;
            this.highlightJson(preview);

            // Guardar preview automáticamente
            localStorage.setItem('pvz_tab_preview', JSON.stringify({
                json_content: jsonString,
                timestamp: new Date().toISOString()
            }));
        } else {
            console.warn('Elemento jsonPreview no encontrado');
        }

        this.levelData.mower_type

        this.updateStats();
    }

    highlightJson(element) {
        const text = element.textContent;
        element.textContent = text;
        const highlighted = this.syntaxHighlight(text);
        element.innerHTML = highlighted;
    }

    syntaxHighlight(json) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, null, 2);
        }

        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b(\d+)\b)/g, (match) => {
            let cls = 'json-number';

            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                    match = match.replace(/:$/, '') + '<span class="json-colon">:</span>';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }

            return `<span class="${cls}">${match}</span>`;
        });
    }

    generateModules() {
        const modules = [
            "RTID(ZombiesDeadWinCon@LevelModules)",
            "RTID(StandardIntro@LevelModules)",
            "RTID(DefaultZombieWinCondition@LevelModules)"
        ];

        // 1. SunDropper va después de los módulos básicos
        if (this.levelData.enable_sun_dropper) {
            modules.splice(2, 0, "RTID(DefaultSunDropper@LevelModules)");
        }

        // 2. SeedBank va después de los módulos básicos
        modules.push("RTID(SeedBank@CurrentLevel)");

        // 3. Módulos de colocación del tablero (si existen)
        if (window.boardManager) {
            const boardModules = window.boardManager.getAllModules();

            // Orden específico para los módulos de colocación
            const placementOrder = [
                "MountingPlants",
                "MountingZombies",
                "MountingGravestones",
                "MountingSliders",
                "MountingPotions",
                "MountingOthers",
                "MountingMolds"
            ];

            placementOrder.forEach(moduleName => {
                const moduleExists = boardModules.some(module =>
                    module.aliases?.[0] === moduleName
                );

                if (moduleExists) {
                    modules.push(`RTID(${moduleName}@CurrentLevel)`);
                }
            });
        }

        // 4. ChallengeModule (si hay desafíos)
        const enabledChallenges = this.challengesData.challenges.filter(c => c.enabled);
        const hasProtectedPlants = window.boardManager?.boardModules?.protectedPlants?.length > 0;
        const hasRegularChallenges = this.challengesData.enabled && enabledChallenges.length > 0;

        if (hasProtectedPlants || hasRegularChallenges) {
            modules.push("RTID(ChallengeModule@CurrentLevel)");
        }

        // 5. NewWaves va después de los desafíos
        modules.push("RTID(NewWaves@CurrentLevel)");

        // 6. Efectos visuales
        if (this.levelData.visual_effect) {
            modules.push(this.levelData.visual_effect);
        }

        // 7. Podadoras al final
        modules.push(`RTID(${this.levelData.mower_type}@LevelModules)`);

        return modules;
    }

    generateChallengeObjects() {
        const objects = [];

        // Verificar si hay plantas en peligro
        const hasProtectedPlants = window.boardManager?.boardModules?.protectedPlants?.length > 0;

        // Verificar si hay desafíos activados en la pestaña Challenges
        const enabledChallenges = this.challengesData.challenges.filter(c => c.enabled);
        const hasRegularChallenges = this.challengesData.enabled && enabledChallenges.length > 0;

        // Array para almacenar todos los desafíos
        let allChallenges = [];

        // 1. Agregar ProtectThePlant si hay plantas en peligro
        if (hasProtectedPlants) {
            allChallenges.push("RTID(ProtectThePlant@CurrentLevel)");

            // Agregar el objeto ProtectThePlant
            objects.push({
                "aliases": ["ProtectThePlant"],
                "objclass": "ProtectThePlantChallengeProperties",
                "objdata": {
                    "MustProtectCount": window.boardManager.boardModules.protectedPlants.length,
                    "Plants": window.boardManager.boardModules.protectedPlants
                }
            });
        }

        // 2. Agregar desafíos regulares si están activados
        if (hasRegularChallenges) {
            enabledChallenges.forEach(challenge => {
                allChallenges.push(`RTID(${challenge.id}@CurrentLevel)`);

                // Agregar cada objeto de desafío
                let objdata = {};

                switch (challenge.id) {
                    case 'ZombieDistance':
                        objdata = { "TargetDistance": challenge.value };
                        break;
                    case 'SunUsed':
                        objdata = { "MaximumSun": challenge.value };
                        break;
                    case 'SunProduced':
                        objdata = { "TargetSun": challenge.value };
                        break;
                    case 'SunHoldout':
                        objdata = { "HoldoutSeconds": challenge.value };
                        break;
                    case 'KillZombies':
                        objdata = {
                            "ZombiesToKill": challenge.values.zombies,
                            "Time": challenge.values.time
                        };
                        break;
                    case 'PlantsLost':
                        objdata = { "MaximumPlantsLost": challenge.value };
                        break;
                    case 'SimultaneousPlants':
                        objdata = { "MaximumPlants": challenge.value };
                        break;
                    case 'SaveMowers':
                        objdata = { "TargetMowers": challenge.value };
                        break;
                }

                objects.push({
                    "aliases": [challenge.id],
                    "objclass": challenge.type,
                    "objdata": objdata
                });
            });
        }

        // 3. Crear UN SOLO ChallengeModule con todos los desafíos combinados
        if (allChallenges.length > 0) {
            objects.push({
                "aliases": ["ChallengeModule"],
                "objclass": "StarChallengeModuleProperties",
                "objdata": {
                    "Challenges": [allChallenges],
                    "ChallengesAlwaysAvailable": true
                }
            });
        }

        return objects;
    }

    generateWaveObjects() {
        const objects = [
            {
                "aliases": ["SeedBank"],
                "objclass": "SeedBankProperties",
                "objdata": {
                    "SelectionMethod": this.levelData.seed_selection_method || "chooser",
                    ...(this.levelData.enable_seed_slots && {
                        "OverrideSeedSlotsCount": this.levelData.seed_slots_count
                    }),
                    // SIEMPRE incluir PresetPlantList si hay plantas preseleccionadas
                    ...(this.plantManager &&
                        this.plantManager.selectedPlants.length > 0 && {
                        "PresetPlantList": this.plantManager.getSelectedPlantsForJson()
                    }),
                    // SIEMPRE incluir PlantExcludeList si hay plantas excluidas
                    ...(this.plantManager &&
                        this.plantManager.excludedPlants.length > 0 && {
                        "PlantExcludeList": this.plantManager.getExcludedPlantsForJson()
                    })
                }
            },
            {
                "aliases": ["NewWaves"],
                "objclass": "WaveManagerModuleProperties",
                "objdata": {
                    "WaveManagerProps": "RTID(WaveManagerProps@CurrentLevel)"
                }
            },
            {
                "aliases": ["WaveManagerProps"],
                "objclass": "WaveManagerProperties",
                "objdata": {
                    "MaxNextWaveHealthPercentage": 0.28,
                    "FlagWaveInterval": this.levelData.flag_wave_interval.toString(),
                    ...(this.levelData.use_underground_zombies && { "SpawnColEnd": this.levelData.spawn_col_end }),
                    ...(this.levelData.use_underground_zombies && { "SpawnColStart": this.levelData.spawn_col_start }),
                    "WaveCount": this.levelData.wave_count.toString(),
                    "WaveSpendingPointIncrement": this.levelData.wave_spending_point_increment,
                    "WaveSpendingPoints": this.levelData.wave_spending_points,
                    "Waves": Array.from({ length: this.levelData.wave_count }, (_, i) => [`RTID(Wave${i + 1}@CurrentLevel)`])
                }
            }
        ];

        // Agregar las oleadas individuales
        this.levelData.waves.forEach((wave, i) => {
            if (i < this.levelData.wave_count) {
                let waveObj;

                if (wave.objclass === "SpawnZombiesFromGroundSpawnerProps") {
                    waveObj = {
                        "aliases": [`Wave${i + 1}`],
                        "objclass": "SpawnZombiesFromGroundSpawnerProps",
                        "objdata": {
                            "AdditionalPlantfood": wave.plant_food || 0,
                            "ColumnStart": wave.column_start || 2,
                            "ColumnEnd": wave.column_end || 4,
                            "Zombies": wave.zombies || []
                        }
                    };
                } else {
                    waveObj = {
                        "aliases": [`Wave${i + 1}`],
                        "objclass": "SpawnZombiesJitteredWaveActionProps",
                        "objdata": {
                            "AdditionalPlantfood": wave.plant_food || 0,
                            "Zombies": wave.zombies || []
                        }
                    };
                }

                objects.push(waveObj);
            }
        });

        return objects;
    }

generateJson() {
    // Obtener módulos del BoardManager si existe
    let boardModules = [];

    if (this.boardManager && typeof this.boardManager.getAllModules === 'function') {
        boardModules = this.boardManager.getAllModules();
        console.log('Módulos del BoardManager:', boardModules);
    } else if (window.boardManager && typeof window.boardManager.getAllModules === 'function') {
        boardModules = window.boardManager.getAllModules();
        console.log('Módulos del BoardManager (window):', boardModules);
    }

    const levelJson = {
        "#comment": this.levelData.level_name,
        "objects": [],
        "version": 1
    };

    // **1. AGREGAR LevelDefinition PRIMERO**
    levelJson.objects.push({
        "objclass": "LevelDefinition",
        "objdata": {
            "Description": this.levelData.level_name,
            "FirstRewardType": this.rewardManager.rewardsData.firstReward?.type || "",
            "FirstRewardParam": this.rewardManager.rewardsData.firstReward?.param || "",
            "ReplayRewardType": this.rewardManager.rewardsData.replayReward?.type || "",
            "ReplayRewardParam": this.rewardManager.rewardsData.replayReward?.param || "",
            "LevelNumber": this.levelData.level_number,
            "ForceToWorldMap": true,
            "Loot": "RTID(DefaultLoot@LevelModules)",
            "Modules": this.generateModules(),
            "ZombieLevel": this.levelData.zombie_level,
            "GridItemLevel": this.levelData.grid_level,
            "Name": this.levelData.level_name,
            "NormalPresentTable": "modern_normal_03",
            "RepeatPlayForceToWorldMap": false,
            "ShinyPresentTable": "egypt_shiny_01",
            "StageModule": `RTID(${this.levelData.stage}@LevelModules)`,
            "StartingSun": this.levelData.starting_sun
        }
    });

    // **2. AGREGAR SeedBank SEGUNDO**
    const waveObjects = this.generateWaveObjects();
    let seedBankObject = null;
    let otherWaveObjects = [];

    // Separar SeedBank del resto de wave objects
    waveObjects.forEach(obj => {
        if (obj.aliases && obj.aliases[0] === "SeedBank") {
            seedBankObject = obj;
        } else {
            otherWaveObjects.push(obj);
        }
    });

    if (seedBankObject) {
        levelJson.objects.push(seedBankObject);
        console.log('SeedBank agregado en posición 2');
    }

    // **3. AGREGAR MÓDULOS DE TABLERO (EXCLUYENDO ProtectThePlant)**
    if (boardModules.length > 0) {
        console.log(`Total módulos del BoardManager: ${boardModules.length}`, 
            boardModules.map(m => m.aliases?.[0]));
        
        // IMPORTANTE: Orden CORRECTO de módulos de molds
        const placementModules = [];
        
        // Primero buscar MountingMolds (DEBE IR PRIMERO)
        const mountingMoldsModule = boardModules.find(m => m.aliases?.[0] === "MountingMolds");
        if (mountingMoldsModule) {
            placementModules.push(mountingMoldsModule);
            console.log('✅ MountingMolds agregado (debe ir primero)');
        }
        
        // Luego buscar MoldLocationsCustom (DEBE IR DESPUÉS)
        const moldLocationsModule = boardModules.find(m => m.aliases?.[0] === "MoldLocationsCustom");
        if (moldLocationsModule) {
            placementModules.push(moldLocationsModule);
            console.log('✅ MoldLocationsCustom agregado (después de MountingMolds)');
        }
        
        // Agregar el resto de módulos de colocación (evitando duplicados)
        const moduleAliases = placementModules.map(m => m.aliases?.[0]);
        
        boardModules.forEach(module => {
            const alias = module.aliases?.[0];
            const placementModulesList = [
                "MountingPlants",
                "MountingZombies",
                "MountingGravestones",
                "MountingSliders",
                "MountingPotions",
                "MountingOthers"
            ];
            
            // IMPORTANTE: NO incluir ProtectThePlant aquí - se agregará en la sección 4
            if (placementModulesList.includes(alias) && !moduleAliases.includes(alias)) {
                placementModules.push(module);
                moduleAliases.push(alias);
            }
        });
        
        // NO agregar ProtectThePlant aquí - se manejará en la sección 4
        
        if (placementModules.length > 0) {
            levelJson.objects.push(...placementModules);
            console.log(`${placementModules.length} módulos de colocación agregados:`, 
                placementModules.map(m => m.aliases?.[0]));
        }
    }

    // **4. AGREGAR DESAFÍOS EN EL ORDEN CORRECTO**
    const challengeObjects = this.generateChallengeObjects();

    // **4.1 PRIMERO: ChallengeModule**
    const challengeModuleObject = challengeObjects.find(obj =>
        obj.aliases?.[0] === "ChallengeModule"
    );
    if (challengeModuleObject) {
        levelJson.objects.push(challengeModuleObject);
        console.log('✅ ChallengeModule agregado PRIMERO');
    }

    // **4.2 SEGUNDO: ProtectThePlant (si existe en challengeObjects)**
    const protectPlantObject = challengeObjects.find(obj =>
        obj.aliases?.[0] === "ProtectThePlant"
    );
    if (protectPlantObject) {
        levelJson.objects.push(protectPlantObject);
        console.log('✅ ProtectThePlant agregado SEGUNDO (después de ChallengeModule)');
    }

    // **4.3 FINALMENTE: Otros desafíos individuales (excluyendo los ya procesados)**
    const otherChallenges = challengeObjects.filter(obj => {
        const alias = obj.aliases?.[0];
        return alias !== "ChallengeModule" && alias !== "ProtectThePlant";
    });
    
    if (otherChallenges.length > 0) {
        levelJson.objects.push(...otherChallenges);
        console.log(`${otherChallenges.length} desafíos individuales agregados`);
    }

    // **5. AGREGAR OTROS OBJETOS DE WAVE (NewWaves, WaveManagerProps, Waves)**
    levelJson.objects.push(...otherWaveObjects);
    console.log(`${otherWaveObjects.length} objetos de wave agregados al final`);

    return levelJson;
}

    updateStats() {
        const container = document.getElementById('statsContent');

        if (this.levelData.zombies.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="bi bi-robot display-1 mb-3"></i>
                    <h4>No hay zombies seleccionados</h4>
                    <p>Selecciona zombies para calcular estadísticas</p>
                </div>`;

            // Guardar estadísticas vacías
            localStorage.setItem('pvz_tab_stats', JSON.stringify({
                stats_content: container.innerHTML,
                timestamp: new Date().toISOString()
            }));

            return;
        }

        let totalThreat = 0;
        let totalHp = 0;
        let armoredCount = 0;
        let specialCount = 0;
        const zombieDetails = [];

        this.levelData.zombies.forEach(zombieAlias => {
            const info = this.getZombieInfo(zombieAlias);
            if (info) {
                const threat = this.calculateZombieThreatLevel(zombieAlias);
                const hp = info.hitpoints || 0;
                const hasArmor = info.tiene_armadura || false;
                const zombieClass = info.zombie_class || '';

                totalThreat += threat;
                totalHp += hp;
                if (hasArmor) armoredCount++;
                if (zombieAlias.toLowerCase().includes('gargantuar') || zombieClass.includes('Gargantuar')) {
                    specialCount++;
                }

                zombieDetails.push(`${zombieAlias}: ${hp} HP, Amenaza: ${threat.toFixed(1)}`);
            }
        });

        const avgHp = totalHp / this.levelData.zombies.length;
        const avgThreat = totalThreat / this.levelData.zombies.length;

        let waveStats = "";
        let undergroundStats = "";
        const undergroundWaveList = [];

        if (this.levelData.waves.length > 0) {
            const totalWaveZombies = this.levelData.waves.reduce((sum, wave) => sum + wave.zombies.length, 0);
            const avgZombiesPerWave = totalWaveZombies / this.levelData.waves.length;

            const undergroundWaves = this.levelData.waves.filter(w => w.objclass === "SpawnZombiesFromGroundSpawnerProps");
            const undergroundCount = undergroundWaves.length;

            undergroundWaves.forEach(wave => {
                undergroundWaveList.push(wave.wave_number || "?");
            });

            waveStats = `<p>- Zombies totales en oleadas: ${totalWaveZombies}</p>
                         <p>- Promedio por oleada: ${avgZombiesPerWave.toFixed(1)}</p>`;

            if (undergroundWaveList.length > 0) {
                undergroundStats = `<p>- Oleadas subterráneas: ${undergroundCount}/${this.levelData.waves.length}</p>
                                   <p>  Oleadas: ${undergroundWaveList.join(', ')}</p>`;
            } else {
                undergroundStats = `<p>- Oleadas subterráneas: 0/${this.levelData.waves.length}</p>`;
            }
        } else {
            waveStats = "<p>- Oleadas no generadas aún</p>";
            undergroundStats = "";
        }

        const enabledChallenges = this.challengesData.challenges.filter(c => c.enabled);
        const challengeStats = `
            <h6>DESAFÍOS ACTIVADOS (${enabledChallenges.length}):</h6>
            <p>- Desafíos activados: ${enabledChallenges.length}/8</p>
            ${enabledChallenges.map(challenge =>
            `<p>  • ${this.getChallengeDescription(challenge)}</p>`
        ).join('')}
        `;

        const difficulty = document.querySelector('input[name="difficulty"]:checked').value;

        let statsText = `
            <h5>ESTADÍSTICAS DEL NIVEL</h5>
            <hr>
            <h6>ZOMBIES SELECCIONADOS (${this.levelData.zombies.length}):</h6>
            <pre>${zombieDetails.join('\n')}</pre>
            
            <h6>ESTADÍSTICAS GENERALES:</h6>
            <p>- Amenaza Total: ${totalThreat.toFixed(1)}</p>
            <p>- Vida Promedio: ${avgHp.toFixed(0)} HP</p>
            <p>- Amenaza Promedio: ${avgThreat.toFixed(1)}</p>
            <p>- Zombies con Armadura: ${armoredCount}</p>
            <p>- Zombies Especiales: ${specialCount}</p>
            
            ${challengeStats}
            
            <h6>CONFIGURACIÓN SUBTERRÁNEA:</h6>
            <p>- Activado: ${this.levelData.use_underground_zombies ? 'Sí' : 'No'}</p>
            <p>- Oleada inicial: ${this.levelData.underground_wave_start}</p>
            <p>- Frecuencia: cada ${this.levelData.underground_wave_interval} oleadas</p>
            <p>- Columnas: ${this.levelData.underground_columns_start}-${this.levelData.underground_columns_end}</p>
            <p>- Zombies por oleada: ${this.levelData.underground_min_zombies}-${this.levelData.underground_max_zombies}</p>
            
            <h6>OLEADAS:</h6>
            <p>- Total de Oleadas: ${this.levelData.wave_count}</p>
            ${waveStats}
            ${undergroundStats}
            <p>- Dificultad: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
            <p>- Sol Inicial: ${this.levelData.starting_sun}</p>
            <p>- Caída de soles periódica: ${this.levelData.enable_sun_dropper ? 'Activada' : 'Desactivada'}</p>
            
            <h6>RECOMENDACIONES:</h6>
        `;

        if (avgThreat > 2.0) {
            statsText += "<p>- Nivel MUY difícil, considera reducir zombies especiales</p>";
        } else if (avgThreat > 1.2) {
            statsText += "<p>- Nivel desafiante, bien balanceado</p>";
        } else {
            statsText += "<p>- Nivel accesible, buen para jugadores nuevos</p>";
        }

        if (armoredCount > this.levelData.zombies.length * 0.5) {
            statsText += "<p>- Muchos zombies con armadura, necesitas plantas penetrantes</p>";
        }

        if (specialCount > 2) {
            statsText += "<p>- Múltiples zombies especiales, prepara defensas fuertes</p>";
        }

        if (enabledChallenges.length > 0) {
            statsText += "<p>- ¡Desafíos activados! Completa objetivos para estrellas adicionales</p>";
        }

        if (this.levelData.use_underground_zombies) {
            statsText += `<p>- ¡Zombies subterráneos activados! Aparecen cada ${this.levelData.underground_wave_interval} oleadas</p>
                         <p>- Prepara plantas que ataquen bajo tierra</p>`;
        }

        if (!this.levelData.enable_sun_dropper) {
            statsText += `<p>- ¡Caída de soles desactivada! Solo tendrás el sol inicial y plantas productoras</p>
                         <p>- Asegúrate de incluir suficientes plantas productoras de sol</p>`;
        }

        container.innerHTML = statsText;

        // Guardar estadísticas
        localStorage.setItem('pvz_tab_stats', JSON.stringify({
            stats_content: statsText,
            timestamp: new Date().toISOString()
        }));
    }

    getChallengeDescription(challenge) {
        switch (challenge.id) {
            case 'ZombieDistance':
                return `No permitir que zombies se acerquen más de ${challenge.value} casillas`;
            case 'SunUsed':
                return `Usar máximo ${challenge.value} sol`;
            case 'SunProduced':
                return `Producir al menos ${challenge.value} sol`;
            case 'SunHoldout':
                return `Retener 50+ sol por ${challenge.value} segundos`;
            case 'KillZombies':
                return `Matar ${challenge.values.zombies} zombies en ${challenge.values.time} segundos`;
            case 'PlantsLost':
                return `Perder máximo ${challenge.value} plantas`;
            case 'SimultaneousPlants':
                return `Máximo ${challenge.value} plantas simultáneas`;
            case 'SaveMowers':
                return `Salvar al menos ${challenge.value} podadoras`;
            default:
                return challenge.id;
        }
    }

    generateLevel() {
        this.updatePreview();
        this.updateStats();
        this.showMessage('Nivel Generado', 'El nivel ha sido generado correctamente.', 'success');
    }

    async saveLevel() {
        this.updatePreview();

        const defaultName = "MODERN1";
        const format = document.getElementById('formatSelect').value || 'json';

        const fileName = defaultName || 'MODERN1';

        if (!fileName) return;

        const cleanFileName = fileName.replace(/[<>:"/\\|?*]/g, '_');
        let finalFileName, blob, mimeType;

        const json = this.generateJson();

        if (format === 'rton') {
            // Convertir a RTON
            const converter = new JSONARTON();
            converter.set(JSON.stringify(json));
            const rtonBinary = converter.get('binary');

            finalFileName = cleanFileName.endsWith('.rton') ? cleanFileName : `${cleanFileName}.rton`;
            blob = rtonBinary;
            mimeType = 'application/octet-stream';
        } else {
            // Mantener JSON
            const jsonString = JSON.stringify(json, null, 2);
            finalFileName = cleanFileName.endsWith('.json') ? cleanFileName : `${cleanFileName}.json`;
            blob = new Blob([jsonString], { type: 'application/json' });
            mimeType = 'application/json';
        }

        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = finalFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async loadConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const config = JSON.parse(text);

                const levelDef = config.objects?.find(obj => obj.objclass === "LevelDefinition");
                if (levelDef) {
                    const objdata = levelDef.objdata || {};

                    document.getElementById('levelName').value = objdata.Name || "";
                    document.getElementById('levelNumber').value = objdata.LevelNumber || 1;
                    document.getElementById('startingSun').value = objdata.StartingSun || 50;
                    document.getElementById('zombieLevel').value = objdata.ZombieLevel || 1;
                    document.getElementById('gridLevel').value = objdata.GridItemLevel || 1;

                    const stage = objdata.StageModule || "";
                    if (stage.includes("Egypt")) {
                        this.selectWorld("Egipto");
                    } else if (stage.includes("Pirate")) {
                        this.selectWorld("Pirata");
                    } else if (stage.includes("Modern")) {
                        this.selectWorld("Moderno");
                    }

                    this.updateStages();

                    const modules = objdata.Modules || [];
                    const hasSunDropper = modules.some(module =>
                        typeof module === 'string' && module.includes("DefaultSunDropper")
                    );

                    this.levelData.enable_sun_dropper = hasSunDropper;
                    document.getElementById('enableSunDropper').checked = this.levelData.enable_sun_dropper;

                    const seedBank = config.objects?.find(obj =>
                        obj.aliases?.[0] === "SeedBank"
                    );

                    if (seedBank && seedBank.objdata?.OverrideSeedSlotsCount !== undefined) {
                        this.levelData.enable_seed_slots = true;
                        this.levelData.seed_slots_count = seedBank.objdata.OverrideSeedSlotsCount;
                    } else {
                        this.levelData.enable_seed_slots = false;
                        this.levelData.seed_slots_count = 8;
                    }

                    document.getElementById('enableSeedSlots').checked = this.levelData.enable_seed_slots;
                    document.getElementById('seedSlotsCount').value = this.levelData.seed_slots_count;
                    this.updateSeedSlotsControl();

                    const challengeModule = config.objects?.find(obj =>
                        obj.objclass === "StarChallengeModuleProperties"
                    );

                    if (challengeModule) {
                        this.challengesData.enabled = true;

                        config.objects?.forEach(obj => {
                            if (obj.objclass.includes("StarChallenge") && obj.aliases?.[0]) {
                                const challengeId = obj.aliases[0];
                                const challenge = this.challengesData.challenges.find(c => c.id === challengeId);

                                if (challenge) {
                                    challenge.enabled = true;

                                    const objdata = obj.objdata || {};
                                    if (challengeId === 'KillZombies') {
                                        challenge.values.zombies = objdata.ZombiesToKill || 15;
                                        challenge.values.time = objdata.Time || 10;
                                    } else if (objdata.TargetDistance !== undefined) {
                                        challenge.value = objdata.TargetDistance;
                                    } else if (objdata.MaximumSun !== undefined) {
                                        challenge.value = objdata.MaximumSun;
                                    } else if (objdata.TargetSun !== undefined) {
                                        challenge.value = objdata.TargetSun;
                                    } else if (objdata.HoldoutSeconds !== undefined) {
                                        challenge.value = objdata.HoldoutSeconds;
                                    } else if (objdata.MaximumPlantsLost !== undefined) {
                                        challenge.value = objdata.MaximumPlantsLost;
                                    } else if (objdata.MaximumPlants !== undefined) {
                                        challenge.value = objdata.MaximumPlants;
                                    } else if (objdata.TargetMowers !== undefined) {
                                        challenge.value = objdata.TargetMowers;
                                    }
                                }
                            }
                        });
                    }

                    this.updateChallengesUI();
                    this.showMessage('Configuración Cargada', 'Configuración cargada correctamente', 'success');
                    this.updatePreview();

                    // Marcar todas las pestañas como con cambios para forzar guardado
                    ['basic', 'waves', 'challenges'].forEach(tabId => {
                        this.markTabAsChanged(tabId);
                        this.saveCurrentTab();
                    });
                } else {
                    this.showMessage('Error', 'No se encontró la configuración del nivel en el archivo', 'error');
                }
            } catch (error) {
                this.showMessage('Error', `No se pudo cargar el archivo: ${error.message}`, 'error');
            }
        };

        input.click();
    }

    copyJsonToClipboard() {
        const jsonText = document.getElementById('jsonPreview').textContent;
        navigator.clipboard.writeText(jsonText).then(() => {
            this.showMessage('Copiado', 'JSON copiado al portapapeles', 'success');
        }).catch(err => {
            this.showMessage('Error', 'No se pudo copiar al portapapeles: ' + err, 'error');
        });
    }

    resetAllSettings() {
        if (confirm('¿Estás seguro de que quieres restablecer todos los ajustes a los valores predeterminados?\n\nSe perderán todos los cambios no guardados.')) {
            this.levelData = {
                level_name: "Mi Nivel Personalizado",
                level_number: 1,
                world: "Moderno",
                stage: "None",
                visual_effect: "",
                enable_sun_dropper: true,
                enable_seed_slots: false,
                seed_slots_count: 8,
                mower_type: "ModernMowers",
                starting_sun: 50,
                zombie_level: 1,
                grid_level: 1,
                wave_count: 10,
                flag_wave_interval: 4,
                plant_food_waves: [3, 6, 9],
                zombies: [],
                waves: [],
                use_underground_zombies: false,
                underground_wave_start: 5,
                underground_wave_interval: 3,
                underground_columns_start: 2,
                underground_columns_end: 4,
                spawn_col_start: 6,
                spawn_col_end: 9,
                wave_spending_points: 150,
                wave_spending_point_increment: 75,
                underground_max_zombies: 3,
                underground_min_zombies: 1
            };

            this.challengesData = {
                enabled: false,
                challenges: [
                    {
                        id: "ZombieDistance",
                        enabled: false,
                        type: "StarChallengeZombieDistanceProps",
                        value: 5.5
                    },
                    {
                        id: "SunUsed",
                        enabled: false,
                        type: "StarChallengeSunUsedProps",
                        value: 500
                    },
                    {
                        id: "SunProduced",
                        enabled: false,
                        type: "StarChallengeSunProducedProps",
                        value: 500
                    },
                    {
                        id: "SunHoldout",
                        enabled: false,
                        type: "StarChallengeSpendSunHoldoutProps",
                        value: 60
                    },
                    {
                        id: "KillZombies",
                        enabled: false,
                        type: "StarChallengeKillZombiesInTimeProps",
                        values: { zombies: 15, time: 10 }
                    },
                    {
                        id: "PlantsLost",
                        enabled: false,
                        type: "StarChallengePlantsLostProps",
                        value: 5
                    },
                    {
                        id: "SimultaneousPlants",
                        enabled: false,
                        type: "StarChallengeSimultaneousPlantsProps",
                        value: 15
                    },
                    {
                        id: "SaveMowers",
                        enabled: false,
                        type: "StarChallengeSaveMowersProps",
                        value: 3
                    }
                ]
            };

            // Restaurar también el valor de autoDetectOnZombieSelection
            this.autoDetectOnZombieSelection = false;

            this.updateAllControls();
            this.updateChallengesUI();
            this.updateSelectedZombiesDisplay();
            this.updatePreview();

            // Limpiar localStorage
            const tabIds = ['basic', 'waves', 'challenges', 'preview', 'stats'];
            tabIds.forEach(tabId => {
                localStorage.removeItem(`pvz_tab_${tabId}`);
                this.updateTabIndicator(tabId, false);
            });

            localStorage.removeItem('pvz_level_generator_config');

            this.showMessage('Restablecido', 'Todos los ajustes han sido restablecidos a los valores predeterminados.', 'success');
        }
    }

    exportSettings() {
        // Primero guardar todo
        this.saveCurrentTab();

        const settings = {
            levelData: this.levelData,
            challengesData: this.challengesData,
            autoDetectOnZombieSelection: this.autoDetectOnZombieSelection,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        const jsonString = JSON.stringify(settings, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `pvz_generator_settings_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('Exportado', 'Configuración exportada correctamente', 'success');
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const settings = JSON.parse(text);

                if (settings.levelData) {
                    this.levelData = { ...this.levelData, ...settings.levelData };
                    this.updateAllControls();
                    this.updateSelectedZombiesDisplay();

                    if (settings.challengesData) {
                        this.challengesData = settings.challengesData;
                        this.updateChallengesUI();
                    }

                    if (settings.autoDetectOnZombieSelection !== undefined) {
                        this.autoDetectOnZombieSelection = settings.autoDetectOnZombieSelection;
                    }

                    this.updatePreview();

                    // Guardar en localStorage
                    localStorage.setItem('pvz_level_generator_config', JSON.stringify({
                        levelData: this.levelData,
                        challengesData: this.challengesData,
                        autoDetectOnZombieSelection: this.autoDetectOnZombieSelection,
                        timestamp: new Date().toISOString()
                    }));

                    // Forzar guardado de todas las pestañas
                    ['basic', 'waves', 'challenges'].forEach(tabId => {
                        this.markTabAsChanged(tabId);
                        this.saveCurrentTab();
                    });

                    this.showMessage('Importado', 'Configuración importada correctamente', 'success');
                } else {
                    this.showMessage('Error', 'El archivo no contiene configuración válida', 'error');
                }
            } catch (error) {
                this.showMessage('Error', `No se pudo importar el archivo: ${error.message}`, 'error');
            }
        };

        input.click();
    }

    showMessage(title, message, type = 'info') {
        // Crear el elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;

        // Mapear íconos según el tipo
        const icons = {
            'success': 'bi-check-circle-fill',
            'error': 'bi-x-circle-fill',
            'warning': 'bi-exclamation-triangle-fill',
            'info': 'bi-info-circle-fill'
        };

        // Icono por defecto si no se especifica
        const iconClass = icons[type] || 'bi-info-circle-fill';

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="bi ${iconClass} text-${type}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                &times;
            </button>
        `;

        // Obtener el contenedor de notificaciones
        let container = document.getElementById('notificationContainer');
        if (!container) {
            // Crear el contenedor si no existe
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        // Agregar la notificación al contenedor
        container.appendChild(notification);

        // Auto-eliminar después de 4 segundos
        setTimeout(() => {
            if (notification.parentElement === container) {
                notification.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌐 DOM completamente cargado - Verificando aplicación...');

    // Si levelGenerator aún no existe, crearlo
    if (!window.levelGenerator) {
        console.log('🔧 Creando nueva instancia de EnhancedLevelGenerator...');
        window.levelGenerator = new EnhancedLevelGenerator();

        // Verificar el estado después de un momento
        setTimeout(() => {
            if (window.levelGenerator.initializationComplete) {
                console.log('✅ Aplicación inicializada correctamente');
            } else if (window.levelGenerator.initializationError) {
                console.error('❌ Error durante inicialización:', window.levelGenerator.initializationError);
            } else {
                console.log('⏳ Aplicación aún inicializando...');
            }
        }, 2000);
    } else {
        console.log('✓ levelGenerator ya existe');

        // Si ya existe pero no está inicializado, intentar forzar inicialización
        if (!window.levelGenerator.initializationComplete) {
            console.log('🔄 Reintentando inicialización...');
            window.levelGenerator.init().catch(e => {
                console.error('Error al reintentar:', e);
            });
        }
    }
});