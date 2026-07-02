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
    MOD_CONFIG,
    detectModFromZombie,
    isModZombie,
    isModCategory,
    PLANTS, // Nueva importación
    GRAVESTONES, // Nueva importación
    GRAVESTONE_DISPLAY_NAMES, // Nueva importación
    FALLBACK_IMAGES,
    ZOMBIE_FAMILIES
} from '../constants/resources.js';

import { RewardManager } from './managers/RewardManager.js';

import { ZombieDataLoader } from './ui/zombie-loader.js';

import { TabStateManager } from './managers/TabStateManager.js';

import { ConveyorManager } from './managers/ConveyorManager.js';

import { MechanicManager } from './managers/MechanicManager.js';
import { UndergroundMechanic } from './mechanics/UndergroundMechanic.js';
import { StormMechanic } from './mechanics/StormMechanic.js';
import { FrostWindMechanic } from './mechanics/FrostWindMechanic.js';
import { TideMechanic } from './mechanics/TideMechanic.js';
import { LowTideMechanic } from './mechanics/LowTideMechanic.js';
import { ParachuteRainMechanic } from './mechanics/ParachuteRainMechanic.js';

window.APP_CONSTANTS = { PLANTS, PATHS };
window.ZOMBIE_FAMILIES = ZOMBIE_FAMILIES;

// ─── DEBUG MODE ────────────────────────────
const DEBUG = false;
if (!DEBUG) {
    const noop = () => {};
    console.log = noop;
    console.debug = noop;
    console.info = noop;
}

// ─── IMPORTS FOR EXTRACTED MODULES ────────────────────────

import {
    calculateDefaultHP,
    calculateDefaultSpeed,
    calculateDefaultDPS,
    detectHomeWorld,
    detectHomeWorldFromCategory,
    detectZombieClass,
    isBasicZombie,
    calculateZombieThreatLevel,
    getZombieWeight
} from './managers/ZombieOperations.js';

import {
    setupConverterListeners,
    convertJsonToRton,
    convertRtonToJson,
    loadJsonFile,
    loadRtonFile,
    copyResult,
    downloadResult,
    downloadFile,
    clearResult,
    showConverterMessage
} from './managers/ConverterManager.js';

import {
    generateSmartWaves,
    generateNormalWave,
    categorizeZombies,
    getPowerfulZombies,
    selectZombieType,
    weightedRandomChoice,
    calculateZombiesPerWave,
    generateThematicLevel
} from './managers/WaveGenerator.js';

import {
    generateJson,
    generateModules,
    generateWaveObjects,
    generateDynamicZombies,
    generateChallengeObjects,
    updatePreview,
    highlightJson,
    syntaxHighlight
} from './managers/JsonLevelBuilder.js';

import {
    updateStats,
    getChallengeDescription
} from './managers/StatsManager.js';

import {
    generateLevel,
    saveLevel,
    loadConfig,
    copyJsonToClipboard,
    resetAllSettings,
    exportSettings,
    importSettings
} from './managers/SettingsManager.js';

import {
    initializeMowerModal,
    generateMowerModalOptions,
    setupMowerModalListeners,
    selectMower,
    updateSelectedMowerDisplay,
    highlightSelectedMower,
    filterMowers,
    initializeScenarioModal,
    generateScenarioModalOptions,
    setupScenarioModalListeners,
    selectScenario,
    updateSelectedScenarioDisplay,
    highlightSelectedScenario,
    filterScenarios,
    initializeWorldModal,
    generateWorldModalOptions,
    setupWorldModalListeners,
    selectWorld,
    updateSelectedWorldDisplay,
    highlightSelectedWorld,
    filterWorlds,
    updateStages
} from './managers/ModalManager.js';

import { Store } from './managers/Store.js';

// ─── END IMPORTS ──────────────────────────────────────────

class EnhancedLevelGenerator {
    constructor() {

        // 1. DATOS DEL NIVEL (Configuración principal) via Store
        this.store = Store.getInstance();

        const defaultLevelData = {
            level_name: "Mi Nivel Personalizado",
            level_number: 1,
            world: "Egipto",
            stage: "NoneStage",
            visual_effect: "",
            enable_sun_dropper: true,
            enable_seed_slots: false,
            seed_slots_count: 8,
            enable_fixed_plant_level: false,
            fixed_plant_level: 0,
            mower_type: "ModernMowers",
            seed_selection_method: "chooser",
            enable_zomboss_battle: false,
            zomboss_mech_type: "",
            enable_pirate_planks: false,
            pirate_plank_rows: [0, 1, 2, 3, 4],
            starting_sun: 50,
            zombie_level: 1,
            grid_level: 1,
            wave_count: 10,
            flag_wave_interval: 4,
            plant_food_waves: [3, 6, 9],
            zombies: [],
            waves: [],
            spawn_col_start: 6,
            spawn_col_end: 9,
            wave_spending_points: 150,
            wave_spending_point_increment: 75
        };
        const restored = this.store.hydrate({ levelData: defaultLevelData });
        this.store.state.levelData = restored.levelData;
        this.levelData = this.store.state.levelData;
        this.store.persist('levelData.*');

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
        


        this.tabStateManager = null;

        this.rewardManager = new RewardManager(this);

        this.conveyorManager = new ConveyorManager(this);

        this.mechanicManager = null;

        // 3. SISTEMA DE ZOMBIES
        this.zombieDataLoader = new ZombieDataLoader();
        this.zombieData = []; // Datos de zombies
        this.zombieCategories = {}; // Se llenará dinámicamente desde el JSON
        this.autoDetectOnZombieSelection = false; // DESACTIVADO

        // 4. SISTEMA DE DESAFÍOS via Store
        const defaultChallenges = {
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
        const restoredCh = this.store.hydrate({ challengesData: defaultChallenges });
        this.store.state.challengesData = restoredCh.challengesData;
        this.challengesData = this.store.state.challengesData;
        this.store.persist('challengesData.*');

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

        // 8. BANDERA DE NIVEL GENERADO
        this.levelGenerated = false;

        // 8. INICIALIZACIÓN DIFERIDA - NO INICIAR INMEDIATAMENTE
        // En lugar de llamar init() aquí, programamos la inicialización

        // Solo inicializar componentes que NO dependen del DOM
        this.setupConverterListeners();

        // Programar la inicialización principal cuando el DOM esté listo
        this.initPromise = this.scheduleInitialization();

    }

    scheduleInitialization() {
        return new Promise((resolve, reject) => {
            const initWhenReady = () => {

                // Si el DOM ya está listo
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
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
                    document.addEventListener('DOMContentLoaded', () => {
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
                    // Intentar igualmente después de un breve retraso
                    setTimeout(() => {
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
            categoriesPanel.innerHTML = '<div class="text-center p-4 text-danger">No hay categorías disponibles</div>';
            contentPanel.innerHTML = '<div class="text-center p-4 text-danger">No hay zombies disponibles</div>';
            return;
        }

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
            const displayName = this.formatCategoryName(category);

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


    // 4. Clasificar las demás categorías - AQUÍ ESTÁ EL CAMBIO
    const modCats = [];
    const chinaCats = [];
    const otherCats = [];
    const specialCats = [];

    remainingCategories.forEach(category => {
        if (this.isSpecialCategory(category)) {
            specialCats.push(category);
        } else if (this.isModCategory(category)) {
            modCats.push(category);
        } else if (this.isChinaCategory(category)) { // ¡NUEVA FUNCIÓN NECESARIA!
            chinaCats.push(category);
        } else {
            otherCats.push(category);
        }
    });

    // 5. Crear sección de China (si hay categorías chinas)
    if (chinaCats.length > 0) {
        const chinaSection = document.createElement('div');
        chinaSection.className = 'category-group';

        const chinaTitle = document.createElement('h6');
        chinaTitle.className = 'text-muted mb-2';
        chinaTitle.textContent = 'China';
        chinaSection.appendChild(chinaTitle);

        const chinaButtonsContainer = document.createElement('div');
        chinaButtonsContainer.className = 'category-buttons';

        chinaCats.sort().forEach(category => {
            const zombieCount = this.zombieCategories[category].length;
            const displayName = this.formatCategoryName(category);

            const button = document.createElement('button');
            button.className = 'category-btn';
            button.dataset.category = category;

            button.innerHTML = `
                <span>${displayName}</span>
                <span class="badge">${zombieCount}</span>
            `;

            chinaButtonsContainer.appendChild(button);
        });

        chinaSection.appendChild(chinaButtonsContainer);
        categoriesPanel.appendChild(chinaSection);
    }

    // 6. Crear sección de Otros (orden alfabético)
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
            const displayName = this.formatCategoryName(category);

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

    // 7. Crear sección de Especiales (orden alfabético)
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
            const displayName = this.formatCategoryName(category);

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

    // 8. Crear sección de Mods (orden alfabético)
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
            const displayName = this.formatCategoryName(category);

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

}


isChinaCategory(categoryName) {
    // Lista exacta de categorías chinas
    const exactChinaCategories = [
        'house',
        'heian',
        'ice_age',
        'renai',
        'kongfu',
        'fairy',
        'journey',
    ];
    
    return exactChinaCategories.includes(categoryName);
}


    // En el método groupCategoriesDynamically()
    groupCategoriesDynamically() {
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


        // Grupo inicial
        const categoryGroups = {
            "Mundos": [],
            "China": [],
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

        // Tarjetas de zombies (ignorar las del modal Zomboss)
        document.addEventListener('click', (e) => {
            const zombieCard = e.target.closest('.zombie-card');
            if (zombieCard && !zombieCard.classList.contains('zomboss-mech-picker')) {
                const zombieName = zombieCard.dataset.zombie;
                zombieCard.classList.toggle('selected');
                this.updateSelectionCount();
            }
        });

        // Búsqueda global con debounce
        const globalSearch = document.getElementById('zombieSearchGlobal');
        if (globalSearch) {
            let searchTimeout;
            globalSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filterAllZombies(e.target.value);
                }, 200);
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

             this.tabStateManager = new TabStateManager();
        console.log('✓ TabStateManager inicializado');

            this.mechanicManager = new MechanicManager(this);
            this.mechanicManager.register(new UndergroundMechanic(this));
            this.mechanicManager.register(new StormMechanic(this));
            this.mechanicManager.register(new FrostWindMechanic(this));
            this.mechanicManager.register(new TideMechanic(this));
            this.mechanicManager.register(new LowTideMechanic(this));
            this.mechanicManager.register(new ParachuteRainMechanic(this));
            this.mechanicManager.initAll();
            console.log('✓ MechanicManager inicializado con mecánicas registradas');

            // 2. Verificar elementos requeridos (solo críticos)
            const canContinue = this.checkRequiredElements();
            if (!canContinue) {
                throw new Error('Faltan elementos críticos en el DOM');
            }

            // 3. Inicializar UI básica CON FALLBACKS
            this.initializeUIWithFallbacks();
            this.mechanicManager.setupAllUI();
            

            console.log('✓ UI básica inicializada');

            // 4. Cargar datos asíncronos
            this.showLoading(true);
            await this.loadZombieData();
            this.showLoading(false);
            console.log('✓ Datos de zombies cargados');

            // 5. Depurar datos (opcional)


            this.debugZombieData();

              try {
            // Inicializar conveyor manager si aún no está inicializado
              if (this.conveyorManager && typeof this.conveyorManager.initialize === 'function') {
        this.conveyorManager.initialize();
        console.log('✓ ConveyorManager inicializado');
    }
} catch (e) {
    console.warn('Error inicializando ConveyorManager:', e);
}

            // 6. Inicializar componentes que necesitan datos (con try-catch)
            try {
                this.plantManager = new PlantManager();
                console.log('✓ PlantManager inicializado');
            } catch (e) {
                console.warn('Error inicializando PlantManager:', e);
            }

            try {
                this.zombieResistanceManager = new ZombieResistanceManager(this);
                console.log('✓ ZombieResistanceManager inicializado');
            } catch (e) {
                console.warn('Error inicializando ZombieResistanceManager:', e);
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
                    if (this.levelData.enable_zomboss_battle) {
                        e.target.value = 'conveyor';
                        return;
                    }
                    this.levelData.seed_selection_method = e.target.value;
                    if (e.target.value === 'conveyor') {
                        const sunDropper = document.getElementById('enableSunDropper');
                        if (sunDropper && sunDropper.checked) {
                            sunDropper.checked = false;
                            this.levelData.enable_sun_dropper = false;
                        }
                        const conveyorConfig = document.getElementById('conveyorConfigContainer');
                        if (conveyorConfig) conveyorConfig.style.display = 'block';
                    } else {
                        const conveyorConfig = document.getElementById('conveyorConfigContainer');
                        if (conveyorConfig) conveyorConfig.style.display = 'none';
                        const sunDropper = document.getElementById('enableSunDropper');
                        if (sunDropper && !sunDropper.checked) {
                            sunDropper.checked = true;
                            this.levelData.enable_sun_dropper = true;
                        }
                    }
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
                id: 'enableZombossBattle', event: 'change', handler: (e) => {
                    this.levelData.enable_zomboss_battle = e.target.checked;
                    this.toggleZombossBattleConfig(e.target.checked);
                    this.markTabAsChanged('basic');
                }
            },
            {
                id: 'enablePiratePlanks', event: 'change', handler: (e) => {
                    this.levelData.enable_pirate_planks = e.target.checked;
                    const container = document.getElementById('piratePlankRowsContainer');
                    if (container) container.style.display = e.target.checked ? 'block' : 'none';
                    this.markTabAsChanged('basic');
                }
            },
            {
                id: 'plankRow0', event: 'change', handler: () => this.updatePiratePlankRows()
            },
            {
                id: 'plankRow1', event: 'change', handler: () => this.updatePiratePlankRows()
            },
            {
                id: 'plankRow2', event: 'change', handler: () => this.updatePiratePlankRows()
            },
            {
                id: 'plankRow3', event: 'change', handler: () => this.updatePiratePlankRows()
            },
            {
                id: 'plankRow4', event: 'change', handler: () => this.updatePiratePlankRows()
            },
            {
                id: 'seedSlotsCount', event: 'input', handler: (e) => {
                    this.levelData.seed_slots_count = parseInt(e.target.value) || 8;
                    this.markTabAsChanged('basic');
                }
            },
            {
                id: 'enableFixedPlantLevel', event: 'change', handler: (e) => {
                    this.levelData.enable_fixed_plant_level = e.target.checked;
                    this.updateFixedPlantLevelControl();
                    this.markTabAsChanged('basic');
                }
            },
            {
                id: 'fixedPlantLevel', event: 'input', handler: (e) => {
                    this.levelData.fixed_plant_level = parseInt(e.target.value) || 0;
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

            // ZombossBattle - Select Zomboss Mech
            const selectZombossBtn = document.getElementById('selectZombossMechBtn');
            if (selectZombossBtn) {
                selectZombossBtn.addEventListener('click', () => this.openZombossMechModal());
            }

            // ZombossMech Modal
            const zbMechAccept = document.getElementById('zombossMechModalAccept');
            if (zbMechAccept) {
                zbMechAccept.addEventListener('click', () => this.acceptZombossMechSelection());
            }
            const zbMechCancel = document.getElementById('zombossMechModalCancel');
            if (zbMechCancel) {
                zbMechCancel.addEventListener('click', () => this.closeZombossMechModal());
            }
            const zbMechClose = document.getElementById('zombossMechModalClose');
            if (zbMechClose) {
                zbMechClose.addEventListener('click', () => this.closeZombossMechModal());
            }
            const zbMechSearch = document.getElementById('zombossMechSearch');
            if (zbMechSearch) {
                zbMechSearch.addEventListener('input', (e) => this.filterZombossMechGrid(e.target.value));
            }

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
            this.updateLevelDataFromTab(this.currentTab, tabData);

            this.hasUnsavedChanges[this.currentTab] = false;
            this.updateTabIndicator(this.currentTab, false);
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
        // Store ya tiene los datos en levelData
        const data = this.collectTabData(tabId);
        if (data) {
            this.applyTabData(tabId, data);
            this.hasUnsavedChanges[tabId] = false;
            this.updateTabIndicator(tabId, false);
        }
    }


applyTabData(tabId, data) {
    console.log(`Aplicando datos para pestaña ${tabId}`, data);

    if (!data) return;

    // *** NUEVO: Verificar si estamos iniciando desde cero o cargando cambios del usuario ***
    const isInitialLoad = !this.hasLoadedTabs || !this.hasLoadedTabs[tabId];
    if (isInitialLoad) {
        // Inicializar el registro de pestañas cargadas
        if (!this.hasLoadedTabs) this.hasLoadedTabs = {};
        this.hasLoadedTabs[tabId] = true;
    }

    switch (tabId) {
        case 'basic':
            // *** CORREGIDO: Solo aplicar valores si existen en data ***
            // NO sobrescribir con undefined/null
            
            if (data.level_name !== undefined) this.safeAssignValue('levelName', data.level_name);
            if (data.level_number !== undefined) this.safeAssignValue('levelNumber', data.level_number.toString());
            if (data.starting_sun !== undefined) this.safeAssignValue('startingSun', data.starting_sun.toString());
            if (data.zombie_level !== undefined) this.safeAssignValue('zombieLevel', data.zombie_level.toString());
            if (data.grid_level !== undefined) this.safeAssignValue('gridLevel', data.grid_level.toString());
            if (data.wave_count !== undefined) this.safeAssignValue('waveCount', data.wave_count.toString());
            if (data.flag_interval !== undefined) this.safeAssignValue('flagInterval', data.flag_interval.toString());
            if (data.spawn_col_start !== undefined) this.safeAssignValue('spawnColStart', data.spawn_col_start.toString());
            if (data.spawn_col_end !== undefined) this.safeAssignValue('spawnColEnd', data.spawn_col_end.toString());
            if (data.wave_points !== undefined) this.safeAssignValue('wavePoints', data.wave_points.toString());
            if (data.wave_increment !== undefined) this.safeAssignValue('waveIncrement', data.wave_increment.toString());
            if (data.seed_slots_count !== undefined) this.safeAssignValue('seedSlotsCount', data.seed_slots_count.toString());
            if (data.fixed_plant_level !== undefined) this.safeAssignValue('fixedPlantLevel', data.fixed_plant_level.toString());

            // Checkboxes - usar el operador ?? para manejar undefined
            const enableSunDropper = data.enable_sun_dropper ?? this.levelData.enable_sun_dropper;
            const enableSeedSlots = data.enable_seed_slots ?? this.levelData.enable_seed_slots;
            const enableFixedPlantLevel = data.enable_fixed_plant_level ?? this.levelData.enable_fixed_plant_level;
            
            this.safeAssignValue('enableSunDropper', enableSunDropper, 'checked');
            this.safeAssignValue('enableSeedSlots', enableSeedSlots, 'checked');
            this.safeAssignValue('enableFixedPlantLevel', enableFixedPlantLevel, 'checked');
            
            // Actualizar levelData con los valores reales
            this.levelData.enable_sun_dropper = enableSunDropper;
            this.levelData.enable_seed_slots = enableSeedSlots;
            this.levelData.enable_fixed_plant_level = enableFixedPlantLevel;
            
            // *** IMPORTANTE: Actualizar controles dependientes ***
            this.updateSeedSlotsControl(); // Esto habilita/deshabilita el campo de seed slots
            this.updateFixedPlantLevelControl();

            // Actualizar selecciones visuales - solo si hay datos válidos
            if (data.mower_type && data.mower_type !== "undefined") {
                this.selectMower(data.mower_type);
            }
            if (data.world && data.world !== "undefined") {
                this.selectWorld(data.world);
            }
            if (data.stage && data.stage !== "undefined") {
                this.selectScenario(data.stage);
            }
            if (data.visual_effect && data.visual_effect !== "undefined") {
                this.safeAssignValue('effectSelect', data.visual_effect);
            }
            if (data.seed_selection_method && data.seed_selection_method !== "undefined") {
                this.safeAssignValue('seedSelectionMethod', data.seed_selection_method);
            }

            break;

        case 'waves':
            // *** CORREGIDO: Solo aplicar zombies si existen y no estamos en carga inicial con array vacío ***
            if (data.selected_zombies && Array.isArray(data.selected_zombies) && data.selected_zombies.length > 0) {
                this.levelData.zombies = [...data.selected_zombies];
                this.updateSelectedZombiesDisplay();
            }

            // Dificultad - solo si existe
            if (data.difficulty) {
                const radio = document.querySelector(`input[name="difficulty"][value="${data.difficulty}"]`);
                if (radio) radio.checked = true;
            }

            if (data.plant_food_waves !== undefined) this.safeAssignValue('plantFoodWaves', data.plant_food_waves);
            if (data.zombie_search !== undefined) this.safeAssignValue('zombieSearch', data.zombie_search);
            if (data.category !== undefined) this.safeAssignValue('categorySelect', data.category);

            if (this.mechanicManager) this.mechanicManager.applyAllData(data);
            break;

        case 'challenges':
            // *** CORREGIDO: Cargar el estado REAL guardado por el usuario ***
            // Solo forzar deshabilitado en carga INICIAL, no cuando el usuario cambia de pestaña
            
            if (isInitialLoad) {
                // En carga inicial, usar valores por defecto
                this.challengesData.enabled = false;
                this.safeAssignValue('challengesEnabled', false, 'checked');
                this.toggleChallengesContainer(false);
                
                console.log('Carga inicial de desafíos - Estado por defecto');
            } else {
                // Cuando el usuario cambia de pestaña, cargar lo que guardó
                if (data.challenges_enabled !== undefined) {
                    this.challengesData.enabled = data.challenges_enabled;
                    this.safeAssignValue('challengesEnabled', data.challenges_enabled, 'checked');
                    this.toggleChallengesContainer(data.challenges_enabled);
                }
                
                console.log('Cambio de pestaña de desafíos - Cargando estado guardado');
            }

            // Siempre cargar valores, pero el estado (enabled) depende de si es carga inicial o no
            this.challengesData.challenges.forEach(challenge => {
                const challengeData = data[`challenge_${challenge.id}`];
                if (challengeData) {
                    // Solo establecer enabled si NO es carga inicial
                    if (!isInitialLoad && challengeData.enabled !== undefined) {
                        challenge.enabled = challengeData.enabled;
                        const checkbox = document.getElementById(`challenge_${challenge.id.toLowerCase()}`);
                        if (checkbox) {
                            checkbox.checked = challenge.enabled;
                        }
                    }

                    // Cargar valores siempre (pero inputs pueden estar deshabilitados)
                    if (challenge.id === 'KillZombies' && challengeData.values) {
                        challenge.values = challengeData.values;
                        this.safeAssignValue('killZombies_count', challenge.values.zombies?.toString());
                        this.safeAssignValue('killZombies_time', challenge.values.time?.toString());
                    } else if (challengeData.value !== undefined) {
                        challenge.value = challengeData.value;
                        const input = document.getElementById(`${challenge.id.toLowerCase()}_value`);
                        if (input) input.value = challenge.value;
                    }
                }
            });
            
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
        // Limpiar solo datos de tabs legacy (el store maneja la persistencia real)
        const tabIds = ['basic', 'waves', 'challenges', 'preview', 'stats'];
        tabIds.forEach(tabId => localStorage.removeItem(`pvz_tab_${tabId}`));
        
        console.log('✓ Datos legacy limpiados, store activo');
    this.levelData.grid_level = 1;
    this.levelData.wave_count = 10;
    this.levelData.flag_wave_interval = 4;
    this.levelData.plant_food_waves = [3, 6, 9];
    this.levelData.spawn_col_start = 6;
    this.levelData.spawn_col_end = 9;
    this.levelData.wave_spending_points = 150;
    this.levelData.wave_spending_point_increment = 75;
    
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
    if (this.mechanicManager) this.mechanicManager.resetAll();
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
            
            // GUARDAR EL NOMBRE ORIGINAL DEL ARCHIVO
            this.originalFileName = file.name.replace(/\.json$/i, '');
            
            this.showConverterMessage('Archivo cargado', `JSON cargado: ${file.name}`, 'success');
        } catch (error) {
            this.showConverterMessage('Error', `Error al cargar archivo: ${error.message}`, 'error');
        }
    };

    input.click();
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
                data.enable_fixed_plant_level = getBoolValue('enableFixedPlantLevel');
                data.fixed_plant_level = getIntValue('fixedPlantLevel', 0);
                data.wave_count = getIntValue('waveCount', 10);
                data.flag_interval = getIntValue('flagInterval', 4);
                data.wave_points = getIntValue('wavePoints', 150);
                data.wave_increment = getIntValue('waveIncrement', 75);
                data.spawn_col_start = getIntValue('spawnColStart', 6);
                data.spawn_col_end = getIntValue('spawnColEnd', 9);
                data.seed_selection_method = getValue('seedSelectionMethod', 'chooser');
                data.enable_zomboss_battle = getBoolValue('enableZombossBattle');
                data.zomboss_mech_type = getValue('zombossMechType', '');
                data.enable_pirate_planks = getBoolValue('enablePiratePlanks');
                const rows = [];
                for (let i = 0; i <= 4; i++) {
                    const cb = document.getElementById('plankRow' + i);
                    if (cb && cb.checked) rows.push(i);
                }
                data.pirate_plank_rows = rows;
                break;

            case 'waves':
                if (this.levelData.zombies.length > 0) {
                    data.selected_zombies = [...this.levelData.zombies];
                }

                const difficultyRadio = document.querySelector('input[name="difficulty"]:checked');
                if (difficultyRadio) data.difficulty = difficultyRadio.value;
                data.plant_food_waves = getValue('plantFoodWaves', '');

                if (this.mechanicManager) this.mechanicManager.collectAllData(data);
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

    showLoading(show) {
        let overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="spinner"></div>';
            document.body.appendChild(overlay);
        }
        overlay.classList.toggle('active', show);
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
    // Detectar mundo de origen basado en categoría y nombre
    // Detectar clase de zombie basado en nombre
    // Determinar si es un zombie básico
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
        document.getElementById('enableSunDropper').checked = this.levelData.enable_sun_dropper;
        document.getElementById('enableSeedSlots').checked = this.levelData.enable_seed_slots;
        document.getElementById('seedSlotsCount').value = this.levelData.seed_slots_count;
        this.updateSeedSlotsControl();
        document.getElementById('enableFixedPlantLevel').checked = this.levelData.enable_fixed_plant_level;
        document.getElementById('fixedPlantLevel').value = this.levelData.fixed_plant_level;
        this.updateFixedPlantLevelControl();

        if (this.mechanicManager) this.mechanicManager.updateAllControls();

        const seedMethodSelect = document.getElementById('seedSelectionMethod');
        if (seedMethodSelect) {
            seedMethodSelect.value = this.levelData.seed_selection_method || 'chooser';
            const conveyorConfig = document.getElementById('conveyorConfigContainer');
            if (conveyorConfig) {
                conveyorConfig.style.display = (this.levelData.seed_selection_method === 'conveyor' || this.levelData.enable_zomboss_battle) ? 'block' : 'none';
            }
        }

        // ZombossBattle
        const zbEnable = document.getElementById('enableZombossBattle');
        if (zbEnable) {
            zbEnable.checked = this.levelData.enable_zomboss_battle;
        }
        const zbContent = document.getElementById('zombossBattleContent');
        if (zbContent) {
            zbContent.style.display = this.levelData.enable_zomboss_battle ? 'block' : 'none';
        }
        const zbMechType = document.getElementById('zombossMechType');
        if (zbMechType) {
            zbMechType.value = this.levelData.zomboss_mech_type || '';
        }
        this.toggleZombossBattleConfig(this.levelData.enable_zomboss_battle);
        this.updateZombossSelectedCount();

        // PiratePlanks
        const ppEnable = document.getElementById('enablePiratePlanks');
        if (ppEnable) {
            ppEnable.checked = this.levelData.enable_pirate_planks;
            const container = document.getElementById('piratePlankRowsContainer');
            if (container) container.style.display = this.levelData.enable_pirate_planks ? 'block' : 'none';
        }
        for (let i = 0; i <= 4; i++) {
            const cb = document.getElementById('plankRow' + i);
            if (cb) cb.checked = this.levelData.pirate_plank_rows.includes(i);
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

updateFixedPlantLevelControl() {
    const enableCheckbox = document.getElementById('enableFixedPlantLevel');
    const levelInput = document.getElementById('fixedPlantLevel');
    
    if (!enableCheckbox || !levelInput) return;
    
    const isEnabled = enableCheckbox.checked;
    levelInput.disabled = !isEnabled;
    
    if (!isEnabled) {
        levelInput.value = 0;
        this.levelData.fixed_plant_level = 0;
    }
}

    toggleZombossBattleConfig(enabled) {
        const content = document.getElementById('zombossBattleContent');
        const seedMethod = document.getElementById('seedSelectionMethod');
        const conveyorConfig = document.getElementById('conveyorConfigContainer');
        const wavesTab = document.getElementById('waves-tab');
        const wavesPanel = document.getElementById('waves');

        if (content) {
            content.style.display = enabled ? 'block' : 'none';
        }

        if (enabled) {
            // Forzar a conveyor cuando ZombossBattle está activo
            if (seedMethod) {
                seedMethod.value = 'conveyor';
                this.levelData.seed_selection_method = 'conveyor';
                seedMethod.disabled = true;
            }
            // Mostrar configuración de conveyor
            if (conveyorConfig) {
                conveyorConfig.style.display = 'block';
            }
            // Desactivar caída de soles
            const sunDropper = document.getElementById('enableSunDropper');
            if (sunDropper) {
                sunDropper.checked = false;
                this.levelData.enable_sun_dropper = false;
            }
            // Limpiar zombies que no sean zombossmech_
            this.levelData.zombies = this.levelData.zombies.filter(z => z.startsWith('zombossmech_'));
            this.updateSelectedZombiesDisplay();
            // Ocultar pestaña de zombies/oleadas
            if (wavesTab) wavesTab.style.display = 'none';
            if (wavesPanel) wavesPanel.style.display = 'none';
        } else {
            if (seedMethod) {
                seedMethod.value = 'chooser';
                this.levelData.seed_selection_method = 'chooser';
                seedMethod.disabled = false;
            }
            // Ocultar configuración de conveyor
            if (conveyorConfig) {
                conveyorConfig.style.display = 'none';
            }
            // Restaurar caída de soles
            const sunDropper = document.getElementById('enableSunDropper');
            if (sunDropper) {
                sunDropper.checked = true;
                this.levelData.enable_sun_dropper = true;
            }
            // Mostrar pestaña de zombies/oleadas
            if (wavesTab) wavesTab.style.display = '';
            if (wavesPanel) wavesPanel.style.display = '';
        }

        this.updateZombossSelectedCount();
        this.updatePreview();
    }

    updatePiratePlankRows() {
        const rows = [];
        for (let i = 0; i <= 4; i++) {
            const cb = document.getElementById('plankRow' + i);
            if (cb && cb.checked) rows.push(i);
        }
        this.levelData.pirate_plank_rows = rows;
        this.markTabAsChanged('basic');
    }

    // Zomboss Mech Modal - muestra solo zombies zombossmech_ estilo tarjetas
    getZombossMechList() {
        const mechZombies = [];
        Object.values(this.zombieCategories).forEach(zombies => {
            zombies.forEach(name => {
                if (name.startsWith('zombossmech_') && !mechZombies.includes(name)) {
                    mechZombies.push(name);
                }
            });
        });
        return mechZombies.sort();
    }

    openZombossMechModal() {
        const overlay = document.getElementById('zombossMechModalOverlay');
        const grid = document.getElementById('zombossMechGrid');
        if (!overlay || !grid) return;

        document.getElementById('zombossMechSearch').value = '';

        let mechList = this.getZombossMechList();
        const selectedZombies = this.levelData.zombies || [];

        // Si no hay datos cargados aún, mostrar mensaje
        if (mechList.length === 0) {
            grid.innerHTML = '<div class="col-12 text-center py-5"><i class="bi bi-exclamation-triangle display-4 text-muted mb-3"></i><h5 class="text-muted">No hay datos de zombies cargados</h5><p class="text-muted">Espera a que los datos se carguen o revisa la pestaña Zombies/Oleadas</p></div>';
            overlay.classList.add('show');
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeZombossMechModal();
            });
            return;
        }

        grid.innerHTML = mechList.map(name => {
            const info = this.getZombieInfo(name);
            const isSelected = selectedZombies.includes(name);
            const imagePath = `Assets/Zombies/${name}.webp`;
            return `
            <div class="col-md-4 col-sm-6">
                <div class="zombie-card zomboss-mech-picker ${isSelected ? 'selected' : ''}" data-zombie="${name}">
                    <div class="selection-indicator">
                        <i class="bi bi-check"></i>
                    </div>
                    <div class="zombie-image-container">
                        <img src="${imagePath}" alt="${name}" class="zombie-image"
                             onerror="this.src='Assets/Zombies/error.webp'; this.style.filter='grayscale(20%) opacity(90%)'">
                    </div>
                    <div class="zombie-name">${name}</div>
                    <div class="zombie-stats">
                        <span class="stat-item">HP: ${info?.hitpoints || 'N/A'}</span>
                        <span class="stat-item">Vel: ${info?.speed || 'N/A'}</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        overlay.classList.add('show');

        setTimeout(() => {
            document.querySelectorAll('.zomboss-mech-picker').forEach(card => {
                card.addEventListener('click', function() {
                    document.querySelectorAll('.zomboss-mech-picker').forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
        }, 50);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeZombossMechModal();
        });
    }

    closeZombossMechModal() {
        const overlay = document.getElementById('zombossMechModalOverlay');
        if (overlay) overlay.classList.remove('show');
    }

    acceptZombossMechSelection() {
        const selected = document.querySelector('.zomboss-mech-picker.selected');
        if (selected) {
            const name = selected.dataset.zombie;
            this.levelData.zombies = [name];
            this.levelData.zomboss_mech_type = name;
            const input = document.getElementById('zombossMechType');
            if (input) input.value = name;
            this.updateSelectedZombiesDisplay();
        }
        this.closeZombossMechModal();
        this.markTabAsChanged('basic');
        this.updatePreview();
        this.updateZombossSelectedCount();
    }

    updateZombossSelectedCount() {
        const countEl = document.getElementById('zombossSelectedCount');
        if (countEl) {
            const count = this.levelData.zombies.filter(z => z.startsWith('zombossmech_')).length;
            countEl.textContent = count > 0 ? `${count} zombie seleccionado` : 'Ningún zombie seleccionado';
        }
        this.updateZombossPreview();
    }

    updateZombossPreview() {
        const list = document.getElementById('zombossPreviewList');
        if (!list) return;
        const selected = this.levelData.zombies.filter(z => z.startsWith('zombossmech_'));
        if (selected.length === 0) {
            list.innerHTML = '<small class="text-muted">Selecciona un Zomboss con el botón de arriba</small>';
            return;
        }
        const name = selected[0];
        const info = this.getZombieInfo(name);
        list.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <img src="Assets/Zombies/${name}.webp" alt="${name}"
                     style="width:64px;height:64px;object-fit:contain;border-radius:6px;background:#f8f9fa;border:2px solid #dc3545;">
                <div>
                    <strong style="font-size:0.85rem;">${name}</strong><br>
                    <small class="text-muted">HP: ${info?.hitpoints || 'N/A'} | Vel: ${info?.speed || 'N/A'}</small>
                </div>
            </div>`;
    }

    filterZombossMechGrid(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        document.querySelectorAll('.zomboss-mech-picker').forEach(card => {
            const name = card.dataset.zombie.toLowerCase();
            card.closest('.col-md-4').style.display = name.includes(term) ? '' : 'none';
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

// ─── PROTOTYPE ASSIGNMENTS FOR EXTRACTED MODULES ──────────

// Modal methods
EnhancedLevelGenerator.prototype.initializeMowerModal = initializeMowerModal;
EnhancedLevelGenerator.prototype.generateMowerModalOptions = generateMowerModalOptions;
EnhancedLevelGenerator.prototype.setupMowerModalListeners = setupMowerModalListeners;
EnhancedLevelGenerator.prototype.selectMower = selectMower;
EnhancedLevelGenerator.prototype.updateSelectedMowerDisplay = updateSelectedMowerDisplay;
EnhancedLevelGenerator.prototype.highlightSelectedMower = highlightSelectedMower;
EnhancedLevelGenerator.prototype.filterMowers = filterMowers;
EnhancedLevelGenerator.prototype.initializeScenarioModal = initializeScenarioModal;
EnhancedLevelGenerator.prototype.generateScenarioModalOptions = generateScenarioModalOptions;
EnhancedLevelGenerator.prototype.setupScenarioModalListeners = setupScenarioModalListeners;
EnhancedLevelGenerator.prototype.selectScenario = selectScenario;
EnhancedLevelGenerator.prototype.updateSelectedScenarioDisplay = updateSelectedScenarioDisplay;
EnhancedLevelGenerator.prototype.highlightSelectedScenario = highlightSelectedScenario;
EnhancedLevelGenerator.prototype.filterScenarios = filterScenarios;
EnhancedLevelGenerator.prototype.initializeWorldModal = initializeWorldModal;
EnhancedLevelGenerator.prototype.generateWorldModalOptions = generateWorldModalOptions;
EnhancedLevelGenerator.prototype.setupWorldModalListeners = setupWorldModalListeners;
EnhancedLevelGenerator.prototype.selectWorld = selectWorld;
EnhancedLevelGenerator.prototype.updateSelectedWorldDisplay = updateSelectedWorldDisplay;
EnhancedLevelGenerator.prototype.highlightSelectedWorld = highlightSelectedWorld;
EnhancedLevelGenerator.prototype.filterWorlds = filterWorlds;
EnhancedLevelGenerator.prototype.updateStages = updateStages;

// Converter methods
EnhancedLevelGenerator.prototype.setupConverterListeners = setupConverterListeners;
EnhancedLevelGenerator.prototype.convertJsonToRton = convertJsonToRton;
EnhancedLevelGenerator.prototype.convertRtonToJson = convertRtonToJson;
EnhancedLevelGenerator.prototype.loadJsonFile = loadJsonFile;
EnhancedLevelGenerator.prototype.loadRtonFile = loadRtonFile;
EnhancedLevelGenerator.prototype.copyResult = copyResult;
EnhancedLevelGenerator.prototype.downloadResult = downloadResult;
EnhancedLevelGenerator.prototype.downloadFile = downloadFile;
EnhancedLevelGenerator.prototype.clearResult = clearResult;
EnhancedLevelGenerator.prototype.showConverterMessage = showConverterMessage;

// Zombie utility methods
EnhancedLevelGenerator.prototype.calculateDefaultHP = calculateDefaultHP;
EnhancedLevelGenerator.prototype.calculateDefaultSpeed = calculateDefaultSpeed;
EnhancedLevelGenerator.prototype.calculateDefaultDPS = calculateDefaultDPS;
EnhancedLevelGenerator.prototype.detectHomeWorld = detectHomeWorld;
EnhancedLevelGenerator.prototype.detectHomeWorldFromCategory = detectHomeWorldFromCategory;
EnhancedLevelGenerator.prototype.detectZombieClass = detectZombieClass;
EnhancedLevelGenerator.prototype.isBasicZombie = isBasicZombie;
EnhancedLevelGenerator.prototype.calculateZombieThreatLevel = calculateZombieThreatLevel;
EnhancedLevelGenerator.prototype.getZombieWeight = getZombieWeight;

// Wave generator methods
EnhancedLevelGenerator.prototype.generateSmartWaves = generateSmartWaves;
EnhancedLevelGenerator.prototype.generateNormalWave = generateNormalWave;
EnhancedLevelGenerator.prototype.categorizeZombies = categorizeZombies;
EnhancedLevelGenerator.prototype.getPowerfulZombies = getPowerfulZombies;
EnhancedLevelGenerator.prototype.selectZombieType = selectZombieType;
EnhancedLevelGenerator.prototype.weightedRandomChoice = weightedRandomChoice;
EnhancedLevelGenerator.prototype.calculateZombiesPerWave = calculateZombiesPerWave;
EnhancedLevelGenerator.prototype.generateThematicLevel = generateThematicLevel;

// JSON level builder methods
EnhancedLevelGenerator.prototype.generateJson = generateJson;
EnhancedLevelGenerator.prototype.generateModules = generateModules;
EnhancedLevelGenerator.prototype.generateWaveObjects = generateWaveObjects;
EnhancedLevelGenerator.prototype.generateDynamicZombies = generateDynamicZombies;
EnhancedLevelGenerator.prototype.generateChallengeObjects = generateChallengeObjects;
EnhancedLevelGenerator.prototype.updatePreview = updatePreview;
EnhancedLevelGenerator.prototype.highlightJson = highlightJson;
EnhancedLevelGenerator.prototype.syntaxHighlight = syntaxHighlight;

// Stats methods
EnhancedLevelGenerator.prototype.updateStats = updateStats;
EnhancedLevelGenerator.prototype.getChallengeDescription = getChallengeDescription;

// Settings methods
EnhancedLevelGenerator.prototype.generateLevel = generateLevel;
EnhancedLevelGenerator.prototype.saveLevel = saveLevel;
EnhancedLevelGenerator.prototype.loadConfig = loadConfig;
EnhancedLevelGenerator.prototype.copyJsonToClipboard = copyJsonToClipboard;
EnhancedLevelGenerator.prototype.resetAllSettings = resetAllSettings;
EnhancedLevelGenerator.prototype.exportSettings = exportSettings;
EnhancedLevelGenerator.prototype.importSettings = importSettings;

// ─── END PROTOTYPE ASSIGNMENTS ────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Si levelGenerator aún no existe, crearlo
    if (!window.levelGenerator) {
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
            window.levelGenerator.init().catch(e => {
                console.error('Error al reintentar:', e);
            });
        }
    }
});
